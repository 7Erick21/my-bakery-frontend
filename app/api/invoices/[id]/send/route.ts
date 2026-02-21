import { type NextRequest, NextResponse } from 'next/server';

import { sendInvoiceEmail } from '@/lib/email/resend';
import { generateInvoicePdf } from '@/lib/pdf/invoicePdf';
import { createClient } from '@/lib/supabase/server';
import { getInvoiceById } from '@/server/queries/invoices';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Verify internal API key or admin session
  const internalKey = request.headers.get('x-internal-key');
  const isInternal = internalKey && internalKey === process.env.INTERNAL_API_KEY;

  if (!isInternal) {
    // Check admin session
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const { id } = await params;
  const invoice = await getInvoiceById(id);

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  if (!invoice.buyer_email) {
    return NextResponse.json({ error: 'No buyer email' }, { status: 400 });
  }

  // Generate PDF
  const pdfBuffer = await generateInvoicePdf(invoice);

  // Send email
  await sendInvoiceEmail(invoice.buyer_email, invoice.invoice_number, pdfBuffer);

  // Mark as sent
  const supabase = await createClient();
  await supabase.from('invoices').update({ sent_at: new Date().toISOString() }).eq('id', id);

  return NextResponse.json({ sent: true });
}
