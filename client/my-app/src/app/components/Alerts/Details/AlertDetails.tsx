'use client';

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert } from "@/app/models/alerts.model";
import { ArrowLeft } from "lucide-react";

// ⬇️ ใช้คอมโพเนนต์ที่แยกไว้
import AlertFootageCard from "@/app/components/Alerts/Details/AlertFootageCard";
import AlertMetaCard from "@/app/components/Alerts/Details/AlertMetaCard";
import EventTimeline from "@/app/components/Alerts/Details/EventTimeline";
import RelatedAlerts from "@/app/components/Alerts/Details/RelatedAlerts";
import Notes from "./Notes";

export default function AlertDetails({ alert }: { alert: Alert }) {
  const [currentAlert] = useState(alert);
  const altCode = `ALT${String(currentAlert?.alert_id).padStart(3, "0")}`;

  function onBack() {
    window.history.back();
  }

  return (
    <div className="w-full w-auto">
      {/* Header */}
      <div className="flex flex-wrap items-start gap-3 justify-center mb-3">
        <label
          htmlFor="cameraDetails"
          className="min-w-0 flex-1 font-bold text-lg text-[var(--color-primary)] truncate"
          title={`Alert Details : ${altCode}`}
        >
          Alert Details : {altCode}
        </label>

        <Button
          type="button"
          onClick={onBack}
          className="ml-auto shrink-0 bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)]
                     px-4 py-2 rounded-md disabled:opacity-50 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>

        {/* ---------- Details zone (Media + Meta) ---------- */}
        <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-4 mt-2">
          {/* Footage (รองรับวิดีโอ/รูป + fallback /library-room.jpg อัตโนมัติในคอมโพเนนต์) */}
          <div className="md:col-span-3">
            <AlertFootageCard footagePath={currentAlert?.footage_path} title="Footage" />
          </div>

          {/* Meta (แสดงรายละเอียด + event icon แบบไดนามิก) */}
          <div className="md:col-span-2">
            <AlertMetaCard alert={currentAlert} title="Alert Details" />
          </div>
        </div>

        {/* ---------- Tabs ---------- */}
        <Tabs defaultValue="timeline" className="w-full mt-4">
          <div className="overflow-x-auto scrollbar-hide ios-smooth snap-x snap-mandatory scroll-gutter">
            <div className="w-full relative -mx-5 px-5 border-b border-gray-200">
              <TabsList className="inline-flex w-auto bg-transparent p-0 rounded-none text-base whitespace-nowrap flex-nowrap">
                {[
                  { id: "timeline", label: "Event Timeline" },
                  { id: "related", label: "Related Alerts" },
                  { id: "notes", label: "Notes & Comments" },
                ].map((t) => (
                  <TabsTrigger
                    key={t.id}
                    value={t.id}
                    className="relative mr-6 h-9 px-0 bg-transparent rounded-none
                               font-medium flex-shrink-0 snap-start
                               text-gray-500 data-[state=active]:text-[var(--color-primary)]
                               after:absolute after:left-0 after:-bottom-[1px]
                               after:h-[2px] after:w-0 after:bg-[var(--color-primary)]
                               data-[state=active]:after:w-full transition-all"
                  >
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>

          <TabsContent value="timeline" className="px-4 py-2 text-sm text-gray-600">
            <EventTimeline alrId={currentAlert.alert_id} />
          </TabsContent>
          <TabsContent value="related" className="px-4 py-2 text-sm text-gray-600">
            <RelatedAlerts alrId={currentAlert.alert_id} />
          </TabsContent>
          <TabsContent value="notes" className="px-4 py-2 text-sm text-gray-600">
            <Notes alrId={currentAlert.alert_id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}