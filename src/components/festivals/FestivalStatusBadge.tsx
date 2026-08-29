import { Badge, type BadgeProps } from "@/components/ui";
import type { FestivalTemporalStatus } from "@/features/festivals/status";

const STATUS_CONFIG: Record<FestivalTemporalStatus, { label: string; variant: BadgeProps["variant"] }> = {
  HAPPENING_NOW: { label: "Happening now", variant: "success" },
  UPCOMING: { label: "Upcoming", variant: "marigold" },
  PAST: { label: "Past", variant: "neutral" },
  EXPECTED: { label: "Expected date", variant: "neutral" },
  NOT_ANNOUNCED: { label: "Date not announced", variant: "neutral" },
};

export function FestivalStatusBadge({ status }: { status: FestivalTemporalStatus }) {
  const config = STATUS_CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
