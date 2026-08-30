import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getPreference, listInterestTags, listSavedContent, listVisitedContent } from "@/features/users/service";
import { listTrips } from "@/features/trips/service";
import { Container } from "@/components/layout";
import { Badge, Button, EmptyState, Tabs, TabList, Tab, TabPanel } from "@/components/ui";
import { ContentListItem } from "@/components/account/ContentListItem";
import type { OnboardingValues } from "@/components/onboarding";
import type { ResolvedContentItem } from "@/features/users/types";
import type { ContentType } from "@prisma/client";
import { PreferencesEditor } from "./PreferencesEditor";
import { SignOutButton } from "./SignOutButton";

export const metadata: Metadata = { title: "Profile", robots: { index: false } };

const TRAVEL_STYLE_LABEL: Record<string, string> = {
  BACKPACKER: "Backpacker",
  BUDGET: "Budget",
  COMFORTABLE: "Comfortable",
  LUXURY: "Luxury",
};

const TYPE_SECTION_ORDER: ContentType[] = ["FESTIVAL", "DESTINATION", "EXPERIENCE", "FOOD", "EVENT"];
const TYPE_SECTION_LABEL: Record<ContentType, string> = {
  FESTIVAL: "Festivals",
  DESTINATION: "Destinations",
  EXPERIENCE: "Experiences",
  FOOD: "Food",
  EVENT: "Events",
};

function toDateInput(date: Date | null): string | undefined {
  return date ? date.toISOString().slice(0, 10) : undefined;
}

function GroupedContentList({ items, action }: { items: ResolvedContentItem[]; action: "save" | "visited" }) {
  return (
    <div className="flex flex-col gap-8">
      {TYPE_SECTION_ORDER.map((type) => {
        const group = items.filter((item) => item.contentType === type);
        if (group.length === 0) return null;
        return (
          <div key={type}>
            <h3 className="text-label font-medium tracking-wide text-ink-muted uppercase">{TYPE_SECTION_LABEL[type]}</h3>
            <div className="mt-2 flex flex-col gap-2">
              {group.map((item) => (
                <ContentListItem key={item.id} item={item} action={action} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
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

  const [preference, interestTags, saved, visited, trips] = await Promise.all([
    getPreference(session.user.id),
    listInterestTags(),
    listSavedContent(session.user.id),
    listVisitedContent(session.user.id),
    listTrips(session.user.id),
  ]);

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
      <p className="mt-1 text-caption text-ink-muted">Private — only visible to you.</p>

      <Tabs defaultValue="preferences" className="mt-8">
        <TabList>
          <Tab value="preferences">Preferences</Tab>
          <Tab value="saved">Saved{saved.length > 0 ? ` (${saved.length})` : ""}</Tab>
          <Tab value="visited">Visited{visited.length > 0 ? ` (${visited.length})` : ""}</Tab>
          <Tab value="trips">Trips</Tab>
          <Tab value="account">Account</Tab>
        </TabList>

        <TabPanel value="preferences">
          <div className="max-w-xl rounded-lg border border-border p-6">
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
              <p className="mt-3 text-ink-muted">Tell us what you love to travel for — entirely optional.</p>
            )}
          </div>
        </TabPanel>

        <TabPanel value="saved">
          {saved.length === 0 ? (
            <EmptyState
              title="Your discoveries will appear here."
              description="Save festivals, destinations, experiences and food as you explore."
              action={
                <Link href="/explore">
                  <Button>Explore India</Button>
                </Link>
              }
            />
          ) : (
            <GroupedContentList items={saved} action="save" />
          )}
        </TabPanel>

        <TabPanel value="visited">
          {visited.length === 0 ? (
            <EmptyState
              title="Places you've explored will appear here."
              description="Mark festivals, destinations and experiences as visited once you've been."
              action={
                <Link href="/destinations">
                  <Button>Discover destinations</Button>
                </Link>
              }
            />
          ) : (
            <GroupedContentList items={visited} action="visited" />
          )}
        </TabPanel>

        <TabPanel value="trips">
          {trips.length === 0 ? (
            <EmptyState
              title="No trips yet"
              description="Start building your first trip — save festivals and destinations as you explore."
              action={
                <Link href="/explore">
                  <Button variant="outline">Start exploring</Button>
                </Link>
              }
            />
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-ink-muted">
                {trips.length} trip{trips.length === 1 ? "" : "s"}.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {trips.map((trip) => (
                  <Link key={trip.id} href={`/trips/${trip.id}`} className="rounded-md border border-border p-4 hover:shadow-panel">
                    <p className="font-medium text-ink">{trip.name}</p>
                  </Link>
                ))}
              </div>
              <Link href="/trips" className="mt-2">
                <Button variant="text">View all trips →</Button>
              </Link>
            </div>
          )}
        </TabPanel>

        <TabPanel value="account">
          <div className="max-w-md rounded-lg border border-border p-6">
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-muted">Name</dt>
                <dd>{session.user.name ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">Email</dt>
                <dd>{session.user.email}</dd>
              </div>
            </dl>
            <div className="mt-6">
              <SignOutButton />
            </div>
          </div>
        </TabPanel>
      </Tabs>
    </Container>
  );
}
