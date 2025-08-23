import CameraCard, { type Camera } from "../../components/cameraCard";
import * as StatusCard from "../../components/StatusCard";
import EventCard, { type EventData } from "../../components/eventCard";
const base = process.env.NEXT_PUBLIC_APP_URL!;

export default async function CamerasPage() {

  const resCam = await fetch(`${base}/api/cameras/`, { cache: "no-store" });
  if (!resCam.ok) {
    throw new Error("Failed to load cameras");
  }

  const cameras: Camera[] = await resCam.json();

  const resEvt = await fetch(`${base}/api/events/`, { cache: "no-store" });
  if (!resEvt.ok) {
    throw new Error("Failed to load events");
  }

  const events: EventData[] = await resEvt.json();

  return (
    <div className="space-y-6">
      <StatusCard.DashboardSummaryCameraSection></StatusCard.DashboardSummaryCameraSection>
<section>
      <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6 ">
        {/* <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6"> */}
        <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {cameras.map((cam) => (
            <CameraCard key={cam.id} cam={cam} />
          ))}
        </div>
      </div>
      </section>

      <section>
        <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6 ">
        {/* <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6"> */}
        <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {events.map((event) => (
            <EventCard key={event.evt_id} event={event} />
          ))}
        </div>
      </div>
      </section>
    </div>
  );
}