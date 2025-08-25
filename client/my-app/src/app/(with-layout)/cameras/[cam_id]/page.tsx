import FullScreenView from "@/app/components/FullScreenView";
import { Camera } from "@/app/models/cameras.model";

const base = process.env.NEXT_PUBLIC_APP_URL!;

export default async function Page({ params }: { params: Promise<{ cam_id: string }> }) {
  const { cam_id } = await params

  const res = await fetch(`${base}/api/cameras/${cam_id}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to load cameras");
  }

  const camera: Camera = await res.json();

  return (
    <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
        <FullScreenView camera={camera}/>
      </div>
    </div>
  )
}