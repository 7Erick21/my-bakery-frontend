'use client';

import type { Route } from 'next';
import Link from 'next/link';
import type { FC } from 'react';
import { StatusBadge } from '@/components/atoms';
import type { CmsContentItem } from '@/lib/supabase/models';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { PageHeader } from '../shared/PageHeader';

const sections = [
  { key: 'hero', label: 'Hero / Banner principal' },
  { key: 'products_intro', label: 'Introducción de Productos' },
  { key: 'about_intro', label: 'Introducción Sobre Nosotros' },
  { key: 'about_footer', label: 'Pie de Sobre Nosotros' },
  { key: 'contact_intro', label: 'Introducción de Contacto' },
  { key: 'footer', label: 'Footer' },
  { key: 'seo', label: 'SEO / Metadatos' }
];

const extraSections = [
  { key: 'timeline', label: 'Timeline (Nuestra Historia)' },
  { key: 'features', label: 'Feature Cards' },
  { key: 'business-info', label: 'Info del Negocio' },
  { key: 'social-links', label: 'Redes Sociales' }
];

interface ContentListProps {
  cmsContent: CmsContentItem[];
}

export const ContentList: FC<ContentListProps> = ({ cmsContent }) => {
  const { t } = useTranslation();

  return (
    <div className='space-y-6'>
      <PageHeader title={t('dashboard.nav.content', 'Contenido')} />

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {sections.map(section => {
          const content = cmsContent.filter(c => c.section === section.key);
          const hasContent = content.length > 0;

          return (
            <Link
              key={section.key}
              href={`/dashboard/content/${section.key}` as Route}
              className='block p-6 rounded-xl bg-[image:var(--background-image-dashboard-card-light)] dark:bg-[image:var(--background-image-dashboard-card-dark)] backdrop-blur-sm border border-border-card-children-light dark:border-border-card-children-dark shadow-[--shadow-dashboard-card-light] dark:shadow-[--shadow-dashboard-card-dark] hover:scale-[1.02] hover:shadow-lg transition-all duration-300 group'
            >
              <div className='flex items-center justify-between'>
                <h3 className='text-18-24 font-semibold text-gray-900 dark:text-gray-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors'>
                  {section.label}
                </h3>
                <StatusBadge variant={hasContent ? 'green' : 'gray'}>
                  {hasContent ? `${content.length} elemento(s)` : 'Vacío'}
                </StatusBadge>
              </div>
              <p className='text-14-16 text-gray-500 dark:text-gray-400 mt-2'>
                Editar textos, imágenes y traducciones de esta sección
              </p>
            </Link>
          );
        })}

        {extraSections.map(section => (
          <Link
            key={section.key}
            href={`/dashboard/content/${section.key}` as Route}
            className='block p-6 rounded-xl bg-[image:var(--background-image-dashboard-card-light)] dark:bg-[image:var(--background-image-dashboard-card-dark)] backdrop-blur-sm border border-border-card-children-light dark:border-border-card-children-dark shadow-[--shadow-dashboard-card-light] dark:shadow-[--shadow-dashboard-card-dark] hover:scale-[1.02] hover:shadow-lg transition-all duration-300 group'
          >
            <div className='flex items-center justify-between'>
              <h3 className='text-18-24 font-semibold text-gray-900 dark:text-gray-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors'>
                {section.label}
              </h3>
            </div>
            <p className='text-14-16 text-gray-500 dark:text-gray-400 mt-2'>
              Gestionar datos de esta sección
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

ContentList.displayName = 'ContentList';
