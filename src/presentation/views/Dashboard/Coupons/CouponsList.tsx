'use client';

import type { Route } from 'next';
import Link from 'next/link';
import type { FC } from 'react';

import type { CouponItem } from '@/lib/supabase/models';
import { formatDate } from '@/lib/utils/format';
import { deleteCoupon, toggleCouponActive } from '@/server/actions/coupons';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { DataTable } from '../shared/DataTable';
import { PageHeader } from '../shared/PageHeader';

interface CouponsListProps {
  coupons: CouponItem[];
}

export const CouponsList: FC<CouponsListProps> = ({ coupons }) => {
  const { t } = useTranslation();

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
        <span className='text-xs'>
          {coupon.valid_until ? formatDate(coupon.valid_until) : 'Sin limite'}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Estado',
      render: (coupon: CouponItem) => (
        <button
          type='button'
          onClick={() => toggleCouponActive(coupon.id, !coupon.is_active)}
          className={`px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
            coupon.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {coupon.is_active ? 'Activo' : 'Inactivo'}
        </button>
      )
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (coupon: CouponItem) => (
        <button
          type='button'
          onClick={() => {
            if (confirm('¿Eliminar este cupon?')) {
              deleteCoupon(coupon.id);
            }
          }}
          className='text-red-500 hover:text-red-700 text-xs cursor-pointer'
        >
          Eliminar
        </button>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title={t('dashboard.nav.coupons', 'Cupones')}
        action={
          <Link
            href={'/dashboard/coupons/new' as Route}
            className='px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-sm hover:shadow-md hover:shadow-amber-500/20 text-white rounded-lg text-sm font-medium transition-all'
          >
            Nuevo cupon
          </Link>
        }
      />
      <DataTable columns={columns} data={coupons} emptyMessage='No hay cupones' />
    </div>
  );
};

CouponsList.displayName = 'CouponsList';
