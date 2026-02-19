'use client';

import { useRouter } from 'next/navigation';
import { type FC, useState } from 'react';

import { Button, Checkbox, DashboardCard, Input, Label, Select } from '@/components/atoms';
import type { LandingSocialLink } from '@/lib/supabase/models';
import { createSocialLink, deleteSocialLink, updateSocialLink } from '@/server/actions/cms';
import { FormActions } from '../shared/FormActions';
import { PageHeader } from '../shared/PageHeader';

const platformOptions = ['facebook', 'instagram', 'twitter', 'tiktok', 'youtube', 'whatsapp'];

interface SocialLinksEditorProps {
  links: LandingSocialLink[];
}

export const SocialLinksEditor: FC<SocialLinksEditorProps> = ({ links }) => {
  const router = useRouter();
  const [editing, setEditing] = useState<LandingSocialLink | null>(null);
  const [isNew, setIsNew] = useState(false);

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Redes Sociales'
        action={
          <Button
            variant='primary'
            className='cursor-pointer'
            onClick={() => {
              setEditing({
                id: '',
                platform: 'facebook',
                url: '',
                icon: 'facebook',
                sort_order: links.length + 1
              });
              setIsNew(true);
            }}
          >
            + Nuevo enlace
          </Button>
        }
      />

      {editing ? (
        <LinkForm
          link={editing}
          isNew={isNew}
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
          {links.map(link => (
            <DashboardCard key={link.id} title={link.platform}>
              <div className='flex items-center justify-between'>
                <p className='text-14-16 text-gray-500 truncate max-w-xs'>{link.url}</p>
                <div className='flex gap-2'>
                  <Button
                    variant='secondary'
                    className='cursor-pointer'
                    onClick={() => {
                      setEditing(link);
                      setIsNew(false);
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant='secondary'
                    className='cursor-pointer text-red-500'
                    onClick={async () => {
                      await deleteSocialLink(link.id);
                      router.refresh();
                    }}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </DashboardCard>
          ))}
          {links.length === 0 && (
            <p className='text-gray-500 text-center py-8'>No hay redes sociales configuradas</p>
          )}
        </div>
      )}
    </div>
  );
};

SocialLinksEditor.displayName = 'SocialLinksEditor';

// ─── Link Form ──────────────────────────────────────────────

interface LinkFormProps {
  link: LandingSocialLink;
  isNew: boolean;
  onCancel: () => void;
  onSaved: () => void;
}

function LinkForm({ link, isNew, onCancel, onSaved }: LinkFormProps) {
  const [platform, setPlatform] = useState(link.platform);
  const [url, setUrl] = useState(link.url);
  const [icon, setIcon] = useState(link.icon || link.platform);
  const [sortOrder, setSortOrder] = useState(String(link.sort_order));
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set('platform', platform);
      formData.set('url', url);
      formData.set('icon', icon);
      formData.set('sort_order', sortOrder);

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
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label required>Plataforma</Label>
              <Select value={platform} onChange={e => setPlatform(e.target.value)}>
                {platformOptions.map(opt => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Icono</Label>
              <Input
                type='text'
                value={icon}
                onChange={e => setIcon(e.target.value)}
                placeholder='facebook, instagram...'
              />
            </div>
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
          <div>
            <Label>Orden</Label>
            <Input type='number' value={sortOrder} onChange={e => setSortOrder(e.target.value)} />
          </div>
        </div>
      </DashboardCard>

      <FormActions submitting={submitting} onCancel={onCancel} cancelLabel='Volver' />
    </form>
  );
}
