"use client";

import { useState } from "react";
import { Modal, Button, Pill, Input, Slider } from "@/components/ui";
import { trackClientEvent } from "@/lib/analytics/client";
import type { InterestTagOption, OnboardingValues } from "./types";

export interface OnboardingWizardProps {
  open: boolean;
  onClose: () => void;
  onComplete: (values: OnboardingValues) => void;
  interestTags: InterestTagOption[];
  initialValues?: OnboardingValues;
  /** "onboarding" (first-time, optional) vs "edit" (from the profile page) — same steps, slightly different copy. */
  mode?: "onboarding" | "edit";
}

const DURATION_PRESETS = [
  { label: "2–3 days", days: 3 },
  { label: "4–5 days", days: 5 },
  { label: "6–7 days", days: 7 },
  { label: "8–14 days", days: 10 },
  { label: "15+ days", days: 18 },
];

const TRAVELLER_PRESETS = [
  { label: "Just me", count: 1 },
  { label: "2", count: 2 },
  { label: "3–4", count: 4 },
  { label: "5+", count: 6 },
];

const BUDGET_PRESETS = [
  { label: "₹10K–₹20K", amount: 15_000 },
  { label: "₹20K–₹40K", amount: 30_000 },
  { label: "₹40K–₹75K", amount: 55_000 },
  { label: "₹75K+", amount: 100_000 },
];

const TRAVEL_STYLES: { value: OnboardingValues["travelStyle"]; label: string; description: string }[] = [
  { value: "BACKPACKER", label: "Backpacker", description: "Hostels, local transport, keep it light" },
  { value: "BUDGET", label: "Budget", description: "Value-conscious, comfortable enough" },
  { value: "COMFORTABLE", label: "Comfortable", description: "Good hotels, some splurges" },
  { value: "LUXURY", label: "Luxury", description: "Best of everything" },
];

const STEP_TITLES = [
  "When are you travelling?",
  "How long?",
  "How many travellers?",
  "What's your budget?",
  "What are you into?",
  "Travel style",
  "Busy or peaceful?",
];

/**
 * Optional, skippable, low-friction onboarding — chips/presets/a slider, no
 * long form (spec §5/§6). Reused for both first-time onboarding and
 * profile-page editing (`mode`), since the steps and validation are
 * identical either way. Persistence is the caller's job (`onComplete`) —
 * guests write to the Zustand store, signed-in users PUT /api/preferences —
 * this component only collects values.
 */
export function OnboardingWizard({ open, onClose, onComplete, interestTags, initialValues, mode = "onboarding" }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<OnboardingValues>(initialValues ?? {});

  // Every close path (backdrop click, Escape, the "skip"/"save & finish"
  // link, and Finish) routes through one of these two handlers — resetting
  // step/values here, in a plain event handler, means this component never
  // needs an effect reacting to `open` just to reset itself.
  function resetAndClose() {
    setStep(0);
    setValues(initialValues ?? {});
    onClose();
  }

  function update<K extends keyof OnboardingValues>(key: K, value: OnboardingValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function hasAnyValue() {
    return Object.values(values).some((v) => v !== undefined && (Array.isArray(v) ? v.length > 0 : true));
  }

  function handleSkip() {
    if (hasAnyValue()) {
      trackClientEvent({ type: "ONBOARDING_INTERACTION", metadata: { action: "completed", mode, partial: true, step } });
      onComplete(values);
    } else {
      trackClientEvent({ type: "ONBOARDING_INTERACTION", metadata: { action: "skipped", mode, step } });
    }
    resetAndClose();
  }

  function handleFinish() {
    trackClientEvent({ type: "ONBOARDING_INTERACTION", metadata: { action: "completed", mode, partial: false } });
    onComplete(values);
    resetAndClose();
  }

  const isLastStep = step === STEP_TITLES.length - 1;

  return (
    <Modal open={open} onClose={handleSkip} title={STEP_TITLES[step]} className="w-[min(28rem,92vw)]">
      <div className="flex flex-col gap-5">
        <div className="flex gap-1" aria-hidden="true">
          {STEP_TITLES.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-marigold-500" : "bg-border"}`} />
          ))}
        </div>

        {step === 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-caption text-ink-muted">Optional — leave blank if you&rsquo;re just browsing.</p>
            <label className="flex flex-col gap-1 text-sm text-ink">
              Start date
              <Input type="date" value={values.travelDateStart ?? ""} onChange={(e) => update("travelDateStart", e.target.value || undefined)} />
            </label>
            <label className="flex flex-col gap-1 text-sm text-ink">
              End date
              <Input type="date" value={values.travelDateEnd ?? ""} onChange={(e) => update("travelDateEnd", e.target.value || undefined)} />
            </label>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-wrap gap-2">
            {DURATION_PRESETS.map((preset) => (
              <Pill key={preset.label} selected={values.durationDays === preset.days} onClick={() => update("durationDays", preset.days)}>
                {preset.label}
              </Pill>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-wrap gap-2">
            {TRAVELLER_PRESETS.map((preset) => (
              <Pill key={preset.label} selected={values.travellerCount === preset.count} onClick={() => update("travellerCount", preset.count)}>
                {preset.label}
              </Pill>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {BUDGET_PRESETS.map((preset) => (
                <Pill key={preset.label} selected={values.budgetAmount === preset.amount} onClick={() => update("budgetAmount", preset.amount)}>
                  {preset.label}
                </Pill>
              ))}
            </div>
            <label className="flex flex-col gap-1 text-sm text-ink">
              Or enter an exact amount (₹)
              <Input
                type="number"
                min={0}
                placeholder="e.g. 35000"
                value={values.budgetAmount ?? ""}
                onChange={(e) => update("budgetAmount", e.target.value ? Number(e.target.value) : undefined)}
              />
            </label>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-wrap gap-2">
            {interestTags.map((tag) => {
              const selected = values.interestTagIds?.includes(tag.id) ?? false;
              return (
                <Pill
                  key={tag.id}
                  selected={selected}
                  onClick={() =>
                    update("interestTagIds", selected ? (values.interestTagIds ?? []).filter((id) => id !== tag.id) : [...(values.interestTagIds ?? []), tag.id])
                  }
                >
                  {tag.name}
                </Pill>
              );
            })}
          </div>
        )}

        {step === 5 && (
          <div className="flex flex-col gap-2">
            {TRAVEL_STYLES.map((style) => (
              <button
                key={style.value}
                type="button"
                onClick={() => update("travelStyle", style.value)}
                className={`rounded-md border p-3 text-left transition-colors duration-fast ${
                  values.travelStyle === style.value ? "border-marigold-500 bg-marigold-50" : "border-border hover:bg-marigold-50/50"
                }`}
              >
                <p className="text-sm font-medium text-ink">{style.label}</p>
                <p className="text-caption text-ink-muted">{style.description}</p>
              </button>
            ))}
          </div>
        )}

        {step === 6 && (
          <div className="flex flex-col gap-2">
            <Slider
              min={0}
              max={100}
              value={values.crowdPreference ?? 50}
              onChange={(e) => update("crowdPreference", Number(e.target.value))}
              labels={["Busy & lively", "Quiet & peaceful"]}
            />
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border pt-4">
          <button type="button" onClick={handleSkip} className="text-sm text-ink-muted hover:text-ink">
            {hasAnyValue() ? "Save & finish" : "Skip for now"}
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
                Back
              </Button>
            )}
            {isLastStep ? (
              <Button onClick={handleFinish}>Finish</Button>
            ) : (
              <Button onClick={() => setStep((s) => s + 1)}>Next</Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
