// app/(dashboard)/alerts/page.tsx
import { Separator } from "@/components/ui/separator";
import AlertView from "@/app/components/Alerts/AlertsView";
import SearchAlertsInput from "@/app/components/Alerts/SearchAlertsInput";
import AlertFilters from "@/app/components/Alerts/AlertFilters";
import DistributionChart from "@/app/components/Alerts/Chart/Distribution";
import Trend from "@/app/components/Alerts/Chart/Trends";

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      {/* === Search & Filter (บนสุด) === */}
      <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6">
        <label
          htmlFor="alertSearchFilter"
          className="min-w-0 flex-1 font-bold text-lg text-[var(--color-primary)]"
        >
          Search & Filter
        </label>
        <div className="grid gap-2 items-start sm:gap-3 mt-3">
          <div className="w-full">
            <SearchAlertsInput />
          </div>
          <div className="w-full">
            {/* ✅ ไม่ต้อง Loader แล้ว */}
            <AlertFilters />
          </div>
        </div>
      </div>

      {/* === Summary + Table + Refresh === */}
      <AlertView />

      {/* === ส่วนล่างเดิม: Trends / Distribution / Recent === */}
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
            htmlFor="recentCameraActivity"
            className="min-w-0 flex-1 font-bold text-lg text-[var(--color-primary)]"
          >
            Recent Camera Activity
          </label>
        </div>
        <Separator className="bg-[var(--color-primary-bg)]" />
        {/* TODO: ใส่คอมโพเนนต์ Recent ของคุณต่อท้ายได้เลย */}
      </div>
    </div>
  );
}