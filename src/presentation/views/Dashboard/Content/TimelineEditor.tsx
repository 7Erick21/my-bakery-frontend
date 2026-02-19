'use client';

import { useRouter } from 'next/navigation';
import { type FC, useState } from 'react';

import { Button, DashboardCard, Input, Label } from '@/components/atoms';
import type { LandingTimelineEvent } from '@/lib/supabase/models';
import { deleteTimelineEvent, upsertTimelineEvent } from '@/server/actions/cms';
import { FormActions } from '../shared/FormActions';
import { ImageUploader } from '../shared/ImageUploader';
import { PageHeader } from '../shared/PageHeader';
import { type Translation, TranslationFields } from '../shared/TranslationFields';
import { uploadFile } from '../shared/uploadFile';

interface TimelineEditorProps {
  events: LandingTimelineEvent[];
  languages: { code: string; name: string }[];
}

export const TimelineEditor: FC<TimelineEditorProps> = ({ events, languages }) => {
  const router = useRouter();
  const [editing, setEditing] = useState<LandingTimelineEvent | null>(null);
  const [isNew, setIsNew] = useState(false);

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Timeline (Nuestra Historia)'
        action={
          <Button
            variant='primary'
            className='cursor-pointer'
            onClick={() => {
              setEditing({
                id: '',
                year: new Date().getFullYear(),
                image_url: null,
                sort_order: events.length + 1,
                timeline_event_translations: []
              });
              setIsNew(true);
            }}
          >
            + Nuevo evento
          </Button>
        }
      />

      {editing ? (
        <EventForm
          event={editing}
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
          {events.map(event => {
            const esTitle =
              event.timeline_event_translations.find(t => t.language_code === 'es')?.title ||
              event.timeline_event_translations[0]?.title ||
              '';
            return (
              <DashboardCard key={event.id} title={`${event.year} — ${esTitle}`}>
                <div className='flex items-center justify-between'>
                  <p className='text-14-16 text-gray-500'>Orden: {event.sort_order}</p>
                  <div className='flex gap-2'>
                    <Button
                      variant='secondary'
                      className='cursor-pointer'
                      onClick={() => {
                        setEditing(event);
                        setIsNew(false);
                      }}
                    >
                      Editar
                    </Button>
                    <Button
                      variant='secondary'
                      className='cursor-pointer text-red-500'
                      onClick={async () => {
                        await deleteTimelineEvent(event.id);
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
          {events.length === 0 && (
            <p className='text-gray-500 text-center py-8'>No hay eventos en el timeline</p>
          )}
        </div>
      )}
    </div>
  );
};

TimelineEditor.displayName = 'TimelineEditor';

// ─── Event Form ─────────────────────────────────────────────

interface EventFormProps {
  event: LandingTimelineEvent;
  isNew: boolean;
  languages: { code: string; name: string }[];
  onCancel: () => void;
  onSaved: () => void;
}

function EventForm({ event, isNew, languages, onCancel, onSaved }: EventFormProps) {
  const [year, setYear] = useState(String(event.year));
  const [sortOrder, setSortOrder] = useState(String(event.sort_order));
  const [imageUrl, setImageUrl] = useState(event.image_url || '');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [translations, setTranslations] = useState<Translation[]>(
    event.timeline_event_translations as Translation[]
  );
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      let finalImageUrl = imageUrl;
      if (pendingFile) {
        finalImageUrl = await uploadFile(pendingFile, 'my-bakery/timeline');
      }

      const formData = new FormData();
      if (!isNew && event.id) formData.set('id', event.id);
      formData.set('year', year);
      formData.set('sort_order', sortOrder);
      formData.set('image_url', finalImageUrl);
      formData.set('translations', JSON.stringify(translations));

      if (event.image_url && event.image_url !== finalImageUrl) {
        formData.set('old_image_url', event.image_url);
      }

      await upsertTimelineEvent(formData);
      onSaved();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6 max-w-3xl'>
      <DashboardCard title={isNew ? 'Nuevo evento' : `Editar evento ${year}`}>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <Label required>Año</Label>
            <Input type='number' value={year} onChange={e => setYear(e.target.value)} required />
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

      <FormActions submitting={submitting} onCancel={onCancel} cancelLabel='Volver' />
    </form>
  );
}
