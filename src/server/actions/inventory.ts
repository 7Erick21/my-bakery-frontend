'use server';

import { revalidatePath } from 'next/cache';

import { requireRole } from '@/lib/auth/helpers';
import { createClient } from '@/lib/supabase/server';

export async function updateStock(productId: string, stock: number) {
  await requireRole(['admin', 'super_admin']);
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('inventory')
    .select('id')
    .eq('product_id', productId)
    .single();

  if (existing) {
    await supabase.from('inventory').update({ stock }).eq('product_id', productId);
  } else {
    await supabase.from('inventory').insert({ product_id: productId, stock });
  }

  revalidatePath('/dashboard/inventory');
}

export async function updateLowStockThreshold(productId: string, threshold: number) {
  await requireRole(['admin', 'super_admin']);
  const supabase = await createClient();

  await supabase
    .from('inventory')
    .update({ low_stock_threshold: threshold })
    .eq('product_id', productId);

  revalidatePath('/dashboard/inventory');
}

export async function recordMovement(formData: FormData) {
  await requireRole(['admin', 'super_admin']);
  const supabase = await createClient();

  const productId = formData.get('product_id') as string;
  const movementType = formData.get('movement_type') as string;
  const quantity = Number(formData.get('quantity'));
  const notes = (formData.get('notes') as string) || null;

  await supabase.rpc('record_inventory_movement', {
    p_product_id: productId,
    p_movement_type: movementType,
    p_quantity: quantity,
    p_notes: notes
  });

  revalidatePath('/dashboard/inventory');
  revalidatePath('/dashboard/inventory/movements');
}

interface DailyReportItemInput {
  product_id: string;
  produced: number;
  sold_physical: number;
  damaged: number;
}

export async function createDailyReport(formData: FormData) {
  const profile = await requireRole(['admin', 'super_admin']);
  const supabase = await createClient();

  const reportDate = formData.get('report_date') as string;
  const notes = (formData.get('notes') as string) || null;
  const itemsJson = formData.get('items') as string;
  const items: DailyReportItemInput[] = JSON.parse(itemsJson);

  // Create the report
  const { data: report, error: reportError } = await supabase
    .from('daily_inventory_reports')
    .insert({
      report_date: reportDate,
      created_by: profile.id,
      notes
    })
    .select('id')
    .single();

  if (reportError || !report) {
    throw new Error(reportError?.message ?? 'Error al crear el informe');
  }

  // Insert report items and record movements
  for (const item of items) {
    // Get sold_online from orders for this date
    const { data: onlineData } = await supabase
      .from('order_items')
      .select('quantity, orders!inner(created_at, status)')
      .eq('product_id', item.product_id)
      .gte('orders.created_at', `${reportDate}T00:00:00`)
      .lte('orders.created_at', `${reportDate}T23:59:59`)
      .neq('orders.status', 'cancelled');

    const soldOnline = (onlineData ?? []).reduce((sum, oi) => sum + (oi.quantity ?? 0), 0);

    const leftover = item.produced - soldOnline - item.sold_physical - item.damaged;

    await supabase.from('daily_inventory_report_items').insert({
      report_id: report.id,
      product_id: item.product_id,
      produced: item.produced,
      sold_online: soldOnline,
      sold_physical: item.sold_physical,
      damaged: item.damaged,
      leftover: Math.max(leftover, 0)
    });

    // Record movements for each type
    if (item.produced > 0) {
      await supabase.rpc('record_inventory_movement', {
        p_product_id: item.product_id,
        p_movement_type: 'production',
        p_quantity: item.produced,
        p_notes: `Informe diario ${reportDate}`
      });
    }

    if (item.sold_physical > 0) {
      await supabase.rpc('record_inventory_movement', {
        p_product_id: item.product_id,
        p_movement_type: 'physical_sale',
        p_quantity: -item.sold_physical,
        p_notes: `Informe diario ${reportDate}`
      });
    }

    if (item.damaged > 0) {
      await supabase.rpc('record_inventory_movement', {
        p_product_id: item.product_id,
        p_movement_type: 'damaged_product',
        p_quantity: -item.damaged,
        p_notes: `Informe diario ${reportDate}`
      });
    }
  }

  revalidatePath('/dashboard/inventory');
  revalidatePath('/dashboard/inventory/daily-report');
  revalidatePath('/dashboard/inventory/daily-report/history');
  revalidatePath('/dashboard/inventory/movements');
}

export async function replaceDailyReport(oldReportId: string, formData: FormData) {
  await requireRole(['admin', 'super_admin']);
  const supabase = await createClient();

  const reportDate = formData.get('report_date') as string;

  // Delete old movements linked to this report date
  await supabase.from('inventory_movements').delete().eq('notes', `Informe diario ${reportDate}`);

  // Delete old report items (cascade doesn't apply here, items have FK)
  await supabase.from('daily_inventory_report_items').delete().eq('report_id', oldReportId);

  // Delete old report
  await supabase.from('daily_inventory_reports').delete().eq('id', oldReportId);

  // Create fresh report with new data
  await createDailyReport(formData);
}
