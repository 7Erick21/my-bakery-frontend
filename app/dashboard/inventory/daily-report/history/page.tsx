import { getDailyReportHistory } from '@/server/queries/inventory';
import { DailyReportHistory } from '@/views/Dashboard/Inventory';

export default async function DailyReportHistoryPage() {
  const reports = await getDailyReportHistory();

  return <DailyReportHistory reports={reports} />;
}
