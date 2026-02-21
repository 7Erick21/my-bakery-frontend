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
import type { Route } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FC, useEffect, useState } from 'react';

import { Button, DashboardCard, IconButton, StatusBadge } from '@/components/atoms';
import { ConfirmDialog, EmptyState } from '@/components/molecules';
import GripIcon from '@/icons/grip.svg';
import PencilIcon from '@/icons/pencil.svg';
import TrashIcon from '@/icons/trash.svg';
import type { CategoryAdmin } from '@/lib/supabase/models';
import { getErrorMessage } from '@/lib/utils/error';
import { getTranslation } from '@/lib/utils/translation';
import { deleteCategory, reorderCategories } from '@/server/actions/categories';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { useToastStore } from '@/shared/stores/toastStore';
import { PageHeader } from '../shared/PageHeader';

interface CategoriesListProps {
  categories: CategoryAdmin[];
}

export const CategoriesList: FC<CategoriesListProps> = ({ categories }) => {
  const { t, lang } = useTranslation();
  const router = useRouter();
  const addToast = useToastStore(s => s.addToast);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [items, setItems] = useState(categories);

  useEffect(() => {
    setItems(categories);
  }, [categories]);

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
      await reorderCategories(reordered.map(i => i.id));
      addToast({ message: 'Orden actualizado', type: 'success' });
      router.refresh();
    } catch {
      setItems(categories);
      addToast({ message: 'Error al reordenar', type: 'error' });
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCategory(deleteTarget);
      addToast({ message: 'Categoria eliminada correctamente', type: 'success' });
    } catch (err: unknown) {
      addToast({ message: getErrorMessage(err), type: 'error' });
    }
    setDeleting(false);
    setDeleteTarget(null);
  }

  return (
    <div className='space-y-6'>
      <PageHeader
        title={t('dashboard.nav.categories', 'Categorias')}
        action={
          <Link href={'/dashboard/categories/new' as Route}>
            <Button variant='primary'>{t('dashboard.categories.create', 'Nueva categoria')}</Button>
          </Link>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={
            <svg
              className='w-12 h-12'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1}
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z'
              />
            </svg>
          }
          title='No hay categorias'
        />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
            <DashboardCard noPadding className='overflow-x-auto'>
              <table className='w-full text-16-20'>
                <thead>
                  <tr className='bg-amber-50/40 dark:bg-amber-950/20 border-b border-border-card-children-light dark:border-border-card-children-dark'>
                    <th className='w-10 px-2 py-3' />
                    <th className='px-4 py-3 font-medium text-gray-600 dark:text-gray-400 text-left'>
                      {t('dashboard.categories.name', 'Nombre')}
                    </th>
                    <th className='px-4 py-3 font-medium text-gray-600 dark:text-gray-400 text-left'>
                      Slug
                    </th>
                    <th className='px-4 py-3 font-medium text-gray-600 dark:text-gray-400 text-left'>
                      {t('dashboard.products.visible', 'Visible')}
                    </th>
                    <th className='w-24 px-4 py-3 font-medium text-gray-600 dark:text-gray-400 text-center' />
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <SortableCategoryRow
                      key={item.id}
                      item={item}
                      lang={lang}
                      t={t}
                      onDelete={() => setDeleteTarget(item.id)}
                    />
                  ))}
                </tbody>
              </table>
            </DashboardCard>
          </SortableContext>
        </DndContext>
      )}

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title='¿Eliminar esta categoria?'
        description='Esta accion no se puede deshacer.'
        loading={deleting}
      />
    </div>
  );
};

CategoriesList.displayName = 'CategoriesList';

// ─── Sortable Row ──────────────────────────────────────────

interface SortableCategoryRowProps {
  item: CategoryAdmin;
  lang: string;
  t: (key: string, fallback?: string) => string;
  onDelete: () => void;
}

function SortableCategoryRow({ item, lang, t, onDelete }: SortableCategoryRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined
  };

  const translation = getTranslation(item.category_translations, lang);

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className='border-b border-border-card-children-light/60 dark:border-border-card-children-dark/60 hover:bg-amber-50/30 dark:hover:bg-amber-900/10 transition-colors'
    >
      <td className='w-10 px-2 py-3 text-center'>
        <button
          type='button'
          className='cursor-grab active:cursor-grabbing touch-none text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          aria-label='Reordenar'
          {...attributes}
          {...listeners}
        >
          <GripIcon className='w-5 h-5' />
        </button>
      </td>
      <td className='px-4 py-3'>
        <Link
          href={`/dashboard/categories/${item.id}` as Route}
          className='font-medium text-gray-900 dark:text-gray-100 hover:text-amber-600'
        >
          {translation?.name || item.slug}
        </Link>
      </td>
      <td className='px-4 py-3'>
        <span className='text-gray-600 dark:text-gray-400 font-mono text-sm'>{item.slug}</span>
      </td>
      <td className='px-4 py-3'>
        <StatusBadge variant={item.is_visible ? 'green' : 'gray'}>
          {item.is_visible ? 'Si' : 'No'}
        </StatusBadge>
      </td>
      <td className='w-24 px-4 py-3 text-center'>
        <div className='flex gap-1 justify-center'>
          <Link href={`/dashboard/categories/${item.id}` as Route}>
            <IconButton aria-label={t('dashboard.edit', 'Editar')} variant='accent'>
              <PencilIcon className='w-4 h-4' />
            </IconButton>
          </Link>
          <IconButton
            aria-label={t('dashboard.delete', 'Eliminar')}
            variant='danger'
            onClick={onDelete}
          >
            <TrashIcon className='w-4 h-4' />
          </IconButton>
        </div>
      </td>
    </tr>
  );
}
