'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { type FC, useState } from 'react';

import { Button, IconButton } from '@/components/atoms';
import { ConfirmDialog } from '@/components/molecules';
import TrashIcon from '@/icons/trash.svg';
import type { CouponItem } from '@/lib/supabase/models';
import { formatDate } from '@/lib/utils/format';
import { deleteCoupon, toggleCouponActive } from '@/server/actions/coupons';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { useToastStore } from '@/shared/stores/toastStore';
import { DataTable } from '../shared/DataTable';
import { PageHeader } from '../shared/PageHeader';

interface CouponsListProps {
  coupons: CouponItem[];
}

export const CouponsList: FC<CouponsListProps> = ({ coupons }) => {
  const { t } = useTranslation();
  const addToast = useToastStore(s => s.addToast);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCoupon(deleteTarget);
      addToast({ message: 'Cupon eliminado correctamente', type: 'success' });
    } catch {
      addToast({ message: 'Error al eliminar el cupon', type: 'error' });
    }
    setDeleting(false);
    setDeleteTarget(null);
  }

  const columns = [
    {
      key: 'code',
      header: 'Codigo',
      render: (coupon: CouponItem) => <span className='font-mono font-bold'>{coupon.code}</span>
    },
    {
      key: 'discount',
      header: 'Descuento',
      render: (coupon: CouponItem) =>
        coupon.discount_type === 'percentage'
          ? `${coupon.discount_value}%`
          : `${coupon.discount_value}€`
    },
    {
      key: 'uses',
      header: 'Usos',
      render: (coupon: CouponItem) => `${coupon.current_uses}/${coupon.max_uses || '∞'}`
    },
    {
      key: 'validity',
      header: 'Validez',
      render: (coupon: CouponItem) => (
        <span className='text-sm'>
          {coupon.valid_until ? formatDate(coupon.valid_until) : 'Sin limite'}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Estado',
      render: (coupon: CouponItem) => (
        <Button
          variant='ghost'
          onClick={() => toggleCouponActive(coupon.id, !coupon.is_active)}
          className={`!px-2 !py-0.5 !rounded-full !text-sm !font-medium !border-0 ${
            coupon.is_active ? '!bg-green-100 !text-green-700' : '!bg-gray-100 !text-gray-500'
          }`}
        >
          {coupon.is_active ? 'Activo' : 'Inactivo'}
        </Button>
      )
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (coupon: CouponItem) => (
        <IconButton
          aria-label='Eliminar'
          variant='danger'
          onClick={() => setDeleteTarget(coupon.id)}
        >
          <TrashIcon className='w-4 h-4' />
        </IconButton>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title={t('dashboard.nav.coupons', 'Cupones')}
        action={
          <Link href={'/dashboard/coupons/new' as Route}>
            <Button variant='primary'>Nuevo cupon</Button>
          </Link>
        }
      />
      <DataTable columns={columns} data={coupons} emptyMessage='No hay cupones' />

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title='¿Eliminar este cupon?'
        description='Esta accion no se puede deshacer.'
        loading={deleting}
      />
    </div>
  );
};

CouponsList.displayName = 'CouponsList';
