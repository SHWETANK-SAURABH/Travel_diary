"use client";

import { useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { useGuestStore } from "@/lib/guest/store";
import { trackClientEvent } from "@/lib/analytics/client";
import { OnboardingWizard } from "./OnboardingWizard";
import type { InterestTagOption, OnboardingValues } from "./types";

export interface OnboardingLauncherProps {
  interestTags: InterestTagOption[];
  initialValues?: OnboardingValues;
  /** "onboarding" (first-time, optional) vs "edit" (profile page) — same wizard, different analytics label. */
  mode?: "onboarding" | "edit";
  /** Custom trigger — defaults to a plain button. Explore uses this for a banner-style CTA. */
  renderTrigger?: (open: () => void) => ReactNode;
}

/**
 * Owns where the wizard's answers go: guests write straight to the
 * client-side store (src/lib/guest/store.ts — merged into the account on a
 * later sign-in, see src/lib/guest/merge.ts); signed-in users PUT
 * /api/preferences and the page is refreshed so server-rendered preference
 * summaries (profile, personalized recommendations) pick it up immediately.
 */
export function OnboardingLauncher({ interestTags, initialValues, mode = "onboarding", renderTrigger }: OnboardingLauncherProps) {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const setGuestPreferences = useGuestStore((s) => s.setPreferences);
  const router = useRouter();

  async function handleComplete(values: OnboardingValues) {
    if (session) {
      await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      router.refresh();
    } else {
      setGuestPreferences(values);
    }
  }

  function openWizard() {
    setOpen(true);
    trackClientEvent({ type: "ONBOARDING_INTERACTION", metadata: { action: "started", mode } });
  }

  return (
    <>
      {renderTrigger ? renderTrigger(openWizard) : <Button onClick={openWizard}>Set travel preferences</Button>}
      <OnboardingWizard open={open} onClose={() => setOpen(false)} onComplete={handleComplete} interestTags={interestTags} initialValues={initialValues} mode={mode} />
    </>
  );
}
