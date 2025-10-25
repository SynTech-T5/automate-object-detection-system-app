// app/(with-layout)/cameras/page.tsx
import CreateEventForm from "@/app/components/Forms/CreateEventForm";
import { Separator } from "@/components/ui/separator";
import CameraView from "@/app/components/Cameras/CameraView";
import SearchCamerasInput from "@/app/components/Cameras/SearchCamerasInput";
import CameraFilters from "@/app/components/Cameras/CameraFilters";
import EventGrid from "@/app/components/Events/EventCardGrid";

type ViewMode = "grid" | "list";
type SP = Record<string, string | string[] | undefined>;

export default async function CamerasPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;

  const pick = (key: keyof SP) =>
    typeof sp?.[key] === "string" ? (sp[key] as string) : undefined;

  const viewParam = pick("view");
  const q = pick("q") ?? "";
  const status = pick("status") as "Active" | "Inactive" | undefined;
  const location = pick("location");
  const type = pick("type");

  const viewMode: ViewMode = viewParam === "list" ? "list" : "grid";

  return (
    <div className="space-y-6">
      {/* Search & Filter */}
      <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6">
        <label
          htmlFor="cameraName"
          className="min-w-0 flex-1 font-bold text-lg text-[var(--color-primary)]"
        >
          Search & Filter
        </label>
        <div className="grid gap-2 items-start sm:gap-3 mt-3">
          <div className="w-full">
            <SearchCamerasInput />
          </div>
          <div className="w-full">
            <CameraFilters />
          </div>
        </div>
      </div>

      {/* Summary + Camera Management + List/Grid (ทั้งหมดอยู่ใน CameraView แล้ว) */}
      <CameraView
        viewMode={viewMode}
        search={q}
        status={status}
        location={location}
        type={type}
      />

      {/* Event Detection Configuration */}
      <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6">
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