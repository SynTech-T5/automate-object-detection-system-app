// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { LayoutGrid, List } from "lucide-react";
// import CameraView from "./CameraView";

// type ViewMode = "grid" | "list";

// export default function CamerasPageClientSection({
//   defaultView = "grid",
// }: { defaultView?: ViewMode }) {
//   const [viewMode, setViewMode] = useState<ViewMode>(defaultView);

//   return (
//     <div className="space-y-4">
//       <div className="flex justify-end">
//         <Button
//           type="button"
//           onClick={() => setViewMode((v) => (v === "grid" ? "list" : "grid"))}
//           className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)] px-4 py-2 rounded-md disabled:opacity-50"
//         >
//           {viewMode === "grid" ? (
//             <>
//               <List className="w-4 h-4 mr-2" />
//               List View
//             </>
//           ) : (
//             <>
//               <LayoutGrid className="w-4 h-4 mr-2" />
//               Grid View
//             </>
//           )}
//         </Button>
//       </div>

//       {/* ส่งสถานะให้ CameraView */}
//       <CameraView />
//     </div>
//   );
// }
