import AlertTable, { type Alert } from "../../components/Alerts/AlertTable";
import * as StatusCard from "../../components/Utilities/StatusCard";
import { Separator } from "@/components/ui/separator";
import AlertsClient from "@/app/components/Alerts/AlertsClient";
import DistributionChart from "@/app/components/Alerts/Chart/Distribution";
import Trend from "@/app/components/Alerts/Chart/Trends";

const base = process.env.NEXT_PUBLIC_APP_URL!;

export default async function AlertsPage() {
  const res = await fetch(`${base}/api/alerts`, {
    cache: "no-store",
    credentials: "include",
    method: "GET",
  });
  if (!res.ok) throw new Error(`Failed to load alerts (${res.status})`);
  const alerts: Alert[] = await res.json();

  return (
    <div className="space-y-6">
      <StatusCard.DashboardSummaryAlertSection />
      <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-start gap-3 justify-center mb-3">
          <label
            htmlFor="AlertManagement"
            className="min-w-0 flex-1 font-bold text-lg text-[var(--color-primary)]"
          >
            Alert Management
          </label>
        </div>
        <Separator className="bg-[var(--color-primary-bg)] my-3" />

        <AlertsClient alerts={alerts} />
      </div>

      {/* ส่วนอื่นๆ ในหน้า เดิม */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6 ">
          <div className="flex flex-wrap items-start gap-3 justify-center mb-3">
            <label
              htmlFor="AlertTrends"
              className="min-w-0 flex-1 font-bold text-lg text-[var(--color-primary)]"
            >
              Alert Trends
            </label>
          </div>
          <Separator className="bg-[var(--color-primary-bg)] mb-3" />

          <Trend />
        </div>
        <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6 ">
          <div className="flex flex-wrap items-start gap-3 justify-center mb-3">
            <label
              htmlFor="AlertDistribution"
              className="min-w-0 flex-1 font-bold text-lg text-[var(--color-primary)]"
            >
              Alert Distribution by Event Type
            </label>
          </div>
          <Separator className="bg-[var(--color-primary-bg)] mb-3" />

          <DistributionChart />
        </div>
      </div>

      <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6 ">
        <div className="flex flex-wrap items-start gap-3 justify-center mb-3">
          <label
            htmlFor="cameraName"
            className="min-w-0 flex-1 font-bold text-lg text-[var(--color-primary)]"
          >
            Recent Camera Activity
          </label>
        </div>
        <Separator className="bg-[var(--color-primary-bg)]" />

      </div>
    </div>
  );
}
