import { DashboardView } from '@/components/dashboard/dashboard-view';
import { listReportSummaries } from '@/lib/reports/store';

export default async function DashboardPage() {
  const reports = await listReportSummaries();

  return <DashboardView reports={reports} />;
}
