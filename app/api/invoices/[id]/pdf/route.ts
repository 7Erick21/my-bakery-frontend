import { type NextRequest, NextResponse } from 'next/server';

import { getSession } from '@/lib/auth/helpers';
import { generateInvoicePdf } from '@/lib/pdf/invoicePdf';
import { createClient } from '@/lib/supabase/server';
import { getInvoiceById } from '@/server/queries/invoices';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const invoice = await getInvoiceById(id);

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  // Check access: user must own the order or be admin
  const supabase = await createClient();
  const { data: order } = await supabase
    .from('orders')
    .select('user_id')
    .eq('id', invoice.order_id)
    .single();

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  if (order.user_id !== user.id && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const pdfBuffer = await generateInvoicePdf(invoice);

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${invoice.invoice_number}.pdf"`
    }
  });
}
