'use client';

import { useRouter } from 'next/navigation';
import { type FC, useState } from 'react';

import { Checkbox, DashboardCard, Input, Label } from '@/components/atoms';
import type { CategoryAdmin } from '@/lib/supabase/models';
import { slugify } from '@/lib/utils/slugify';
import { createCategory, updateCategory } from '@/server/actions/categories';
import { FormActions } from '../shared/FormActions';
import { ImageUploader } from '../shared/ImageUploader';
import { type Translation, TranslationFields } from '../shared/TranslationFields';
import { uploadFile } from '../shared/uploadFile';

interface CategoryFormProps {
  category?: CategoryAdmin;
  languages: { code: string; name: string }[];
}

export const CategoryForm: FC<CategoryFormProps> = ({ category, languages }) => {
  const router = useRouter();
  const isEditing = !!category;

  const [imageUrl, setImageUrl] = useState(category?.image_url || '');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [sortOrder, setSortOrder] = useState(category?.sort_order?.toString() || '0');
  const [isVisible, setIsVisible] = useState(category?.is_visible ?? true);
  const [translations, setTranslations] = useState<Translation[]>(
    category?.category_translations || []
  );
  const [submitting, setSubmitting] = useState(false);

  const originalImageUrl = category?.image_url || '';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      let finalImageUrl = imageUrl;

      // Upload pending file if any
      if (pendingFile) {
        finalImageUrl = await uploadFile(pendingFile, 'my-bakery/categories');
      }

      // Auto-generate slug from English name (or first available)
      const enTranslation = translations.find(t => t.language_code === 'en');
      const fallbackTranslation = translations[0];
      const nameForSlug = enTranslation?.name || fallbackTranslation?.name || '';
      const slug = isEditing ? category.slug : slugify(nameForSlug);

      const formData = new FormData();
      formData.set('slug', slug);
      formData.set('image_url', finalImageUrl);
      formData.set('sort_order', sortOrder);
      formData.set('is_visible', String(isVisible));
      formData.set('translations', JSON.stringify(translations));

      if (isEditing) {
        // Pass old URL so the server can clean up from Cloudinary
        if (originalImageUrl && originalImageUrl !== finalImageUrl) {
          formData.set('old_image_url', originalImageUrl);
        }
        await updateCategory(category.id, formData);
      } else {
        await createCategory(formData);
      }

      router.push('/dashboard/categories');
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-8 max-w-3xl mx-auto'>
      <h1 className='text-24-32 font-bold text-gray-900 dark:text-gray-100'>
        {isEditing ? 'Editar categoria' : 'Nueva categoria'}
      </h1>

      {/* 1. Traducciones primero */}
      <DashboardCard title='Traducciones'>
        <TranslationFields
          languages={languages}
          fields={[
            { key: 'name', label: 'Nombre', type: 'text', required: true },
            { key: 'description', label: 'Descripcion', type: 'textarea' }
          ]}
          translations={translations}
          onChange={setTranslations}
        />
      </DashboardCard>

      {/* 2. Imagen */}
      <DashboardCard title='Imagen'>
        <ImageUploader
          value={pendingFile ? undefined : imageUrl || undefined}
          pendingFile={pendingFile}
          onFileSelect={file => {
            setPendingFile(file);
            if (file) setImageUrl('');
          }}
        />
      </DashboardCard>

      {/* 3. Configuracion: orden + visible */}
      <DashboardCard title='Configuracion' className='space-y-4'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div>
            <Label>Orden</Label>
            <Input type='number' value={sortOrder} onChange={e => setSortOrder(e.target.value)} />
          </div>
          <div className='flex items-end'>
            <Checkbox checked={isVisible} onChange={setIsVisible} label='Visible' />
          </div>
        </div>
      </DashboardCard>

      {/* Botones */}
      <FormActions
        submitting={submitting}
        submitLabel={isEditing ? 'Guardar cambios' : 'Crear categoria'}
        onCancel={() => router.back()}
      />
    </form>
  );
};

CategoryForm.displayName = 'CategoryForm';
