'use client';

import { useRouter } from 'next/navigation';
import { type FC, useState } from 'react';

import { DashboardCard, Input, Label, Select, Textarea } from '@/components/atoms';
import type { RecurringScheduleWithItems } from '@/lib/supabase/models';
import {
  createRecurringScheduleAdmin,
  updateRecurringScheduleAdmin
} from '@/server/actions/recurring';
import { DELIVERY_TYPE_LABELS, PAYMENT_METHOD_LABELS } from '@/shared/constants/checkout';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { FormActions } from '../shared/FormActions';

interface RecurringScheduleFormProps {
  schedule?: RecurringScheduleWithItems;
}

export const RecurringScheduleFormAdmin: FC<RecurringScheduleFormProps> = ({ schedule }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const isEditing = !!schedule;

  const [businessName, setBusinessName] = useState(schedule?.business_name || '');
  const [contactName, setContactName] = useState(schedule?.contact_name || '');
  const [contactPhone, setContactPhone] = useState(schedule?.contact_phone || '');
  const [deliveryType, setDeliveryType] = useState(schedule?.delivery_type || 'pickup');
  const [paymentMethod, setPaymentMethod] = useState(schedule?.payment_method || 'cash');
  const [notes, setNotes] = useState(schedule?.notes || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!businessName.trim()) return;

    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.set('business_name', businessName.trim());
    formData.set('contact_name', contactName.trim());
    formData.set('contact_phone', contactPhone.trim());
    formData.set('delivery_type', deliveryType);
    formData.set('payment_method', paymentMethod);
    formData.set('notes', notes.trim());

    try {
      if (isEditing) {
        await updateRecurringScheduleAdmin(schedule.id, formData);
        router.push(`/dashboard/recurring/${schedule.id}`);
      } else {
        const newId = await createRecurringScheduleAdmin(formData);
        router.push(`/dashboard/recurring/${newId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className='text-32-48 font-bold text-gray-900 dark:text-gray-100 mb-6'>
        {isEditing ? 'Editar pedido recurrente' : 'Nuevo pedido recurrente'}
      </h1>

      <DashboardCard>
        <form onSubmit={handleSubmit} className='space-y-5 p-1'>
          <div>
            <Label htmlFor='business_name' required>
              Nombre de empresa
            </Label>
            <Input
              id='business_name'
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              required
              placeholder='Ej: Restaurante La Plaza'
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='contact_name'>Persona de contacto</Label>
              <Input
                id='contact_name'
                value={contactName}
                onChange={e => setContactName(e.target.value)}
                placeholder='Nombre del contacto'
              />
            </div>
            <div>
              <Label htmlFor='contact_phone'>Telefono</Label>
              <Input
                id='contact_phone'
                type='tel'
                value={contactPhone}
                onChange={e => setContactPhone(e.target.value)}
                placeholder='+34 600 000 000'
              />
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='delivery_type'>Tipo de entrega</Label>
              <Select
                id='delivery_type'
                value={deliveryType}
                onChange={setDeliveryType}
                options={Object.entries(DELIVERY_TYPE_LABELS).map(([key, labels]) => ({
                  value: key,
                  label: labels.es
                }))}
              />
            </div>
            <div>
              <Label htmlFor='payment_method'>Metodo de pago</Label>
              <Select
                id='payment_method'
                value={paymentMethod}
                onChange={setPaymentMethod}
                options={Object.entries(PAYMENT_METHOD_LABELS).map(([key, labels]) => ({
                  value: key,
                  label: labels.es
                }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor='notes'>Notas</Label>
            <Textarea
              id='notes'
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder='Observaciones, instrucciones especiales...'
              rows={3}
            />
          </div>

          {error && (
            <p className='text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg'>
              {error}
            </p>
          )}

          <FormActions
            submitting={submitting}
            submitLabel={isEditing ? 'Guardar cambios' : 'Crear pedido recurrente'}
            submittingLabel={isEditing ? 'Guardando...' : 'Creando...'}
            onCancel={() => router.push('/dashboard/recurring')}
          />
        </form>
      </DashboardCard>
    </div>
  );
};

RecurringScheduleFormAdmin.displayName = 'RecurringScheduleFormAdmin';
