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
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useRouter } from 'next/navigation';
import { type FC, useEffect, useState } from 'react';

import { Button, DashboardCard, IconButton, Input, Label } from '@/components/atoms';
import GripIcon from '@/icons/grip.svg';
import PencilIcon from '@/icons/pencil.svg';
import TrashIcon from '@/icons/trash.svg';
import type { LandingTimelineEvent } from '@/lib/supabase/models';
import {
  deleteTimelineEvent,
  reorderTimelineEvents,
  upsertTimelineEvent
} from '@/server/actions/cms';
import { useToastStore } from '@/shared/stores/toastStore';
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
  const addToast = useToastStore(s => s.addToast);
  const [editing, setEditing] = useState<LandingTimelineEvent | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [items, setItems] = useState(events);

  useEffect(() => {
    setItems(events);
  }, [events]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex(i => i.id === active.id);
    const newIndex = items.findIndex(i => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);

    setItems(reordered);

    try {
      await reorderTimelineEvents(reordered.map(i => i.id));
      addToast({ message: 'Orden actualizado', type: 'success' });
      router.refresh();
    } catch {
      setItems(events);
      addToast({ message: 'Error al reordenar', type: 'error' });
    }
  }

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
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
            <div className='grid gap-4'>
              {items.map(event => (
                <SortableTimelineItem
                  key={event.id}
                  event={event}
                  onEdit={() => {
                    setEditing(event);
                    setIsNew(false);
                  }}
                  onDelete={async () => {
                    await deleteTimelineEvent(event.id);
                    router.refresh();
                  }}
                />
              ))}
              {items.length === 0 && (
                <p className='text-gray-500 text-center py-8'>No hay eventos en el timeline</p>
              )}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

TimelineEditor.displayName = 'TimelineEditor';

// ─── Sortable Item ──────────────────────────────────────────

interface SortableTimelineItemProps {
  event: LandingTimelineEvent;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableTimelineItem({ event, onEdit, onDelete }: SortableTimelineItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: event.id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined
  };

  const esTitle =
    event.timeline_event_translations.find(t => t.language_code === 'es')?.title ||
    event.timeline_event_translations[0]?.title ||
    '';

  return (
    <div ref={setNodeRef} style={style}>
      <DashboardCard>
        <div className='flex items-center gap-3'>
          <button
            type='button'
            className='cursor-grab active:cursor-grabbing touch-none text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            aria-label='Reordenar evento'
            {...attributes}
            {...listeners}
          >
            <GripIcon className='w-5 h-5' />
          </button>

          <span className='font-semibold text-gray-900 dark:text-gray-100 flex-1'>
            {event.year} — {esTitle}
          </span>

          <div className='flex gap-1'>
            <IconButton aria-label='Editar' variant='accent' onClick={onEdit}>
              <PencilIcon className='w-4 h-4' />
            </IconButton>
            <IconButton aria-label='Eliminar' variant='danger' onClick={onDelete}>
              <TrashIcon className='w-4 h-4' />
            </IconButton>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
}

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
      formData.set('sort_order', String(event.sort_order));
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
        <div>
          <Label required>Año</Label>
          <Input type='number' value={year} onChange={e => setYear(e.target.value)} required />
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
