'use client';

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useRouter } from 'next/navigation';
import { type FC, useCallback, useState } from 'react';

import {
  Button,
  Checkbox,
  DashboardCard,
  IconButton,
  Input,
  Label,
  Select
} from '@/components/atoms';
import TrashIcon from '@/icons/trash.svg';
import type { CategoryAdmin, ProductAdmin } from '@/lib/supabase/models';
import { slugify } from '@/lib/utils/slugify';
import { createProduct, updateProduct } from '@/server/actions/products';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { useToastStore } from '@/shared/stores/toastStore';
import { FormActions } from '../shared/FormActions';
import { ImageUploader } from '../shared/ImageUploader';
import { type Translation, TranslationFields } from '../shared/TranslationFields';
import { uploadFile } from '../shared/uploadFile';

interface ProductFormProps {
  product?: ProductAdmin;
  categories: CategoryAdmin[];
  languages: { code: string; name: string }[];
}

// An image slot: either an existing URL or a pending file
interface ImageSlot {
  id: string;
  url: string | null;
  file: File | null;
}

let slotIdCounter = 0;
function nextSlotId() {
  return `slot-${++slotIdCounter}`;
}

interface IngredientFormState {
  sort_order: number;
  is_allergen: boolean;
  translations: Translation[];
}

interface StepFormState {
  step_number: number;
  duration_minutes: string | number;
  translations: Translation[];
}

export const ProductForm: FC<ProductFormProps> = ({ product, categories, languages }) => {
  const { t } = useTranslation();
  const addToast = useToastStore(s => s.addToast);
  const router = useRouter();
  const isEditing = !!product;

  const [categoryId, setCategoryId] = useState(product?.category_id || '');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [taxRate, setTaxRate] = useState(product?.tax_rate?.toString() || '10');
  const [compareAtPrice, setCompareAtPrice] = useState(product?.compare_at_price?.toString() || '');
  const [isVisible, setIsVisible] = useState(product?.is_visible ?? true);
  const [displayOnLanding, setDisplayOnLanding] = useState(product?.display_on_landing ?? false);
  const [prepTime, setPrepTime] = useState(product?.preparation_time_minutes?.toString() || '');
  const [weight, setWeight] = useState(product?.weight_grams?.toString() || '');
  const [seasonTags, setSeasonTags] = useState(product?.season_tags?.join(',') || '');
  const [translations, setTranslations] = useState<Translation[]>(
    product?.product_translations || []
  );
  const [submitting, setSubmitting] = useState(false);

  // Ingredients state
  const [ingredientsOpen, setIngredientsOpen] = useState(false);
  const [ingredients, setIngredients] = useState<IngredientFormState[]>(
    product?.ingredients?.map(ing => ({
      sort_order: ing.sort_order,
      is_allergen: ing.is_allergen,
      translations: ing.ingredient_translations || []
    })) || []
  );

  // Preparation steps state
  const [stepsOpen, setStepsOpen] = useState(false);
  const [steps, setSteps] = useState<StepFormState[]>(
    product?.preparation_steps
      ?.sort((a, b) => a.step_number - b.step_number)
      .map(step => ({
        step_number: step.step_number,
        duration_minutes: step.duration_minutes || '',
        translations: step.preparation_step_translations || []
      })) || []
  );

  // Track original URLs for cleanup on server side
  const originalImageUrls: string[] = product?.product_images?.map(img => img.url) || [];
  const initialPrimaryIdx = product?.product_images?.findIndex(img => img.is_primary) ?? 0;

  const [imageSlots, setImageSlots] = useState<ImageSlot[]>(
    originalImageUrls.length > 0
      ? originalImageUrls.map((url: string) => ({ id: nextSlotId(), url, file: null }))
      : []
  );
  const [primaryIndex, setPrimaryIndex] = useState(Math.max(0, initialPrimaryIdx));

  const imageSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  function handleFileSelect(index: number, file: File | null) {
    const updated = [...imageSlots];
    updated[index] = { ...updated[index], file };
    setImageSlots(updated);
  }

  function removeSlot(index: number) {
    setImageSlots(prev => prev.filter((_, i) => i !== index));
    // Adjust primaryIndex if needed
    setPrimaryIndex(prev => {
      if (index === prev) return 0;
      if (index < prev) return prev - 1;
      return prev;
    });
  }

  function addSlot(file: File) {
    setImageSlots(prev => [...prev, { id: nextSlotId(), url: null, file }]);
  }

  const handleImageDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = imageSlots.findIndex(s => s.id === active.id);
      const newIndex = imageSlots.findIndex(s => s.id === over.id);
      const reordered = arrayMove(imageSlots, oldIndex, newIndex);
      setImageSlots(reordered);

      // Move primaryIndex along with the reorder
      setPrimaryIndex(prev => {
        if (prev === oldIndex) return newIndex;
        if (oldIndex < prev && newIndex >= prev) return prev - 1;
        if (oldIndex > prev && newIndex <= prev) return prev + 1;
        return prev;
      });
    },
    [imageSlots]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Upload any pending files
      const finalUrls: string[] = [];
      for (const slot of imageSlots) {
        if (slot.file) {
          const url = await uploadFile(slot.file, 'my-bakery/products');
          finalUrls.push(url);
        } else if (slot.url) {
          finalUrls.push(slot.url);
        }
      }

      // Auto-generate slug from English name (or first available)
      const enTranslation = translations.find(t => t.language_code === 'en');
      const fallbackTranslation = translations[0];
      const nameForSlug = enTranslation?.name || fallbackTranslation?.name || '';
      const slug = isEditing ? product.slug : slugify(nameForSlug);

      const formData = new FormData();
      formData.set('slug', slug);
      formData.set('category_id', categoryId);
      formData.set('price', price);
      formData.set('tax_rate', taxRate);
      if (compareAtPrice) formData.set('compare_at_price', compareAtPrice);
      formData.set('is_visible', String(isVisible));
      formData.set('display_on_landing', String(displayOnLanding));
      if (prepTime) formData.set('preparation_time_minutes', prepTime);
      if (weight) formData.set('weight_grams', weight);
      if (seasonTags) formData.set('season_tags', seasonTags);
      formData.set('translations', JSON.stringify(translations));
      formData.set(
        'images',
        JSON.stringify(finalUrls.map((url, idx) => ({ url, is_primary: idx === primaryIndex })))
      );

      // Serialize ingredients with auto sort_order
      if (ingredients.length > 0) {
        formData.set(
          'ingredients_data',
          JSON.stringify(ingredients.map((ing, idx) => ({ ...ing, sort_order: idx })))
        );
      }

      // Serialize preparation steps with auto step_number
      if (steps.length > 0) {
        formData.set(
          'steps_data',
          JSON.stringify(steps.map((s, idx) => ({ ...s, step_number: idx + 1 })))
        );
      }

      // Pass old URLs so the server can clean up removed images from Cloudinary
      if (isEditing) {
        formData.set('old_image_urls', JSON.stringify(originalImageUrls));
        await updateProduct(product.id, formData);
      } else {
        await createProduct(formData);
      }

      addToast({
        message: isEditing ? 'Producto actualizado' : 'Producto creado',
        type: 'success'
      });
      router.push('/dashboard/products');
      router.refresh();
    } catch (err) {
      console.error(err);
      addToast({ message: 'Error al guardar el producto', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-8 max-w-3xl mx-auto'>
      <div className='flex items-center justify-between'>
        <h1 className='text-32-48 font-bold text-gray-900 dark:text-gray-100'>
          {isEditing
            ? t('dashboard.products.edit', 'Editar producto')
            : t('dashboard.products.create', 'Nuevo producto')}
        </h1>
      </div>

      {/* Basic info */}
      <DashboardCard
        title={t('dashboard.products.basicInfo', 'Informacion basica')}
        className='space-y-4'
      >
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <Label required>{t('dashboard.products.category', 'Categoria')}</Label>
            <Select
              value={categoryId}
              onChange={setCategoryId}
              required
              placeholder='Seleccionar...'
              options={categories.map(cat => ({
                value: cat.id,
                label: cat.category_translations?.[0]?.name || cat.slug
              }))}
            />
          </div>

          <div>
            <Label required>{t('dashboard.products.price', 'Precio')} (€)</Label>
            <Input
              type='number'
              step='0.01'
              value={price}
              onChange={e => setPrice(e.target.value)}
              required
            />
          </div>

          <div>
            <Label required>IVA (%)</Label>
            <Select
              value={taxRate}
              onChange={setTaxRate}
              required
              options={[
                { value: '4', label: '4% — Pan comun' },
                { value: '10', label: '10% — Bolleria / Pasteleria' },
                { value: '21', label: '21% — General' }
              ]}
            />
          </div>

          <div>
            <Label>Precio anterior (€)</Label>
            <Input
              type='number'
              step='0.01'
              value={compareAtPrice}
              onChange={e => setCompareAtPrice(e.target.value)}
            />
          </div>

          <div>
            <Label>Tiempo preparacion (min)</Label>
            <Input type='number' value={prepTime} onChange={e => setPrepTime(e.target.value)} />
          </div>

          <div>
            <Label>Peso (gramos)</Label>
            <Input type='number' value={weight} onChange={e => setWeight(e.target.value)} />
          </div>

          <div>
            <Label>Temporada</Label>
            <Select
              value={seasonTags}
              onChange={setSeasonTags}
              options={[
                { value: '', label: 'Sin temporada' },
                { value: 'todo_el_ano', label: 'Todo el ano' },
                { value: 'navidad', label: 'Navidad' },
                { value: 'pascua', label: 'Pascua' },
                { value: 'san_juan', label: 'San Juan' },
                { value: 'sant_jordi', label: 'Sant Jordi' },
                { value: 'todos_santos', label: 'Todos los Santos' }
              ]}
            />
          </div>
        </div>

        <div className='flex flex-wrap gap-6'>
          <Checkbox checked={isVisible} onChange={setIsVisible} label='Activo' />
          <Checkbox
            checked={displayOnLanding}
            onChange={setDisplayOnLanding}
            label='Mostrar en landing'
          />
        </div>
      </DashboardCard>

      {/* Translations */}
      <DashboardCard title='Traducciones'>
        <TranslationFields
          languages={languages}
          fields={[
            { key: 'name', label: 'Nombre', type: 'text', required: true },
            { key: 'short_description', label: 'Descripcion corta', type: 'text' },
            { key: 'description', label: 'Descripcion', type: 'textarea' }
          ]}
          translations={translations}
          onChange={setTranslations}
        />
      </DashboardCard>

      {/* Images */}
      <DashboardCard title='Imagenes' className='space-y-4'>
        {imageSlots.length > 1 && (
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Arrastra para reordenar. Haz clic en la estrella para elegir la imagen principal.
          </p>
        )}
        <DndContext
          sensors={imageSensors}
          collisionDetection={closestCenter}
          onDragEnd={handleImageDragEnd}
        >
          <SortableContext
            items={imageSlots.map(s => s.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className='flex gap-3 flex-wrap'>
              {imageSlots.map((slot, idx) => (
                <SortableImageSlot
                  key={slot.id}
                  slot={slot}
                  index={idx}
                  isPrimary={idx === primaryIndex}
                  onFileSelect={file => handleFileSelect(idx, file)}
                  onRemove={() => removeSlot(idx)}
                  onSetPrimary={() => setPrimaryIndex(idx)}
                />
              ))}
              <ImageUploader
                onFileSelect={file => {
                  if (file) addSlot(file);
                }}
              />
            </div>
          </SortableContext>
        </DndContext>
      </DashboardCard>

      {/* Ingredients */}
      <DashboardCard className='space-y-4'>
        <button
          type='button'
          onClick={() => setIngredientsOpen(!ingredientsOpen)}
          className='flex items-center justify-between w-full cursor-pointer'
        >
          <h2 className='text-24-32 font-semibold text-gray-900 dark:text-gray-100'>
            Ingredientes ({ingredients.length})
          </h2>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${ingredientsOpen ? 'rotate-180' : ''}`}
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            aria-hidden='true'
          >
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
          </svg>
        </button>
        {ingredientsOpen && (
          <div className='space-y-4 pt-2'>
            {ingredients.map((ing, idx) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: dynamic form items without stable IDs
                key={`ing-${idx}`}
                className='p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3'
              >
                <div className='flex items-center justify-between'>
                  <span className='text-16-20 font-medium text-gray-600 dark:text-gray-400'>
                    #{idx + 1}
                  </span>
                  <IconButton
                    aria-label='Eliminar ingrediente'
                    variant='danger'
                    size='sm'
                    onClick={() => setIngredients(ingredients.filter((_, i) => i !== idx))}
                  >
                    <TrashIcon className='w-3.5 h-3.5' />
                  </IconButton>
                </div>
                <TranslationFields
                  languages={languages}
                  fields={[{ key: 'name', label: 'Nombre', type: 'text', required: true }]}
                  translations={ing.translations}
                  onChange={updated => {
                    const newIngredients = [...ingredients];
                    newIngredients[idx] = { ...newIngredients[idx], translations: updated };
                    setIngredients(newIngredients);
                  }}
                />
                <Checkbox
                  checked={ing.is_allergen}
                  onChange={checked => {
                    const newIngredients = [...ingredients];
                    newIngredients[idx] = { ...newIngredients[idx], is_allergen: checked };
                    setIngredients(newIngredients);
                  }}
                  label='Alergeno'
                />
              </div>
            ))}
            <Button
              type='button'
              variant='secondary'
              onClick={() =>
                setIngredients([
                  ...ingredients,
                  { sort_order: ingredients.length, is_allergen: false, translations: [] }
                ])
              }
            >
              + Anadir ingrediente
            </Button>
          </div>
        )}
      </DashboardCard>

      {/* Preparation Steps */}
      <DashboardCard className='space-y-4'>
        <button
          type='button'
          onClick={() => setStepsOpen(!stepsOpen)}
          className='flex items-center justify-between w-full cursor-pointer'
        >
          <h2 className='text-24-32 font-semibold text-gray-900 dark:text-gray-100'>
            Proceso de elaboracion ({steps.length})
          </h2>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${stepsOpen ? 'rotate-180' : ''}`}
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            aria-hidden='true'
          >
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
          </svg>
        </button>
        {stepsOpen && (
          <div className='space-y-4 pt-2'>
            {steps.map((step, idx) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: dynamic form items without stable IDs
                key={`step-${idx}`}
                className='p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3'
              >
                <div className='flex items-center justify-between'>
                  <span className='text-16-20 font-medium text-gray-600 dark:text-gray-400'>
                    Paso {idx + 1}
                  </span>
                  <IconButton
                    aria-label='Eliminar paso'
                    variant='danger'
                    size='sm'
                    onClick={() => setSteps(steps.filter((_, i) => i !== idx))}
                  >
                    <TrashIcon className='w-3.5 h-3.5' />
                  </IconButton>
                </div>
                <TranslationFields
                  languages={languages}
                  fields={[
                    { key: 'title', label: 'Titulo', type: 'text', required: true },
                    { key: 'description', label: 'Descripcion', type: 'textarea' }
                  ]}
                  translations={step.translations}
                  onChange={updated => {
                    const newSteps = [...steps];
                    newSteps[idx] = { ...newSteps[idx], translations: updated };
                    setSteps(newSteps);
                  }}
                />
                <div>
                  <Label>Duracion (min)</Label>
                  <Input
                    type='number'
                    value={step.duration_minutes}
                    onChange={e => {
                      const newSteps = [...steps];
                      newSteps[idx] = { ...newSteps[idx], duration_minutes: e.target.value };
                      setSteps(newSteps);
                    }}
                  />
                </div>
              </div>
            ))}
            <Button
              type='button'
              variant='secondary'
              onClick={() =>
                setSteps([
                  ...steps,
                  { step_number: steps.length + 1, duration_minutes: '', translations: [] }
                ])
              }
            >
              + Anadir paso
            </Button>
          </div>
        )}
      </DashboardCard>

      {/* Submit */}
      <FormActions
        submitting={submitting}
        submitLabel={isEditing ? 'Guardar cambios' : 'Crear producto'}
        onCancel={() => router.back()}
      />
    </form>
  );
};

ProductForm.displayName = 'ProductForm';

// ─── Sortable Image Slot ───────────────────────────────────

interface SortableImageSlotProps {
  slot: ImageSlot;
  index: number;
  isPrimary: boolean;
  onFileSelect: (file: File | null) => void;
  onRemove: () => void;
  onSetPrimary: () => void;
}

function SortableImageSlot({
  slot,
  index,
  isPrimary,
  onFileSelect,
  onRemove,
  onSetPrimary
}: SortableImageSlotProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: slot.id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    // Needed so the drag handle doesn't interfere with ImageUploader's click
    cursor: 'grab' as const
  };

  // We need index for nothing here, but it's passed for context
  void index;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ImageUploader
        value={slot.url || undefined}
        pendingFile={slot.file}
        onFileSelect={onFileSelect}
        onRemove={onRemove}
        isPrimary={isPrimary}
        onSetPrimary={onSetPrimary}
      />
    </div>
  );
}
