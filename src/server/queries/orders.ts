import type { OrderAdmin, OrderListItem, OrderWithItems } from '@/lib/supabase/models';
import { createClient } from '@/lib/supabase/server';

export async function getUserOrders(userId: string): Promise<OrderListItem[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('orders')
    .select(
      `
      id, status, payment_status, subtotal, discount_amount, total,
      delivery_type, payment_method, delivery_fee,
      delivery_date, notes, created_at,
      order_items(
        id, quantity, unit_price, total_price,
        products(slug, product_translations(name, language_code))
      ),
      invoices(id)
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return (data ?? []) as unknown as OrderListItem[];
}

export async function getOrderById(id: string, userId?: string): Promise<OrderWithItems | null> {
  const supabase = await createClient();

  let query = supabase
    .from('orders')
    .select(
      `
      id, user_id, status, payment_status, subtotal, discount_amount, total,
      delivery_type, payment_method, delivery_fee, address_id,
      delivery_date, notes, created_at, updated_at,
      coupon_id, stripe_checkout_session_id,
      order_items(
        id, quantity, unit_price, total_price, tax_rate,
        products(slug, product_translations(name, language_code),
          product_images(url, is_primary))
      ),
      profiles(full_name, email),
      addresses(full_name, street, city, postal_code, province)
    `
    )
    .eq('id', id);

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data } = await query.single();
  return (data as unknown as OrderWithItems) ?? null;
}

export async function getAllOrdersAdmin(): Promise<OrderAdmin[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('orders')
    .select(
      `
      id, status, payment_status, total,
      delivery_type, payment_method, delivery_fee,
      delivery_date, created_at,
      profiles(full_name, email),
      order_items(quantity)
    `
    )
    .order('created_at', { ascending: false });

  return (data ?? []) as unknown as OrderAdmin[];
}
