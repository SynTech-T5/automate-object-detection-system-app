import * as StatusCard from "../../components/Utilities/StatusCard";
import CreateEventForm from "@/app/components/Forms/CreateEventForm";
import { Separator } from "@/components/ui/separator";
import ToggleViewButton from "@/app/components/Cameras/ToggleViewButton";
import CameraView from "@/app/components/Cameras/CameraView";
import SearchCamerasInput from "@/app/components/Cameras/SearchCamerasInput";
import CameraFilters from "@/app/components/Cameras/CameraFilters";
import CreateCameraForm from "@/app/components/Forms/CreateCameraForm";
import EventGrid from "@/app/components/Events/EventCardGrid";

type ViewMode = "grid" | "list";

export default async function CamerasPage({
  searchParams,
}: {
  searchParams?: {
    view?: ViewMode;
    q?: string;
    status?: 'Active' | 'Inactive';
    location?: string;
    type?: string;
  };
}) {

  const viewMode: ViewMode = searchParams?.view === "list" ? "list" : "grid";
  const q = searchParams?.q ?? "";
  const status = searchParams?.status;
  const location = searchParams?.location;
  const type = searchParams?.type;

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
            <CreateCameraForm />
          </div>
        </div>

        <Separator className="bg-[var(--color-primary-bg)] my-3" />

        <div className="grid gap-2 items-start sm:gap-3 mt-3">
          <div className="w-full">
            <SearchCamerasInput />
          </div>
          <div className="w-full">
            <CameraFilters />
          </div>
        </div>

        <CameraView
          viewMode={viewMode}
          search={q}
          status={status}
          location={location}
          type={type}
        />
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
        <Separator className="bg-[var(--color-primary-bg)] mb-3" />

        <EventGrid />
      </div>
    </div>
  );
}