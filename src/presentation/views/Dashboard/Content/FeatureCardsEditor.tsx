'use client';

import { useRouter } from 'next/navigation';
import { type FC, useState } from 'react';

import { Button, DashboardCard, Input, Label, Select } from '@/components/atoms';
import type { LandingFeatureCard } from '@/lib/supabase/models';
import { deleteFeatureCard, upsertFeatureCard } from '@/server/actions/cms';
import { FormActions } from '../shared/FormActions';
import { PageHeader } from '../shared/PageHeader';
import { type Translation, TranslationFields } from '../shared/TranslationFields';

const iconOptions = ['heart', 'award', 'user', 'clock', 'coffee'];

interface FeatureCardsEditorProps {
  cards: LandingFeatureCard[];
  languages: { code: string; name: string }[];
}

export const FeatureCardsEditor: FC<FeatureCardsEditorProps> = ({ cards, languages }) => {
  const router = useRouter();
  const [editing, setEditing] = useState<LandingFeatureCard | null>(null);
  const [isNew, setIsNew] = useState(false);

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Feature Cards'
        action={
          <Button
            variant='primary'
            className='cursor-pointer'
            onClick={() => {
              setEditing({
                id: '',
                icon: 'heart',
                sort_order: cards.length + 1,
                feature_card_translations: []
              });
              setIsNew(true);
            }}
          >
            + Nueva card
          </Button>
        }
      />

      {editing ? (
        <CardForm
          card={editing}
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
          {cards.map(card => {
            const esTitle =
              card.feature_card_translations.find(t => t.language_code === 'es')?.title ||
              card.feature_card_translations[0]?.title ||
              '';
            return (
              <DashboardCard key={card.id} title={`${card.icon} — ${esTitle}`}>
                <div className='flex items-center justify-between'>
                  <p className='text-14-16 text-gray-500'>Orden: {card.sort_order}</p>
                  <div className='flex gap-2'>
                    <Button
                      variant='secondary'
                      className='cursor-pointer'
                      onClick={() => {
                        setEditing(card);
                        setIsNew(false);
                      }}
                    >
                      Editar
                    </Button>
                    <Button
                      variant='secondary'
                      className='cursor-pointer text-red-500'
                      onClick={async () => {
                        await deleteFeatureCard(card.id);
                        router.refresh();
                      }}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </DashboardCard>
            );
          })}
          {cards.length === 0 && (
            <p className='text-gray-500 text-center py-8'>No hay feature cards</p>
          )}
        </div>
      )}
    </div>
  );
};

FeatureCardsEditor.displayName = 'FeatureCardsEditor';

// ─── Card Form ──────────────────────────────────────────────

interface CardFormProps {
  card: LandingFeatureCard;
  isNew: boolean;
  languages: { code: string; name: string }[];
  onCancel: () => void;
  onSaved: () => void;
}

function CardForm({ card, isNew, languages, onCancel, onSaved }: CardFormProps) {
  const [icon, setIcon] = useState(card.icon || 'heart');
  const [sortOrder, setSortOrder] = useState(String(card.sort_order));
  const [translations, setTranslations] = useState<Translation[]>(
    card.feature_card_translations as Translation[]
  );
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      if (!isNew && card.id) formData.set('id', card.id);
      formData.set('icon', icon);
      formData.set('sort_order', sortOrder);
      formData.set('translations', JSON.stringify(translations));

      await upsertFeatureCard(formData);
      onSaved();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6 max-w-3xl'>
      <DashboardCard title={isNew ? 'Nueva card' : 'Editar card'}>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <Label required>Icono</Label>
            <Select value={icon} onChange={e => setIcon(e.target.value)}>
              {iconOptions.map(opt => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Orden</Label>
            <Input type='number' value={sortOrder} onChange={e => setSortOrder(e.target.value)} />
          </div>
        </div>
      </DashboardCard>

      <DashboardCard title='Traducciones'>
        <TranslationFields
          languages={languages}
          fields={[
            { key: 'title', label: 'Título', type: 'text', required: true },
            { key: 'description', label: 'Descripción', type: 'textarea' }
          ]}
          translations={translations}
          onChange={setTranslations}
        />
      </DashboardCard>

      <FormActions submitting={submitting} onCancel={onCancel} cancelLabel='Volver' />
    </form>
  );
}
