// "use client";

// import { useEffect, useState } from "react";
// import {
//   AlertDialog, AlertDialogCancel, AlertDialogContent,
//   AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { Button } from "@/components/ui/button";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import HealthStatus from "./Details/HealthStatus";
// import type { Camera } from "./CameraCard";

// function EventDetection() { return <div>Event logs / charts…</div>; }
// function AccessControl() { return <div>Door events…</div>; }
// function Maintenance() { return <div>Tickets & schedules…</div>; }

// export default function CameraDetailsModal({
//   open,
//   onOpenChange,
//   camId,
// }: {
//   open: boolean;
//   onOpenChange: (v: boolean) => void;
//   camId: number | null;
// }) {
//   const [data, setData] = useState<Camera | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [err, setErr] = useState<string | null>(null);

//   useEffect(() => {
//     let aborted = false;
//     async function fetchData() {
//       if (!open || camId == null) return;
//       setLoading(true); setErr(null);
//       try {
//         // รองรับทั้ง /api/cameras/:id และ /api/cameras?id=
//         const r1 = await fetch(`/api/cameras/${camId}`, { cache: "no-store" });
//         const payload = r1.ok ? await r1.json() : await (async () => {
//           const r2 = await fetch(`/api/cameras?id=${camId}`, { cache: "no-store" });
//           return r2.ok ? await r2.json() : null;
//         })();
//         if (aborted) return;
//         if (!payload) throw new Error("Not found");
//         setData(payload);
//       } catch (e: any) {
//         if (!aborted) { setErr(e?.message ?? "Fetch error"); setData(null); }
//       } finally {
//         if (!aborted) setLoading(false);
//       }
//     }
//     fetchData();
//     return () => { aborted = true; };
//   }, [open, camId]);

//   const snapshot = data?.snapshotUrl ?? "/library-room.jpg";

//   return (
//     <AlertDialog open={open} onOpenChange={onOpenChange}>
//       <AlertDialogContent
//         className="
//           !p-0 rounded-2xl ring-1 ring-black/5 shadow-xl
//           !w-[90vw] sm:!w-[88vw] !max-w-[880px]
//           max-h-[85vh] bg-white
//           !overflow-hidden flex flex-col min-w-0
//         "
//       >
//         {/* โซนสกรอลล์: Header + Content + Tabs ทั้งหมด */}
//         <div
//           className="
//             flex-1 min-h-0 min-w-0
//             overflow-y-auto overflow-x-auto sm:overflow-x-hidden
//             overscroll-contain touch-pan-y
//             px-4 sm:px-4 pb-20 flex flex-col
//           "
//           style={{ WebkitOverflowScrolling: "touch" }}
//         >
//           {/* Header */}
//           <div className="px-1 pt-5">
//             <AlertDialogHeader className="p-0">
//               <AlertDialogTitle className="text-[var(--color-primary)] text-lg font-semibold">
//                 Camera Details{camId != null ? `: ${camId}` : ""}
//               </AlertDialogTitle>
//             </AlertDialogHeader>
//           </div>

//           {/* ส่วนบน */}
//           <div className="py-3 px-3">
//             <div className="min-w-[960px] sm:min-w-0">
//               <div className="grid grid-cols-2 gap-6">
//                 {/* Snapshot */}
//                 <div className="relative h-[200px] sm:h-[300px] rounded-md overflow-hidden bg-gray-50">
//                   <img
//                     src={snapshot}
//                     onError={(e) => ((e.currentTarget.src = "/api/placeholder/800/600"))}
//                     alt="Camera snapshot"
//                     className="absolute inset-0 h-full w-full object-cover"
//                   />
//                   <Button
//                     type="button"
//                     className="absolute bottom-3 right-3 px-5 py-2 shadow-lg bg-[#0077FF] hover:bg-[#0063d6] text-white rounded-xl"
//                   >
//                     View
//                   </Button>
//                 </div>

//                 {/* Information จาก API */}
//                 <div>
//                   <div className="text-[var(--color-primary)] text-base mb-3">Camera Information</div>
//                   {err && <div className="text-sm text-red-600 mb-2">โหลดข้อมูลไม่สำเร็จ: {err}</div>}

//                   <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
//                     {[
//                       ["Camera ID", data?.id ?? camId ?? "-"],
//                       ["Status", loading ? "…" : (data?.status ?? "-")],
//                       ["Location", loading ? "…" : (data?.location ?? "-")],
//                       ["Type", loading ? "…" : (data?.type ?? "-")],
//                       ["IP Address", loading ? "…" : (data?.ipAddress ?? "-")],
//                       ["Resolution", loading ? "…" : (data?.resolution ?? "-")],
//                       ["Installation Date", loading ? "…" : (data?.installedAt ?? "-")],
//                       ["Last Maintenance", loading ? "…" : (data?.lastMaintenanceAt ?? "-")],
//                     ].map(([k, v]) => (
//                       <div key={k as string} className="space-y-1">
//                         <dt className="text-gray-500 text-xs">{k}</dt>
//                         <dd className="text-gray-900 text-sm">
//                           {loading
//                             ? <span className="inline-block h-3 w-24 bg-gray-200 rounded animate-pulse" />
//                             : String(v)}
//                         </dd>
//                       </div>
//                     ))}
//                   </dl>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Tabs (ให้โมดัลเป็นคนสกรอลล์ ไม่ให้แท็บสกรอลล์เอง) */}
//           <div className="min-w-[960px] sm:min-w-0 flex-1 min-h-0 flex flex-col">
//             <Tabs defaultValue="health" className="flex-1 min-h-0 flex flex-col">
//               <TabsList className="w-full justify-start bg-transparent p-0 border-b border-gray-200 rounded-none text-base whitespace-nowrap">
//                 {[
//                   { id: "health", label: "Health Status" },
//                   { id: "event", label: "Event Detection" },
//                   { id: "access", label: "Access Control" },
//                   { id: "maint", label: "Maintenance" },
//                 ].map((t) => (
//                   <TabsTrigger
//                     key={t.id}
//                     value={t.id}
//                     className="
//                       relative mr-6 h-9 px-0 bg-transparent rounded-none
//                       font-medium
//                       text-gray-500 data-[state=active]:text-[var(--color-primary)]
//                       after:absolute after:left-0 after:-bottom-[1px]
//                       after:h-[2px] after:w-0 after:bg-[var(--color-primary)]
//                       data-[state=active]:after:w-full
//                       transition-all
//                     "
//                   >
//                     {t.label}
//                   </TabsTrigger>
//                 ))}
//               </TabsList>

//               <TabsContent value="health" className="h-full focus-visible:outline-none">
//                 <HealthStatus />
//               </TabsContent>
//               <TabsContent value="event" className="h-full focus-visible:outline-none">
//                 <EventDetection />
//               </TabsContent>
//               <TabsContent value="access" className="h-full focus-visible:outline-none">
//                 <AccessControl />
//               </TabsContent>
//               <TabsContent value="maint" className="h-full focus-visible:outline-none">
//                 <Maintenance />
//               </TabsContent>
//             </Tabs>
//           </div>
//         </div>

//         {/* Footer — ล็อกด้านล่าง */}
//         <div className="px-5 py-3 border-t border-gray-100 bg-white">
//           <AlertDialogFooter className="p-0">
//             <AlertDialogCancel className="border-gray-300 hover:bg-gray-50">
//               Close
//             </AlertDialogCancel>
//           </AlertDialogFooter>
//         </div>
//       </AlertDialogContent>
//     </AlertDialog>
//   );
// }