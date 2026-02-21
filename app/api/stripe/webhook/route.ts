// Supabase admin client (service role) for webhooks
import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe/client';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (_err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const orderId = paymentIntent.metadata?.order_id;

    if (orderId) {
      // Update order payment status
      await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'confirmed',
          stripe_payment_intent_id: paymentIntent.id
        })
        .eq('id', orderId);

      // Update coupon uses
      const { data: order } = await supabase
        .from('orders')
        .select('coupon_id')
        .eq('id', orderId)
        .single();

      if (order?.coupon_id) {
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

      // Decrement stock via inventory movements for traceability
      const { data: items } = await supabase
        .from('order_items')
        .select(
          'product_id, quantity, unit_price, total_price, tax_rate, products(product_translations(name, language_code))'
        )
        .eq('order_id', orderId);

      if (items) {
        for (const item of items) {
          await supabase.rpc('record_inventory_movement', {
            p_product_id: item.product_id,
            p_movement_type: 'order',
            p_quantity: -item.quantity,
            p_reference_id: orderId,
            p_notes: 'Stripe payment confirmed'
          });
        }

        // Generate invoice
        try {
          await generateStripeInvoice(
            supabase,
            orderId,
            items as unknown as OrderItemWithProduct[]
          );
        } catch {
          // Non-blocking
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}

interface OrderItemWithProduct {
  unit_price: number;
  quantity: number;
  total_price: number;
  tax_rate: number;
  products: {
    product_translations: { name: string; language_code: string }[];
  } | null;
}

async function generateStripeInvoice(
  supabase: SupabaseClient,
  orderId: string,
  orderItems: OrderItemWithProduct[]
) {
  // Check if already exists
  const { data: existing } = await supabase
    .from('invoices')
    .select('id')
    .eq('order_id', orderId)
    .maybeSingle();
  if (existing) return;

  // Get order details
  const { data: orderData } = await supabase
    .from('orders')
    .select('subtotal, discount_amount, total, user_id, address_id, delivery_fee, buyer_nif')
    .eq('id', orderId)
    .single();
  if (!orderData) return;

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', orderData.user_id)
    .single();

  // Get address if exists
  let address: {
    full_name: string;
    street: string;
    city: string;
    postal_code: string;
    province: string;
  } | null = null;
  if (orderData.address_id) {
    const { data: addr } = await supabase
      .from('addresses')
      .select('full_name, street, city, postal_code, province')
      .eq('id', orderData.address_id)
      .single();
    address = addr;
  }

  // Get seller info
  const { data: bizRows } = await supabase.from('business_info').select('key, value');
  const bizMap = new Map<string, string>();
  for (const row of bizRows ?? []) {
    bizMap.set(row.key, row.value);
  }

  // Generate invoice number
  const { data: invoiceNum } = await supabase.rpc('generate_invoice_number');
  const invoiceNumber =
    (invoiceNum as unknown as string) || `FAC-${new Date().getFullYear()}-00000`;

  // Calculate IVA breakdown
  let subtotalBase = 0;
  let totalIva = 0;

  const invoiceItems = orderItems.map(item => {
    const taxRate = item.tax_rate || 10;
    const unitBase = item.unit_price / (1 + taxRate / 100);
    const lineBase = unitBase * item.quantity;
    const lineTotal = item.unit_price * item.quantity;
    const lineIva = lineTotal - lineBase;

    subtotalBase += lineBase;
    totalIva += lineIva;

    const productName =
      item.products?.product_translations?.find(
        (t: { language_code: string }) => t.language_code === 'es'
      )?.name ||
      item.products?.product_translations?.[0]?.name ||
      'Producto';

    return {
      product_name: productName,
      quantity: item.quantity,
      unit_price_incl_iva: item.unit_price,
      tax_rate: taxRate,
      unit_base: Math.round(unitBase * 100) / 100,
      line_base: Math.round(lineBase * 100) / 100,
      line_iva: Math.round(lineIva * 100) / 100,
      line_total: Math.round(lineTotal * 100) / 100
    };
  });

  const { data: invoice } = await supabase
    .from('invoices')
    .insert({
      order_id: orderId,
      invoice_number: invoiceNumber,
      seller_name: bizMap.get('business_name') || 'My Bakery',
      seller_nif: bizMap.get('nif') || '',
      seller_address: bizMap.get('address') || '',
      buyer_name: address?.full_name || profile?.full_name || '',
      buyer_nif: orderData.buyer_nif || null,
      buyer_address: address
        ? `${address.street}, ${address.city} ${address.postal_code}, ${address.province}`
        : null,
      buyer_email: profile?.email || null,
      subtotal_base: Math.round(subtotalBase * 100) / 100,
      total_iva: Math.round(totalIva * 100) / 100,
      total: orderData.total,
      discount_amount: orderData.discount_amount,
      delivery_fee: orderData.delivery_fee
    })
    .select('id')
    .single();

  if (invoice && invoiceItems.length > 0) {
    await supabase.from('invoice_items').insert(
      invoiceItems.map(item => ({
        invoice_id: invoice.id,
        ...item
      }))
    );
  }
}
