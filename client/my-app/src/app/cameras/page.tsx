import CameraCard, { type Camera } from "../components/CameraCard";

const base = process.env.NEXT_PUBLIC_APP_URL!;

export default async function CamerasPage() {

  const res = await fetch(`${base}/api/cameras`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to load cameras");
  }

  const cameras: Camera[] = await res.json();

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
      {cameras.map((cam) => (
        <CameraCard key={cam.cam_id} cam={cam} />
      ))}
    </div>
  );
}

// "use client";
// import { useEffect, useState } from "react";
// import CameraCard, { Camera } from "../components/CameraCard";

// export default function CamerasPage() {
//   const [cameras, setCameras] = useState<Camera[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");

//   useEffect(() => {
//     fetch("/api/cameras")
//       .then((res) => res.json())
//       .then((data: Camera[]) => setCameras(data))
//       .catch((e) => setErr(e.message))
//       .finally(() => setLoading(false));
//   }, []);

//   if (loading) return loading;
//   if (err) throw new Error("Failed to load cameras");

//   return (
//     <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
//       {cameras.map((cam) => (
//         <CameraCard key={cam.cam_id} cam={cam} />
//       ))}
//     </div>
//   );
// }