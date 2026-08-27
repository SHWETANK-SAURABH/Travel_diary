import type { ReactNode } from "react";
import { cn } from "./cn";

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/** e.g. "Your discoveries will appear here.", "No trips yet — start building your first trip." */
export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2 py-16 text-center", className)}>
      <p className="text-h3 font-display text-ink">{title}</p>
      {description && <p className="max-w-sm text-caption text-ink-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
