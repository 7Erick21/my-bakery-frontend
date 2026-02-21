'use server';

import { revalidatePath } from 'next/cache';

import { requireAuth, requireRole } from '@/lib/auth/helpers';
import { createClient } from '@/lib/supabase/server';
import type { DeliveryType, PaymentMethod } from '@/lib/supabase/types';

export async function createRecurringSchedule(formData: FormData) {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('recurring_order_schedules')
    .insert({
      user_id: user.id,
      business_name: formData.get('business_name') as string,
      contact_name: (formData.get('contact_name') as string) || null,
      contact_phone: (formData.get('contact_phone') as string) || null,
      delivery_type: (formData.get('delivery_type') as DeliveryType) || 'pickup',
      payment_method: (formData.get('payment_method') as PaymentMethod) || 'cash',
      address_id: (formData.get('address_id') as string) || null,
      notes: (formData.get('notes') as string) || null,
      is_active: true
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/orders/recurring');
  return data.id;
}

export async function updateRecurringSchedule(scheduleId: string, formData: FormData) {
  await requireAuth();
  const supabase = await createClient();

  const { error } = await supabase
    .from('recurring_order_schedules')
    .update({
      business_name: formData.get('business_name') as string,
      contact_name: (formData.get('contact_name') as string) || null,
      contact_phone: (formData.get('contact_phone') as string) || null,
      delivery_type: (formData.get('delivery_type') as DeliveryType) || 'pickup',
      payment_method: (formData.get('payment_method') as PaymentMethod) || 'cash',
      address_id: (formData.get('address_id') as string) || null,
      notes: (formData.get('notes') as string) || null
    })
    .eq('id', scheduleId);

  if (error) throw new Error(error.message);

  revalidatePath('/orders/recurring');
  revalidatePath('/dashboard/recurring');
}

export async function deleteRecurringSchedule(scheduleId: string) {
  await requireAuth();
  const supabase = await createClient();

  // Delete items first, then schedule
  await supabase.from('recurring_order_items').delete().eq('schedule_id', scheduleId);

  const { error } = await supabase.from('recurring_order_schedules').delete().eq('id', scheduleId);

  if (error) throw new Error(error.message);

  revalidatePath('/orders/recurring');
  revalidatePath('/dashboard/recurring');
}

export async function toggleRecurringSchedule(scheduleId: string, isActive: boolean) {
  await requireAuth();
  const supabase = await createClient();

  const { error } = await supabase
    .from('recurring_order_schedules')
    .update({ is_active: isActive })
    .eq('id', scheduleId);

  if (error) throw new Error(error.message);

  revalidatePath('/orders/recurring');
  revalidatePath('/dashboard/recurring');
}

export async function upsertRecurringItem(
  scheduleId: string,
  productId: string,
  dayOfWeek: number,
  quantity: number
) {
  await requireAuth();
  const supabase = await createClient();

  // Check if item exists
  const { data: existing } = await supabase
    .from('recurring_order_items')
    .select('id')
    .eq('schedule_id', scheduleId)
    .eq('product_id', productId)
    .eq('day_of_week', dayOfWeek)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('recurring_order_items')
      .update({ quantity })
      .eq('id', existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from('recurring_order_items').insert({
      schedule_id: scheduleId,
      product_id: productId,
      day_of_week: dayOfWeek,
      quantity,
      is_active: true
    });
    if (error) throw new Error(error.message);
  }

  revalidatePath('/orders/recurring');
  revalidatePath('/dashboard/recurring');
}

export async function deleteRecurringItem(itemId: string) {
  await requireAuth();
  const supabase = await createClient();

  const { error } = await supabase.from('recurring_order_items').delete().eq('id', itemId);

  if (error) throw new Error(error.message);

  revalidatePath('/orders/recurring');
  revalidatePath('/dashboard/recurring');
}

// ─── Admin-specific actions ───────────────────────────────

export async function createRecurringScheduleAdmin(formData: FormData) {
  const profile = await requireRole(['admin', 'super_admin']);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('recurring_order_schedules')
    .insert({
      user_id: profile.id,
      business_name: formData.get('business_name') as string,
      contact_name: (formData.get('contact_name') as string) || null,
      contact_phone: (formData.get('contact_phone') as string) || null,
      delivery_type: (formData.get('delivery_type') as DeliveryType) || 'pickup',
      payment_method: (formData.get('payment_method') as PaymentMethod) || 'cash',
      address_id: (formData.get('address_id') as string) || null,
      notes: (formData.get('notes') as string) || null,
      is_active: true
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/dashboard/recurring');
  return data.id;
}

export async function updateRecurringScheduleAdmin(scheduleId: string, formData: FormData) {
  await requireRole(['admin', 'super_admin']);
  const supabase = await createClient();

  const { error } = await supabase
    .from('recurring_order_schedules')
    .update({
      business_name: formData.get('business_name') as string,
      contact_name: (formData.get('contact_name') as string) || null,
      contact_phone: (formData.get('contact_phone') as string) || null,
      delivery_type: (formData.get('delivery_type') as DeliveryType) || 'pickup',
      payment_method: (formData.get('payment_method') as PaymentMethod) || 'cash',
      address_id: (formData.get('address_id') as string) || null,
      notes: (formData.get('notes') as string) || null
    })
    .eq('id', scheduleId);

  if (error) throw new Error(error.message);

  revalidatePath('/dashboard/recurring');
  revalidatePath(`/dashboard/recurring/${scheduleId}`);
}

export async function upsertRecurringItemAdmin(
  scheduleId: string,
  productId: string,
  dayOfWeek: number,
  quantity: number
) {
  await requireRole(['admin', 'super_admin']);
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('recurring_order_items')
    .select('id')
    .eq('schedule_id', scheduleId)
    .eq('product_id', productId)
    .eq('day_of_week', dayOfWeek)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('recurring_order_items')
      .update({ quantity })
      .eq('id', existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from('recurring_order_items').insert({
      schedule_id: scheduleId,
      product_id: productId,
      day_of_week: dayOfWeek,
      quantity,
      is_active: true
    });
    if (error) throw new Error(error.message);
  }

  revalidatePath('/dashboard/recurring');
  revalidatePath(`/dashboard/recurring/${scheduleId}`);
}

export async function deleteRecurringScheduleAdmin(scheduleId: string) {
  await requireRole(['admin', 'super_admin']);
  const supabase = await createClient();

  await supabase.from('recurring_order_items').delete().eq('schedule_id', scheduleId);
  const { error } = await supabase.from('recurring_order_schedules').delete().eq('id', scheduleId);
  if (error) throw new Error(error.message);

  revalidatePath('/dashboard/recurring');
}

export async function deleteRecurringItemAdmin(itemId: string) {
  await requireRole(['admin', 'super_admin']);
  const supabase = await createClient();

  const { error } = await supabase.from('recurring_order_items').delete().eq('id', itemId);
  if (error) throw new Error(error.message);

  revalidatePath('/dashboard/recurring');
}

export async function toggleRecurringItem(itemId: string, isActive: boolean) {
  await requireAuth();
  const supabase = await createClient();

  const { error } = await supabase
    .from('recurring_order_items')
    .update({ is_active: isActive })
    .eq('id', itemId);

  if (error) throw new Error(error.message);

  revalidatePath('/orders/recurring');
  revalidatePath('/dashboard/recurring');
}
