'use client';

import { useRouter } from 'next/navigation';
import { type FC, useState } from 'react';

import { Checkbox, DashboardCard } from '@/components/atoms';
import type { CategoryAdmin } from '@/lib/supabase/models';
import { slugify } from '@/lib/utils/slugify';
import { createCategory, updateCategory } from '@/server/actions/categories';
import { useToastStore } from '@/shared/stores/toastStore';
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
  const addToast = useToastStore(s => s.addToast);
  const isEditing = !!category;

  const [imageUrl, setImageUrl] = useState(category?.image_url || '');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
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

      addToast({
        message: isEditing ? 'Categoria actualizada' : 'Categoria creada',
        type: 'success'
      });
      router.push('/dashboard/categories');
      router.refresh();
    } catch (err) {
      console.error(err);
      addToast({ message: 'Error al guardar la categoria', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-8 max-w-3xl mx-auto'>
      <h1 className='text-32-48 font-bold text-gray-900 dark:text-gray-100'>
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
          onRemove={() => {
            setPendingFile(null);
            setImageUrl('');
          }}
        />
      </DashboardCard>

      {/* 3. Configuracion */}
      <DashboardCard title='Configuracion' className='space-y-4'>
        <Checkbox checked={isVisible} onChange={setIsVisible} label='Visible' />
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
