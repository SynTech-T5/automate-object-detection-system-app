"use client";

import FormCreateAlert from "../../components/FormCreateAlert"
import IconPickerDemo from "../../components/IconPickerDemo";
import CreateEventForm from "../../components/CreateEventForm";
import AlertTab from "../../components/AlertTab";

export default function Page() {
  return (
    <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
      </div>
      <AlertTab/>
    </div>
  );
}