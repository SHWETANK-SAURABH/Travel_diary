import type { TripBudgetEstimate } from "@/features/trips/types";

function formatINR(amount: number): string {
  if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(1)}L`;
  if (amount >= 1_000) return `₹${Math.round(amount / 1000)}K`;
  return `₹${amount}`;
}

/** Spec §25: a range, never a guaranteed price — hidden entirely when there's no cost data to estimate from, rather than showing a fabricated ₹0. */
export function BudgetEstimate({ estimate }: { estimate: TripBudgetEstimate }) {
  if (!estimate.hasData) return null;

  return (
    <div>
      <p className="text-label font-medium tracking-wide text-ink-muted uppercase">Estimated trip budget</p>
      <p className="mt-1 text-h3 font-display text-ink">
        {formatINR(estimate.low)} – {formatINR(estimate.high)}
      </p>
      <p className="text-caption text-ink-muted">A rough estimate, not a guaranteed price.</p>
    </div>
  );
}
