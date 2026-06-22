"use client";

import { motion } from "framer-motion";
import { Clock, Sun, Sunset } from "lucide-react";
import { cn } from "@/lib/utils";

const SLOT_OPTIONS = ["08:00", "09:30", "11:00", "14:00", "15:30", "17:00"];

function toAmPm(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}

interface TimeSlotPickerProps {
  value: string;
  onChange: (time: string) => void;
  slots?: string[];
}

export function TimeSlotPicker({
  value,
  onChange,
  slots = SLOT_OPTIONS,
}: TimeSlotPickerProps) {
  const morningSlots = slots.filter((t) => parseInt(t) < 12);
  const afternoonSlots = slots.filter((t) => parseInt(t) >= 12);

  const renderSlot = (time: string) => (
    <motion.button
      key={time}
      type="button"
      aria-pressed={value === time}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onChange(time)}
      className={cn(
        "py-3.5 px-2 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5",
        value === time
          ? "border-secondary bg-secondary text-white shadow-lg shadow-secondary/25"
          : "border-border/40 bg-surface text-text-primary hover:border-secondary/50 hover:bg-secondary/5"
      )}
    >
      <Clock
        size={14}
        className={value === time ? "text-white/70" : "text-secondary/50"}
      />
      <span className="text-sm font-bold">{toAmPm(time)}</span>
    </motion.button>
  );

  return (
    <div className="space-y-4">
      {morningSlots.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2.5">
            <Sun size={13} className="text-warning" />
            <span className="text-xs font-bold text-text-tertiary uppercase tracking-wider">
              Mañana
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {morningSlots.map(renderSlot)}
          </div>
        </div>
      )}

      {afternoonSlots.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2.5">
            <Sunset size={13} className="text-accent" />
            <span className="text-xs font-bold text-text-tertiary uppercase tracking-wider">
              Tarde
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {afternoonSlots.map(renderSlot)}
          </div>
        </div>
      )}
    </div>
  );
}
