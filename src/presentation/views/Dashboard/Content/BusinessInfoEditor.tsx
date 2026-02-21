'use client';

import { useRouter } from 'next/navigation';
import { type FC, useState } from 'react';

import { Button, DashboardCard, IconButton, Input, Label } from '@/components/atoms';
import PencilIcon from '@/icons/pencil.svg';
import type { LandingBusinessInfoItem } from '@/lib/supabase/models';
import { createBusinessInfo, updateBusinessInfo } from '@/server/actions/cms';
import { FormActions } from '../shared/FormActions';
import { PageHeader } from '../shared/PageHeader';
import { type Translation, TranslationFields } from '../shared/TranslationFields';

interface BusinessInfoEditorProps {
  items: LandingBusinessInfoItem[];
  languages: { code: string; name: string }[];
}

export const BusinessInfoEditor: FC<BusinessInfoEditorProps> = ({ items, languages }) => {
  const router = useRouter();
  const [editing, setEditing] = useState<LandingBusinessInfoItem | null>(null);
  const [isNew, setIsNew] = useState(false);

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Info del Negocio'
        action={
          <Button
            variant='primary'
            className='cursor-pointer'
            onClick={() => {
              setEditing({ id: '', key: '', value: '', business_info_translations: [] });
              setIsNew(true);
            }}
          >
            + Nueva clave
          </Button>
        }
      />

      {editing ? (
        <InfoForm
          item={editing}
          isNew={isNew}
          languages={languages}
          onCancel={() => {
            setEditing(null);
            setIsNew(false);
          }}
          onSaved={() => {
            setEditing(null);
            setIsNew(false);
            router.refresh();
          }}
        />
      ) : (
        <div className='grid gap-4'>
          {items.map(item => (
            <DashboardCard key={item.id} title={item.key}>
              <div className='flex items-center justify-between'>
                <p className='text-16-20 text-gray-500 truncate max-w-xs'>{item.value}</p>
                <IconButton
                  aria-label='Editar'
                  variant='accent'
                  onClick={() => {
                    setEditing(item);
                    setIsNew(false);
                  }}
                >
                  <PencilIcon className='w-4 h-4' />
                </IconButton>
              </div>
            </DashboardCard>
          ))}
          {items.length === 0 && (
            <p className='text-gray-500 text-center py-8'>No hay información del negocio</p>
          )}
        </div>
      )}
    </div>
  );
};

BusinessInfoEditor.displayName = 'BusinessInfoEditor';

// ─── Info Form ──────────────────────────────────────────────

interface InfoFormProps {
  item: LandingBusinessInfoItem;
  isNew: boolean;
  languages: { code: string; name: string }[];
  onCancel: () => void;
  onSaved: () => void;
}

function InfoForm({ item, isNew, languages, onCancel, onSaved }: InfoFormProps) {
  const [key, setKey] = useState(item.key);
  const [value, setValue] = useState(item.value);
  const [translations, setTranslations] = useState<Translation[]>(
    item.business_info_translations.map(t => ({
      id: t.id,
      language_code: t.language_code,
      value: t.value
    }))
  );
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set('value', value);
      formData.set('translations', JSON.stringify(translations));

      if (isNew) {
        formData.set('key', key);
        await createBusinessInfo(formData);
      } else {
        await updateBusinessInfo(item.id, formData);
      }
      onSaved();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6 max-w-3xl'>
      <DashboardCard title={isNew ? 'Nueva clave' : `Editar: ${item.key}`}>
        <div className='space-y-4'>
          <div>
            <Label required>Clave</Label>
            <Input
              type='text'
              value={key}
              onChange={e => setKey(e.target.value)}
              required
              disabled={!isNew}
              placeholder='ej: phone, address, open_hours'
            />
          </div>
          <div>
            <Label required>Valor por defecto</Label>
            <Input type='text' value={value} onChange={e => setValue(e.target.value)} required />
          </div>
        </div>
      </DashboardCard>

      <DashboardCard title='Traducciones'>
        <TranslationFields
          languages={languages}
          fields={[{ key: 'value', label: 'Valor', type: 'text', required: true }]}
          translations={translations}
          onChange={setTranslations}
        />
      </DashboardCard>

      <FormActions submitting={submitting} onCancel={onCancel} cancelLabel='Volver' />
    </form>
  );
}
