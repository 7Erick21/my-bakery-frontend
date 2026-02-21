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
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FC, useEffect, useState } from 'react';

import { Button, DashboardCard, IconButton } from '@/components/atoms';
import { ConfirmDialog, EmptyState } from '@/components/molecules';
import GripIcon from '@/icons/grip.svg';
import PencilIcon from '@/icons/pencil.svg';
import TrashIcon from '@/icons/trash.svg';
import type { ProductAdminListItem } from '@/lib/supabase/models';
import { formatPrice } from '@/lib/utils/format';
import { getTranslation } from '@/lib/utils/translation';
import {
  deleteProduct,
  reorderProducts,
  toggleProductVisibility
} from '@/server/actions/products';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { useToastStore } from '@/shared/stores/toastStore';
import { PageHeader } from '../shared/PageHeader';

interface ProductsListProps {
  products: ProductAdminListItem[];
}

export const ProductsList: FC<ProductsListProps> = ({ products }) => {
  const { t, lang } = useTranslation();
  const router = useRouter();
  const addToast = useToastStore(s => s.addToast);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [items, setItems] = useState(products);

  useEffect(() => {
    setItems(products);
  }, [products]);

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
      await reorderProducts(reordered.map(i => i.id));
      addToast({ message: 'Orden actualizado', type: 'success' });
      router.refresh();
    } catch {
      setItems(products);
      addToast({ message: 'Error al reordenar', type: 'error' });
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget);
      addToast({ message: 'Producto eliminado correctamente', type: 'success' });
    } catch {
      addToast({ message: 'Error al eliminar el producto', type: 'error' });
    }
    setDeleting(false);
    setDeleteTarget(null);
  }

  return (
    <div className='space-y-6'>
      <PageHeader
        title={t('dashboard.nav.products', 'Productos')}
        action={
          <Link href={'/dashboard/products/new' as Route}>
            <Button variant='primary'>{t('dashboard.products.create', 'Nuevo producto')}</Button>
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
          title='No hay productos'
        />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
            <DashboardCard noPadding className='overflow-x-auto'>
              <table className='w-full text-16-20'>
                <thead>
                  <tr className='bg-amber-50/40 dark:bg-amber-950/20 border-b border-border-card-children-light dark:border-border-card-children-dark'>
                    <th className='w-10 px-2 py-3' />
                    <th className='w-16 px-4 py-3' />
                    <th className='px-4 py-3 font-medium text-gray-600 dark:text-gray-400 text-left'>
                      {t('dashboard.products.name', 'Nombre')}
                    </th>
                    <th className='px-4 py-3 font-medium text-gray-600 dark:text-gray-400 text-left'>
                      {t('dashboard.products.category', 'Categoria')}
                    </th>
                    <th className='px-4 py-3 font-medium text-gray-600 dark:text-gray-400 text-left'>
                      {t('dashboard.products.price', 'Precio')}
                    </th>
                    <th className='px-4 py-3 font-medium text-gray-600 dark:text-gray-400 text-left'>
                      {t('dashboard.products.stock', 'Stock')}
                    </th>
                    <th className='px-4 py-3 font-medium text-gray-600 dark:text-gray-400 text-left'>
                      {t('dashboard.products.visible', 'Visible')}
                    </th>
                    <th className='w-24 px-4 py-3 text-center' />
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <SortableProductRow
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
        title='¿Eliminar este producto?'
        description='Esta accion no se puede deshacer.'
        loading={deleting}
      />
    </div>
  );
};

ProductsList.displayName = 'ProductsList';

// ─── Sortable Row ──────────────────────────────────────────

interface SortableProductRowProps {
  item: ProductAdminListItem;
  lang: string;
  t: (key: string, fallback?: string) => string;
  onDelete: () => void;
}

function SortableProductRow({ item, lang, t, onDelete }: SortableProductRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined
  };

  const translation = getTranslation(item.product_translations, lang);
  const catTranslation = getTranslation(item.categories?.category_translations, lang);
  const primaryImage = item.product_images?.find(img => img.is_primary);
  const inv = item.inventory?.[0];
  const isLow = inv ? inv.stock <= inv.low_stock_threshold : false;

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
      <td className='w-16 px-4 py-3'>
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt=''
            width={40}
            height={40}
            className='w-10 h-10 rounded-lg object-cover'
          />
        ) : (
          <div className='w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700' />
        )}
      </td>
      <td className='px-4 py-3'>
        <Link
          href={`/dashboard/products/${item.id}` as Route}
          className='font-medium text-gray-900 dark:text-gray-100 hover:text-amber-600 dark:hover:text-amber-400'
        >
          {translation?.name || item.slug}
        </Link>
      </td>
      <td className='px-4 py-3'>
        <span className='text-16-20 text-gray-600 dark:text-gray-400'>
          {catTranslation?.name || item.categories?.slug || '-'}
        </span>
      </td>
      <td className='px-4 py-3'>
        <span className='font-mono text-gray-900 dark:text-gray-100'>
          {formatPrice(item.price)}
        </span>
      </td>
      <td className='px-4 py-3'>
        {inv ? (
          <span
            className={isLow ? 'text-red-500 font-medium' : 'text-gray-600 dark:text-gray-400'}
          >
            {inv.stock}
          </span>
        ) : (
          <span className='text-gray-400'>-</span>
        )}
      </td>
      <td className='px-4 py-3'>
        <Button
          variant='ghost'
          onClick={() => toggleProductVisibility(item.id, !item.is_visible)}
          className={`!px-2 !py-1 !rounded-full !text-sm !font-medium ${
            item.is_visible
              ? '!bg-green-100 !text-green-700 dark:!bg-green-900/30 dark:!text-green-400'
              : '!bg-gray-100 !text-gray-500 dark:!bg-gray-800 dark:!text-gray-500'
          } !border-0`}
        >
          {item.is_visible ? 'Si' : 'No'}
        </Button>
      </td>
      <td className='w-24 px-4 py-3 text-center'>
        <div className='flex gap-1 justify-center'>
          <Link href={`/dashboard/products/${item.id}` as Route}>
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
