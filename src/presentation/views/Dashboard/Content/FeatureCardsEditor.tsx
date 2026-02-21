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

import { Button, DashboardCard, IconButton, Label } from '@/components/atoms';
import AwardIcon from '@/icons/award.svg';
import CakeIcon from '@/icons/cake.svg';
import ClockIcon from '@/icons/clock.svg';
import CoffeeIcon from '@/icons/coffe.svg';
import GiftIcon from '@/icons/gift.svg';
import GripIcon from '@/icons/grip.svg';
import HandshakeIcon from '@/icons/handshake.svg';
import HeartIcon from '@/icons/heart.svg';
import LeafIcon from '@/icons/leaf.svg';
import PencilIcon from '@/icons/pencil.svg';
import ShieldIcon from '@/icons/shield.svg';
import SparklesIcon from '@/icons/sparkles.svg';
import StarIcon from '@/icons/star.svg';
import TrashIcon from '@/icons/trash.svg';
import TruckIcon from '@/icons/truck.svg';
import UserIcon from '@/icons/user.svg';
import WheatIcon from '@/icons/wheat.svg';
import type { LandingFeatureCard } from '@/lib/supabase/models';
import { deleteFeatureCard, reorderFeatureCards, upsertFeatureCard } from '@/server/actions/cms';
import { useToastStore } from '@/shared/stores/toastStore';
import { FormActions } from '../shared/FormActions';
import { PageHeader } from '../shared/PageHeader';
import { type Translation, TranslationFields } from '../shared/TranslationFields';

const iconOptions: { key: string; label: string; Icon: typeof HeartIcon }[] = [
  { key: 'heart', label: 'Corazón', Icon: HeartIcon },
  { key: 'award', label: 'Premio', Icon: AwardIcon },
  { key: 'star', label: 'Estrella', Icon: StarIcon },
  { key: 'cake', label: 'Pastel', Icon: CakeIcon },
  { key: 'wheat', label: 'Trigo', Icon: WheatIcon },
  { key: 'coffee', label: 'Café', Icon: CoffeeIcon },
  { key: 'leaf', label: 'Hoja', Icon: LeafIcon },
  { key: 'sparkles', label: 'Brillo', Icon: SparklesIcon },
  { key: 'clock', label: 'Reloj', Icon: ClockIcon },
  { key: 'truck', label: 'Envío', Icon: TruckIcon },
  { key: 'shield', label: 'Garantía', Icon: ShieldIcon },
  { key: 'gift', label: 'Regalo', Icon: GiftIcon },
  { key: 'user', label: 'Persona', Icon: UserIcon },
  { key: 'handshake', label: 'Acuerdo', Icon: HandshakeIcon }
];

const iconMap = Object.fromEntries(iconOptions.map(o => [o.key, o.Icon]));

interface FeatureCardsEditorProps {
  cards: LandingFeatureCard[];
  languages: { code: string; name: string }[];
}

export const FeatureCardsEditor: FC<FeatureCardsEditorProps> = ({ cards, languages }) => {
  const router = useRouter();
  const addToast = useToastStore(s => s.addToast);
  const [editing, setEditing] = useState<LandingFeatureCard | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [items, setItems] = useState(cards);

  useEffect(() => {
    setItems(cards);
  }, [cards]);

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
      await reorderFeatureCards(reordered.map(i => i.id));
      addToast({ message: 'Orden actualizado', type: 'success' });
      router.refresh();
    } catch {
      setItems(cards);
      addToast({ message: 'Error al reordenar', type: 'error' });
    }
  }

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Feature Cards'
        action={
          cards.length < 4 && (
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
          )
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
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
            <div className='grid gap-4'>
              {items.map(card => (
                <SortableFeatureItem
                  key={card.id}
                  card={card}
                  onEdit={() => {
                    setEditing(card);
                    setIsNew(false);
                  }}
                  onDelete={async () => {
                    await deleteFeatureCard(card.id);
                    router.refresh();
                  }}
                />
              ))}
              {items.length === 0 && (
                <p className='text-gray-500 text-center py-8'>No hay feature cards</p>
              )}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

FeatureCardsEditor.displayName = 'FeatureCardsEditor';

// ─── Sortable Item ──────────────────────────────────────────

interface SortableFeatureItemProps {
  card: LandingFeatureCard;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableFeatureItem({ card, onEdit, onDelete }: SortableFeatureItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined
  };

  const esTitle =
    card.feature_card_translations.find(t => t.language_code === 'es')?.title ||
    card.feature_card_translations[0]?.title ||
    '';
  const CardIcon = iconMap[card.icon || ''] || HeartIcon;

  return (
    <div ref={setNodeRef} style={style}>
      <DashboardCard>
        <div className='flex items-center gap-3'>
          <button
            type='button'
            className='cursor-grab active:cursor-grabbing touch-none text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            aria-label='Reordenar card'
            {...attributes}
            {...listeners}
          >
            <GripIcon className='w-5 h-5' />
          </button>

          <div className='w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center'>
            <CardIcon className='w-5 h-5 text-amber-600' />
          </div>

          <span className='font-semibold text-gray-900 dark:text-gray-100 flex-1'>{esTitle}</span>

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
      formData.set('sort_order', String(card.sort_order));
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
        <div>
          <Label required>Icono</Label>
          <div className='grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2 mt-2'>
            {iconOptions.map(opt => (
              <button
                key={opt.key}
                type='button'
                onClick={() => setIcon(opt.key)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                  icon === opt.key
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <opt.Icon
                  className={`w-6 h-6 ${icon === opt.key ? 'text-amber-600' : 'text-gray-500 dark:text-gray-400'}`}
                />
                <span
                  className={`text-sm leading-tight text-center ${icon === opt.key ? 'text-amber-700 dark:text-amber-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  {opt.label}
                </span>
              </button>
            ))}
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
