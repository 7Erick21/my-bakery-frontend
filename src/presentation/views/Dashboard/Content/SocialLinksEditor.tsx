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

import { Button, DashboardCard, IconButton, Input, Label, Select } from '@/components/atoms';
import FacebookIcon from '@/icons/facebooks.svg';
import GripIcon from '@/icons/grip.svg';
import InstagramIcon from '@/icons/instagram.svg';
import LinkedinIcon from '@/icons/linkedin.svg';
import PencilIcon from '@/icons/pencil.svg';
import PinterestIcon from '@/icons/pinterest.svg';
import TelegramIcon from '@/icons/telegram.svg';
import ThreadsIcon from '@/icons/threads.svg';
import TiktokIcon from '@/icons/tiktok.svg';
import TrashIcon from '@/icons/trash.svg';
import TwitterIcon from '@/icons/twitter.svg';
import WhatsappIcon from '@/icons/whatsapp.svg';
import YoutubeIcon from '@/icons/youtube.svg';
import type { LandingSocialLink } from '@/lib/supabase/models';
import {
  createSocialLink,
  deleteSocialLink,
  reorderSocialLinks,
  updateSocialLink
} from '@/server/actions/cms';
import { useToastStore } from '@/shared/stores/toastStore';
import { FormActions } from '../shared/FormActions';
import { PageHeader } from '../shared/PageHeader';

const platformOptions = [
  'facebook',
  'instagram',
  'twitter',
  'tiktok',
  'youtube',
  'whatsapp',
  'linkedin',
  'pinterest',
  'telegram',
  'threads'
];

const socialIconMap: Record<string, typeof FacebookIcon> = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  twitter: TwitterIcon,
  tiktok: TiktokIcon,
  youtube: YoutubeIcon,
  whatsapp: WhatsappIcon,
  linkedin: LinkedinIcon,
  pinterest: PinterestIcon,
  telegram: TelegramIcon,
  threads: ThreadsIcon
};

interface SocialLinksEditorProps {
  links: LandingSocialLink[];
}

export const SocialLinksEditor: FC<SocialLinksEditorProps> = ({ links }) => {
  const router = useRouter();
  const addToast = useToastStore(s => s.addToast);
  const [editing, setEditing] = useState<LandingSocialLink | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [items, setItems] = useState(links);

  useEffect(() => {
    setItems(links);
  }, [links]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const usedPlatforms = new Set(items.map(l => l.platform));
  const availablePlatforms = platformOptions.filter(p => !usedPlatforms.has(p));
  const allUsed = availablePlatforms.length === 0;

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex(i => i.id === active.id);
    const newIndex = items.findIndex(i => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);

    setItems(reordered);

    try {
      await reorderSocialLinks(reordered.map(i => i.id));
      addToast({ message: 'Orden actualizado', type: 'success' });
      router.refresh();
    } catch {
      setItems(links);
      addToast({ message: 'Error al reordenar', type: 'error' });
    }
  }

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Redes Sociales'
        action={
          !allUsed ? (
            <Button
              variant='primary'
              className='cursor-pointer'
              onClick={() => {
                setEditing({
                  id: '',
                  platform: availablePlatforms[0],
                  url: '',
                  icon: availablePlatforms[0],
                  sort_order: items.length + 1
                });
                setIsNew(true);
              }}
            >
              + Nuevo enlace
            </Button>
          ) : undefined
        }
      />

      {editing ? (
        <LinkForm
          link={editing}
          isNew={isNew}
          availablePlatforms={availablePlatforms}
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
              {items.map(link => (
                <SortableSocialLinkItem
                  key={link.id}
                  link={link}
                  onEdit={() => {
                    setEditing(link);
                    setIsNew(false);
                  }}
                  onDelete={async () => {
                    await deleteSocialLink(link.id);
                    router.refresh();
                  }}
                />
              ))}
              {items.length === 0 && (
                <p className='text-gray-500 text-center py-8'>No hay redes sociales configuradas</p>
              )}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

SocialLinksEditor.displayName = 'SocialLinksEditor';

// ─── Sortable Item ──────────────────────────────────────────

interface SortableSocialLinkItemProps {
  link: LandingSocialLink;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableSocialLinkItem({ link, onEdit, onDelete }: SortableSocialLinkItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: link.id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined
  };

  const PlatformIcon = socialIconMap[link.platform] || FacebookIcon;

  return (
    <div ref={setNodeRef} style={style}>
      <DashboardCard>
        <div className='flex items-center gap-3'>
          <button
            type='button'
            className='cursor-grab active:cursor-grabbing touch-none text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            aria-label='Reordenar enlace'
            {...attributes}
            {...listeners}
          >
            <GripIcon className='w-5 h-5' />
          </button>

          <div className='w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center'>
            <PlatformIcon className='w-5 h-5 text-amber-600' />
          </div>

          <div className='flex-1 min-w-0'>
            <span className='font-semibold text-gray-900 dark:text-gray-100'>
              {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
            </span>
            <p className='text-16-20 text-gray-500 truncate'>{link.url}</p>
          </div>

          <div className='flex gap-1 shrink-0'>
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

// ─── Link Form ──────────────────────────────────────────────

interface LinkFormProps {
  link: LandingSocialLink;
  isNew: boolean;
  availablePlatforms: string[];
  onCancel: () => void;
  onSaved: () => void;
}

function LinkForm({ link, isNew, availablePlatforms, onCancel, onSaved }: LinkFormProps) {
  const selectOptions = isNew ? availablePlatforms : [link.platform, ...availablePlatforms];

  const [platform, setPlatform] = useState(link.platform);
  const [url, setUrl] = useState(link.url);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set('platform', platform);
      formData.set('url', url);
      formData.set('icon', platform);
      formData.set('sort_order', String(link.sort_order));

      if (isNew) {
        await createSocialLink(formData);
      } else {
        formData.set('is_visible', 'true');
        await updateSocialLink(link.id, formData);
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
      <DashboardCard title={isNew ? 'Nuevo enlace social' : `Editar: ${link.platform}`}>
        <div className='space-y-4'>
          <div>
            <Label required>Plataforma</Label>
            <Select
              value={platform}
              onChange={setPlatform}
              options={selectOptions.map(opt => ({
                value: opt,
                label: opt.charAt(0).toUpperCase() + opt.slice(1)
              }))}
            />
          </div>
          <div>
            <Label required>URL</Label>
            <Input
              type='text'
              value={url}
              onChange={e => setUrl(e.target.value)}
              required
              placeholder='https://...'
            />
          </div>
        </div>
      </DashboardCard>

      <FormActions submitting={submitting} onCancel={onCancel} cancelLabel='Volver' />
    </form>
  );
}
