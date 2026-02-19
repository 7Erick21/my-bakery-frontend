import type {
  ProductAdminListItem,
  ProductionScheduleItem,
  RecurringProductionItem
} from '@/lib/supabase/models';
import { getTranslation } from '@/lib/utils/translation';

const AMBER_500: [number, number, number] = [245, 158, 11];
const AMBER_600: [number, number, number] = [217, 119, 6];
const AMBER_50: [number, number, number] = [255, 251, 235];
const WHITE: [number, number, number] = [255, 255, 255];
const GRAY_500: [number, number, number] = [107, 114, 128];
const BLUE_50: [number, number, number] = [239, 246, 255];

// ASCII-safe day names (jsPDF Helvetica doesn't support accents)
const DAY_NAMES = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];

interface MergedPdfRow {
  product_name: string;
  base_quantity: number;
  recurring_quantity: number;
  total: number;
  recurring_details: { business_name: string; quantity: number }[];
}

export async function generateProductionSchedulePdf(
  items: ProductionScheduleItem[],
  products: ProductAdminListItem[],
  recurringItems: RecurringProductionItem[]
): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const { autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // ── Build recurring lookup ──
  const recurringMap = new Map<string, RecurringProductionItem>();
  for (const item of recurringItems) {
    recurringMap.set(`${item.product_id}__${item.day_of_week}`, item);
  }

  // ── Load logo ──
  let logoData: string | null = null;
  try {
    const response = await fetch('/my-bakery-logo.jpg');
    const blob = await response.blob();
    logoData = await blobToDataUrl(blob);
  } catch {
    // Continue without logo
  }

  // ── Build merged rows per day ──
  function getMergedRowsForDay(day: number): MergedPdfRow[] {
    const rows: MergedPdfRow[] = [];
    const seenProducts = new Set<string>();

    // Base schedule items for this day
    for (const item of items) {
      if (!item.is_active || item.day_of_week !== day) continue;
      seenProducts.add(item.product_id);
      const recKey = `${item.product_id}__${day}`;
      const rec = recurringMap.get(recKey);
      const recQty = rec?.total_quantity ?? 0;

      rows.push({
        product_name: resolveProductName(item, products),
        base_quantity: item.base_quantity,
        recurring_quantity: recQty,
        total: item.base_quantity + recQty,
        recurring_details: rec?.details ?? []
      });
    }

    // Recurring-only products for this day
    for (const rec of recurringItems) {
      if (rec.day_of_week !== day || seenProducts.has(rec.product_id)) continue;
      seenProducts.add(rec.product_id);

      rows.push({
        product_name: rec.product_name,
        base_quantity: 0,
        recurring_quantity: rec.total_quantity,
        total: rec.total_quantity,
        recurring_details: rec.details
      });
    }

    return rows;
  }

  // ── Draw header ──
  let y = margin;

  if (logoData) {
    doc.addImage(logoData, 'JPEG', margin, y, 30, 30);
  }

  const textX = logoData ? margin + 36 : margin;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...AMBER_600);
  doc.text('CALENDARIO DE PRODUCCION', textX, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(...GRAY_500);
  doc.text('Base + pedidos recurrentes', textX, y + 18);

  y += logoData ? 35 : 30;

  // ── Separator line ──
  doc.setDrawColor(...AMBER_500);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // ── Tables per day ──
  for (let day = 1; day <= 7; day++) {
    const mergedRows = getMergedRowsForDay(day);
    if (mergedRows.length === 0) continue;

    // Check if we need a new page (at least 50mm for header + a few rows)
    if (y > pageHeight - 50) {
      doc.addPage();
      y = margin;
    }

    // Day heading
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...AMBER_600);
    doc.text(DAY_NAMES[day - 1], margin, y);
    y += 4;

    // Day totals
    const dayTotalBase = mergedRows.reduce((s, r) => s + r.base_quantity, 0);
    const dayTotalRecurring = mergedRows.reduce((s, r) => s + r.recurring_quantity, 0);
    const dayTotal = dayTotalBase + dayTotalRecurring;

    const body = mergedRows.map(row => [
      stripAccents(row.product_name),
      String(row.base_quantity),
      String(row.recurring_quantity),
      String(row.total)
    ]);

    // Add totals row
    body.push(['TOTAL', String(dayTotalBase), String(dayTotalRecurring), String(dayTotal)]);

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Producto', 'Base', 'Recurrentes', 'Total']],
      body,
      theme: 'plain',
      headStyles: {
        fillColor: AMBER_500,
        textColor: WHITE,
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'left'
      },
      columnStyles: {
        0: { cellWidth: contentWidth * 0.46 },
        1: { cellWidth: contentWidth * 0.18, halign: 'center' },
        2: { cellWidth: contentWidth * 0.18, halign: 'center' },
        3: { cellWidth: contentWidth * 0.18, halign: 'center' }
      },
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      alternateRowStyles: {
        fillColor: AMBER_50
      },
      didParseCell(data) {
        // Style the totals row (last body row)
        if (data.section === 'body' && data.row.index === body.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [254, 243, 199]; // amber-100
        }
      }
    });

    // Get final Y from last table
    const lastTable = (doc as unknown as Record<string, unknown>).lastAutoTable as
      | { finalY?: number }
      | undefined;
    y = (lastTable?.finalY ?? y + 20) + 4;

    // ── Recurring breakdown sub-section ──
    const rowsWithRecurring = mergedRows.filter(r => r.recurring_details.length > 0);
    if (rowsWithRecurring.length > 0) {
      if (y > pageHeight - 30) {
        doc.addPage();
        y = margin;
      }

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(...GRAY_500);
      doc.text('Desglose pedidos recurrentes:', margin, y);
      y += 3;

      const breakdownBody: string[][] = [];
      for (const row of rowsWithRecurring) {
        for (const d of row.recurring_details) {
          breakdownBody.push([
            stripAccents(d.business_name),
            stripAccents(row.product_name),
            String(d.quantity)
          ]);
        }
      }

      autoTable(doc, {
        startY: y,
        margin: { left: margin + 4, right: margin },
        head: [['Empresa', 'Producto', 'Cantidad']],
        body: breakdownBody,
        theme: 'plain',
        headStyles: {
          fillColor: GRAY_500,
          textColor: WHITE,
          fontStyle: 'bold',
          fontSize: 8,
          halign: 'left'
        },
        columnStyles: {
          0: { cellWidth: (contentWidth - 4) * 0.4 },
          1: { cellWidth: (contentWidth - 4) * 0.4 },
          2: { cellWidth: (contentWidth - 4) * 0.2, halign: 'center' }
        },
        styles: {
          fontSize: 8,
          cellPadding: 2
        },
        alternateRowStyles: {
          fillColor: BLUE_50
        }
      });

      const breakdownTable = (doc as unknown as Record<string, unknown>).lastAutoTable as
        | { finalY?: number }
        | undefined;
      y = (breakdownTable?.finalY ?? y + 15) + 8;
    } else {
      y += 4;
    }
  }

  // ── Footer on every page ──
  const totalPages = doc.getNumberOfPages();
  const now = new Date().toLocaleString();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...GRAY_500);
    doc.text(`Generado el ${now}`, margin, pageHeight - 8);
    doc.text(`Pagina ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 8, {
      align: 'right'
    });
  }

  // ── Save ──
  doc.save('calendario-produccion.pdf');
}

function resolveProductName(
  item: ProductionScheduleItem,
  products: ProductAdminListItem[]
): string {
  // Try from the joined data first
  const joinedName = item.products?.product_translations?.[0]?.name;
  if (joinedName) return joinedName;

  // Fallback: look up from the products list
  const product = products.find(p => p.id === item.product_id);
  if (!product) return 'Producto';
  const t = getTranslation(product.product_translations, 'es');
  return t?.name ?? 'Producto';
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function stripAccents(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
