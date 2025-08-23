import CameraCard, { type Camera } from "./CameraCard";
import CameraTable from "./CameraTable";

type ViewMode = "grid" | "list";
const base = process.env.NEXT_PUBLIC_APP_URL!;

export default async function CameraView({ viewMode }: { viewMode: ViewMode }) {
  const res = await fetch(`${base}/api/cameras`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load cameras");

  const cameras: Camera[] = await res.json();

  return viewMode === "grid" ? (
    <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
      {cameras.map((cam) => (
        <CameraCard key={cam.id} cam={cam} />
      ))}
    </div>
  ) : (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
      <CameraTable cameras={cameras} />
    </div>
  );
}