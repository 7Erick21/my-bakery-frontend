'use client';

import { useRouter } from 'next/navigation';
import { type FC, useState } from 'react';
import { Input, Label, Select } from '@/components/atoms';
import { getErrorMessage } from '@/lib/utils/error';
import { createCoupon } from '@/server/actions/coupons';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { useToastStore } from '@/shared/stores/toastStore';
import { FormActions } from '../shared/FormActions';

export const CouponForm: FC = () => {
  const { t } = useTranslation();
  const addToast = useToastStore(s => s.addToast);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData(e.currentTarget);
      await createCoupon(formData);
      addToast({ message: 'Cupon creado correctamente', type: 'success' });
      router.push('/dashboard/coupons');
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      addToast({ message: 'Error al crear el cupon', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className='max-w-2xl'>
      <h1 className='text-32-48 font-bold text-gray-900 dark:text-gray-100 mb-6'>Nuevo cupon</h1>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <Label required>Codigo</Label>
          <Input name='code' type='text' required placeholder='DESCUENTO10' className='uppercase' />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <Label required>Tipo de descuento</Label>
            <Select
              name='discount_type'
              required
              defaultValue='percentage'
              options={[
                { value: 'percentage', label: 'Porcentaje (%)' },
                { value: 'fixed', label: 'Cantidad fija (€)' }
              ]}
            />
          </div>
          <div>
            <Label required>Valor</Label>
            <Input name='discount_value' type='number' required min='0' step='0.01' />
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <Label>Pedido minimo (€)</Label>
            <Input name='min_order_amount' type='number' min='0' step='0.01' />
          </div>
          <div>
            <Label>Usos maximos</Label>
            <Input name='max_uses' type='number' min='1' />
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <Label>Valido desde</Label>
            <Input name='valid_from' type='date' />
          </div>
          <div>
            <Label>Valido hasta</Label>
            <Input name='valid_until' type='date' />
          </div>
        </div>

        {error && <p className='text-red-500 text-16-20'>{error}</p>}

        <div className='pt-4'>
          <FormActions
            submitting={submitting}
            submitLabel='Crear cupon'
            submittingLabel='Creando...'
            onCancel={() => router.back()}
          />
        </div>
      </form>
    </div>
  );
};

CouponForm.displayName = 'CouponForm';
