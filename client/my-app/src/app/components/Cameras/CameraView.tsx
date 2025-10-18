import CameraCard  from "./CameraCard";
import { Camera } from "@/app/models/cameras.model";
import CameraTable from "./CameraTable";
import CameraGrid from "./CameraGrid";

type ViewMode = "grid" | "list";
const base = process.env.NEXT_PUBLIC_APP_URL!;

/* ------------------------- Search matcher -------------------------- */
function buildMatcher(search?: string) {
  const q = (search ?? "").trim().toLowerCase();
  if (!q) return (_c: Camera) => true;

  const tokens = q.split(/\s+/);
  const checks: Array<(c: Camera) => boolean> = [];

  for (const t of tokens) {
    const m = t.match(/^(id|name|location):(.*)$/i);
    if (m) {
      const key = m[1].toLowerCase();
      const val = m[2].trim().toLowerCase();
      if (!val) continue;

      if (key === "id") {
        checks.push((c) => String(c.camera_id).toLowerCase().includes(val));
      } else if (key === "name") {
        checks.push((c) => (c.camera_name ?? "").toLowerCase().includes(val));
      } else if (key === "location") {
        checks.push((c) => (c.location_name ?? "").toLowerCase().includes(val));
      }
    } else {
      const val = t.toLowerCase();
      checks.push((c) => {
        const idStr = String(c.camera_id).toLowerCase();
        const nm = (c.camera_name ?? "").toLowerCase();
        const loc = (c.location_name ?? "").toLowerCase();
        return idStr.includes(val) || nm.includes(val) || loc.includes(val);
      });
    }
  }
  return (c: Camera) => checks.every((fn) => fn(c));
}

export default async function CameraView({
  viewMode,
  search,
  status,
  location,
  type,
}: {
  viewMode: ViewMode;
  search?: string;
  status?: "Active" | "Inactive";
  location?: string;
  type?: string;
}) {
  const res = await fetch(`${base}/api/cameras`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${process.env.TOKEN}`,
      "Content-Type": "application/json",
    }
  });
  if (!res.ok) throw new Error("Failed to load cameras");
  const json = await res.json();
  const cameras: Camera[] = json.data;

  // 1) ค้นหา
  const match = buildMatcher(search);
  let filtered = cameras.filter(match);

  // 2) กรองสถานะ (boolean -> Active/Inactive)
  if (status === "Active" || status === "Inactive") {
    const want = status === "Active"; // true = Active
    filtered = filtered.filter((c) => c.camera_status === want);
  }

  // 3) กรอง location
  if (location && location !== "All") {
    const needle = location.toLowerCase();
    filtered = filtered.filter((c) =>
      (c.location_name ?? "").toLowerCase().includes(needle)
    );
  }

  // 4) กรอง type
  if (type && type !== "All") {
    const t = type.toLowerCase();
    filtered = filtered.filter((c) =>
      (c.camera_type ?? "").toLowerCase().includes(t)
    );
  }

  return viewMode === "grid" ? (
      <CameraGrid cameras={filtered} />
  ) : (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
      <CameraTable cameras={filtered} />
    </div>
  );
}
