"use client";

import { daysUntil } from "@/features/festivals/status";

/** "102 days to go" for a future date; nothing for today/past (the caller only renders this for UPCOMING status). */
export function Countdown({ date }: { date: Date }) {
  const days = daysUntil(date);
  if (days <= 0) return null;

  return (
    <p className="text-body text-marigold-600">
      {days} day{days === 1 ? "" : "s"} to go
    </p>
  );
}
