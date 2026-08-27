import { exploreNav } from "@/config/nav";
import { DropdownItem } from "@/components/ui";

/** Content of the desktop "Explore ▾" dropdown. */
export function ExploreMenu() {
  return (
    <>
      {exploreNav.map((item) =>
        item.href ? (
          <DropdownItem key={item.label} href={item.href}>
            {item.label}
          </DropdownItem>
        ) : (
          <span
            key={item.label}
            className="flex items-center justify-between px-3 py-2 text-sm text-ink-muted/60"
            aria-disabled="true"
          >
            {item.label}
            <span className="text-label">Soon</span>
          </span>
        )
      )}
    </>
  );
}
