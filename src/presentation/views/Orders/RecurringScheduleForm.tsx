'use client';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { type FC, useState } from 'react';

import type { AddressItem } from '@/lib/supabase/models';
import { Layout } from '@/presentation/layout/Layout';
import { createRecurringSchedule, updateRecurringSchedule } from '@/server/actions/recurring';
import { DELIVERY_TYPE_LABELS, PAYMENT_METHOD_LABELS } from '@/shared/constants/checkout';
import { useTranslation } from '@/shared/hooks/useTranslate';

interface RecurringScheduleFormProps {
  scheduleId?: string;
  initialData?: {
    business_name: string;
    contact_name: string | null;
    contact_phone: string | null;
    delivery_type: string;
    payment_method: string;
    address_id?: string | null;
    notes: string | null;
  };
  addresses: AddressItem[];
}

export const RecurringScheduleForm: FC<RecurringScheduleFormProps> = ({
  scheduleId,
  initialData,
  addresses
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lang = 'es';

  const isEdit = !!scheduleId;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);

      if (isEdit) {
        await updateRecurringSchedule(scheduleId, formData);
        router.push(`/orders/recurring/${scheduleId}` as Route);
      } else {
        const newId = await createRecurringSchedule(formData);
        router.push(`/orders/recurring/${newId}` as Route);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
      setSaving(false);
    }
  }

  return (
    <Layout>
      <section className='min-h-dvh pt-24 pb-16'>
        <div className='max-w-2xl mx-auto'>
          <h1 className='text-24-32 font-bold text-gray-900 dark:text-gray-100 mb-6'>
            {isEdit
              ? t('recurring.editSchedule', 'Editar pedido recurrente')
              : t('recurring.newSchedule', 'Nuevo pedido recurrente')}
          </h1>

          {error && (
            <div className='mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm'>
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-5'
          >
            <div>
              <label
                htmlFor='business_name'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
              >
                {t('recurring.businessName', 'Nombre empresa')} *
              </label>
              <input
                id='business_name'
                name='business_name'
                type='text'
                required
                defaultValue={initialData?.business_name || ''}
                className='w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent'
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label
                  htmlFor='contact_name'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                >
                  {t('recurring.contactName', 'Persona de contacto')}
                </label>
                <input
                  id='contact_name'
                  name='contact_name'
                  type='text'
                  defaultValue={initialData?.contact_name || ''}
                  className='w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                />
              </div>
              <div>
                <label
                  htmlFor='contact_phone'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                >
                  {t('recurring.contactPhone', 'Telefono')}
                </label>
                <input
                  id='contact_phone'
                  name='contact_phone'
                  type='tel'
                  defaultValue={initialData?.contact_phone || ''}
                  className='w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                />
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label
                  htmlFor='delivery_type'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                >
                  {t('checkout.deliveryType', 'Tipo de entrega')}
                </label>
                <select
                  id='delivery_type'
                  name='delivery_type'
                  defaultValue={initialData?.delivery_type || 'pickup'}
                  className='w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                >
                  {Object.entries(DELIVERY_TYPE_LABELS).map(([val, labels]) => (
                    <option key={val} value={val}>
                      {labels[lang]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor='payment_method'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                >
                  {t('checkout.paymentMethod', 'Metodo de pago')}
                </label>
                <select
                  id='payment_method'
                  name='payment_method'
                  defaultValue={initialData?.payment_method || 'cash'}
                  className='w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                >
                  {Object.entries(PAYMENT_METHOD_LABELS).map(([val, labels]) => (
                    <option key={val} value={val}>
                      {labels[lang]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {addresses.length > 0 && (
              <div>
                <label
                  htmlFor='address_id'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                >
                  {t('checkout.address', 'Direccion de envio')}
                </label>
                <select
                  id='address_id'
                  name='address_id'
                  defaultValue={initialData?.address_id || ''}
                  className='w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                >
                  <option value=''>Sin direccion</option>
                  {addresses.map(addr => (
                    <option key={addr.id} value={addr.id}>
                      {addr.label || addr.full_name} — {addr.street}, {addr.city}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label
                htmlFor='notes'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
              >
                {t('recurring.notes', 'Notas')}
              </label>
              <textarea
                id='notes'
                name='notes'
                rows={3}
                defaultValue={initialData?.notes || ''}
                className='w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent'
              />
            </div>

            <div className='flex gap-3 pt-2'>
              <button
                type='submit'
                disabled={saving}
                className='px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg disabled:opacity-50 cursor-pointer'
              >
                {saving
                  ? '...'
                  : isEdit
                    ? t('common.save', 'Guardar')
                    : t('common.create', 'Crear')}
              </button>
              <button
                type='button'
                onClick={() => router.push('/orders/recurring' as Route)}
                className='px-6 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'
              >
                {t('common.cancel', 'Cancelar')}
              </button>
            </div>
          </form>
        </div>
      </section>
    </Layout>
  );
};

RecurringScheduleForm.displayName = 'RecurringScheduleForm';
