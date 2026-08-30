import Link from "next/link";
import { ResponsiveImage } from "@/components/ui";
import { SaveButton, VisitedButton } from "@/components/discovery";
import type { DiscoveryKind } from "@/components/discovery/contentKind";
import type { ResolvedContentItem } from "@/features/users/types";

const TYPE_LABEL: Record<ResolvedContentItem["contentType"], string> = {
  FESTIVAL: "Festival",
  DESTINATION: "Destination",
  EXPERIENCE: "Experience",
  FOOD: "Food",
  EVENT: "Event",
};

const KIND_FOR_TYPE: Record<ResolvedContentItem["contentType"], DiscoveryKind> = {
  FESTIVAL: "festival",
  DESTINATION: "destination",
  EXPERIENCE: "experience",
  FOOD: "food",
  EVENT: "event",
};

/** One row in the profile's Saved/Visited lists — image, name, type/location, and the same Save/Visited toggle used everywhere else, so removing an item is possible right from the list. */
export function ContentListItem({ item, action }: { item: ResolvedContentItem; action: "save" | "visited" }) {
  const inner = (
    <div className="flex min-w-0 items-center gap-3">
      {item.imageUrl ? (
        <ResponsiveImage src={item.imageUrl} alt="" aspectRatio="1/1" containerClassName="h-14 w-14 shrink-0 rounded-md" className="rounded-md" sizes="56px" />
      ) : (
        <div className="h-14 w-14 shrink-0 rounded-md bg-marigold-50" aria-hidden="true" />
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink">{item.name}</p>
        <p className="truncate text-caption text-ink-muted">{[TYPE_LABEL[item.contentType], item.locationName].filter(Boolean).join(" · ")}</p>
      </div>
    </div>
  );

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
      {item.href ? (
        <Link href={item.href} className="min-w-0 flex-1">
          {inner}
        </Link>
      ) : (
        <div className="min-w-0 flex-1 opacity-80">{inner}</div>
      )}
      {action === "save" ? <SaveButton kind={KIND_FOR_TYPE[item.contentType]} id={item.id} size="sm" /> : <VisitedButton kind={KIND_FOR_TYPE[item.contentType]} id={item.id} size="sm" />}
    </div>
  );
}
