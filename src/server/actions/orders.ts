'use server';

import { revalidatePath } from 'next/cache';

import { requireAuth, requireRole } from '@/lib/auth/helpers';
import { sendBizumAdminNotification } from '@/lib/email/templates/bizumNotification';
import type { OrderItemInput } from '@/lib/supabase/models';
import { createClient } from '@/lib/supabase/server';
import type { DeliveryType, OrderStatus, PaymentMethod, PaymentStatus } from '@/lib/supabase/types';
import { formatPrice } from '@/lib/utils/format';
import { sendWhatsAppNotification } from '@/lib/whatsapp/notify';
import { generateInvoice } from './invoices';

const OFFLINE_METHODS = new Set<PaymentMethod>(['bizum', 'cash']);

export async function createOrder(formData: FormData) {
  const user = await requireAuth();
  const supabase = await createClient();

  const items: OrderItemInput[] = JSON.parse(formData.get('items') as string);
  const deliveryDate = (formData.get('delivery_date') as string) || null;
  const notes = (formData.get('notes') as string) || null;
  const couponCode = (formData.get('coupon_code') as string) || null;
  const deliveryType = (formData.get('delivery_type') as DeliveryType) || 'pickup';
  const paymentMethod = (formData.get('payment_method') as PaymentMethod) || 'stripe';
  const deliveryFee = Number(formData.get('delivery_fee') || 0);
  const addressId = (formData.get('address_id') as string) || null;
  const buyerNif = (formData.get('buyer_nif') as string) || null;

  // Fetch real tax_rate from DB for each product (don't trust client data)
  const productIds = items.map(item => item.productId);
  const { data: productRows } = await supabase
    .from('products')
    .select('id, tax_rate')
    .in('id', productIds);

  const taxRateMap = new Map<string, number>();
  for (const row of productRows ?? []) {
    taxRateMap.set(row.id, row.tax_rate);
  }

  let subtotal = 0;
  for (const item of items) {
    subtotal += item.price * item.quantity;
  }

  let discountAmount = 0;
  let couponId: string | null = null;

  if (couponCode) {
    const { data: coupon } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode)
      .eq('is_active', true)
      .single();

    if (coupon) {
      if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
        throw new Error('Coupon has reached max uses');
      }
      if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
        throw new Error('Order does not meet minimum amount');
      }
      if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
        throw new Error('Coupon has expired');
      }

      couponId = coupon.id;
      if (coupon.discount_type === 'percentage') {
        discountAmount = subtotal * (coupon.discount_value / 100);
      } else {
        discountAmount = coupon.discount_value;
      }
    }
  }

  // Total = subtotal - discount + delivery fee
  const total = Math.max(0, subtotal - discountAmount) + deliveryFee;

  const isOffline = OFFLINE_METHODS.has(paymentMethod);

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      status: 'pending',
      payment_status: 'pending',
      subtotal,
      discount_amount: discountAmount,
      total,
      coupon_id: couponId,
      delivery_type: deliveryType,
      payment_method: paymentMethod,
      delivery_fee: deliveryFee,
      ...(addressId ? { address_id: addressId } : {}),
      delivery_date: deliveryDate,
      notes,
      ...(buyerNif ? { buyer_nif: buyerNif } : {})
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);

  // Insert order items with tax_rate from DB
  await supabase.from('order_items').insert(
    items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
      tax_rate: taxRateMap.get(item.productId) ?? 10
    }))
  );

  // Send Bizum notifications to admin (non-blocking)
  if (paymentMethod === 'bizum') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single();

    const orderRef = order.id.slice(0, 8).toUpperCase();
    const totalFormatted = formatPrice(total);
    const customerName = profile?.full_name || 'Cliente';
    const customerEmail = profile?.email || '';

    // Fire-and-forget notifications
    sendBizumAdminNotification({
      orderRef,
      orderId: order.id,
      total: totalFormatted,
      customerName,
      customerEmail,
      createdAt: new Date().toLocaleString('es-ES')
    }).catch(() => {});

    sendWhatsAppNotification({
      orderRef,
      total: totalFormatted,
      customerName
    }).catch(() => {});
  }

  revalidatePath('/orders');

  return { orderId: order.id, total, isOffline };
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await requireRole(['admin', 'super_admin']);
  const supabase = await createClient();

  const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
  if (error) throw new Error(error.message);

  revalidatePath('/orders');
  revalidatePath('/dashboard/orders');
}

export async function updatePaymentStatus(orderId: string, status: PaymentStatus) {
  await requireRole(['admin', 'super_admin']);
  const supabase = await createClient();

  const { error } = await supabase
    .from('orders')
    .update({ payment_status: status })
    .eq('id', orderId);
  if (error) throw new Error(error.message);

  // If marking as paid, decrement stock via inventory movements
  if (status === 'paid') {
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', orderId);

    if (orderItems) {
      for (const item of orderItems) {
        await supabase.rpc('record_inventory_movement', {
          p_product_id: item.product_id,
          p_movement_type: 'order',
          p_quantity: -item.quantity,
          p_reference_id: orderId,
          p_notes: 'Payment confirmed'
        });
      }
    }

    // Increment coupon uses if applicable
    const { data: order } = await supabase
      .from('orders')
      .select('coupon_id')
      .eq('id', orderId)
      .single();

    if (order?.coupon_id) {
      await supabase.rpc('increment_coupon_uses' as never, { coupon_id: order.coupon_id } as never);
      // Fallback: manual increment
      const { data: coupon } = await supabase
        .from('coupons')
        .select('current_uses')
        .eq('id', order.coupon_id)
        .single();
      if (coupon) {
        await supabase
          .from('coupons')
          .update({ current_uses: coupon.current_uses + 1 })
          .eq('id', order.coupon_id);
      }
    }

    // Generate invoice for paid orders
    try {
      await generateInvoice(orderId);
    } catch {
      // Non-blocking: invoice generation failure shouldn't block payment status update
    }
  }

  revalidatePath('/orders');
  revalidatePath('/dashboard/orders');
  revalidatePath('/dashboard/invoices');
}
