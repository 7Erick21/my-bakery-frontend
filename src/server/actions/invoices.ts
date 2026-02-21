'use server';

import { requireRole } from '@/lib/auth/helpers';
import { createClient } from '@/lib/supabase/server';

/**
 * Generate an invoice for a paid order.
 * Snapshots seller info from business_info table, buyer info from order's profile + address.
 * Breaks down IVA per line item since prices include IVA.
 */
export async function generateInvoice(orderId: string) {
  const supabase = await createClient();

  // Check if invoice already exists
  const { data: existing } = await supabase
    .from('invoices')
    .select('id')
    .eq('order_id', orderId)
    .maybeSingle();

  if (existing) return existing.id;

  // Get order with items
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select(
      `
      id, user_id, subtotal, discount_amount, total, delivery_fee, buyer_nif,
      order_items(id, quantity, unit_price, total_price, tax_rate,
        products(product_translations(name, language_code))
      ),
      profiles(full_name, email),
      addresses(full_name, street, city, postal_code, province)
    `
    )
    .eq('id', orderId)
    .single();

  if (orderErr || !order) throw new Error('Order not found');

  // Get seller info from business_info
  const { data: bizRows } = await supabase.from('business_info').select('key, value');

  const bizMap = new Map<string, string>();
  for (const row of bizRows ?? []) {
    bizMap.set(row.key, row.value);
  }

  const sellerName = bizMap.get('business_name') || 'My Bakery';
  const sellerNif = bizMap.get('nif') || '';
  const sellerAddress = bizMap.get('address') || '';

  // Buyer info
  const profile = (order as Record<string, unknown>).profiles as {
    full_name: string | null;
    email: string | null;
  } | null;
  const address = (order as Record<string, unknown>).addresses as {
    full_name: string;
    street: string;
    city: string;
    postal_code: string;
    province: string;
  } | null;

  const buyerName = address?.full_name || profile?.full_name || '';
  const buyerAddress = address
    ? `${address.street}, ${address.city} ${address.postal_code}, ${address.province}`
    : null;
  const buyerEmail = profile?.email || null;

  // Generate invoice number via DB function
  const { data: invoiceNum } = await supabase.rpc('generate_invoice_number');
  const invoiceNumber =
    (invoiceNum as unknown as string) || `FAC-${new Date().getFullYear()}-00000`;

  // Calculate IVA breakdown per item
  // Prices include IVA, so: unit_base = unit_price / (1 + tax_rate/100)
  const items =
    ((order as Record<string, unknown>).order_items as Array<{
      id: string;
      quantity: number;
      unit_price: number;
      total_price: number;
      tax_rate: number;
      products: {
        product_translations: { name: string; language_code: string }[];
      } | null;
    }>) || [];

  let subtotalBase = 0;
  let totalIva = 0;

  const invoiceItems = items.map(item => {
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

  // Round totals
  subtotalBase = Math.round(subtotalBase * 100) / 100;
  totalIva = Math.round(totalIva * 100) / 100;

  // buyer_nif from the order determines simplified vs full invoice
  const buyerNif = ((order as Record<string, unknown>).buyer_nif as string | null) || null;

  // Create invoice
  const { data: invoice, error: invoiceErr } = await supabase
    .from('invoices')
    .insert({
      order_id: orderId,
      invoice_number: invoiceNumber,
      seller_name: sellerName,
      seller_nif: sellerNif,
      seller_address: sellerAddress,
      buyer_name: buyerName,
      buyer_nif: buyerNif,
      buyer_address: buyerAddress,
      buyer_email: buyerEmail,
      subtotal_base: subtotalBase,
      total_iva: totalIva,
      total: (order as Record<string, unknown>).total as number,
      discount_amount: (order as Record<string, unknown>).discount_amount as number,
      delivery_fee: (order as Record<string, unknown>).delivery_fee as number
    })
    .select('id')
    .single();

  if (invoiceErr) throw new Error(invoiceErr.message);

  // Insert invoice items
  if (invoiceItems.length > 0) {
    await supabase.from('invoice_items').insert(
      invoiceItems.map(item => ({
        invoice_id: invoice.id,
        ...item
      }))
    );
  }

  return invoice.id;
}

/**
 * Mark invoice as sent (records sent_at timestamp).
 */
export async function markInvoiceSent(invoiceId: string) {
  await requireRole(['admin', 'super_admin']);
  const supabase = await createClient();

  await supabase.from('invoices').update({ sent_at: new Date().toISOString() }).eq('id', invoiceId);
}

/**
 * Send invoice email via Resend.
 * Calls the edge function or API route that generates PDF + sends email.
 */
export async function sendInvoiceEmail(invoiceId: string) {
  await requireRole(['admin', 'super_admin']);

  // Call the API route that generates PDF and sends email
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/invoices/${invoiceId}/send`, {
    method: 'POST',
    headers: { 'x-internal-key': process.env.INTERNAL_API_KEY || '' }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to send invoice: ${text}`);
  }
}
