import type { RecommendationContext, RecommendationSignals } from "./types";

const TRAVEL_STYLE_LABEL: Record<string, string> = {
  BACKPACKER: "backpacker",
  BUDGET: "budget",
  COMFORTABLE: "comfortable",
  LUXURY: "luxury",
};

/**
 * Deterministic, threshold-based — never an LLM (spec §21/§40: "generate
 * these explanations... from the scoring signals," not from a model).
 * Evaluated in priority order so the strongest, most legible reasons win
 * when more than 4 thresholds clear; caps at 4 per spec §23 ("2-4
 * reasons"). Falls back to a couple of honest, generic reasons if nothing
 * clears a threshold, rather than returning an empty list.
 */
export function explainDestination(signals: RecommendationSignals, context: RecommendationContext, featured: boolean): string[] {
  const reasons: string[] = [];

  if (signals.interest > 0.65 && context.interestTagIds?.length) reasons.push("Matches your interests");
  if (signals.season >= 0.9) reasons.push("Good conditions this month");
  if (signals.budget >= 0.9 && context.budgetAmount) reasons.push("Fits your budget");
  if (signals.festival >= 0.9) reasons.push("Festival happening nearby");
  if (signals.uniqueness >= 0.9) reasons.push("A hidden gem, off the usual path");
  if (signals.travelStyle >= 0.9 && context.travelStyle) {
    reasons.push(`Matches your ${TRAVEL_STYLE_LABEL[context.travelStyle] ?? context.travelStyle} travel style`);
  }
  if (signals.duration >= 0.9 && context.durationDays) reasons.push(`Fits your ${context.durationDays}-day trip`);
  if (featured && reasons.length < 4) reasons.push("Editor's pick");

  if (reasons.length === 0) {
    if (signals.quality >= 0.6) reasons.push("A well-regarded destination");
    if (signals.popularity >= 0.7) reasons.push("Popular with travellers");
    else if (signals.uniqueness >= 0.6) reasons.push("Off the well-worn path");
    if (reasons.length === 0) reasons.push("Worth exploring");
  }

  return reasons.slice(0, 4);
}

export function explainFestival(signals: RecommendationSignals, context: RecommendationContext, featured: boolean): string[] {
  const reasons: string[] = [];

  if (signals.season >= 0.9 && (context.travelDateStart || context.month)) reasons.push("Happening during your trip");
  if (signals.interest > 0.65 && context.interestTagIds?.length) reasons.push("Matches your interests");
  if (signals.festival >= 0.9) reasons.push("Near a destination you might visit");
  if (signals.uniqueness >= 0.9) reasons.push("A local, less-crowded celebration");
  if (featured && reasons.length < 4) reasons.push("Editor's pick");

  if (reasons.length === 0) {
    if (signals.popularity >= 0.7) reasons.push("One of India's best-known festivals");
    else reasons.push("A distinctive local celebration");
  }

  return reasons.slice(0, 4);
}
