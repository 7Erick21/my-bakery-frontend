import { getAuditLog } from '@/server/queries/audit';

import { AuditLog } from '@/views/Dashboard/Audit';

export default async function DashboardAuditPage() {
  const entries = await getAuditLog();

  return <AuditLog entries={entries} />;
}
