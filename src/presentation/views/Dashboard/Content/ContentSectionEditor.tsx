'use client';

import { useRouter } from 'next/navigation';
import { type FC, useState } from 'react';
import { Checkbox, DashboardCard } from '@/components/atoms';
import type { CmsContentItem } from '@/lib/supabase/models';
import { upsertCmsContent } from '@/server/actions/cms';
import { FormActions } from '../shared/FormActions';
import { ImageUploader } from '../shared/ImageUploader';
import { type Translation, TranslationFields } from '../shared/TranslationFields';
import { uploadFile } from '../shared/uploadFile';

interface ContentSectionEditorProps {
  section: string;
  content: CmsContentItem[];
  languages: { code: string; name: string }[];
}

type FieldDef = { key: string; label: string; type: 'text' | 'textarea' };

interface SectionConfig {
  fields: FieldDef[];
  hasImage: boolean;
}

const allFields: Record<string, FieldDef> = {
  title: { key: 'title', label: 'Titulo', type: 'text' },
  subtitle: { key: 'subtitle', label: 'Subtitulo', type: 'text' },
  body: { key: 'body', label: 'Contenido', type: 'textarea' },
  cta_text: { key: 'cta_text', label: 'Texto del boton', type: 'text' },
  cta_url: { key: 'cta_url', label: 'URL del boton', type: 'text' }
};

const f = (...keys: string[]) => keys.map(k => allFields[k]);

const sectionConfig: Record<string, SectionConfig> = {
  hero: { fields: f('title', 'subtitle', 'body', 'cta_text', 'cta_url'), hasImage: true },
  products_intro: { fields: f('title', 'body', 'cta_text', 'cta_url'), hasImage: false },
  about_intro: { fields: f('title', 'body', 'cta_text', 'cta_url'), hasImage: false },
  about_footer: { fields: f('body', 'cta_text', 'cta_url'), hasImage: false },
  contact_intro: { fields: f('title', 'subtitle', 'body', 'cta_text', 'cta_url'), hasImage: false },
  footer: { fields: f('body'), hasImage: false },
  seo: {
    fields: [
      { key: 'title', label: 'Meta titulo', type: 'text' },
      { key: 'body', label: 'Meta descripcion', type: 'textarea' }
    ],
    hasImage: false
  }
};

const defaultConfig: SectionConfig = {
  fields: f('title', 'subtitle', 'body', 'cta_text', 'cta_url'),
  hasImage: false
};

export const ContentSectionEditor: FC<ContentSectionEditorProps> = ({
  section,
  content,
  languages
}) => {
  const router = useRouter();
  const config = sectionConfig[section] || defaultConfig;

  const item = content[0];
  const [imageUrl, setImageUrl] = useState(item?.image_url || '');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isVisible, setIsVisible] = useState(item?.is_visible ?? true);
  const [translations, setTranslations] = useState<Translation[]>(
    item?.cms_content_translations || []
  );
  const [submitting, setSubmitting] = useState(false);

  const originalImageUrl = item?.image_url || '';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      let finalImageUrl = imageUrl;

      // Upload pending file if any
      if (pendingFile) {
        finalImageUrl = await uploadFile(pendingFile, 'my-bakery/cms');
      }

      const formData = new FormData();
      if (item?.id) formData.set('id', item.id);
      formData.set('image_url', finalImageUrl);
      formData.set('is_visible', String(isVisible));
      formData.set('sort_order', '0');
      formData.set('translations', JSON.stringify(translations));

      // Pass old URL so the server can clean up from Cloudinary
      if (originalImageUrl && originalImageUrl !== finalImageUrl) {
        formData.set('old_image_url', originalImageUrl);
      }

      await upsertCmsContent(section, formData);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-8 max-w-3xl'>
      <div className='flex items-center justify-between'>
        <h1 className='text-32-48 font-bold text-gray-900 dark:text-gray-100'>
          Editar: {section.replace('_', ' ')}
        </h1>
      </div>

      <DashboardCard title='Traducciones'>
        <TranslationFields
          languages={languages}
          fields={config.fields}
          translations={translations}
          onChange={setTranslations}
        />
      </DashboardCard>

      {config.hasImage && (
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
      )}

      <Checkbox checked={isVisible} onChange={setIsVisible} label='Visible' />

      <FormActions
        submitting={submitting}
        onCancel={() => router.push('/dashboard/content')}
        cancelLabel='Volver'
      />
    </form>
  );
};

ContentSectionEditor.displayName = 'ContentSectionEditor';
