# PHASE 2 — Design System & Application Shell

You have completed Phase 1 of the India travel discovery platform.

Before making any changes:

1. Inspect the current repository.
2. Read `/docs/product-spec.md`.
3. Read `/docs/architecture.md`.
4. Read `/docs/database.md`.
5. Understand the existing implementation from Phase 1.
6. Do NOT rewrite working architecture.
7. Build on the existing foundation.

This phase is about creating the **visual design system and application shell**.

Do NOT build the complete homepage, interactive India map, festival system, destination system, trip planner, recommendation engine, or full CMS yet.

---

# 1. PRODUCT FEEL

The product should feel like:

> **A living digital atlas of India.**

It should communicate:

* Discovery
* Curiosity
* Travel
* Culture
* Exploration
* Premium quality
* Modern India

The visual language should be:

### Premium

Editorial photography, strong typography, thoughtful spacing.

### Modern Indian

Subtle cultural character without stereotypical decoration.

### Vibrant

Festivals and cultural content can have visual energy.

### Sophisticated

Avoid childish travel-app aesthetics.

### Exploratory

The interface should encourage users to keep discovering.

---

# 2. DESIGN PRINCIPLE

The primary UX principle is:

## Progressive Discovery

Do not overwhelm users.

The interface should reveal information gradually:

```text
Simple
  ↓
Discover
  ↓
Preview
  ↓
Explore
  ↓
Deep information
  ↓
Plan
```

For example:

A festival card should NOT show 20 pieces of information.

Initial card:

* Image
* Name
* Location
* Date

Interaction reveals:

* Category
* Tags
* Popular/Hidden status

Dedicated page provides:

* Story
* Experience
* Travel
* Food
* Nearby
* Accommodation

Apply this philosophy throughout the application.

---

# 3. DESIGN SYSTEM

Create a reusable design system rather than styling individual pages independently.

Establish:

* Typography
* Font hierarchy
* Spacing
* Border radius
* Shadows
* Buttons
* Inputs
* Cards
* Badges
* Pills
* Tabs
* Dropdowns
* Tooltips
* Panels
* Bottom sheets
* Modals
* Navigation
* Skeleton loaders
* Empty states
* Error states

Use reusable components.

Do not duplicate UI patterns.

---

# 4. TYPOGRAPHY

Choose a modern, highly readable typeface system.

The typography should feel:

* Editorial
* Premium
* Contemporary
* Highly readable

Create hierarchy for:

### Display

Large hero headlines.

### H1

Page titles.

### H2

Section titles.

### H3

Cards/subsections.

### Body

Readable descriptions.

### Caption

Metadata and supporting information.

### Labels

Small navigation/filter/status text.

Do not use excessively small text.

---

# 5. COLOR SYSTEM

Create a restrained color system.

The interface should not look like a generic colorful travel template.

Use:

* Neutral foundation
* Strong primary brand color
* Accent colors for discovery/festivals
* Semantic colors for:

  * success
  * warning
  * error
  * information

Festival-specific colors may be introduced later, but should still remain within the design system.

Do not hardcode arbitrary colors inside components.

Create centralized design tokens.

---

# 6. DESIGN TOKENS

Create reusable tokens for:

```text
colors
typography
spacing
radius
shadows
transitions
z-index
breakpoints
```

Use these tokens throughout the application.

Do not scatter magic numbers everywhere.

---

# 7. BUTTON SYSTEM

Create reusable button variants such as:

* Primary
* Secondary
* Ghost
* Outline
* Destructive
* Icon
* Text

Buttons should have:

* Hover state
* Active state
* Disabled state
* Loading state

Make them accessible and touch-friendly.

---

# 8. CARD SYSTEM

Create a flexible card foundation.

Potential variants:

### Discovery Card

Used for festivals/destinations.

### Feature Card

Large editorial content.

### Compact Card

Search/list results.

### Recommendation Card

Used later by the recommendation engine.

### Map Preview Card

Used inside map panels.

Cards should not automatically contain excessive information.

---

# 9. IMAGE SYSTEM

Create reusable image components.

Images should support:

* Responsive sizing
* Lazy loading
* Aspect ratios
* Placeholder/loading state
* Error fallback
* Alt text
* Priority loading for hero images

Prepare the system for future CDN/media optimization.

Do not hardcode image dimensions that break responsive layouts.

---

# 10. NAVIGATION

Create the global navigation foundation.

## Desktop

Keep the main navigation minimal.

Suggested structure:

```text
Logo

Explore ▾
Map
Trips

Search

Account/Profile
```

The Explore menu should eventually contain:

```text
Festivals
Destinations
Hidden India
Food
Experiences
Seasonal Travel
Calendar
```

Do not implement every Explore page yet.

The navigation only needs to establish the structure.

---

# 11. MOBILE NAVIGATION

Create a mobile navigation system.

Use bottom navigation:

```text
Home
Explore
Map
Trips
Profile
```

The Explore item should open the broader discovery menu.

Use large touch targets.

Do not simply shrink desktop navigation.

---

# 12. EXPLORE MENU

Create a polished Explore menu foundation.

It should eventually expose:

* Festivals
* Destinations
* Hidden India
* Food
* Experiences
* Seasonal Travel
* Calendar

Design it so additional discovery categories can be added later.

---

# 13. SEARCH FOUNDATION UI

Do not build the complete search engine yet.

Create only the reusable search UI components:

* Search input
* Search button/icon
* Search overlay foundation
* Search suggestions container
* Search result group component

The actual search functionality will be built in a later phase.

---

# 14. PANELS & BOTTOM SHEETS

Create reusable components for:

### Desktop

Side panels.

### Mobile

Bottom sheets.

These will become critical to the map experience.

They should support:

* Open/close
* Drag where appropriate
* Overlay
* Scrollable content
* Responsive behavior
* Animation
* Focus management

Do not make these map-specific.

They should be reusable throughout the application.

---

# 15. MODALS

Create a reusable modal system.

Support:

* Confirmation
* Forms
* Content previews
* Account actions

Keep the API simple.

---

# 16. LOADING SYSTEM

Performance is a top-level requirement.

Do NOT rely primarily on generic spinners.

Create skeleton loading states for:

* Cards
* Images
* Panels
* Lists
* Page sections
* Map panels

Use subtle transitions.

Loading should feel intentional and premium.

---

# 17. ERROR STATES

Create reusable error UI.

Examples:

### Content error

> Something went wrong loading this discovery.

### Map error

> We couldn't load the map right now.

### Network error

> Check your connection and try again.

Provide retry actions where appropriate.

Do not expose technical stack traces to users.

---

# 18. EMPTY STATES

Create reusable empty-state components.

Examples:

### No saved items

> Your discoveries will appear here.

### No trips

> Start building your first trip.

### No search results

> We couldn't find anything matching that search.

Use helpful next actions.

---

# 19. RESPONSIVE SYSTEM

Primary targets:

### Desktop

Large layouts, rich map interactions, side panels.

### Mobile

Touch-first, simplified navigation, bottom sheets.

Tablet should remain usable.

Define responsive breakpoints through the design system.

Do not rely on dozens of one-off media queries.

---

# 20. ANIMATION SYSTEM

The product should use:

### Moderate motion + selected cinematic moments.

Create reusable animation primitives for:

* Fade
* Slide
* Scale
* Reveal
* Panel opening
* Bottom sheet opening
* Page transitions
* Hover states

Animations should be:

* Fast
* Smooth
* Purposeful

Do NOT make every element animated.

Avoid:

* excessive parallax
* long transitions
* distracting effects
* animation that delays interaction

Prepare a reduced-motion strategy.

---

# 21. MAP-READY DESIGN

The actual map comes in the next major phase.

However, create the UI foundation it will need:

### Desktop

```text
┌───────────────────────────────┐
│ Navigation                     │
├───────────────────────────────┤
│                               │
│           MAP                 │
│                         PANEL │
│                         PANEL │
│                               │
└───────────────────────────────┘
```

### Mobile

```text
┌─────────────────────┐
│ Navigation/Search   │
├─────────────────────┤
│                     │
│        MAP          │
│                     │
│                     │
├─────────────────────┤
│ Bottom Sheet        │
└─────────────────────┘
```

Do not build the actual geographic map yet.

---

# 22. PAGE CONTAINER SYSTEM

Create reusable page layout primitives.

Support:

* Full-width sections
* Standard content width
* Wide editorial sections
* Full-bleed media
* Map/full-screen layouts

The map will require a special full-viewport layout.

---

# 23. HEADER BEHAVIOR

Create a polished responsive header.

Consider:

* Transparent header over hero imagery
* Solid header after scrolling
* Mobile compact header

Do not overcomplicate it.

The final homepage will determine the exact hero behavior later.

---

# 24. FOOTER

Create a clean footer foundation.

Potential sections:

### Explore

Festivals
Destinations
Hidden India
Map

### Plan

Trips
Travel information

### About

About the platform
Contact

### Legal

Privacy
Terms

Do not create unnecessary footer clutter.

---

# 25. ROUTE SHELLS

Create basic route shells/placeholders for:

```text
/
 /explore
 /map
 /festivals
 /destinations
 /hidden-india
 /calendar
 /search
 /trips
 /profile
 /admin
```

These do NOT need their final content yet.

Use proper loading/error boundaries where appropriate.

---

# 26. DARK/LIGHT MODE

Do NOT implement a user-selectable dark mode unless the existing project already has one.

The product's visual identity should remain controlled and consistent.

If dark styling is useful for specific experiences such as the map, implement it locally rather than creating an entire alternate application theme.

---

# 27. ACCESSIBILITY FOUNDATION

Although advanced accessibility is not a V1 priority, build sensible foundations:

* Semantic HTML
* Keyboard-friendly buttons
* Visible focus states
* Proper form labels
* ARIA only when necessary
* Sufficient contrast
* Touch-friendly controls
* Reduced-motion support

Do not create inaccessible custom controls unnecessarily.

---

# 28. PERFORMANCE

Do not allow the design system to become heavy.

Avoid unnecessary:

* JavaScript
* animation libraries
* dependencies
* giant component libraries

Prefer lightweight reusable components.

Use dynamic imports where appropriate.

Keep the initial bundle small.

---

# 29. DO NOT BUILD YET

Do NOT implement:

* Complete homepage
* Interactive India map
* Festival pages
* Destination pages
* Search engine
* Calendar logic
* Recommendation engine
* Trip builder
* Full authentication UI
* Full CMS

Only create the reusable visual and application-shell foundations needed for those later phases.

---

# 30. TEST THE SYSTEM

After implementation:

1. Run TypeScript checks.
2. Run lint.
3. Run tests.
4. Run production build.
5. Start the production build if practical.
6. Test desktop layout.
7. Test mobile layout.
8. Test navigation.
9. Test buttons/inputs/panels.
10. Check for console errors.

Fix issues before finishing.

---

# 31. ACCEPTANCE CRITERIA

Phase 2 is complete when:

* A coherent design system exists.
* Typography is consistent.
* Colors are centralized.
* Spacing/radius/shadows are centralized.
* Reusable buttons exist.
* Reusable cards exist.
* Reusable panels exist.
* Bottom sheets exist.
* Modals exist.
* Skeleton loaders exist.
* Error states exist.
* Empty states exist.
* Desktop navigation exists.
* Mobile navigation exists.
* Explore menu exists.
* Responsive foundations exist.
* Animation primitives exist.
* Map-ready panel architecture exists.
* Basic route shells exist.
* The application remains fast.
* No existing Phase 1 functionality is broken.
* TypeScript passes.
* Lint passes.
* Production build passes.

---

# 32. IMPORTANT

Do NOT move to the next product phase automatically.

Do NOT start implementing the interactive India map yet.

At the end, report:

1. What design-system components were created.
2. What navigation/shell components were created.
3. What design decisions were made.
4. What files were added/changed.
5. What tests/checks were run.
6. Any issues discovered.
7. Any architectural considerations for the upcoming map phase.

The next phase will be the **Living India Map**, which is the core product differentiator.

Protect the existing architecture and make the next phase easy to implement.










----------------------------------------------------------------------------------

# PHASE 3 — THE LIVING INDIA MAP

You are continuing development of the India travel discovery platform.

Before making any changes:

1. Inspect the current repository.
2. Read `/docs/product-spec.md`.
3. Read `/docs/architecture.md`.
4. Read `/docs/database.md`.
5. Read the Phase 2 design-system implementation.
6. Understand the existing components and conventions.
7. Do NOT rewrite working architecture.
8. Do NOT replace the existing design system.
9. Build this phase on top of the existing foundation.

# THIS IS THE CORE DIFFERENTIATOR OF THE PRODUCT.

The interactive India map must NOT feel like a normal map with pins.

It should feel like:

> **A living digital atlas of India.**

The map is one of the primary reasons users should want to use this product instead of a normal travel website.

---

# 1. GOAL OF THIS PHASE

Build the first fully functional version of the interactive India map.

The map must support:

* India overview
* State/UT boundaries
* Cities/regions
* Festival locations
* Destination locations
* Hidden destinations
* Experiences where applicable
* Marker clustering
* Month-based discovery
* All Year mode
* Map layers
* Map-specific search
* Smart relevance
* Desktop side panel
* Mobile bottom sheet
* Smooth geographic navigation
* Save
* Add to Trip
* Map state preservation
* Responsive behavior

Use the existing database and design system from previous phases.

Do not build the full festival page, destination page, trip builder, or recommendation engine yet.

Where those systems are not yet implemented, create clean interfaces/hooks/placeholders so the map can integrate with them later.

---

# 2. PRODUCT PHILOSOPHY

The map should answer:

> What is happening across India?

and:

> Where should I explore?

The user should be able to move naturally:

India
→ State
→ City/Region
→ Discovery
→ Preview
→ Full page

The map should remain the primary visual context throughout exploration.

---

# 3. INITIAL MAP EXPERIENCE

When the user opens `/map`:

Show:

* Full India map
* Current month selected
* "All Year" option
* Relevant discovery markers
* Minimal marker styling at national zoom
* A small amount of highlighted content
* Map controls
* Search
* Layer controls

Do not overwhelm the user.

The first screen should look beautiful even with a small amount of seed data.

---

# 4. MAP TECHNOLOGY

Use the map technology selected during Phase 1.

Do not replace it unless there is a strong technical reason.

The map must support:

* Vector rendering
* Custom styling
* Geographic boundaries
* Smooth zoom
* Pan
* Marker clustering
* Efficient rendering
* Responsive behavior

Do NOT use thousands of HTML/DOM markers if the chosen map technology supports a more performant vector/source-based approach.

Prefer:

* GeoJSON/vector sources
* Symbol layers
* Circle layers
* Cluster layers
* Server-side geographic queries

where appropriate.

---

# 5. INDIA GEOGRAPHY

Implement India geographic visualization.

At minimum support:

* India outline
* States
* Union Territories

Use real geographic boundary data.

Do NOT manually draw India.

Do NOT hardcode coordinates for state shapes.

Use a reliable geographic dataset compatible with the selected map technology.

Ensure the dataset can later support:

* State selection
* State highlighting
* City/region exploration
* Geographic queries

---

# 6. MAP HIERARCHY

The map should have clear geographic levels.

### Level 1 — India

Show:

* major discovery clusters
* selected/highlighted discoveries

### Level 2 — State/UT

Show:

* state boundary
* relevant discoveries
* clusters

### Level 3 — City/Region

Show:

* individual festivals
* destinations
* experiences
* other relevant points

### Level 4 — Discovery

Show:

* exact or approximate location
* preview panel

Use smooth animated transitions between these levels.

---

# 7. MAP NAVIGATION

When a user clicks a state:

1. Animate zoom into the state.
2. Highlight the selected state.
3. Update visible discoveries.
4. Open the contextual state panel.

Example:

```text
India
 ↓
Kerala
 ↓
Kochi
 ↓
Festival
```

The transition should feel cinematic but remain fast.

Do not use unnecessarily long animations.

---

# 8. CURRENT MONTH

The current month should be selected by default.

Example:

```text
August
```

The map should query/retrieve relevant content for that month.

The map should not download the entire database.

Only retrieve content relevant to:

* current viewport
* selected month
* active layers

---

# 9. MONTH SELECTOR

Create a simple month selector:

```text
Jan Feb Mar Apr May Jun
Jul Aug Sep Oct Nov Dec
```

Keep the interaction simple.

When the user selects another month:

Update:

* Festival markers
* Seasonal destinations
* Relevant experiences
* Highlighted discoveries
* State counts where applicable

The transition should feel smooth.

Do not reload the entire page.

---

# 10. ALL YEAR MODE

Provide:

> All Year

When selected:

* Show all relevant discoveries
* Use aggressive clustering
* Avoid visual overload
* Prioritize important discoveries visually

All Year should behave as a true discovery index.

---

# 11. MARKER DESIGN

At national zoom:

Use minimal visual markers.

Do not put giant icons everywhere.

As the user zooms in:

* reveal richer markers
* reveal categories
* reveal individual locations
* reveal more information

Marker types should eventually support:

* Festival
* Destination
* Hidden Gem
* Experience
* Food/Event

However, keep the national view visually restrained.

---

# 12. MARKER CLUSTERING

Implement real marker clustering.

Example:

```text
Jaipur
24 discoveries
```

When the user zooms:

```text
Festival A
Festival B
Destination C
Hidden Gem D
...
```

Clusters should communicate geographic density.

Cluster counts should be accurate.

Do not fake cluster numbers.

---

# 13. LAYER CONTROLS

Create a layer control UI.

Initial layers:

```text
Festivals
Destinations
Hidden Gems
Experiences
Food / Events
```

Use smart defaults.

Allow users to manually toggle layers.

When a layer is disabled:

* hide its markers
* update clustering appropriately

Do not unnecessarily reload the entire map.

---

# 14. MAP SEARCH

Implement map-specific search.

The user should be able to search things like:

```text
Kerala
Munnar
Hornbill
festivals
hidden gems
```

Search should prioritize the current map context when possible.

Search results should allow the user to:

* select a state
* select a city
* select a festival
* select a destination
* select a discovery

Selecting a result should smoothly navigate the map to it.

---

# 15. UNIVERSAL SEARCH INTEGRATION

Do NOT replace the global search.

The site will eventually have:

> Universal Search

The map will have:

> Map Search

They are separate experiences.

The map search should be optimized for geographic exploration.

---

# 16. MAP RELEVANCE

For the current month, show all relevant data available in the viewport.

However, visually prioritize important discoveries.

Relevance can initially use:

* selected month
* proximity
* popularity
* hidden classification
* current events
* editorial featuring

Do NOT build the full recommendation engine yet.

Create a simple reusable relevance function/service that can later be replaced by the full recommendation engine.

---

# 17. DISCOVERY TYPES

Create a consistent internal discovery interface.

For example:

```ts
type MapDiscovery = {
  id: string
  type: "festival" | "destination" | "experience" | "food" | "event"
  name: string
  latitude: number
  longitude: number
  locationPrecision: "exact" | "approximate"
  image?: string
  slug: string
  relevance?: number
}
```

Adapt this to the actual project's type system.

Do not duplicate separate map logic everywhere.

The map should consume a normalized discovery representation.

---

# 18. LOCATION PRECISION

The database supports:

* Exact
* Approximate

The map must visually distinguish them appropriately.

If exact venue is unavailable:

* show the broader verified location
* do not imply exact precision

Do not expose internal verification information.

The UI can subtly indicate an approximate area when necessary.

---

# 19. STATE PANEL — DESKTOP

When a state is selected, open a side panel.

Example:

```text
KERALA

14 festivals this month
8 destinations
5 hidden discoveries

[Explore Kerala]
```

The panel can include a few representative discoveries.

Do not turn it into a giant page.

The map remains visible.

---

# 20. STATE PANEL — MOBILE

On mobile, use a bottom sheet.

The map remains visible behind it.

The bottom sheet should support:

* drag/expand where appropriate
* scrolling
* close
* discovery selection

Do not create tiny desktop-style panels on mobile.

---

# 21. DISCOVERY PREVIEW PANEL

When a festival or destination marker is selected:

Keep the map visible.

Show:

* Image
* Name
* Location
* Date or best-time information
* Short description
* Important tags

Actions:

```text
Save
Add to Trip
Explore
```

The panel should initially be concise.

Use expandable content only when needed.

---

# 22. SAVE

If the user clicks:

> Save

For guests:

* save locally

For authenticated users:

* save to account

Use the architecture established in Phase 1.

Do not require login just to save.

---

# 23. ADD TO TRIP

Show:

> Add to Trip

If the trip system isn't implemented yet:

Create a clean interface/service abstraction and a temporary interaction state.

Do not build the full trip planner in this phase.

The map must be ready for direct trip integration in the later phase.

---

# 24. NAVIGATING TO FULL PAGES

The preview panel should contain:

> Explore

This will eventually open:

```text
/festivals/[slug]
```

or:

```text
/destinations/[slug]
```

For now, if those pages don't exist yet, use the correct route structure and a clean placeholder rather than implementing the full page.

---

# 25. PRESERVE MAP CONTEXT

This is important.

If a user does:

```text
India
→ Rajasthan
→ Jaipur
→ Festival
→ Festival page
```

and returns to the map, preserve:

* selected month
* map location/context

Do not unnecessarily reset the map to India.

The user should feel like they are returning to the exact exploration context.

---

# 26. DESKTOP LAYOUT

Use the existing design system.

Recommended structure:

```text
┌────────────────────────────────────────────────────┐
│ Header                                             │
├────────────────────────────────────────────────────┤
│ Search / Month / Layers                            │
├────────────────────────────────────────────────────┤
│                                                    │
│                    INDIA MAP                       │
│                                                    │
│                                    ┌─────────────┐ │
│                                    │ Side Panel  │ │
│                                    │             │ │
│                                    └─────────────┘ │
│                                                    │
└────────────────────────────────────────────────────┘
```

The map should occupy most of the viewport.

---

# 27. MOBILE LAYOUT

Recommended:

```text
┌──────────────────────┐
│ Header / Search      │
├──────────────────────┤
│                      │
│                      │
│       INDIA MAP      │
│                      │
│                      │
├──────────────────────┤
│ Bottom Sheet         │
└──────────────────────┘
```

Use touch-friendly controls.

Do not clutter the map with many floating buttons.

---

# 28. MAP CONTROLS

Include appropriate controls for:

* Zoom
* Location/reset
* Month
* Layers
* Search

Keep controls visually minimal.

Avoid unnecessary map controls.

---

# 29. MAP LOADING

Create a polished map loading state.

Use:

* Skeleton/placeholder
* Subtle animation
* No generic full-screen spinner if avoidable

The map should appear progressively.

---

# 30. MAP DATA LOADING

This is critical for performance.

Do NOT load all India festival/destination data into the browser.

Use viewport-aware queries.

Conceptually:

```text
User moves map
        ↓
Get current bounding box
        ↓
Request relevant data
        ↓
Filter by month/layers
        ↓
Render visible discoveries
```

Use debouncing/throttling where appropriate.

Do not issue API requests on every pixel of map movement.

---

# 31. DATABASE / GEO QUERIES

Use efficient geographic queries.

The backend should eventually support something conceptually similar to:

```text
getDiscoveriesInViewport(
  north,
  south,
  east,
  west,
  month,
  layers
)
```

Return only the required fields for the map.

Do not return huge descriptions or unnecessary content.

The map endpoint should return lightweight data.

---

# 32. MAP DATA CONTRACT

Create a dedicated map data service.

It should be responsible for:

* viewport queries
* month filtering
* layer filtering
* normalization
* clustering support
* relevance

Do not place database queries directly inside map UI components.

---

# 33. SEED DATA

Expand the seed dataset enough to make the map visually meaningful.

Include at least:

* multiple states
* multiple cities
* multiple festivals
* multiple destinations
* hidden destinations
* different months
* different festival categories

Make sure geographic coordinates are realistic.

Clearly mark seed data as demo content.

---

# 34. MAP VISUAL QUALITY

The map should NOT look like a default map provider demo.

Customize:

* colors
* land
* water
* borders
* labels
* roads where appropriate
* typography
* marker styling

The map should fit the product's visual identity.

India should be the visual focus.

Avoid excessive geographic detail at national zoom.

---

# 35. ANIMATION

Implement smooth transitions for:

* India → State
* State → City
* Cluster → markers
* Marker selection
* Side panel opening
* Bottom sheet opening

Keep animations fast and responsive.

Never delay interaction for cinematic effects.

---

# 36. PERFORMANCE REQUIREMENTS

The map must remain performant with significantly more data than the current seed dataset.

Design for:

* thousands of festivals
* thousands of destinations
* thousands of experiences

Do not optimize only for the current demo dataset.

Use:

* clustering
* viewport queries
* vector rendering
* memoization where appropriate
* caching
* debounced map requests
* efficient state updates

---

# 37. MOBILE PERFORMANCE

On mobile:

* reduce marker complexity
* reduce animation complexity
* use bottom sheets
* load only necessary data
* avoid unnecessary re-renders

The map must remain usable on mid-range devices.

---

# 38. ANALYTICS

Use the analytics abstraction from Phase 1.

Track:

* map opened
* month selected
* All Year selected
* state clicked
* city clicked
* cluster clicked
* marker clicked
* layer toggled
* map search
* discovery preview opened
* save from map
* add-to-trip from map
* explore/full-page click
* approximate map area explored where appropriate

Do not collect unnecessary personal information.

---

# 39. ACCESSIBILITY

Even though advanced accessibility is not a V1 priority:

* Map controls must have accessible labels.
* Buttons must be keyboard accessible where possible.
* Important map information should have non-map alternatives.
* Panels must be keyboard navigable.
* Focus should be handled correctly.
* Reduced-motion preferences should be respected.

Do not rely exclusively on color to distinguish discovery types.

---

# 40. DO NOT BUILD

Do NOT implement yet:

* Full recommendation engine
* Full festival pages
* Full destination pages
* Full trip planner
* Advanced search
* Full CMS
* AI assistant
* Booking
* Live weather
* Community features

Only build the map and its required supporting infrastructure.

---

# 41. TESTING

After implementation:

Run:

* TypeScript
* lint
* tests
* production build

Then manually test:

### Desktop

* India map loads
* State selection
* Zoom
* Pan
* Clustering
* Month switching
* All Year
* Layers
* Search
* State panel
* Discovery preview
* Save
* Explore
* Map state preservation

### Mobile

* Map loads
* Touch navigation
* Bottom sheet
* Month selector
* Layers
* Search
* Marker selection
* Save
* Explore

Test with a reasonably large seed dataset.

Check browser console for errors.

Fix regressions before finishing.

---

# 42. ACCEPTANCE CRITERIA

This phase is complete only when:

* `/map` is a real functioning map.
* India geographic boundaries are visible.
* States/UTs are represented.
* Seed festivals/destinations appear geographically.
* Markers cluster.
* Current month is selected by default.
* Month switching updates map data.
* All Year works.
* Layers work.
* Map-specific search works.
* State selection zooms correctly.
* State panel works.
* Discovery preview panel works.
* Desktop side panel works.
* Mobile bottom sheet works.
* Save works for guests/local state.
* Save architecture works for accounts.
* Add-to-trip integration point exists.
* Full-page navigation integration exists.
* Map context can be preserved.
* Viewport-aware loading is implemented.
* Map data is not all loaded into the browser.
* Performance is reasonable.
* Map styling matches the design system.
* Animations are smooth.
* Analytics events are wired.
* TypeScript passes.
* Lint passes.
* Production build passes.
* No Phase 1 or Phase 2 functionality is broken.

---

# 43. FINAL REPORT

When finished, report:

1. Map technology used.
2. Why it was selected.
3. Geographic data source/format.
4. How viewport loading works.
5. How clustering works.
6. How month filtering works.
7. How layers work.
8. How map state preservation works.
9. Desktop/mobile interaction model.
10. Files created/modified.
11. Tests/checks performed.
12. Performance considerations.
13. Any remaining limitations.

Do NOT automatically proceed to Phase 4.

The next phase will build the **Festival Discovery System** on top of this map.

The goal of this phase is to make the India map feel like the defining feature of the product—not simply another component.



----------------------------------------------------------------------------------
# PHASE 4 — FESTIVAL DISCOVERY SYSTEM

You are continuing development of the India travel discovery platform.

Before making changes:

1. Inspect the existing repository.
2. Read `/docs/product-spec.md`.
3. Read `/docs/architecture.md`.
4. Read `/docs/database.md`.
5. Inspect the completed Phase 2 design system.
6. Inspect the completed Phase 3 Living India Map.
7. Understand existing components, services, routes, database models, and conventions.
8. Do NOT rewrite working functionality.
9. Do NOT replace the existing map architecture.
10. Build this phase on top of the existing system.

---

# 1. GOAL

Build the complete **Festival Discovery System**.

Festivals are one of the primary content pillars of the platform.

The experience should allow users to:

Discover festivals
→ Understand what they are
→ See when they happen
→ See where they happen
→ Explore the surrounding destination
→ Discover nearby places/experiences
→ Save the festival
→ Add it to a trip

The experience must work for both:

* anonymous users
* authenticated users

---

# 2. CORE FESTIVAL PHILOSOPHY

Do not make this a generic festival directory.

The product should answer:

> What is this festival?

> When is it happening?

> Where is it happening?

> What will the experience be like?

> Why should I travel for it?

> What else can I do nearby?

Use progressive disclosure.

Do not overwhelm users with a huge information wall.

---

# 3. FESTIVAL CATEGORIES

Use the categories established in the database:

* Regional Cultural Festivals
* Harvest Festivals
* Food Festivals
* Arts & Music Festivals
* Modern / Local Festivals

Do not hardcode categories throughout the frontend.

Load them from the database/taxonomy system.

Make the taxonomy extensible.

---

# 4. FESTIVAL CLASSIFICATION

Support:

### Popular

Well-known/high-demand festivals.

### Hidden

Less-known or offbeat festivals.

### Local / Emerging

Smaller or newer local experiences.

These classifications should influence ranking and discovery.

Do not treat them as mutually exclusive if the data model allows a better representation.

---

# 5. FESTIVAL LISTING PAGE

Implement:

```text
/festivals
```

The page should feel like a discovery experience rather than a database table.

---

# 6. FESTIVAL PAGE STRUCTURE

The page should initially show:

* Hero image
* Festival name
* Location
* Current-year date
* Start date
* End date
* Duration
* Date status
* Category
* Popular/Hidden/Local label
* Short description
* Traveller-fit tags
* Countdown if upcoming
* Save
* Add to Trip

Keep the initial information compact.

---

# 7. FESTIVAL CARDS

Festival cards must remain lightweight.

Initial card:

* Image
* Name
* Location
* Date

Do not put ten metadata fields onto cards.

On hover/interaction, reveal:

* Category
* Popular/Hidden label
* Traveller-fit tags
* Optional contextual information

Follow the design system from Phase 2.

---

# 8. FESTIVAL DISCOVERY PAGE

The main festival page should combine:

### Happening Now

Major current festivals.

### Upcoming

Festivals happening soon.

### Browse by Month

Allow users to explore the current year by month.

Do not make the page feel like a spreadsheet.

Use editorial layouts, discovery sections, and visual grouping.

---

# 9. FESTIVAL RANKING

Default ranking should balance:

* Upcoming relevance
* Selected month
* Geographic relevance
* Popularity
* Uniqueness
* Hidden/local classification
* Editorial featuring

Do not use popularity as the only ranking signal.

The ranking system should be implemented as a reusable service.

Do not bury ranking logic inside React components.

---

# 10. FESTIVAL FILTERS

Keep filters minimal in V1.

Do NOT add a huge advanced filter system.

Useful filters may include:

* State/location
* Month
* Festival category
* Popular/Hidden/Local

Only expose filters that actually improve discovery.

Prioritize simplicity.

---

# 11. FESTIVAL SEARCH

The universal search system will be implemented separately.

However, the festival system must expose searchable fields such as:

* name
* description
* location
* state
* city
* category
* tags

Create appropriate database indexes.

Do not build a second unrelated search system.

---

# 12. FESTIVAL DETAIL PAGE

Route:

```text
/festivals/[slug]
```

Every festival has one permanent canonical page.

Example:

```text
/festivals/hornbill-festival
```

Do NOT create:

```text
/festivals/hornbill-festival-2026
```

as the primary public page.

The permanent page should always represent the festival.

---

# 13. HERO SECTION

Create a strong visual hero.

Include:

* Festival image
* Festival name
* Location
* Current-year date
* Status
* Countdown where applicable

Do not put huge amounts of text over the image.

Maintain readability and visual hierarchy.

---

# 14. DATE SYSTEM

Display:

### Current year date

Example:

> December 1–10, 2026

### Duration

Example:

> 10 days

### Status

Examples:

> Confirmed

or:

> Expected

or:

> Date not announced

Do not present an expected date as confirmed.

---

# 15. COUNTDOWN

For upcoming festivals, show a countdown.

Example:

> 102 days to go

The countdown should update correctly.

Do not show countdowns for past festivals.

For festivals currently happening:

> Happening Now

Do not display a negative countdown.

---

# 16. FESTIVAL STATUS

Status labels should appear on festival pages.

Possible states:

* Happening Now
* Upcoming
* Past
* Expected Date
* Date Not Announced

Do not clutter every festival card with all status information.

---

# 17. FESTIVAL DESCRIPTION

The top-level description should be short.

Do NOT write an encyclopedia entry.

Use:

* 1–3 concise paragraphs
* Strong introductory explanation
* What makes the festival special

Additional detail belongs in expandable sections.

---

# 18. PROGRESSIVE DISCLOSURE

Create expandable sections:

### Festival Story

History/background.

### What to Expect

Atmosphere, traditions, activities, cultural experience.

### How to Reach

Transport information.

### Where to Stay

Accommodation guidance.

### Food

Local dishes/food experiences.

### Nearby

Nearby destinations/festivals/experiences.

### Related Experiences

Things to do around the festival.

Sections should open smoothly.

Do not load all heavy content unnecessarily if it can be deferred.

---

# 19. FESTIVAL STORY

Keep the initial story concise.

Avoid:

* huge historical essays
* generic AI-generated paragraphs
* repetitive filler

Content should feel editorial and useful to a traveller.

---

# 20. WHAT TO EXPECT

Provide practical cultural context.

Potential content:

* ceremonies
* performances
* food
* markets
* traditional activities
* local atmosphere

Avoid stereotyping.

Do not fabricate details.

---

# 21. TRAVELLER-FIT TAGS

Use simple general tags.

Examples:

* Family-friendly
* Backpacker-friendly
* Couple-friendly
* Group-friendly
* Photography-friendly
* Culture-focused

Do not create another complex scoring system.

---

# 22. IMAGES

Festival pages should have:

### Hero image

One high-quality primary image.

### Gallery

A compact gallery.

Allow expansion into a larger visual gallery.

Use the media architecture from Phase 1.

Optimize images.

Do not load huge full-resolution images unnecessarily.

---

# 23. LOCATION

Display:

* City/region
* State
* Map preview

Use the geographic data from the map system.

If exact venue is available:

Use it.

If only approximate location is available:

Show the broader verified area without implying exact precision.

Do not invent coordinates.

---

# 24. MAP INTEGRATION

The festival page should connect back to the Living India Map.

Provide:

> View on Map

Selecting it should open the map centered on the festival.

If practical, preserve:

* month
* location
* map context

Do not create a second independent map implementation.

Reuse the map architecture.

---

# 25. NEARBY DISCOVERY

This is a core feature.

On festival pages show relevant nearby:

* Destinations
* Festivals
* Experiences
* Food
* Attractions

Prioritize geographic relevance.

Example:

```text
You're visiting this festival.

Also explore nearby:
- Destination A
- Destination B
- Experience C
- Food D
```

Keep the initial number limited.

Provide:

> Explore Nearby

for deeper discovery.

---

# 26. DESTINATION CONNECTION

Every festival should connect to its host destination/region where possible.

Example:

Festival:

> Hornbill Festival

Destination:

> Nagaland

Nearby:

> Kohima

The relationships should be database-driven.

Do not hardcode these relationships in UI components.

---

# 27. TRANSPORT

Create a practical transport section.

Support:

* Nearest airport
* Nearest railway station
* Major road access
* Approximate travel time
* Local transport guidance

Do NOT build booking.

Do NOT build real-time transport schedules.

Keep the data structure extensible.

---

# 28. ACCOMMODATION

Provide:

* Recommended areas
* Accommodation types
* Basic guidance

Architect the data so booking integrations can be added later.

Do not implement hotel booking now.

---

# 29. FOOD

Show relevant food content:

* Local dishes
* Festival foods
* Regional specialties
* Food experiences

Use the Food entity from the database.

Do not duplicate food data inside festival records.

---

# 30. EXPERIENCES

Show relevant curated experiences.

Examples:

* Cultural experiences
* Photography
* Workshops
* Markets
* Nature
* Adventure
* Performances

Use the Experience entity.

---

# 31. SAVE

Users should be able to:

> Save

Guests:

* local browser storage

Authenticated users:

* cloud account

Use the existing save architecture.

Do not require login.

---

# 32. ADD TO TRIP

Provide:

> Add to Trip

If the trip system is not fully implemented yet, connect to the existing interface/service abstraction.

Do not implement the entire trip planner in this phase.

---

# 33. VISITED

Allow:

> Mark as Visited

V1 behavior:

* simple toggle
* no date
* no notes
* no photos

Use the existing visited architecture.

---

# 34. SHARING

Festival pages should be easily shareable.

Implement:

* native/browser share where available
* copy link
* social metadata

Ensure social preview metadata is generated correctly.

---

# 35. SEO

Festival pages are a major SEO acquisition channel.

Implement:

* dynamic title
* meta description
* canonical URL
* Open Graph metadata
* social image
* structured data where appropriate
* sitemap inclusion
* semantic HTML

Use the permanent festival URL.

Example:

```text
/festivals/hornbill-festival
```

Do not generate thin duplicate pages.

---

# 36. STRUCTURED DATA

Where appropriate, implement structured data for:

* Event
* Place
* Breadcrumb

Only output schema data that accurately represents the page.

Do not fabricate dates or information.

---

# 37. INTERNAL LINKING

Festival pages should link to:

* Host destination
* State
* Nearby destinations
* Related festivals
* Experiences
* Food
* Map

This should improve both UX and SEO.

---

# 38. FESTIVAL DATA COMPLETENESS

Create sensible handling for incomplete data.

Example:

If exact date is unknown:

> Date not announced

If exact venue is unknown:

> Location: Kohima region

If no accommodation information exists:

Do not display an empty section.

Use graceful progressive disclosure.

---

# 39. CONTENT TRUST

Do NOT expose internal verification metadata prominently.

Do not show:

> Last verified by admin

unless later explicitly decided.

The public interface should remain clean.

The backend retains verification information.

---

# 40. DEMO DATA

Expand the seed dataset enough to make the festival system convincing.

Include:

* famous festivals
* niche festivals
* hidden/local festivals
* multiple states
* different categories
* festivals across different months
* festivals with exact dates
* festivals with expected dates
* festivals with missing dates
* festivals with approximate locations

Clearly mark seed content as demo content.

Do not fabricate "official" claims.

---

# 41. RESPONSIVE DESIGN

Desktop:

* Large hero
* Rich gallery
* Multi-column information sections
* Side-by-side nearby discovery

Mobile:

* Compact hero
* Swipeable/expandable gallery
* Stacked sections
* Bottom-sheet/map interactions where appropriate

Do not simply shrink desktop layouts.

---

# 42. PERFORMANCE

Festival pages may contain large images.

Use:

* responsive images
* lazy loading
* priority loading for hero
* dynamic imports where useful
* deferred heavy sections
* efficient database queries

Do not fetch unrelated nearby content unnecessarily.

---

# 43. LOADING STATES

Use the Phase 2 skeleton system.

Create skeletons for:

* Festival cards
* Festival page
* Hero
* Gallery
* Nearby discoveries
* Expandable sections

Avoid generic full-screen spinners.

---

# 44. ERROR STATES

Handle:

* festival not found
* missing image
* missing date
* missing location
* failed nearby content
* API/database errors

Do not expose internal errors.

---

# 45. ANALYTICS

Use the existing analytics abstraction.

Track:

* festival listing viewed
* festival clicked
* festival page viewed
* month selected
* category interaction
* Save
* Visited
* Add to Trip
* View on Map
* Nearby item clicked
* Gallery opened
* Expandable section opened
* Share clicked

Do not collect unnecessary personal information.

---

# 46. ADMIN COMPATIBILITY

Ensure the festival data model works with the future CMS.

Admins will eventually need to:

* create festival
* edit festival
* update dates
* update location
* update images
* manage categories
* manage tags
* manage nearby relationships
* verify information

Do not build the complete CMS in this phase.

But do not create frontend assumptions that make CMS integration difficult.

---

# 47. DO NOT BUILD YET

Do NOT build:

* Full destination system
* Full recommendation engine
* Full calendar
* Full search system
* Full trip builder
* Community reviews
* User-generated content
* Booking
* AI travel assistant

Those are later phases.

---

# 48. TESTING

After implementation:

Run:

* TypeScript
* lint
* tests
* production build

Then manually test:

### Festival listing

* Loading
* Cards
* Month browsing
* Ranking
* Filters

### Festival page

* Hero
* Date
* Countdown
* Status
* Gallery
* Expandable sections
* Save
* Visited
* Add to Trip
* View on Map
* Nearby
* SEO metadata

### Mobile

Test:

* Festival listing
* Festival page
* Gallery
* Expandable sections
* Buttons
* Map navigation

Check console for errors.

Fix regressions before finishing.

---

# 49. ACCEPTANCE CRITERIA

Phase 4 is complete when:

* `/festivals` is a functional discovery page.
* Festival cards are lightweight.
* Festivals are ranked meaningfully.
* Month discovery works.
* Basic filters work.
* `/festivals/[slug]` works.
* Permanent festival URLs work.
* Current-year dates display correctly.
* Date status works.
* Duration works.
* Countdown works.
* Past/upcoming/current status works.
* Gallery works.
* Progressive disclosure works.
* Location information works.
* Map integration works.
* Nearby discovery works.
* Food relationships work.
* Experience relationships work.
* Transport information works.
* Accommodation guidance works.
* Save works.
* Visited works.
* Add-to-trip integration exists.
* Sharing works.
* SEO metadata works.
* Structured data is valid where used.
* Mobile layout works.
* Desktop layout works.
* Loading states work.
* Error states work.
* Analytics events are wired.
* No Phase 1–3 functionality is broken.
* TypeScript passes.
* Lint passes.
* Production build passes.

---

# 50. FINAL REPORT

When finished, report:

1. Festival data model used.
2. Festival ranking approach.
3. Festival page architecture.
4. Date/status implementation.
5. Map integration.
6. Nearby discovery implementation.
7. SEO implementation.
8. Save/Visited integration.
9. Files created/modified.
10. Tests/checks performed.
11. Any limitations.
12. Any issues that should be addressed before the next phase.

Do NOT automatically proceed to Phase 5.

The next phase will build the **Destination Discovery System** and connect destinations deeply with festivals, seasons, food, experiences, transport and nearby discovery.




-------------------------------------------------------------------------------------------------------------------------------------------------------------------

# PHASE 5 — DESTINATION DISCOVERY SYSTEM

You are continuing development of the India travel discovery platform.

Before making changes:

1. Inspect the existing repository.
2. Read `/docs/product-spec.md`.
3. Read `/docs/architecture.md`.
4. Read `/docs/database.md`.
5. Inspect the completed Phase 2 design system.
6. Inspect the completed Phase 3 Living India Map.
7. Inspect the completed Phase 4 Festival Discovery System.
8. Understand the existing components, services, routes, database models, and conventions.
9. Do NOT rewrite working functionality.
10. Reuse existing components and services wherever appropriate.

---

# 1. GOAL

Build the complete **Destination Discovery System**.

Destinations are a core product pillar alongside festivals.

The destination experience should answer:

> Where should I go?

> When should I go?

> Why should I go?

> What can I do there?

> What will it roughly cost?

> What festivals/events are nearby?

> What else can I explore nearby?

The system must support both:

* famous destinations
* lesser-known destinations / hidden gems

---

# 2. PRODUCT PHILOSOPHY

Do not make this a generic destination directory.

The destination experience should feel like:

> **Travel inspiration + practical travel intelligence.**

The user should discover a destination and naturally move toward:

Destination
→ Best time
→ Experiences
→ Food
→ Festivals
→ Nearby places
→ Budget
→ Trip planning

Keep the initial experience visually inspiring.

Use progressive disclosure for detailed travel information.

---

# 3. DESTINATION TYPES

Support at minimum:

* Major destination
* City
* Nature destination
* Heritage destination
* Beach destination
* Mountain destination
* Hidden gem
* Cultural destination

Do not hardcode these categories throughout the frontend.

Use an extensible taxonomy.

---

# 4. DESTINATION LISTING PAGE

Implement:

```text
/destinations
```

The page should feel editorial and exploratory.

Do not create a simple table/grid of hundreds of places.

Use sections such as:

* Featured Destinations
* Best This Month
* Hidden India
* Popular Destinations
* Seasonal Discoveries

The exact dynamic content should eventually be controlled by ranking/editorial logic.

---

# 5. DESTINATION CARDS

Keep cards visually clean.

Initial card should contain:

* Image
* Destination name
* State/region
* Short contextual label
* Optional budget level
* Optional seasonal indicator

Do not overload cards with:

* long descriptions
* transport information
* huge tag lists
* multiple ratings

Cards should encourage exploration.

---

# 6. DESTINATION RANKING

Default destination ranking should consider:

* Seasonal suitability
* Festivals/events
* Overall travel quality
* Popularity
* Uniqueness
* Editorial featuring

For personalized users, eventually add:

* Budget
* Duration
* Traveller count
* Interests
* Travel style
* Crowd preference

Do NOT build the complete recommendation engine yet.

Create reusable ranking/service interfaces.

---

# 7. DESTINATION DETAIL PAGE

Route:

```text
/destinations/[slug]
```

Every destination should have one permanent canonical page.

Example:

```text
/destinations/munnar
```

Do not create separate yearly destination pages.

---

# 8. DESTINATION HERO

Create a cinematic hero.

Show:

* Destination image
* Destination name
* Region/state
* Short description
* Best time
* Budget level
* Save
* Add to Trip

Keep the hero visually clean.

Do not put every piece of travel information above the fold.

---

# 9. QUICK TRAVEL SNAPSHOT

Near the top of the page, show a concise travel snapshot.

Example:

```text
Best time
October – March

Also good
April – May

Budget
₹₹

Typical trip
₹12K – ₹18K
```

Use the established design system.

---

# 10. BEST TIME

Best-time information is a major feature.

Display:

### Best time

Example:

> October – March

### Alternative good time

Example:

> April – May

### Why

Provide a concise explanation deeper in the page.

Example:

> Pleasant weather and good conditions for outdoor exploration.

---

# 11. BEST-TIME ENGINE

Use the hybrid architecture defined earlier.

The system can:

1. Generate a system suggestion.
2. Store the suggestion.
3. Allow admin verification.
4. Allow admin override.

The user should see only the verified/current recommendation.

Do not use live weather APIs in V1.

Use curated seasonal information.

---

# 12. SEASONAL DISCOVERY

This is a major feature.

When a user selects a month elsewhere in the product, destination recommendations should respond to the selected month.

For example:

```text
February
↓
Seasonally strong destinations
↓
Festivals happening nearby
↓
Experiences available
```

Destination ranking should consider:

* weather/season suitability
* festival activity
* overall destination quality
* uniqueness

---

# 13. DESTINATION PAGE SECTIONS

Use progressive disclosure.

Recommended sections:

### Overview

Short description.

### Things to Do

Major experiences.

### Best Time

Seasonal explanation.

### Food

Local dishes and food experiences.

### Festivals

Relevant festivals.

### Experiences

Curated activities.

### How to Reach

Transport.

### Where to Stay

Accommodation guidance.

### Nearby Places

Nearby destinations.

### Travel Tips

Practical advice.

Do not display empty sections.

Only show sections with meaningful content.

---

# 14. THINGS TO DO

Show curated activities.

Examples:

* sightseeing
* nature
* adventure
* heritage
* photography
* markets
* local culture
* workshops

Use the Experience entity where possible.

Do not duplicate experience content inside destinations.

---

# 15. FOOD

Use the existing Food system.

Show:

* Local dishes
* Regional specialties
* Food experiences
* Food festivals where relevant

Avoid generic descriptions.

Make the food section useful for someone actually visiting.

---

# 16. FESTIVAL CONNECTION

Festivals should be deeply connected to destinations.

Example:

```text
Destination
↓
Festivals happening here
↓
Festival page
```

Show:

* Upcoming festivals
* Happening Now
* Relevant annual festivals

Use the existing Festival service.

Do not duplicate festival data.

---

# 17. FESTIVAL-BASED DISCOVERY

A destination page should be able to surface:

> **Visit during this festival**

Example:

> Want to experience Munnar differently?

> Visit during [Festival].

This relationship should be data-driven.

---

# 18. NEARBY DESTINATIONS

Show geographically relevant destinations.

Use geospatial relationships.

Do not manually hardcode nearby destinations.

The backend should be able to query:

> destinations within X km

with appropriate ranking.

Do not blindly show only the nearest places.

Consider:

* distance
* quality
* uniqueness
* relevance
* travel practicality

---

# 19. NEARBY DISCOVERY

A destination should connect to:

* nearby festivals
* nearby destinations
* experiences
* food
* attractions

This should reuse the nearby discovery architecture created for festivals.

Do not create a separate incompatible system.

---

# 20. MAP INTEGRATION

Every destination page should have:

> View on Map

When clicked:

* open `/map`
* center on destination
* preserve useful map context
* show destination preview

Reuse the existing Living India Map.

Do NOT build another map component.

---

# 21. DESTINATION LOCATION

Use:

* city
* district/region where appropriate
* state
* coordinates

Support:

* exact location
* approximate location

Never invent geographic precision.

---

# 22. TRANSPORT

Create practical transport information.

Support:

* nearest airport
* nearest railway station
* major road access
* approximate travel time
* local transport guidance

Do not implement:

* flight booking
* train booking
* real-time transport schedules

Keep the architecture extensible.

---

# 23. ACCOMMODATION

Provide guidance rather than booking.

Potential information:

* best areas to stay
* accommodation types
* approximate budget category
* general travel guidance

Do not implement hotel booking.

Architect for future integration.

---

# 24. BUDGET

V1 is INR-only.

Every meaningful destination should support:

### Budget level

```text
₹
₹₹
₹₹₹
```

### Approximate trip range

Example:

> ₹12K–₹18K

Use rounded ranges on cards.

Provide more precise estimates deeper in the destination page.

---

# 25. BUDGET ESTIMATION

Create a reusable destination budget service.

It should support a baseline estimate based on:

* standard duration
* standard traveller assumption
* destination cost level

Later it will support personalized estimates based on:

* user's duration
* number of travellers
* travel style

Do not build personal expense tracking.

---

# 26. TRAVEL STYLE

The destination system should be compatible with:

* Backpacker
* Budget
* Comfortable
* Luxury

Do not force a single price assumption onto every user.

---

# 27. CROWD PREFERENCE

Do NOT create a destination crowd rating in V1.

However, the architecture should allow the future recommendation engine to use crowd preference.

Do not display:

> Low crowd
> Medium crowd
> High crowd

on destination pages yet.

---

# 28. HIDDEN DESTINATIONS

Support a strong hidden destination identity.

A hidden destination should:

* be marked as Hidden
* appear in Hidden India
* appear on the map
* appear in seasonal discovery
* appear in recommendations
* connect to nearby festivals and experiences

Do not hide it from normal discovery.

---

# 29. HIDDEN INDIA PAGE

Implement:

```text
/hidden-india
```

This should be a dedicated editorial discovery experience.

It should include:

* Hidden destinations
* Hidden festivals
* Lesser-known experiences

Use the same underlying content models.

Do not duplicate content.

The page should feel more exploratory/mysterious visually while remaining part of the shared design system.

---

# 30. DESTINATION GALLERY

Create:

* hero image
* compact supporting gallery
* expandable gallery

Use the existing media system.

Optimize images.

Do not load the full gallery at initial page load if unnecessary.

---

# 31. SAVE

Users should be able to save destinations.

Guest:

* local browser storage

Authenticated:

* cloud storage

Reuse the existing save system.

---

# 32. VISITED

Users should be able to:

> Mark as Visited

Use the existing visited system.

No:

* dates
* notes
* ratings

in V1.

---

# 33. ADD TO TRIP

Provide:

> Add to Trip

Connect to the trip service abstraction created earlier.

Do not build the complete trip planner in this phase.

---

# 34. SHARING

Destination pages should support:

* copy link
* browser/native share
* Open Graph
* social preview

Use clean canonical URLs.

---

# 35. SEO

Destination pages are important SEO landing pages.

Implement:

* dynamic title
* meta description
* canonical URL
* Open Graph
* social image
* semantic HTML
* structured data where appropriate
* sitemap inclusion
* breadcrumbs where useful

Avoid thin pages.

---

# 36. STRUCTURED DATA

Where accurate, support structured data such as:

* Place
* TouristDestination where appropriate
* BreadcrumbList

Do not fabricate information.

---

# 37. INTERNAL LINKING

Destination pages should link to:

* Festivals
* Nearby destinations
* Experiences
* Food
* State/region
* Map
* Hidden India where appropriate

This should create a strong internal discovery network.

---

# 38. SEASONAL DESTINATION LIST

Implement a reusable seasonal ranking service.

Inputs:

```text
month
location/context
destination data
festival data
experience data
editorial signals
```

Output:

Ranked destinations.

For now, do NOT personalize this engine deeply.

The full recommendation engine comes later.

---

# 39. DATA MODEL

Ensure destination data remains normalized.

Do not put:

```text
food1
food2
food3
festival1
festival2
festival3
```

as arbitrary fields.

Use proper relationships.

The destination should connect to:

* Location
* Festival
* Experience
* Food
* Nearby destinations
* Media
* Tags

---

# 40. CONTENT QUALITY

Do not generate generic filler text.

Avoid:

> "Munnar is a beautiful destination located in Kerala..."

unless there is useful context after it.

Content should emphasize:

* what makes the place special
* what to experience
* when to visit
* what to eat
* nearby opportunities
* practical travel information

Keep descriptions concise and editorial.

---

# 41. DEMO DATA

Expand seed data enough to demonstrate the system.

Include:

* famous destinations
* hidden destinations
* mountain destinations
* beach destinations
* heritage destinations
* nature destinations
* cultural destinations
* multiple states
* different seasonal suitability
* festivals connected to destinations
* experiences
* food
* nearby destinations

Use clearly marked demo content.

Do not present fake information as verified.

---

# 42. RESPONSIVE DESIGN

Desktop:

* cinematic hero
* rich gallery
* two-column content where appropriate
* nearby discovery sections
* strong editorial layout

Mobile:

* compact hero
* swipe/expand gallery
* stacked content
* sticky or easily accessible Save/Add to Trip actions where appropriate

Do not simply shrink desktop.

---

# 43. PERFORMANCE

Destination pages can be image-heavy.

Use:

* responsive image delivery
* lazy loading
* hero priority loading
* efficient queries
* deferred heavy sections
* caching where appropriate

Do not fetch unrelated nearby data.

---

# 44. LOADING STATES

Use Phase 2 skeleton components.

Create skeletons for:

* Destination cards
* Destination hero
* Gallery
* Snapshot
* Things to Do
* Nearby discoveries
* Festivals
* Experiences

---

# 45. ERROR STATES

Handle:

* destination not found
* missing image
* incomplete data
* missing best-time data
* missing budget
* failed nearby query
* API/database failure

Do not show technical errors.

---

# 46. ANALYTICS

Track:

* destination listing viewed
* destination clicked
* destination page viewed
* seasonal month interaction
* Save
* Visited
* Add to Trip
* View on Map
* nearby destination clicked
* festival clicked
* experience clicked
* food clicked
* gallery opened
* section expanded
* share clicked

Use the existing analytics abstraction.

---

# 47. ADMIN COMPATIBILITY

Ensure destination data can later be managed through CMS.

Admins should eventually be able to:

* create destination
* edit destination
* change location
* manage images
* manage best time
* verify best time
* set budget
* manage tags
* manage nearby relationships
* connect festivals
* connect experiences
* connect food
* feature destination

Do not build the complete CMS now.

---

# 48. DO NOT BUILD YET

Do NOT implement:

* Full recommendation engine
* Advanced search
* Full calendar
* Complete trip planner
* AI itinerary generation
* Live weather
* Booking
* Community reviews
* User-generated content
* Advanced crowd scoring
* Multi-currency
* Multilingual content

---

# 49. TESTING

Run:

* TypeScript
* lint
* tests
* production build

Manually test:

### Destination listing

* Cards
* Seasonal sections
* Hidden destinations
* Responsive layout

### Destination page

* Hero
* Best time
* Alternative time
* Budget
* Gallery
* Things to Do
* Food
* Festivals
* Experiences
* Transport
* Accommodation
* Nearby
* Save
* Visited
* Add to Trip
* View on Map
* Share

### Hidden India

* Hidden destinations
* Hidden festivals
* Hidden experiences
* Navigation

### Mobile

Test all major interactions.

Fix regressions before finishing.

---

# 50. ACCEPTANCE CRITERIA

Phase 5 is complete when:

* `/destinations` is functional.
* Destination cards work.
* Seasonal destination discovery works.
* `/destinations/[slug]` works.
* Permanent destination URLs work.
* Best-time information works.
* Alternative-time information works.
* Budget level works.
* Approximate cost works.
* Gallery works.
* Food relationships work.
* Festival relationships work.
* Experience relationships work.
* Nearby destinations work.
* Transport works.
* Accommodation guidance works.
* Hidden destinations work.
* `/hidden-india` works.
* Save works.
* Visited works.
* Add-to-trip integration exists.
* View-on-map works.
* Sharing works.
* SEO metadata works.
* Structured data is accurate where used.
* Desktop works.
* Mobile works.
* Loading states work.
* Error states work.
* Analytics are wired.
* No earlier phase is broken.
* TypeScript passes.
* Lint passes.
* Production build passes.

---

# 51. FINAL REPORT

When finished, report:

1. Destination data architecture.
2. Seasonal ranking implementation.
3. Best-time implementation.
4. Budget implementation.
5. Festival/destination relationships.
6. Nearby discovery implementation.
7. Hidden India implementation.
8. Map integration.
9. SEO implementation.
10. Analytics implementation.
11. Files created/modified.
12. Tests/checks performed.
13. Limitations or issues.

Do NOT automatically proceed to the next phase.

The next major phase will connect the platform's **search, calendar and seasonal discovery systems** into one unified discovery experience.




-------------------------------------------------------------------------------

# PHASE 5 — DESTINATION DISCOVERY SYSTEM

You are continuing development of the India travel discovery platform.

Before making changes:

1. Inspect the existing repository.
2. Read `/docs/product-spec.md`.
3. Read `/docs/architecture.md`.
4. Read `/docs/database.md`.
5. Inspect the completed Phase 2 design system.
6. Inspect the completed Phase 3 Living India Map.
7. Inspect the completed Phase 4 Festival Discovery System.
8. Understand the existing components, services, routes, database models, and conventions.
9. Do NOT rewrite working functionality.
10. Reuse existing components and services wherever appropriate.

---

# 1. GOAL

Build the complete **Destination Discovery System**.

Destinations are a core product pillar alongside festivals.

The destination experience should answer:

> Where should I go?

> When should I go?

> Why should I go?

> What can I do there?

> What will it roughly cost?

> What festivals/events are nearby?

> What else can I explore nearby?

The system must support both:

* famous destinations
* lesser-known destinations / hidden gems

---

# 2. PRODUCT PHILOSOPHY

Do not make this a generic destination directory.

The destination experience should feel like:

> **Travel inspiration + practical travel intelligence.**

The user should discover a destination and naturally move toward:

Destination
→ Best time
→ Experiences
→ Food
→ Festivals
→ Nearby places
→ Budget
→ Trip planning

Keep the initial experience visually inspiring.

Use progressive disclosure for detailed travel information.

---

# 3. DESTINATION TYPES

Support at minimum:

* Major destination
* City
* Nature destination
* Heritage destination
* Beach destination
* Mountain destination
* Hidden gem
* Cultural destination

Do not hardcode these categories throughout the frontend.

Use an extensible taxonomy.

---

# 4. DESTINATION LISTING PAGE

Implement:

```text
/destinations
```

The page should feel editorial and exploratory.

Do not create a simple table/grid of hundreds of places.

Use sections such as:

* Featured Destinations
* Best This Month
* Hidden India
* Popular Destinations
* Seasonal Discoveries

The exact dynamic content should eventually be controlled by ranking/editorial logic.

---

# 5. DESTINATION CARDS

Keep cards visually clean.

Initial card should contain:

* Image
* Destination name
* State/region
* Short contextual label
* Optional budget level
* Optional seasonal indicator

Do not overload cards with:

* long descriptions
* transport information
* huge tag lists
* multiple ratings

Cards should encourage exploration.

---

# 6. DESTINATION RANKING

Default destination ranking should consider:

* Seasonal suitability
* Festivals/events
* Overall travel quality
* Popularity
* Uniqueness
* Editorial featuring

For personalized users, eventually add:

* Budget
* Duration
* Traveller count
* Interests
* Travel style
* Crowd preference

Do NOT build the complete recommendation engine yet.

Create reusable ranking/service interfaces.

---

# 7. DESTINATION DETAIL PAGE

Route:

```text
/destinations/[slug]
```

Every destination should have one permanent canonical page.

Example:

```text
/destinations/munnar
```

Do not create separate yearly destination pages.

---

# 8. DESTINATION HERO

Create a cinematic hero.

Show:

* Destination image
* Destination name
* Region/state
* Short description
* Best time
* Budget level
* Save
* Add to Trip

Keep the hero visually clean.

Do not put every piece of travel information above the fold.

---

# 9. QUICK TRAVEL SNAPSHOT

Near the top of the page, show a concise travel snapshot.

Example:

```text
Best time
October – March

Also good
April – May

Budget
₹₹

Typical trip
₹12K – ₹18K
```

Use the established design system.

---

# 10. BEST TIME

Best-time information is a major feature.

Display:

### Best time

Example:

> October – March

### Alternative good time

Example:

> April – May

### Why

Provide a concise explanation deeper in the page.

Example:

> Pleasant weather and good conditions for outdoor exploration.

---

# 11. BEST-TIME ENGINE

Use the hybrid architecture defined earlier.

The system can:

1. Generate a system suggestion.
2. Store the suggestion.
3. Allow admin verification.
4. Allow admin override.

The user should see only the verified/current recommendation.

Do not use live weather APIs in V1.

Use curated seasonal information.

---

# 12. SEASONAL DISCOVERY

This is a major feature.

When a user selects a month elsewhere in the product, destination recommendations should respond to the selected month.

For example:

```text
February
↓
Seasonally strong destinations
↓
Festivals happening nearby
↓
Experiences available
```

Destination ranking should consider:

* weather/season suitability
* festival activity
* overall destination quality
* uniqueness

---

# 13. DESTINATION PAGE SECTIONS

Use progressive disclosure.

Recommended sections:

### Overview

Short description.

### Things to Do

Major experiences.

### Best Time

Seasonal explanation.

### Food

Local dishes and food experiences.

### Festivals

Relevant festivals.

### Experiences

Curated activities.

### How to Reach

Transport.

### Where to Stay

Accommodation guidance.

### Nearby Places

Nearby destinations.

### Travel Tips

Practical advice.

Do not display empty sections.

Only show sections with meaningful content.

---

# 14. THINGS TO DO

Show curated activities.

Examples:

* sightseeing
* nature
* adventure
* heritage
* photography
* markets
* local culture
* workshops

Use the Experience entity where possible.

Do not duplicate experience content inside destinations.

---

# 15. FOOD

Use the existing Food system.

Show:

* Local dishes
* Regional specialties
* Food experiences
* Food festivals where relevant

Avoid generic descriptions.

Make the food section useful for someone actually visiting.

---

# 16. FESTIVAL CONNECTION

Festivals should be deeply connected to destinations.

Example:

```text
Destination
↓
Festivals happening here
↓
Festival page
```

Show:

* Upcoming festivals
* Happening Now
* Relevant annual festivals

Use the existing Festival service.

Do not duplicate festival data.

---

# 17. FESTIVAL-BASED DISCOVERY

A destination page should be able to surface:

> **Visit during this festival**

Example:

> Want to experience Munnar differently?

> Visit during [Festival].

This relationship should be data-driven.

---

# 18. NEARBY DESTINATIONS

Show geographically relevant destinations.

Use geospatial relationships.

Do not manually hardcode nearby destinations.

The backend should be able to query:

> destinations within X km

with appropriate ranking.

Do not blindly show only the nearest places.

Consider:

* distance
* quality
* uniqueness
* relevance
* travel practicality

---

# 19. NEARBY DISCOVERY

A destination should connect to:

* nearby festivals
* nearby destinations
* experiences
* food
* attractions

This should reuse the nearby discovery architecture created for festivals.

Do not create a separate incompatible system.

---

# 20. MAP INTEGRATION

Every destination page should have:

> View on Map

When clicked:

* open `/map`
* center on destination
* preserve useful map context
* show destination preview

Reuse the existing Living India Map.

Do NOT build another map component.

---

# 21. DESTINATION LOCATION

Use:

* city
* district/region where appropriate
* state
* coordinates

Support:

* exact location
* approximate location

Never invent geographic precision.

---

# 22. TRANSPORT

Create practical transport information.

Support:

* nearest airport
* nearest railway station
* major road access
* approximate travel time
* local transport guidance

Do not implement:

* flight booking
* train booking
* real-time transport schedules

Keep the architecture extensible.

---

# 23. ACCOMMODATION

Provide guidance rather than booking.

Potential information:

* best areas to stay
* accommodation types
* approximate budget category
* general travel guidance

Do not implement hotel booking.

Architect for future integration.

---

# 24. BUDGET

V1 is INR-only.

Every meaningful destination should support:

### Budget level

```text
₹
₹₹
₹₹₹
```

### Approximate trip range

Example:

> ₹12K–₹18K

Use rounded ranges on cards.

Provide more precise estimates deeper in the destination page.

---

# 25. BUDGET ESTIMATION

Create a reusable destination budget service.

It should support a baseline estimate based on:

* standard duration
* standard traveller assumption
* destination cost level

Later it will support personalized estimates based on:

* user's duration
* number of travellers
* travel style

Do not build personal expense tracking.

---

# 26. TRAVEL STYLE

The destination system should be compatible with:

* Backpacker
* Budget
* Comfortable
* Luxury

Do not force a single price assumption onto every user.

---

# 27. CROWD PREFERENCE

Do NOT create a destination crowd rating in V1.

However, the architecture should allow the future recommendation engine to use crowd preference.

Do not display:

> Low crowd
> Medium crowd
> High crowd

on destination pages yet.

---

# 28. HIDDEN DESTINATIONS

Support a strong hidden destination identity.

A hidden destination should:

* be marked as Hidden
* appear in Hidden India
* appear on the map
* appear in seasonal discovery
* appear in recommendations
* connect to nearby festivals and experiences

Do not hide it from normal discovery.

---

# 29. HIDDEN INDIA PAGE

Implement:

```text
/hidden-india
```

This should be a dedicated editorial discovery experience.

It should include:

* Hidden destinations
* Hidden festivals
* Lesser-known experiences

Use the same underlying content models.

Do not duplicate content.

The page should feel more exploratory/mysterious visually while remaining part of the shared design system.

---

# 30. DESTINATION GALLERY

Create:

* hero image
* compact supporting gallery
* expandable gallery

Use the existing media system.

Optimize images.

Do not load the full gallery at initial page load if unnecessary.

---

# 31. SAVE

Users should be able to save destinations.

Guest:

* local browser storage

Authenticated:

* cloud storage

Reuse the existing save system.

---

# 32. VISITED

Users should be able to:

> Mark as Visited

Use the existing visited system.

No:

* dates
* notes
* ratings

in V1.

---

# 33. ADD TO TRIP

Provide:

> Add to Trip

Connect to the trip service abstraction created earlier.

Do not build the complete trip planner in this phase.

---

# 34. SHARING

Destination pages should support:

* copy link
* browser/native share
* Open Graph
* social preview

Use clean canonical URLs.

---

# 35. SEO

Destination pages are important SEO landing pages.

Implement:

* dynamic title
* meta description
* canonical URL
* Open Graph
* social image
* semantic HTML
* structured data where appropriate
* sitemap inclusion
* breadcrumbs where useful

Avoid thin pages.

---

# 36. STRUCTURED DATA

Where accurate, support structured data such as:

* Place
* TouristDestination where appropriate
* BreadcrumbList

Do not fabricate information.

---

# 37. INTERNAL LINKING

Destination pages should link to:

* Festivals
* Nearby destinations
* Experiences
* Food
* State/region
* Map
* Hidden India where appropriate

This should create a strong internal discovery network.

---

# 38. SEASONAL DESTINATION LIST

Implement a reusable seasonal ranking service.

Inputs:

```text
month
location/context
destination data
festival data
experience data
editorial signals
```

Output:

Ranked destinations.

For now, do NOT personalize this engine deeply.

The full recommendation engine comes later.

---

# 39. DATA MODEL

Ensure destination data remains normalized.

Do not put:

```text
food1
food2
food3
festival1
festival2
festival3
```

as arbitrary fields.

Use proper relationships.

The destination should connect to:

* Location
* Festival
* Experience
* Food
* Nearby destinations
* Media
* Tags

---

# 40. CONTENT QUALITY

Do not generate generic filler text.

Avoid:

> "Munnar is a beautiful destination located in Kerala..."

unless there is useful context after it.

Content should emphasize:

* what makes the place special
* what to experience
* when to visit
* what to eat
* nearby opportunities
* practical travel information

Keep descriptions concise and editorial.

---

# 41. DEMO DATA

Expand seed data enough to demonstrate the system.

Include:

* famous destinations
* hidden destinations
* mountain destinations
* beach destinations
* heritage destinations
* nature destinations
* cultural destinations
* multiple states
* different seasonal suitability
* festivals connected to destinations
* experiences
* food
* nearby destinations

Use clearly marked demo content.

Do not present fake information as verified.

---

# 42. RESPONSIVE DESIGN

Desktop:

* cinematic hero
* rich gallery
* two-column content where appropriate
* nearby discovery sections
* strong editorial layout

Mobile:

* compact hero
* swipe/expand gallery
* stacked content
* sticky or easily accessible Save/Add to Trip actions where appropriate

Do not simply shrink desktop.

---

# 43. PERFORMANCE

Destination pages can be image-heavy.

Use:

* responsive image delivery
* lazy loading
* hero priority loading
* efficient queries
* deferred heavy sections
* caching where appropriate

Do not fetch unrelated nearby data.

---

# 44. LOADING STATES

Use Phase 2 skeleton components.

Create skeletons for:

* Destination cards
* Destination hero
* Gallery
* Snapshot
* Things to Do
* Nearby discoveries
* Festivals
* Experiences

---

# 45. ERROR STATES

Handle:

* destination not found
* missing image
* incomplete data
* missing best-time data
* missing budget
* failed nearby query
* API/database failure

Do not show technical errors.

---

# 46. ANALYTICS

Track:

* destination listing viewed
* destination clicked
* destination page viewed
* seasonal month interaction
* Save
* Visited
* Add to Trip
* View on Map
* nearby destination clicked
* festival clicked
* experience clicked
* food clicked
* gallery opened
* section expanded
* share clicked

Use the existing analytics abstraction.

---

# 47. ADMIN COMPATIBILITY

Ensure destination data can later be managed through CMS.

Admins should eventually be able to:

* create destination
* edit destination
* change location
* manage images
* manage best time
* verify best time
* set budget
* manage tags
* manage nearby relationships
* connect festivals
* connect experiences
* connect food
* feature destination

Do not build the complete CMS now.

---

# 48. DO NOT BUILD YET

Do NOT implement:

* Full recommendation engine
* Advanced search
* Full calendar
* Complete trip planner
* AI itinerary generation
* Live weather
* Booking
* Community reviews
* User-generated content
* Advanced crowd scoring
* Multi-currency
* Multilingual content

---

# 49. TESTING

Run:

* TypeScript
* lint
* tests
* production build

Manually test:

### Destination listing

* Cards
* Seasonal sections
* Hidden destinations
* Responsive layout

### Destination page

* Hero
* Best time
* Alternative time
* Budget
* Gallery
* Things to Do
* Food
* Festivals
* Experiences
* Transport
* Accommodation
* Nearby
* Save
* Visited
* Add to Trip
* View on Map
* Share

### Hidden India

* Hidden destinations
* Hidden festivals
* Hidden experiences
* Navigation

### Mobile

Test all major interactions.

Fix regressions before finishing.

---

# 50. ACCEPTANCE CRITERIA

Phase 5 is complete when:

* `/destinations` is functional.
* Destination cards work.
* Seasonal destination discovery works.
* `/destinations/[slug]` works.
* Permanent destination URLs work.
* Best-time information works.
* Alternative-time information works.
* Budget level works.
* Approximate cost works.
* Gallery works.
* Food relationships work.
* Festival relationships work.
* Experience relationships work.
* Nearby destinations work.
* Transport works.
* Accommodation guidance works.
* Hidden destinations work.
* `/hidden-india` works.
* Save works.
* Visited works.
* Add-to-trip integration exists.
* View-on-map works.
* Sharing works.
* SEO metadata works.
* Structured data is accurate where used.
* Desktop works.
* Mobile works.
* Loading states work.
* Error states work.
* Analytics are wired.
* No earlier phase is broken.
* TypeScript passes.
* Lint passes.
* Production build passes.

---

# 51. FINAL REPORT

When finished, report:

1. Destination data architecture.
2. Seasonal ranking implementation.
3. Best-time implementation.
4. Budget implementation.
5. Festival/destination relationships.
6. Nearby discovery implementation.
7. Hidden India implementation.
8. Map integration.
9. SEO implementation.
10. Analytics implementation.
11. Files created/modified.
12. Tests/checks performed.
13. Limitations or issues.

Do NOT automatically proceed to the next phase.

The next major phase will connect the platform's **search, calendar and seasonal discovery systems** into one unified discovery experience.




--------------------------------------------------------------------------------------------------------------------------------------------------------------------