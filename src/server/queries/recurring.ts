import type { RecurringScheduleWithItems } from '@/lib/supabase/models';
import { createClient } from '@/lib/supabase/server';

export async function getUserRecurringSchedules(
  userId: string
): Promise<RecurringScheduleWithItems[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('recurring_order_schedules')
    .select(
      `
      id, user_id, business_name, contact_name, contact_phone,
      delivery_type, payment_method, notes, is_active,
      created_at, updated_at,
      addresses(full_name, street, city, postal_code),
      recurring_order_items(
        id, product_id, day_of_week, quantity, is_active,
        products(slug, price, product_translations(name, language_code))
      ),
      profiles(full_name, email)
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return (data ?? []) as unknown as RecurringScheduleWithItems[];
}

export async function getRecurringScheduleById(
  id: string,
  userId?: string
): Promise<RecurringScheduleWithItems | null> {
  const supabase = await createClient();

  let query = supabase
    .from('recurring_order_schedules')
    .select(
      `
      id, user_id, business_name, contact_name, contact_phone,
      delivery_type, payment_method, notes, is_active,
      created_at, updated_at,
      addresses(full_name, street, city, postal_code),
      recurring_order_items(
        id, product_id, day_of_week, quantity, is_active,
        products(slug, price, product_translations(name, language_code))
      ),
      profiles(full_name, email)
    `
    )
    .eq('id', id);

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data } = await query.single();
  return (data as unknown as RecurringScheduleWithItems) ?? null;
}

export async function getAllRecurringSchedulesAdmin(): Promise<RecurringScheduleWithItems[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('recurring_order_schedules')
    .select(
      `
      id, user_id, business_name, contact_name, contact_phone,
      delivery_type, payment_method, notes, is_active,
      created_at, updated_at,
      addresses(full_name, street, city, postal_code),
      recurring_order_items(
        id, product_id, day_of_week, quantity, is_active,
        products(slug, price, product_translations(name, language_code))
      ),
      profiles(full_name, email)
    `
    )
    .order('created_at', { ascending: false });

  return (data ?? []) as unknown as RecurringScheduleWithItems[];
}
