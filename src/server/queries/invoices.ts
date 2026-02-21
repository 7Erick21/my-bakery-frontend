import type { InvoiceWithItems } from '@/lib/supabase/models';
import { createClient } from '@/lib/supabase/server';

export async function getInvoiceByOrderId(orderId: string): Promise<InvoiceWithItems | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('invoices')
    .select(
      `
      *,
      invoice_items(*)
    `
    )
    .eq('order_id', orderId)
    .maybeSingle();

  return (data as unknown as InvoiceWithItems) ?? null;
}

export async function getInvoiceById(id: string): Promise<InvoiceWithItems | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('invoices')
    .select(
      `
      *,
      invoice_items(*)
    `
    )
    .eq('id', id)
    .maybeSingle();

  return (data as unknown as InvoiceWithItems) ?? null;
}

export async function getAllInvoicesAdmin(): Promise<InvoiceWithItems[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('invoices')
    .select(
      `
      *,
      invoice_items(*)
    `
    )
    .order('created_at', { ascending: false });

  return (data ?? []) as unknown as InvoiceWithItems[];
}
