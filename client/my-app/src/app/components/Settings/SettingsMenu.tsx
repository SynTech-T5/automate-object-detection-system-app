'use client';

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert } from "@/app/models/alerts.model";
import { ArrowLeft } from "lucide-react";

import AccountSettings from "./Account";

export default function SettingsMenu() {

  return (
    <div className="w-full w-auto">
        {/* ---------- Tabs ---------- */}
        <Tabs defaultValue="account" className="w-full mt-4">
          <div className="overflow-x-auto scrollbar-hide ios-smooth snap-x snap-mandatory scroll-gutter">
            <div className="w-full relative -mx-5 px-5 border-b border-gray-200">
              <TabsList className="inline-flex w-auto bg-transparent p-0 rounded-none text-base whitespace-nowrap flex-nowrap">
                {[
                  { id: "account", label: "Account" },
                  { id: "notifications", label: "Notifications" },
                  { id: "default", label: "Default Settings" },
                  { id: "user", label: "User Managements" },
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

          <TabsContent value="account" className="py-2 text-sm text-gray-600">
                <AccountSettings />
          </TabsContent>
          <TabsContent value="notifications" className="py-2 text-sm text-gray-600">

          </TabsContent>
          <TabsContent value="default" className="py-2 text-sm text-gray-600">

          </TabsContent>
          <TabsContent value="user" className="py-2 text-sm text-gray-600">

          </TabsContent>
        </Tabs>
      </div>
  );
}