import * as StatusCard from "../../components/StatusCard";
import CreateEventForm from "@/app/components/CreateEventForm";
import { Separator } from "@/components/ui/separator";
import ToggleViewButton from "@/app/components/ToggleViewButton";
import CameraView from "@/app/components/CameraView";

type ViewMode = "grid" | "list";

export default async function CamerasPage({
  searchParams,
}: {
  searchParams?: { view?: ViewMode };
}) {
  const viewMode: ViewMode = searchParams?.view === "list" ? "list" : "grid";

  return (
    <div className="space-y-6">
      <StatusCard.DashboardSummaryCameraSection />

      <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6 ">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-start gap-3 justify-center mb-3">
          <label
            htmlFor="cameraName"
            className="min-w-0 flex-1 font-bold text-lg text-[var(--color-primary)]"
          >
            Camera Management
          </label>

          <div className="flex gap-3">
            <ToggleViewButton />
            <CreateEventForm />
          </div>
        </div>

        <Separator className="bg-[var(--color-primary-bg)] mb-3" />

        <CameraView viewMode={viewMode} />
      </div>

      <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6 ">
        <div className="flex flex-wrap items-start gap-3 justify-center mb-3">
          <label
            htmlFor="cameraName"
            className="min-w-0 flex-1 font-bold text-lg text-[var(--color-primary)]"
          >
            Event Detection Configuration
          </label>
          <CreateEventForm />
        </div>
        <Separator className="bg-[var(--color-primary-bg)]" />
      </div>
    </div>
  );
}