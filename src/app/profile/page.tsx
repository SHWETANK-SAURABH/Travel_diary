import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getPreference, listInterestTags } from "@/features/users/service";
import { Container } from "@/components/layout";
import { Badge, Button } from "@/components/ui";
import type { OnboardingValues } from "@/components/onboarding";
import { PreferencesEditor } from "./PreferencesEditor";

export const metadata: Metadata = { title: "Profile", robots: { index: false } };

const TRAVEL_STYLE_LABEL: Record<string, string> = {
  BACKPACKER: "Backpacker",
  BUDGET: "Budget",
  COMFORTABLE: "Comfortable",
  LUXURY: "Luxury",
};

function toDateInput(date: Date | null): string | undefined {
  return date ? date.toISOString().slice(0, 10) : undefined;
}

export default async function ProfilePage() {
  const session = await auth();

  if (!session) {
    return (
      <Container className="py-24">
        <h1 className="font-display text-h1">Profile</h1>
        <p className="mt-3 max-w-xl text-ink-muted">Sign in to view and manage your preferences.</p>
        <Link href="/auth/sign-in?callbackUrl=/profile">
          <Button className="mt-6">Sign in</Button>
        </Link>
      </Container>
    );
  }

  const [preference, interestTags] = await Promise.all([getPreference(session.user.id), listInterestTags()]);

  const initialValues: OnboardingValues | undefined = preference
    ? {
        travelDateStart: toDateInput(preference.travelDateStart),
        travelDateEnd: toDateInput(preference.travelDateEnd),
        durationDays: preference.durationDays ?? undefined,
        travellerCount: preference.travellerCount ?? undefined,
        budgetAmount: preference.budgetAmount ?? undefined,
        travelStyle: preference.travelStyle ?? undefined,
        crowdPreference: preference.crowdPreference ?? undefined,
        interestTagIds: preference.interests.map((tag) => tag.id),
      }
    : undefined;

  return (
    <Container className="py-12">
      <h1 className="font-display text-h1">{session.user.name ?? session.user.email}</h1>

      <div className="mt-8 max-w-xl rounded-lg border border-border p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-h3 font-display">Travel Preferences</h2>
          <PreferencesEditor hasPreference={Boolean(preference)} interestTags={interestTags} initialValues={initialValues} />
        </div>

        {preference ? (
          <dl className="mt-4 flex flex-col gap-2 text-sm">
            {preference.durationDays && (
              <div className="flex justify-between">
                <dt className="text-ink-muted">Trip length</dt>
                <dd>{preference.durationDays} days</dd>
              </div>
            )}
            {preference.travellerCount && (
              <div className="flex justify-between">
                <dt className="text-ink-muted">Travellers</dt>
                <dd>{preference.travellerCount}</dd>
              </div>
            )}
            {preference.budgetAmount && (
              <div className="flex justify-between">
                <dt className="text-ink-muted">Budget</dt>
                <dd>₹{preference.budgetAmount.toLocaleString("en-IN")}</dd>
              </div>
            )}
            {preference.travelStyle && (
              <div className="flex justify-between">
                <dt className="text-ink-muted">Travel style</dt>
                <dd>{TRAVEL_STYLE_LABEL[preference.travelStyle]}</dd>
              </div>
            )}
            {preference.crowdPreference != null && (
              <div className="flex justify-between">
                <dt className="text-ink-muted">Crowd preference</dt>
                <dd>{preference.crowdPreference < 40 ? "Busy & lively" : preference.crowdPreference > 60 ? "Quiet & peaceful" : "No strong preference"}</dd>
              </div>
            )}
            {preference.interests.length > 0 && (
              <div>
                <dt className="text-ink-muted">Interests</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {preference.interests.map((tag) => (
                    <Badge key={tag.id} variant="marigold">
                      {tag.name}
                    </Badge>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        ) : (
          <p className="mt-3 text-ink-muted">
            No travel preferences set yet — entirely optional, but the more we know, the better your recommendations on{" "}
            <Link href="/explore" className="text-marigold-600 hover:underline">
              Explore
            </Link>
            .
          </p>
        )}
      </div>
    </Container>
  );
}
