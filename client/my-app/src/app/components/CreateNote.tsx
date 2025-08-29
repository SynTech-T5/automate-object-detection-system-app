"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ScheduleMaintenanceForm() {
  const [formData, setFormData] = useState({
    maintenanceType: "",
    scheduledDate: "",
    technician: "",
    note: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl bg-white rounded-lg p-6 shadow-sm space-y-4"
    >
      <h2 className="text-blue-600 font-semibold text-sm">Schedule Maintenance</h2>

      {/* Maintenance Type & Scheduled Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-1">
          <Label>Maintenance Type<span className="text-red-500">*</span></Label>
          <Select
            onValueChange={(value) =>
              setFormData({ ...formData, maintenanceType: value })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="{maintenance_type}" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Routine Check">Routine Check</SelectItem>
              <SelectItem value="Repair">Repair</SelectItem>
              <SelectItem value="Installation">Installation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col space-y-1">
          <Label>Scheduled Date<span className="text-red-500">*</span></Label>
          <Input
            type="date"
            placeholder="{date}"
            value={formData.scheduledDate}
            onChange={(e) =>
              setFormData({ ...formData, scheduledDate: e.target.value })
            }

          />
        </div>
      </div>

      {/* Technician */}
      <div className="flex flex-col space-y-1">
        <Label>Technician<span className="text-red-500">*</span></Label>
        <Input
          type="text"
          placeholder="{technician_name}"
          value={formData.technician}
          onChange={(e) =>
            setFormData({ ...formData, technician: e.target.value })
          }
        />
      </div>

      {/* Note */}
      <div className="flex flex-col space-y-1">
        <Label>Note</Label>
        <Textarea
          placeholder="note"
          value={formData.note}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="bg-blue-500 hover:bg-blue-600 text-white font-medium w-full md:w-auto px-6 py-2 rounded"
      >
        Schedule Maintenance
      </Button>
    </form>
  );
}
