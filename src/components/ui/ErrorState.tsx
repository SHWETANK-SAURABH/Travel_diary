import { cn } from "./cn";
import { Button } from "./Button";

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Generic error UI — never exposes stack traces/technical detail to users.
 * Use the `title` prop for the specific message ("We couldn't load the map
 * right now.", "Check your connection and try again."); the component just
 * provides the consistent shell + optional retry action.
 */
export function ErrorState({
  title = "Something went wrong.",
  description,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2 py-16 text-center", className)}>
      <p className="text-h3 font-display text-ink">{title}</p>
      {description && <p className="max-w-sm text-caption text-ink-muted">{description}</p>}
      {onRetry && (
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
