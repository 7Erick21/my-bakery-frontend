'use client';

import { useRouter } from 'next/navigation';
import { type FC, useState } from 'react';
import { Button, DashboardCard, Input, Label } from '@/components/atoms';
import type { LanguageRow } from '@/lib/supabase/models';
import { upsertLanguage } from '@/server/actions/cms';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { DataTable } from '../shared/DataTable';
import { PageHeader } from '../shared/PageHeader';

interface LanguagesListProps {
  languages: LanguageRow[];
}

export const LanguagesList: FC<LanguagesListProps> = ({ languages }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newNativeName, setNewNativeName] = useState('');

  const columns = [
    {
      key: 'code',
      header: 'Código',
      render: (item: LanguageRow) => (
        <span className='font-mono text-16-20 font-medium text-gray-900 dark:text-gray-100'>
          {item.code}
        </span>
      )
    },
    {
      key: 'name',
      header: 'Nombre',
      render: (item: LanguageRow) => (
        <span className='text-gray-700 dark:text-gray-300'>{item.name}</span>
      )
    },
    {
      key: 'native_name',
      header: 'Nombre nativo',
      render: (item: LanguageRow) => (
        <span className='text-gray-700 dark:text-gray-300'>{item.native_name}</span>
      )
    },
    {
      key: 'active',
      header: 'Activo',
      render: (item: LanguageRow) => (
        <Button
          variant='ghost'
          onClick={async () => {
            const formData = new FormData();
            formData.set('code', item.code);
            formData.set('name', item.name);
            formData.set('native_name', item.native_name);
            formData.set('is_active', String(!item.is_active));
            formData.set('sort_order', String(item.sort_order));
            await upsertLanguage(formData);
            router.refresh();
          }}
          className={`!px-2 !py-1 !rounded-full !text-sm !border-0 ${
            item.is_active
              ? '!bg-green-100 !text-green-700 dark:!bg-green-900/30 dark:!text-green-400'
              : '!bg-gray-100 !text-gray-500 dark:!bg-gray-800 dark:!text-gray-500'
          }`}
        >
          {item.is_active ? 'Sí' : 'No'}
        </Button>
      )
    },
    {
      key: 'order',
      header: 'Orden',
      render: (item: LanguageRow) => (
        <span className='text-gray-600 dark:text-gray-400'>{item.sort_order}</span>
      )
    }
  ];

  async function handleAddLanguage(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    formData.set('code', newCode);
    formData.set('name', newName);
    formData.set('native_name', newNativeName);
    formData.set('is_new', 'true');
    formData.set('is_active', 'true');
    formData.set('sort_order', String(languages.length));
    await upsertLanguage(formData);
    setShowForm(false);
    setNewCode('');
    setNewName('');
    setNewNativeName('');
    router.refresh();
  }

  return (
    <div className='space-y-6'>
      <PageHeader
        title={t('dashboard.nav.languages', 'Idiomas')}
        action={
          <Button
            variant='primary'
            className='cursor-pointer'
            onClick={() => setShowForm(!showForm)}
          >
            Nuevo idioma
          </Button>
        }
      />

      {showForm && (
        <DashboardCard>
          <form onSubmit={handleAddLanguage} className='space-y-4'>
            <div className='grid grid-cols-3 gap-4'>
              <div>
                <Label>Código (ej: fr)</Label>
                <Input
                  type='text'
                  value={newCode}
                  onChange={e => setNewCode(e.target.value)}
                  required
                  maxLength={5}
                />
              </div>
              <div>
                <Label>Nombre</Label>
                <Input
                  type='text'
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Nombre nativo</Label>
                <Input
                  type='text'
                  value={newNativeName}
                  onChange={e => setNewNativeName(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button variant='primary' className='cursor-pointer' type='submit'>
              Agregar
            </Button>
          </form>
        </DashboardCard>
      )}

      <DataTable columns={columns} data={languages} emptyMessage='No hay idiomas configurados' />
    </div>
  );
};

LanguagesList.displayName = 'LanguagesList';
