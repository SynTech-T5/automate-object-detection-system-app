"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  ClipboardCheck,
  Wrench,
  Hammer,
  ArrowUpCircle,
  RefreshCw,
  Search,
  Settings,
} from "lucide-react";

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

  const maintenanceOptions = [
    { value: "Routine Check", label: "Routine Check", icon: ClipboardCheck },
    { value: "Repair", label: "Repair", icon: Wrench },
    { value: "Installation", label: "Installation", icon: Hammer },
    { value: "Upgrade", label: "Upgrade", icon: ArrowUpCircle },
    { value: "Replacement", label: "Replacement", icon: RefreshCw },
    { value: "Inspection", label: "Inspection", icon: Search },
    { value: "Configuration", label: "Configuration", icon: Settings },
  ];

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <h2 className="min-w-0 flex-1 font-bold text-lg text-[var(--color-primary)]">
        Schedule Maintenance
      </h2>

      {/* Maintenance Type & Scheduled Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-1">
          <Label>
            Maintenance Type<span className="text-red-500">*</span>
          </Label>
          <Select
            onValueChange={(value) =>
              setFormData({ ...formData, maintenanceType: value })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {maintenanceOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <div className="flex items-center gap-2">
                    <opt.icon className="w-4 h-4 text-[var(--color-primary)]" />
                    <span>{opt.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col space-y-1">
          <Label>
            Scheduled Date<span className="text-red-500">*</span>
          </Label>
          <Input
            type="date"
            placeholder="date"
            value={formData.scheduledDate}
            onChange={(e) =>
              setFormData({ ...formData, scheduledDate: e.target.value })
            }
          />
        </div>
      </div>

      {/* Technician */}
      <div className="flex flex-col space-y-1">
        <Label>
          Technician<span className="text-red-500">*</span>
        </Label>
        <Input
          type="text"
          placeholder="technician name"
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
        className="bg-[var(--color-primary)] hover:opacity-90 text-white font-medium w-full md:w-auto px-6 py-2 rounded"
      >
        Schedule Maintenance
      </Button>
    </form>
  );
}