import { Badge } from "@/components/ui";
import type { BudgetLevel } from "@prisma/client";

const BUDGET_SYMBOL: Record<BudgetLevel, string> = {
  BUDGET: "₹",
  MID_RANGE: "₹₹",
  LUXURY: "₹₹₹",
};

export function BudgetBadge({ level }: { level: BudgetLevel }) {
  return <Badge variant="neutral">{BUDGET_SYMBOL[level]}</Badge>;
}
