import { getAllInvoicesAdmin } from '@/server/queries/invoices';

import { InvoicesList } from '@/views/Dashboard/Invoices';

export default async function DashboardInvoicesPage() {
  const invoices = await getAllInvoicesAdmin();

  return <InvoicesList invoices={invoices} />;
}
