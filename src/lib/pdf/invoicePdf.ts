import type { InvoiceWithItems } from '@/lib/supabase/models';

const AMBER_600: [number, number, number] = [217, 119, 6];
const AMBER_500: [number, number, number] = [245, 158, 11];
const AMBER_50: [number, number, number] = [255, 251, 235];
const WHITE: [number, number, number] = [255, 255, 255];
const GRAY_500: [number, number, number] = [107, 114, 128];
const GRAY_700: [number, number, number] = [55, 65, 81];
const BLACK: [number, number, number] = [0, 0, 0];

function stripAccents(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function formatMoney(n: number): string {
  return `${n.toFixed(2)} EUR`;
}

/**
 * Generate invoice PDF and return as ArrayBuffer (for server-side use).
 * Uses jsPDF + autoTable.
 *
 * If buyer_nif is present → "FACTURA" (complete invoice, RD 1619/2012)
 * If buyer_nif is absent  → "FACTURA SIMPLIFICADA" (simplified invoice)
 */
export async function generateInvoicePdf(invoice: InvoiceWithItems): Promise<ArrayBuffer> {
  const { jsPDF } = await import('jspdf');
  const { autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  const isSimplified = !invoice.buyer_nif;
  const invoiceTitle = isSimplified ? 'FACTURA SIMPLIFICADA' : 'FACTURA';

  let y = margin;

  // ── Header ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(isSimplified ? 17 : 20);
  doc.setTextColor(...AMBER_600);
  doc.text(invoiceTitle, margin, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...GRAY_500);
  doc.text(stripAccents(invoice.invoice_number), margin, y + 16);

  doc.setFontSize(10);
  doc.text(
    `Fecha: ${new Date(invoice.invoice_date || invoice.created_at).toLocaleDateString('es-ES')}`,
    pageWidth - margin,
    y + 8,
    { align: 'right' }
  );

  y += 25;

  // ── Separator ──
  doc.setDrawColor(...AMBER_500);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // ── Seller / Buyer ──
  const colWidth = contentWidth / 2 - 5;

  // Seller
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...GRAY_500);
  doc.text('EMISOR', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...GRAY_700);
  doc.text(stripAccents(invoice.seller_name), margin, y);
  y += 4.5;
  if (invoice.seller_nif) {
    doc.text(`NIF: ${invoice.seller_nif}`, margin, y);
    y += 4.5;
  }
  if (invoice.seller_address) {
    doc.text(stripAccents(invoice.seller_address), margin, y, { maxWidth: colWidth });
    y += 6;
  }

  // Buyer (right column, same vertical area)
  let yBuyer = y - (invoice.seller_nif ? 15 : 10.5);
  const buyerX = margin + colWidth + 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...GRAY_500);
  doc.text('CLIENTE', buyerX, yBuyer);
  yBuyer += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...GRAY_700);
  doc.text(stripAccents(invoice.buyer_name), buyerX, yBuyer);
  yBuyer += 4.5;

  // Only show NIF for complete invoices
  if (!isSimplified && invoice.buyer_nif) {
    doc.text(`NIF: ${invoice.buyer_nif}`, buyerX, yBuyer);
    yBuyer += 4.5;
  }
  if (invoice.buyer_address) {
    doc.text(stripAccents(invoice.buyer_address), buyerX, yBuyer, { maxWidth: colWidth });
    yBuyer += 6;
  }
  if (invoice.buyer_email) {
    doc.text(invoice.buyer_email, buyerX, yBuyer);
    yBuyer += 4.5;
  }

  y = Math.max(y, yBuyer) + 6;

  // ── Items table ──
  const body = invoice.invoice_items.map(item => [
    stripAccents(item.product_name),
    String(item.quantity),
    formatMoney(item.unit_base),
    `${item.tax_rate}%`,
    formatMoney(item.line_iva),
    formatMoney(item.line_total)
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Producto', 'Cant.', 'Base unit. (EUR)', 'IVA %', 'IVA (EUR)', 'Total (EUR)']],
    body,
    theme: 'plain',
    headStyles: {
      fillColor: AMBER_500,
      textColor: WHITE,
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left'
    },
    columnStyles: {
      0: { cellWidth: contentWidth * 0.32 },
      1: { cellWidth: contentWidth * 0.08, halign: 'center' },
      2: { cellWidth: contentWidth * 0.15, halign: 'right' },
      3: { cellWidth: contentWidth * 0.1, halign: 'center' },
      4: { cellWidth: contentWidth * 0.15, halign: 'right' },
      5: { cellWidth: contentWidth * 0.2, halign: 'right' }
    },
    styles: {
      fontSize: 9,
      cellPadding: 2.5,
      textColor: GRAY_700
    },
    alternateRowStyles: {
      fillColor: AMBER_50
    }
  });

  const lastTable = (doc as unknown as Record<string, unknown>).lastAutoTable as
    | { finalY?: number }
    | undefined;
  y = (lastTable?.finalY ?? y + 30) + 10;

  // ── Totals ──
  const totalsX = pageWidth - margin - 70;

  const drawTotalRow = (label: string, value: string, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(bold ? 11 : 10);
    doc.setTextColor(...(bold ? BLACK : GRAY_700));
    doc.text(label, totalsX, y);
    doc.text(value, pageWidth - margin, y, { align: 'right' });
    y += bold ? 6 : 5;
  };

  drawTotalRow('Base imponible', formatMoney(invoice.subtotal_base));
  drawTotalRow('Total IVA', formatMoney(invoice.total_iva));

  if (invoice.discount_amount > 0) {
    doc.setTextColor(22, 163, 74); // green-600
    drawTotalRow('Descuento', `-${formatMoney(invoice.discount_amount)}`);
    doc.setTextColor(...GRAY_700);
  }

  if (invoice.delivery_fee > 0) {
    drawTotalRow('Gastos de envio', formatMoney(invoice.delivery_fee));
  }

  y += 2;
  doc.setDrawColor(...AMBER_500);
  doc.line(totalsX, y, pageWidth - margin, y);
  y += 5;

  drawTotalRow('TOTAL', formatMoney(invoice.total), true);

  // ── Legal footer ──
  y = pageHeight - 20;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...GRAY_500);

  const legalText = isSimplified
    ? 'Factura simplificada emitida conforme al articulo 7 del Real Decreto 1619/2012 por el que se regulan las obligaciones de facturacion.'
    : 'Factura emitida conforme al Real Decreto 1619/2012 por el que se regulan las obligaciones de facturacion.';
  doc.text(legalText, margin, y, { maxWidth: contentWidth });

  // ── Page numbers ──
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...GRAY_500);
    doc.text(`Pagina ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 8, {
      align: 'right'
    });
  }

  return doc.output('arraybuffer');
}
