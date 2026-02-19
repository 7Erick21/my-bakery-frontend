'use client';

import { useRouter } from 'next/navigation';
import { type FC, useState } from 'react';

import { Button, Checkbox, DashboardCard, Input, Label, Select } from '@/components/atoms';
import type { CategoryAdmin, ProductAdmin } from '@/lib/supabase/models';
import { slugify } from '@/lib/utils/slugify';
import { createProduct, updateProduct } from '@/server/actions/products';
import { useTranslation } from '@/shared/hooks/useTranslate';
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
  url: string | null;
  file: File | null;
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
  const router = useRouter();
  const isEditing = !!product;

  const [categoryId, setCategoryId] = useState(product?.category_id || '');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [taxRate, setTaxRate] = useState(product?.tax_rate?.toString() || '10');
  const [compareAtPrice, setCompareAtPrice] = useState(product?.compare_at_price?.toString() || '');
  const [isVisible, setIsVisible] = useState(product?.is_visible ?? true);
  const [displayOnLanding, setDisplayOnLanding] = useState(product?.display_on_landing ?? false);
  const [sortOrder, setSortOrder] = useState(product?.sort_order?.toString() || '0');
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

  const [imageSlots, setImageSlots] = useState<ImageSlot[]>(
    originalImageUrls.length > 0
      ? originalImageUrls.map((url: string) => ({ url, file: null }))
      : []
  );

  function handleFileSelect(index: number, file: File | null) {
    const updated = [...imageSlots];
    updated[index] = { ...updated[index], file };
    setImageSlots(updated);
  }

  function removeSlot(index: number) {
    setImageSlots(imageSlots.filter((_, i) => i !== index));
  }

  function addSlot(file: File) {
    setImageSlots([...imageSlots, { url: null, file }]);
  }

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
      formData.set('sort_order', sortOrder);
      if (prepTime) formData.set('preparation_time_minutes', prepTime);
      if (weight) formData.set('weight_grams', weight);
      if (seasonTags) formData.set('season_tags', seasonTags);
      formData.set('translations', JSON.stringify(translations));
      formData.set('images', JSON.stringify(finalUrls.map(url => ({ url }))));

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

      router.push('/dashboard/products');
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-8 max-w-3xl mx-auto'>
      <div className='flex items-center justify-between'>
        <h1 className='text-24-32 font-bold text-gray-900 dark:text-gray-100'>
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
            <Select value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
              <option value=''>Seleccionar...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.category_translations?.[0]?.name || cat.slug}
                </option>
              ))}
            </Select>
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
            <Select value={taxRate} onChange={e => setTaxRate(e.target.value)} required>
              <option value='4'>4% — Pan comun</option>
              <option value='10'>10% — Bolleria / Pasteleria</option>
              <option value='21'>21% — General</option>
            </Select>
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
            <Label>Orden</Label>
            <Input type='number' value={sortOrder} onChange={e => setSortOrder(e.target.value)} />
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
            <Select value={seasonTags} onChange={e => setSeasonTags(e.target.value)}>
              <option value=''>Sin temporada</option>
              <option value='todo_el_ano'>Todo el ano</option>
              <option value='navidad'>Navidad</option>
              <option value='pascua'>Pascua</option>
              <option value='san_juan'>San Juan</option>
              <option value='sant_jordi'>Sant Jordi</option>
              <option value='todos_santos'>Todos los Santos</option>
            </Select>
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
        <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
          {imageSlots.map((slot, idx) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: dynamic form items without stable IDs
            <div key={`slot-${idx}`} className='relative'>
              <ImageUploader
                value={slot.url || undefined}
                pendingFile={slot.file}
                onFileSelect={file => handleFileSelect(idx, file)}
              />
              <button
                type='button'
                onClick={() => removeSlot(idx)}
                className='absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs cursor-pointer'
              >
                x
              </button>
            </div>
          ))}
          <ImageUploader
            onFileSelect={file => {
              if (file) addSlot(file);
            }}
          />
        </div>
      </DashboardCard>

      {/* Ingredients */}
      <DashboardCard className='space-y-4'>
        <button
          type='button'
          onClick={() => setIngredientsOpen(!ingredientsOpen)}
          className='flex items-center justify-between w-full cursor-pointer'
        >
          <h2 className='text-18-24 font-semibold text-gray-900 dark:text-gray-100'>
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
                  <span className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                    #{idx + 1}
                  </span>
                  <button
                    type='button'
                    onClick={() => setIngredients(ingredients.filter((_, i) => i !== idx))}
                    className='text-red-500 hover:text-red-700 text-sm cursor-pointer'
                  >
                    Eliminar
                  </button>
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
              className='cursor-pointer'
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
          <h2 className='text-18-24 font-semibold text-gray-900 dark:text-gray-100'>
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
                  <span className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                    Paso {idx + 1}
                  </span>
                  <button
                    type='button'
                    onClick={() => setSteps(steps.filter((_, i) => i !== idx))}
                    className='text-red-500 hover:text-red-700 text-sm cursor-pointer'
                  >
                    Eliminar
                  </button>
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
              className='cursor-pointer'
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
