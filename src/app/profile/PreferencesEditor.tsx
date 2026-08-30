"use client";

import { Button } from "@/components/ui";
import { OnboardingLauncher } from "@/components/onboarding";
import type { InterestTagOption, OnboardingValues } from "@/components/onboarding";

export interface PreferencesEditorProps {
  hasPreference: boolean;
  interestTags: InterestTagOption[];
  initialValues?: OnboardingValues;
}

/**
 * A thin client wrapper around OnboardingLauncher's `renderTrigger` —
 * `renderTrigger` is a function, and a Server Component (the profile page)
 * cannot pass a function prop directly to a Client Component (React throws
 * "Functions cannot be passed directly to Client Components"). This
 * component receives only serializable props from the server and builds
 * the function-valued `renderTrigger` itself, entirely client-side.
 */
export function PreferencesEditor({ hasPreference, interestTags, initialValues }: PreferencesEditorProps) {
  return (
    <OnboardingLauncher
      interestTags={interestTags}
      initialValues={initialValues}
      mode="edit"
      renderTrigger={(open) => (
        <Button variant="outline" onClick={open}>
          {hasPreference ? "Edit preferences" : "Set travel preferences"}
        </Button>
      )}
    />
  );
}
