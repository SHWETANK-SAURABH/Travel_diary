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


# PHASE 6 — SEARCH, CALENDAR & UNIFIED SEASONAL DISCOVERY

You are continuing development of the India travel discovery platform.

Before making changes:

1. Inspect the existing repository.
2. Read `/docs/product-spec.md`.
3. Read `/docs/architecture.md`.
4. Read `/docs/database.md`.
5. Inspect the completed Phase 2 design system.
6. Inspect the completed Phase 3 Living India Map.
7. Inspect the completed Phase 4 Festival Discovery System.
8. Inspect the completed Phase 5 Destination Discovery System.
9. Understand the existing services, database models, components, routes, analytics and conventions.
10. Do NOT rewrite working functionality.
11. Reuse existing components and services.
12. Do NOT create duplicate search, calendar, ranking or map logic.

---

# 1. GOAL

Build the unified discovery layer connecting:

* Universal Search
* Festival Calendar
* Month-based discovery
* Seasonal destinations
* Festival discovery
* Living India Map
* Happening Now
* Upcoming discovery

The core concept is:

# WHERE + WHEN + WHAT

A user should be able to choose a month and immediately understand:

> What is happening in India?

> Where should I go?

> What destinations are especially good?

> What festivals can I experience?

---

# 2. IMPORTANT PRODUCT PRINCIPLE

The map, calendar and discovery pages must feel like parts of one system.

Do NOT build:

* one calendar logic
* separate festival month logic
* separate map month logic
* separate seasonal destination logic

Create shared services/data contracts.

For example:

```text
Selected Month
      ↓
Discovery Context
      ↓
├── Festivals
├── Destinations
├── Map
├── Happening Now
└── Seasonal recommendations
```

---

# 3. DISCOVERY CONTEXT

Create a reusable discovery context/state model.

It should be capable of representing:

* selected month
* selected year
* selected location/state
* selected categories
* active map layers
* search query where relevant

Do not put every UI state into global state.

Persist only useful discovery context.

At minimum:

### Month

### Geographic context

These are the states that should survive relevant navigation.

---

# 4. UNIVERSAL SEARCH

Implement the global search system.

Search across:

* Festivals
* Destinations
* States
* Cities
* Hidden gems
* Experiences
* Food
* Events

Search should be fast and useful.

---

# 5. SEARCH UX

The search interaction should work like:

```text
User clicks Search
        ↓
Search overlay/page
        ↓
Types query
        ↓
Suggestions/results
        ↓
Categorized results
```

Do not immediately navigate to a generic result page for every keystroke.

Use debounced search.

---

# 6. SEARCH RESULTS

Categorize results.

Example:

### Festivals

Hornbill Festival

### Destinations

Kohima

### Experiences

Naga food experience

### Food

Smoked pork

Do not mix everything into one confusing list.

---

# 7. SEARCH RESULT CARD

A result should show:

* image where useful
* name
* type
* location
* short contextual metadata

Do not overload results.

---

# 8. SEARCH RELEVANCE

Search ranking should consider:

1. Exact name match
2. Prefix/name match
3. Location match
4. Tag match
5. Description relevance
6. Popularity
7. Editorial relevance

Do not simply sort alphabetically.

---

# 9. SEARCH TYPO TOLERANCE

Support reasonable typo tolerance if the selected search technology supports it efficiently.

Example:

```text
Munnar
Munaar
Munar
```

should still produce useful results.

Do not build a complex AI spelling correction system.

---

# 10. SEARCH EMPTY STATE

If nothing is found:

Show:

> We couldn't find anything matching "xyz".

Then provide:

* Suggested searches
* Popular destinations
* Popular festivals
* Nearby/seasonal discovery where relevant

Do not show a blank screen.

---

# 11. ZERO-RESULT ANALYTICS

Every zero-result query should be recorded through the analytics system.

Track:

* query
* timestamp
* context if appropriate

Avoid storing unnecessary personal information.

The admin dashboard will later use this to identify content opportunities.

---

# 12. SEARCH ANALYTICS

Track:

* search opened
* query submitted
* result clicked
* result type
* zero-result search
* search refinement

Use the existing analytics abstraction.

---

# 13. SEARCH URL

Search should support shareable/deep-linkable state where practical.

Example:

```text id="ykxqlh"
/search?q=kerala
```

Use URL state where it improves navigation and browser back/forward behavior.

---

# 14. FESTIVAL CALENDAR

Implement:

```text id="8d3ry2"
/calendar
```

The calendar is a core discovery feature.

It should help users understand:

> What is happening across India this year?

---

# 15. CALENDAR DESIGN

Do NOT create a dense traditional office-calendar UI.

Prefer an editorial travel calendar.

The page should have:

### Current month

### Happening Now

### Upcoming

### Browse by month

Use visual festival cards.

---

# 16. MONTH NAVIGATION

Support:

```text id="3hrj9w"
January
February
March
...
December
```

Current year only.

Do not build historical calendar browsing in V1.

---

# 17. MONTH SELECTION

When the user selects a month:

Update the shared discovery context.

This should affect:

* Calendar
* Festival results
* Map
* Seasonal destinations
* Homepage seasonal sections when applicable

Do not create separate month state for each feature.

---

# 18. CALENDAR ↔ MAP

This connection is extremely important.

When the user selects:

> October

on the calendar:

Provide:

> Explore October on Map

When selected:

Open the Living India Map with:

* October selected
* relevant festival data
* relevant destinations
* appropriate geographic context

Do not reload a separate map implementation.

---

# 19. MAP ↔ CALENDAR

The reverse should also work.

If the user selects:

> October

on the map:

They should be able to navigate to:

> View October festivals

which opens the calendar with October selected.

---

# 20. HAPPENING NOW

Implement a reusable service for determining:

> Happening Now

A festival should be considered active if:

```text
current date >= start date
AND
current date <= end date
```

Handle:

* timezone
* missing dates
* expected dates

Do not show festivals with unknown dates as definitely happening.

---

# 21. UPCOMING

Create:

> Upcoming

ranking.

Prioritize festivals that are:

* approaching soon
* relevant to selected month/context
* popular
* unique
* editorially important

Avoid simply sorting by date without context.

---

# 22. FESTIVAL STATUS

Use the existing festival status system:

* Happening Now
* Upcoming
* Past
* Expected Date
* Date Not Announced

Do not create a second status model.

---

# 23. SEASONAL DESTINATIONS

Implement the unified seasonal destination discovery.

When month = X:

Return destinations based on:

* seasonal suitability
* festivals/events
* overall travel quality
* uniqueness
* popularity
* editorial signals

Use the destination ranking service created earlier.

---

# 24. SEASONAL DESTINATION UI

Use one ranked list rather than forcing users into many categories.

Example:

## Best Places to Visit in October

1. Destination A
2. Destination B
3. Destination C
4. Destination D
5. Destination E

Optionally provide lightweight contextual labels such as:

> Great weather

> Festival season

> Ideal for nature

Do not create many complicated filters.

---

# 25. SEASONAL RANKING

For anonymous users:

Use:

* season
* festivals
* events
* travel quality
* uniqueness
* popularity

For personalized users later:

Add:

* interests
* budget
* duration
* traveller count
* travel style
* crowd preference

Do not implement deep personalization yet.

---

# 26. DISCOVERY PAGE

Create a useful unified discovery route if the existing architecture supports it.

For example:

```text id="s5q55n"
/explore
```

The Explore page should act as the gateway to:

* Festivals
* Destinations
* Hidden India
* Seasonal travel
* Calendar
* Map

Do not duplicate content unnecessarily.

---

# 27. EXPLORE PAGE STRUCTURE

Potential structure:

### Discover India

Short editorial introduction.

### Happening Now

Current festivals/events.

### This Month

Seasonal discoveries.

### Best Places This Month

Top destinations.

### Hidden India

Hidden discoveries.

### Explore the Map

CTA to the living map.

### Browse Festivals

CTA.

### Browse Destinations

CTA.

The exact content should be dynamic.

---

# 28. MONTH-SPECIFIC PAGE CONTENT

The system should support a user experience like:

> October in India

with:

* festivals
* destinations
* experiences
* food
* map discovery

Do NOT generate thousands of static SEO pages automatically.

Use real data and meaningful pages only.

---

# 29. SEO

Implement SEO for useful discovery pages.

Potential indexable pages:

* `/festivals`
* `/destinations`
* `/calendar`
* `/hidden-india`
* important content pages

Month pages may become indexable later if content quality is high.

Do not create thin SEO pages for every month/state combination automatically.

---

# 30. INTERNAL LINKING

Connect:

Search
↔ Festival
↔ Destination
↔ Calendar
↔ Map
↔ Hidden India
↔ Explore

The user should always have a logical next discovery.

---

# 31. PERFORMANCE

Search and calendar must remain fast.

Use:

* debouncing
* pagination/infinite loading where appropriate
* server-side queries
* caching
* database indexes

Do not fetch every festival into the browser.

---

# 32. MOBILE EXPERIENCE

Search:

* full-screen/overlay search
* large input
* touch-friendly results

Calendar:

* horizontal month selector
* vertically scrolling discoveries

Explore:

* visually strong sections
* compact cards
* minimal clutter

Map integration should open the existing mobile map experience.

---

# 33. LOADING STATES

Use existing skeleton components.

Create loading states for:

* Search results
* Calendar
* Festival lists
* Seasonal destinations
* Explore sections

---

# 34. ERROR STATES

Handle:

* search failure
* calendar failure
* missing month data
* database failure
* unavailable content

Use existing error components.

---

# 35. ANALYTICS

Track:

### Search

* search opened
* query
* result click
* zero result

### Calendar

* calendar opened
* month selected
* festival clicked
* map CTA clicked

### Explore

* section viewed where appropriate
* discovery clicked
* map CTA
* festival CTA
* destination CTA

Avoid excessive analytics events that provide no meaningful insight.

---

# 36. DO NOT BUILD YET

Do NOT implement:

* Deep personalized recommendation engine
* AI search
* AI itinerary generation
* Full trip planner
* Community
* Reviews
* Booking
* Live weather
* Multilingual content
* Multi-currency

---

# 37. TESTING

Run:

* TypeScript
* lint
* tests
* production build

Manually verify:

### Search

* Search opens
* Typing works
* Debouncing works
* Results are categorized
* Result ranking works
* Zero-result state works
* Search URLs work
* Back navigation works

### Calendar

* Current month
* Month switching
* Happening Now
* Upcoming
* Festival selection
* Map integration

### Seasonal discovery

* Month selection
* Destination ranking
* Festival connections
* Map integration

### Explore

* All major discovery pathways work
* No duplicate/contradictory content
* Mobile and desktop work

Fix all regressions before finishing.

---

# 38. ACCEPTANCE CRITERIA

Phase 6 is complete when:

* Universal search works.
* Search covers all primary content types.
* Search results are categorized.
* Search ranking works.
* Search has useful empty states.
* Zero-result searches are tracked.
* Search analytics are wired.
* `/calendar` works.
* Month navigation works.
* Current year is handled correctly.
* Happening Now works.
* Upcoming works.
* Calendar ↔ Map works.
* Map ↔ Calendar works.
* Seasonal destination ranking works.
* `/explore` works.
* Explore connects the major discovery systems.
* Discovery context is shared.
* Month state is preserved appropriately.
* Desktop works.
* Mobile works.
* SEO foundation is applied.
* Loading states work.
* Error states work.
* Performance is reasonable.
* No earlier phase is broken.
* TypeScript passes.
* Lint passes.
* Production build passes.

---

# 39. FINAL REPORT

When finished, report:

1. Search architecture.
2. Search ranking implementation.
3. Search indexes used.
4. Calendar architecture.
5. Month/discovery context implementation.
6. Happening Now logic.
7. Seasonal destination ranking.
8. Map ↔ Calendar integration.
9. Explore page structure.
10. Analytics implementation.
11. SEO changes.
12. Files created/modified.
13. Tests/checks performed.
14. Remaining limitations.

Do NOT automatically proceed to the next phase.

The next phase will build the **Personalization & Recommendation Engine** using the discovery infrastructure created here.













# PHASE 7 — PERSONALIZATION & RECOMMENDATION ENGINE

You are continuing development of the India travel discovery platform.

Before making changes:

1. Inspect the existing repository.
2. Read `/docs/product-spec.md`.
3. Read `/docs/architecture.md`.
4. Read `/docs/database.md`.
5. Inspect the completed Phase 2 design system.
6. Inspect the completed Phase 3 Living India Map.
7. Inspect the completed Phase 4 Festival Discovery System.
8. Inspect the completed Phase 5 Destination Discovery System.
9. Inspect the completed Phase 6 Search, Calendar and Seasonal Discovery systems.
10. Understand the existing recommendation/ranking abstractions.
11. Do NOT rewrite working functionality.
12. Reuse existing services, database models, UI components and analytics abstractions.

---

# 1. GOAL

Build the first real **Personalization & Recommendation Engine**.

The system should help answer:

> Where should THIS traveller go?

The recommendation system must be:

* useful
* explainable
* lightweight
* deterministic/reproducible where possible
* transparent
* easy to improve later

Do NOT build an AI chatbot.

Do NOT use an LLM to generate recommendations in real time.

The initial recommendation engine should be a structured ranking system using the user's preferences and existing content data.

---

# 2. CORE RECOMMENDATION PRINCIPLE

Recommendations should balance:

### 1. Personal fit

Does this match the traveller?

### 2. Overall travel quality

Is this actually a good destination/festival?

### 3. Uniqueness

Does this provide something distinctive rather than simply being popular?

Do NOT let popularity dominate the system.

---

# 3. PERSONALIZATION MUST BE OPTIONAL

Anonymous users should continue to receive useful recommendations.

Authenticated users can get personalized recommendations.

Never block discovery behind onboarding.

Do NOT force a questionnaire before users can use the platform.

---

# 4. PREFERENCE MODEL

Use the preference architecture from Phase 1.

Support:

### Travel dates

* start date
* end date

### Duration

Number of days.

### Travellers

Number of travellers.

### Budget

Total trip budget.

### Travel style

* Backpacker
* Budget
* Comfortable
* Luxury

### Interests

* History
* Food
* Arts & Culture
* Music
* Nature
* Beaches
* Adventure
* Photography
* Heritage
* Offbeat Travel

### Crowd preference

A continuous preference:

```text
Busy & lively ←────────────→ Quiet & peaceful
```

Store it in a way that can be used numerically by the ranking engine.

---

# 5. PREFERENCE ONBOARDING

Create an optional lightweight onboarding experience.

It should NOT feel like a long form.

Recommended structure:

### Step 1

When are you travelling?

### Step 2

How long?

### Step 3

How many travellers?

### Step 4

Budget

### Step 5

What are you into?

### Step 6

Travel style

### Step 7

Crowd preference

Allow:

> Skip for now

at any point where practical.

---

# 6. ONBOARDING UX

Use the existing design system.

Make the experience:

* visual
* quick
* conversational
* low-friction

Prefer:

* chips
* sliders
* cards
* presets

Avoid:

* giant forms
* complicated dropdowns
* unnecessary fields

---

# 7. BUDGET INPUT

Allow both:

### Presets

Examples:

* ₹10K–₹20K
* ₹20K–₹40K
* ₹40K–₹75K
* ₹75K+

and:

### Custom budget

The system should store a numeric budget.

V1 is INR-only.

---

# 8. DURATION

Provide simple presets such as:

* 2–3 days
* 4–5 days
* 6–7 days
* 8–14 days
* 15+ days

Allow custom duration if useful.

Store the final value numerically.

---

# 9. TRAVELLER COUNT

Allow:

* 1
* 2
* 3–4
* 5+

Store the actual numeric count where possible.

Do not make the UI unnecessarily complex.

---

# 10. INTEREST SELECTION

Use visual interest chips.

Example:

```text id="z7g9w2"
History
Food
Nature
Beaches
Adventure
Photography
Arts & Culture
Music
Heritage
Offbeat
```

Allow multiple selections.

Do not force users to select interests.

---

# 11. TRAVEL STYLE

Use:

```text id="1ihkfz"
Backpacker
Budget
Comfortable
Luxury
```

Use clear descriptions if helpful.

Do not assume travel style from budget alone.

---

# 12. CROWD PREFERENCE

Use a slider:

```text id="odr8ke"
Busy & lively ───────── Quiet & peaceful
```

Convert the selected position into a numeric preference.

The crowd signal should have a **moderate** effect on recommendations.

Do NOT make it dominate the ranking.

---

# 13. RECOMMENDATION TYPES

The engine should support:

### Destination recommendations

### Festival recommendations

### Seasonal recommendations

### Nearby recommendations

Do not build separate ranking systems for each.

Create a shared recommendation architecture.

---

# 14. RECOMMENDATION INPUT

Conceptually:

```ts id="1g1wpl"
RecommendationContext = {
  userPreferences,
  currentMonth,
  selectedLocation,
  travelDates,
  contentType,
  discoveryContext
}
```

Adapt this to the existing architecture.

---

# 15. DESTINATION SCORING

Create a transparent scoring system.

Potential signals:

### Season fit

Does the destination work well during the selected/travel month?

### Budget fit

Does estimated cost fit the user's budget?

### Duration fit

Can the destination realistically work within the user's available days?

### Interest fit

Does it match selected interests?

### Travel style fit

Does it fit the selected travel style?

### Crowd fit

Does it align with the crowd preference?

### Festival/event fit

Are there relevant festivals/events during the user's dates?

### Quality

Overall editorial/travel quality.

### Uniqueness

How distinctive is the destination?

Do not blindly sum arbitrary scores.

Use normalized signals.

Document the scoring model.

---

# 16. FESTIVAL SCORING

Festival recommendations should consider:

* date fit
* month fit
* geographic context
* interests
* travel style
* uniqueness
* popularity
* cultural relevance
* destination fit

Do not recommend a festival simply because it is famous.

---

# 17. SCORE NORMALIZATION

Ensure different signals are normalized to compatible ranges.

For example:

```text id="cbg2ef"
0.0 → poor match
0.5 → moderate match
1.0 → strong match
```

Then combine them using documented weights.

Make weights easy to change.

Do NOT hardcode weights in multiple components.

---

# 18. INITIAL WEIGHTING

Start with a reasonable baseline.

Example conceptual weighting:

```text id="ldz7if"
Personal fit       40%
Season/date fit    20%
Travel quality     15%
Uniqueness         10%
Budget fit          5%
Festival/event fit 5%
Popularity          5%
```

Treat these as initial tunable values, NOT permanent truth.

Document the rationale.

The system should make future experimentation easy.

---

# 19. CROWD PREFERENCE WEIGHT

Crowd preference should be included inside personal fit.

It should have a moderate effect.

Do not allow crowd preference to completely remove otherwise excellent destinations.

For example:

A traveller who prefers quiet places should see fewer crowded destinations, but famous destinations should not automatically disappear.

---

# 20. TOP 5 RECOMMENDATIONS

The primary recommendation experience should return:

# TOP 5

Do not initially show 20–50 recommendations.

The goal is useful curation.

Example:

```text id="fj5c8q"
1. Meghalaya
2. Hampi
3. Sikkim
4. Kerala
5. Spiti
```

The actual output must come from the ranking engine.

---

# 21. EXPLAIN WHY

Every recommendation should include concise reasons.

Example:

> **Meghalaya**
>
> 92% match
>
> ✓ Great for nature
> ✓ Fits your 5-day trip
> ✓ Within your budget
> ✓ Good seasonal conditions

Do not generate these explanations using an LLM.

Generate them from the scoring signals.

---

# 22. MATCH SCORE

Show a match percentage only if it is meaningful.

Example:

> 92% match

The percentage should correspond to the normalized ranking model.

Do not fabricate confidence.

Avoid presenting the score as scientific certainty.

---

# 23. RECOMMENDATION CARD

Create a dedicated recommendation card.

Include:

* image
* destination/festival name
* location
* match score
* 2–4 reasons
* Save
* Explore
* Add to Trip where appropriate

Do not overload the card.

---

# 24. ANONYMOUS RECOMMENDATIONS

Guests should still receive recommendations.

Use:

* month
* season
* festival/event activity
* overall travel quality
* uniqueness
* popularity
* geographic context

Do not display:

> Personalized for you

for anonymous users.

Instead use:

> Best for October

or:

> Worth exploring this month

---

# 25. AUTHENTICATED RECOMMENDATIONS

For users with preferences:

Use:

* budget
* duration
* travellers
* interests
* travel style
* crowd preference
* dates
* season
* festivals/events
* quality
* uniqueness

Label appropriately:

> Recommended for you

---

# 26. PERSONALIZATION FROM BEHAVIOR

Do NOT build a complex machine-learning behavioral model in V1.

However, create the architecture for future signals such as:

* saved destinations
* viewed destinations
* visited destinations
* clicked festivals
* trip additions
* search behavior

For V1, use explicit preferences as the main personalization signal.

Behavioral data can be recorded through analytics for future improvements.

---

# 27. COLD START

New users with no preferences should receive generic recommendations.

Do not return empty recommendation sections.

Fallback:

```text id="11cynv"
Season
+
Festival activity
+
Travel quality
+
Uniqueness
+
Popularity
```

---

# 28. RECOMMENDATION DIVERSITY

Avoid returning five nearly identical destinations.

Example:

Do not return:

* 5 mountain destinations

if the user selected broad interests.

Use lightweight diversity logic.

The Top 5 should have meaningful variety where appropriate.

For example:

* nature
* culture
* food
* heritage
* offbeat

Do not force diversity when the user's interests are extremely narrow.

---

# 29. GEOGRAPHIC DIVERSITY

Avoid returning five destinations from the same small geographic region unless the user's context strongly supports it.

Use geography as a diversity signal.

---

# 30. DUPLICATE PREVENTION

Do not recommend:

* the same destination multiple times
* the same festival multiple times
* duplicate content relationships

Deduplicate before returning results.

---

# 31. CONTEXT-AWARE RECOMMENDATIONS

The engine should support contextual recommendations.

Example:

User is viewing:

> Hornbill Festival

Then recommendations should prioritize:

* nearby destinations
* relevant experiences
* nearby food
* complementary festivals

This is different from homepage recommendations.

Use the same recommendation architecture with different context.

---

# 32. MAP RECOMMENDATIONS

The map should eventually be able to request:

> Best discoveries in this viewport for this user.

For now, integrate with the existing map relevance service.

Do not duplicate map ranking logic.

---

# 33. SEASONAL RECOMMENDATIONS

Reuse the seasonal discovery service from Phase 6.

Personalization should add additional scoring rather than replace seasonal logic.

Conceptually:

```text id="l6q3sc"
Seasonal ranking
        +
Personal fit
        ↓
Personalized seasonal ranking
```

---

# 34. FESTIVAL RECOMMENDATIONS

When the user has travel dates:

Prioritize festivals that actually overlap those dates.

If exact festival dates are not confirmed:

Do not pretend they are confirmed.

Use the existing date-status model.

---

# 35. BUDGET ESTIMATION

Use the existing budget system.

The recommendation engine should compare:

> estimated trip cost

against:

> user budget

Do not make exact financial promises.

Use approximate ranges.

---

# 36. DURATION FIT

Consider whether the destination makes sense within the user's trip duration.

Example:

A destination requiring 10 days should not rank highly for a 3-day trip unless there is a reasonable shorter-trip experience.

Use practical travel fit.

---

# 37. TRAVELLER FIT

Use traveller count/context where meaningful.

Examples:

* solo
* couple
* family/group

Do not over-engineer this in V1.

---

# 38. RECOMMENDATION SERVICE

Create a dedicated service such as:

```text id="4n6q7x"
recommendDestinations(context)
recommendFestivals(context)
recommendNearby(context)
```

The exact architecture is your choice.

Do not place scoring logic inside React components.

---

# 39. CONFIGURABLE WEIGHTS

Recommendation weights should be centrally configurable.

For example:

```text id="r4m0uk"
seasonWeight
budgetWeight
durationWeight
interestWeight
travelStyleWeight
crowdWeight
qualityWeight
uniquenessWeight
popularityWeight
festivalWeight
```

This will later allow admin experimentation.

Do not require code changes for every small weight adjustment if a configuration layer can reasonably support it.

---

# 40. EXPLANATION ENGINE

Create a deterministic explanation system.

Example:

If:

```text
interestMatch > threshold
```

generate:

> Great match for your interest in nature.

If:

```text
budgetFit > threshold
```

generate:

> Fits your budget.

If:

```text
seasonFit > threshold
```

generate:

> Good conditions this month.

Keep explanations concise.

Do not expose raw internal scores.

---

# 41. PERSONALIZATION UI

Create a dedicated preferences/profile experience.

Users should be able to edit:

* dates
* duration
* travellers
* budget
* interests
* travel style
* crowd preference

Changes should update future recommendations.

---

# 42. PREFERENCE EDITING

Do not make users repeat onboarding.

Provide:

> Edit travel preferences

from their profile or discovery experience.

Save changes to the account.

---

# 43. GUEST PREFERENCES

Guests may optionally provide preferences.

Store them locally.

If the guest later creates an account:

### Merge guest preferences into the account.

If there is conflicting account data, use a clear merge strategy and do not silently destroy information.

---

# 44. RECOMMENDATION REFRESH

Allow users to refresh recommendations where useful.

Do not make refresh produce arbitrary random results.

It should recalculate using current:

* preferences
* season
* context
* content

---

# 45. EMPTY / INSUFFICIENT DATA

If there are not enough personalized matches:

Do not show fake percentages.

Fallback to:

> Best this month

using the anonymous ranking system.

---

# 46. ANALYTICS

Track:

* onboarding started
* onboarding completed
* onboarding skipped
* preference changed
* recommendation section viewed
* recommendation clicked
* recommendation saved
* recommendation added to trip
* recommendation dismissed if implemented
* recommendation context
* match score interaction if useful

Do not collect sensitive information unnecessarily.

---

# 47. EXPERIMENTATION FOUNDATION

Structure the recommendation engine so future A/B tests can change:

* weights
* number of results
* card presentation
* explanation style

Do not build a full experimentation platform now.

Create clean configuration boundaries.

---

# 48. PRIVACY

Personalization data should remain private.

Do not expose:

* user preferences
* recommendation scores
* behavioral signals

to other users.

Public shared trips remain separate from private recommendation data.

---

# 49. SECURITY

Validate all preference inputs.

Do not trust client-side recommendation parameters blindly.

Where recommendation queries access user data:

* verify authenticated user
* enforce authorization
* avoid leaking private data

---

# 50. PERFORMANCE

Recommendations should be fast.

Use:

* indexed queries
* precomputed normalized fields where useful
* caching for generic seasonal recommendations
* efficient filtering
* limited result sets

Do not run expensive calculations over the entire database for every page request.

---

# 51. CACHING STRATEGY

Generic recommendations such as:

> Best destinations in October

can be cached.

Personalized recommendations should use appropriate user/context caching.

Do not cache private recommendations in publicly accessible caches.

---

# 52. SEO

Personalized recommendations should NOT create indexable pages.

Do not expose private recommendation state in URLs.

Public seasonal pages can remain indexable if they contain meaningful content.

---

# 53. DESIGN

Use the Phase 2 design system.

Recommendation UI should feel:

* curated
* premium
* useful
* confident but not absolute

Avoid:

* cheesy "AI magic"
* excessive percentages
* fake intelligence language
* huge recommendation grids

The user should feel:

> "This platform understands what I might actually enjoy."

---

# 54. DO NOT BUILD

Do NOT build:

* AI chatbot
* LLM-generated recommendations
* ML training pipeline
* collaborative filtering
* social recommendation graphs
* reviews-based recommendation engine
* booking recommendations
* real-time weather recommendations

Architect for future versions, but keep V1 deterministic.

---

# 55. TESTING

Test at minimum:

### Anonymous

* no preferences
* month only
* location context
* seasonal recommendations

### Personalized

* budget
* duration
* interests
* travel style
* crowd preference
* dates
* traveller count

### Festival

* exact dates
* expected dates
* date not announced

### Diversity

* geographic diversity
* content diversity
* duplicate prevention

### Fallbacks

* insufficient data
* no exact matches
* missing budget
* missing seasonal data

### UI

* onboarding
* preference editing
* recommendation cards
* explanation display
* mobile
* desktop

Run:

* TypeScript
* lint
* tests
* production build

Fix regressions before finishing.

---

# 56. ACCEPTANCE CRITERIA

Phase 7 is complete when:

* Optional preference onboarding works.
* Guests can skip onboarding.
* Guest preferences persist locally.
* Guest preferences can merge into an account.
* Authenticated users can edit preferences.
* Destination recommendations use preferences.
* Festival recommendations use preferences.
* Seasonal recommendations use preferences.
* Anonymous recommendations still work.
* Top 5 recommendations are returned.
* Recommendations have meaningful explanations.
* Match scores are derived from real scoring.
* Scoring weights are configurable.
* Recommendation logic is centralized.
* Diversity is handled.
* Duplicates are prevented.
* Context-aware recommendations work.
* Map integration uses existing relevance architecture.
* Budget fit works.
* Duration fit works.
* Interest fit works.
* Travel style fit works.
* Crowd preference has a moderate effect.
* Festival date fit works.
* Fallback recommendations work.
* Recommendation analytics are wired.
* Private recommendation data is protected.
* Recommendation performance is reasonable.
* Mobile works.
* Desktop works.
* No earlier phase is broken.
* TypeScript passes.
* Lint passes.
* Production build passes.

---

# 57. FINAL REPORT

When finished, report:

1. Preference model.
2. Onboarding flow.
3. Recommendation scoring model.
4. Initial weights.
5. Explanation engine.
6. Diversity logic.
7. Anonymous fallback logic.
8. Guest preference persistence.
9. Account preference persistence.
10. Context-aware recommendation architecture.
11. Caching strategy.
12. Analytics events.
13. Files created/modified.
14. Tests/checks performed.
15. Known limitations.

Do NOT automatically proceed to the next phase.

The next phase will build the **Accounts, Saves, Visited and Guest-to-Account synchronization system** around the personalization foundation.










# PHASE 8 — ACCOUNTS, SAVES, VISITED & GUEST-TO-ACCOUNT SYNC

You are continuing development of the India travel discovery platform.

Before making changes:

1. Inspect the existing repository.
2. Read `/docs/product-spec.md`.
3. Read `/docs/architecture.md`.
4. Read `/docs/database.md`.
5. Inspect the completed Phase 2 design system.
6. Inspect the completed Phase 3 Living India Map.
7. Inspect the completed Phase 4 Festival Discovery System.
8. Inspect the completed Phase 5 Destination Discovery System.
9. Inspect the completed Phase 6 Search/Calendar/Seasonal Discovery system.
10. Inspect the completed Phase 7 Personalization/Recommendation system.
11. Understand the current authentication, user, preference, save and analytics architecture.
12. Do NOT rewrite working systems.
13. Reuse existing services, models, components and design patterns.

---

# 1. GOAL

Build the complete personal account layer.

Users should be able to:

* browse without an account
* optionally create an account
* sign in with email
* sign in with Google
* save festivals
* save destinations
* save experiences
* save food
* mark content as visited
* store travel preferences
* access saved content across devices
* preserve guest data when creating an account

The most important transition is:

# GUEST → ACCOUNT

A guest should never feel that creating an account means starting over.

---

# 2. CORE PRINCIPLE

Authentication is optional.

The website must remain fully useful without an account.

Do NOT:

* block map exploration
* block festival pages
* block destination pages
* block search
* force onboarding
* force signup before saving

When authentication is genuinely required, explain why.

---

# 3. AUTHENTICATION

Support:

### Email authentication

### Google authentication

Use the secure authentication provider/library established during Phase 1.

Do NOT implement custom password hashing or authentication cryptography.

Do NOT add unnecessary authentication methods.

---

# 4. ACCOUNT ENTRY POINTS

Users should be able to access authentication through:

* Profile
* Save when appropriate
* Trip functionality when cloud persistence is useful
* Preference syncing

Avoid intrusive signup popups.

---

# 5. AUTHENTICATION UX

Create polished:

### Sign in

### Create account

### Authentication callback/loading state

### Signed-out state

### Signed-in state

Use the existing design system.

Keep forms minimal.

Do not add unnecessary fields.

---

# 6. EMAIL ACCOUNT

For V1, keep email authentication minimal.

Support:

* email
* password

Do not implement a complex authentication ecosystem.

If the chosen authentication provider naturally handles verification/recovery, integrate it safely where appropriate without making it a major product feature.

---

# 7. GOOGLE LOGIN

Provide:

> Continue with Google

Use the established authentication provider.

Handle:

* success
* cancellation
* failure
* loading

Do not expose technical errors to users.

---

# 8. USER PROFILE

Implement:

```text id="l9g8ys"
/profile
```

The profile should be private.

Show:

* user identity
* travel preferences
* saved content
* visited content
* trips when available
* account settings

Do not create public social profiles.

---

# 9. PROFILE STRUCTURE

Suggested sections:

### Preferences

Edit travel preferences.

### Saved

Saved festivals, destinations and other content.

### Visited

Places/content marked visited.

### Trips

User's trips.

### Account

Authentication/account controls.

Keep navigation simple.

---

# 10. SAVE SYSTEM

Users can save:

* festivals
* destinations
* experiences
* food

Use one unified save system.

Do NOT implement separate unrelated save logic for every content type.

---

# 11. GUEST SAVES

For guests:

Store saved items locally in the browser.

Use the architecture from Phase 1.

The saved state must survive:

* page navigation
* browser refresh
* browser restart where local storage is available

Do not require an account.

---

# 12. ACCOUNT SAVES

For authenticated users:

Save items to the database.

The state must synchronize across devices.

If a user saves something on one device, another authenticated session should eventually see the same saved state.

Use the backend as the source of truth for authenticated users.

---

# 13. SAVE UX

Save action should be consistent everywhere:

* Festival cards
* Festival pages
* Destination cards
* Destination pages
* Map previews
* Recommendation cards
* Search results where appropriate

Use the same interaction pattern.

---

# 14. SAVE STATES

Support:

### Unsaved

♡ Save

### Saved

♥ Saved

Use an accessible label in addition to visual iconography.

Do not rely solely on color.

---

# 15. OPTIMISTIC SAVE

For authenticated users, use optimistic UI where safe.

Example:

User taps:

> Save

The UI immediately reflects:

> Saved

Then synchronize with backend.

If backend fails:

* revert state
* show a useful error

Do not leave the UI in a false state.

---

# 16. DUPLICATE PREVENTION

A user should not be able to create duplicate saves for the same content.

Enforce this at the database level.

Do not rely only on frontend checks.

---

# 17. VISITED SYSTEM

Users can mark:

> Visited

for relevant content.

At minimum:

* destinations
* festivals
* experiences

Use one consistent visited system.

---

# 18. VISITED UX

Use:

> Mark as Visited

and:

> Visited

states.

Allow users to undo it.

Do not require:

* visit date
* review
* notes
* photos

in V1.

---

# 19. GUEST VISITED

Guests may optionally mark items as visited locally.

If they create an account later:

Merge visited state into the account.

---

# 20. GUEST PREFERENCES

Guests may have preferences from Phase 7.

Store them locally.

Examples:

* budget
* duration
* travellers
* interests
* travel style
* crowd preference
* travel dates

Do not require preferences.

---

# 21. GUEST → ACCOUNT MERGE

This is the most important part of the phase.

When a guest creates an account:

Automatically merge:

### Saved content

### Visited content

### Travel preferences

### Relevant local trip data if already supported

Do NOT require the user to recreate their data manually.

---

# 22. MERGE STRATEGY

The merge must be deterministic.

For saves:

```text id="m2cg8a"
local save + existing server save
        ↓
one saved record
```

For visited:

```text id="b9op2y"
local visited + server visited
        ↓
visited = true
```

For preferences:

If both local and account preferences exist:

* preserve account values where explicitly configured
* merge local values that are missing
* avoid silently overwriting meaningful account preferences

Document the exact strategy.

---

# 23. MERGE SAFETY

The merge operation must be:

* authenticated
* idempotent
* transactional where appropriate

If the merge is retried, it should not create duplicates.

---

# 24. MERGE FAILURE

If part of the merge fails:

Do not silently lose guest data.

Use a safe strategy such as:

* transactional backend merge
* retryable operation
* clear client state only after successful synchronization

Do not delete local data before the server confirms successful merge.

---

# 25. LOCAL STORAGE DESIGN

Use a structured local-storage namespace.

For example:

```text id="swy2o9"
travelDiary:guest:saves
travelDiary:guest:visited
travelDiary:guest:preferences
travelDiary:guest:trip
```

Use a versioned structure so the local schema can evolve.

Do not scatter raw `localStorage.setItem()` calls throughout the application.

Create a dedicated persistence abstraction.

---

# 26. ACCOUNT DATA SOURCE OF TRUTH

For authenticated users:

### Server/database = source of truth

For guests:

### Local browser storage = source of truth

After authentication:

### Database becomes source of truth

Keep this distinction clear.

---

# 27. SESSION MANAGEMENT

Use the existing authentication solution.

Handle:

* signed out
* signed in
* loading
* expired session
* logout

Do not expose sensitive authentication information to the client unnecessarily.

---

# 28. LOGOUT

Provide:

> Log out

When logging out:

* server session ends
* account state clears appropriately
* do not accidentally delete the user's cloud saves
* guest/local state should remain separate

Do not automatically convert account data back into guest data unless explicitly designed.

---

# 29. PROFILE PREFERENCES

Allow users to edit:

* Travel dates
* Duration
* Traveller count
* Budget
* Interests
* Travel style
* Crowd preference

Reuse Phase 7 components.

Do not duplicate onboarding components.

---

# 30. SAVED CONTENT PAGE

Create a useful saved-content experience inside profile.

Group content into:

* Festivals
* Destinations
* Experiences
* Food

Use tabs or a clean segmented navigation.

Do not create four completely separate pages unless justified.

---

# 31. VISITED PAGE

Provide a simple visited view.

Show:

* content image
* name
* location/type
* visited state

Do not build a social travel journal yet.

---

# 32. EMPTY STATES

Create useful empty states.

### No saves

> Your discoveries will appear here.

CTA:

> Explore India

### No visited places

> Places you've explored will appear here.

CTA:

> Discover destinations

### No preferences

> Tell us what you love to travel for.

CTA:

> Set preferences

---

# 33. AUTHENTICATED SAVE INTEGRATION

Ensure saved state is correctly reflected across:

* Festival cards
* Festival pages
* Destination cards
* Destination pages
* Map previews
* Recommendation cards
* Search results

Do not allow stale UI to remain after save/unsave.

---

# 34. MAP INTEGRATION

The map must use the same save/visited services.

Do not create map-specific save storage.

When the user saves a map discovery:

* guest → local
* authenticated → server

---

# 35. RECOMMENDATION INTEGRATION

Recommendations should know whether content is already:

* saved
* visited

Avoid repeatedly recommending items the user has explicitly marked as visited unless context makes it useful.

Do not completely exclude saved items automatically.

---

# 36. FESTIVAL INTEGRATION

Festival cards/pages must correctly display:

* Save state
* Visited state

Do not duplicate the logic.

---

# 37. DESTINATION INTEGRATION

Destination cards/pages must correctly display:

* Save state
* Visited state

Reuse existing components.

---

# 38. ACCOUNT SECURITY

Protect:

* profile
* saves
* visited data
* preferences

A user must only be able to access their own private account data.

Do not trust client-provided user IDs.

Derive authenticated identity from the server-side session.

---

# 39. DATABASE CONSTRAINTS

Enforce appropriate uniqueness.

For example:

```text id="8z9f0e"
(userId, contentType, contentId)
```

for saves.

Use appropriate indexes for:

* user saves
* visited
* preferences
* trips later

---

# 40. API SECURITY

Every private endpoint must:

1. authenticate the user
2. authorize the requested operation
3. validate input
4. prevent access to another user's data

Do not expose database internals.

---

# 41. RATE LIMITING / ABUSE

Do not build a massive security platform.

But protect authentication and account mutation endpoints against obvious abuse where practical.

Use provider/platform capabilities where possible.

---

# 42. PRIVACY

Private user data should remain private.

Do not expose:

* preferences
* saved content
* visited content
* recommendation state

through public pages.

Public trip sharing is a separate feature and comes later.

---

# 43. ANALYTICS

Track useful account events:

* signup started
* signup completed
* login
* logout
* guest save
* authenticated save
* unsave
* visited
* unvisited
* guest-to-account merge
* preference updated

Do not collect unnecessary personal data.

---

# 44. ERROR HANDLING

Handle:

* login failure
* Google login failure
* save failure
* unsave failure
* visited failure
* preference save failure
* merge failure
* expired session
* network failure

Provide clear user-facing feedback.

Never expose stack traces.

---

# 45. PERFORMANCE

Avoid fetching the entire saved database on every page.

Use:

* targeted queries
* batching
* caching where appropriate
* efficient indexes

For example, a festival listing should be able to determine saved state efficiently for the current user.

Do not issue one API call per card.

---

# 46. RESPONSIVE DESIGN

Desktop:

* profile sidebar or tab navigation
* content grids

Mobile:

* stacked sections
* horizontal tabs where appropriate
* touch-friendly controls

Keep account pages simple and functional.

---

# 47. SEO

Profile and saved pages should NOT be publicly indexable.

Use appropriate:

* noindex
* robots behavior
* private route handling

Public content pages remain indexable.

---

# 48. TESTING

Test the complete lifecycle.

### Guest

1. Browse.
2. Save festival.
3. Save destination.
4. Mark destination visited.
5. Refresh.
6. Close/reopen browser where possible.
7. Confirm local state remains.

### Account

1. Create account.
2. Save content.
3. Refresh.
4. Log out.
5. Log in again.
6. Confirm saves remain.
7. Edit preferences.
8. Confirm preferences persist.

### Guest → Account

1. As guest, save multiple items.
2. Mark items visited.
3. Set preferences.
4. Create account.
5. Confirm everything merges.
6. Refresh.
7. Confirm cloud data exists.
8. Repeat merge/retry scenario.
9. Confirm no duplicates.

### Security

Test that a user cannot access another user's:

* saves
* preferences
* visited data

### Responsive

Test desktop and mobile.

Run:

* TypeScript
* lint
* tests
* production build

Fix regressions before finishing.

---

# 49. ACCEPTANCE CRITERIA

Phase 8 is complete when:

* Email authentication works.
* Google authentication works.
* Authentication is optional.
* Profile works.
* Preferences can be edited.
* Saves work for guests.
* Saves work for accounts.
* Visited works for guests.
* Visited works for accounts.
* Saved content is persistent.
* Visited content is persistent.
* Guest data survives refresh.
* Guest data survives browser restart where supported.
* Guest data merges automatically into an account.
* Guest saves do not duplicate server saves.
* Guest visited data merges correctly.
* Guest preferences merge correctly.
* Merge is idempotent.
* Merge does not lose local data.
* Authenticated data is private.
* Save state is consistent across the application.
* Map uses the same save architecture.
* Festival pages use the same save architecture.
* Destination pages use the same save architecture.
* Recommendation cards use the same save state.
* Empty states work.
* Error states work.
* Analytics are wired.
* Mobile works.
* Desktop works.
* No previous phase is broken.
* TypeScript passes.
* Lint passes.
* Production build passes.

---

# 50. FINAL REPORT

When finished, report:

1. Authentication provider/architecture.
2. Guest persistence architecture.
3. Account persistence architecture.
4. Guest-to-account merge strategy.
5. Merge failure/retry behavior.
6. Save model.
7. Visited model.
8. Preference synchronization.
9. Security/authorization approach.
10. Analytics events.
11. Files created/modified.
12. Tests/checks performed.
13. Any remaining limitations.

Do NOT automatically proceed to the next phase.

The next phase will build the **Trip Planner**, using the saved/visited/account infrastructure created here.



# PHASE 9 — TRIP PLANNER & ITINERARY BUILDER

You are continuing development of the India travel discovery platform.

Before making changes:

1. Inspect the existing repository.
2. Read `/docs/product-spec.md`.
3. Read `/docs/architecture.md`.
4. Read `/docs/database.md`.
5. Inspect the completed Phase 2 design system.
6. Inspect the completed Phase 3 Living India Map.
7. Inspect the completed Phase 4 Festival Discovery System.
8. Inspect the completed Phase 5 Destination Discovery System.
9. Inspect the completed Phase 6 Search/Calendar/Seasonal Discovery system.
10. Inspect the completed Phase 7 Personalization/Recommendation system.
11. Inspect the completed Phase 8 Accounts/Saves/Visited system.
12. Understand the existing Trip, User, Save, Location and Map architecture.
13. Do NOT rewrite working functionality.
14. Reuse existing services, models, components and design patterns.

---

# 1. GOAL

Build the first complete **Trip Planner**.

The user should be able to go from:

```text
Discover
   ↓
Save
   ↓
Add to Trip
   ↓
Organize
   ↓
Build itinerary
   ↓
View on map
   ↓
Share
```

The trip planner should be useful without attempting to become a full booking platform.

---

# 2. CORE PRODUCT PHILOSOPHY

The trip planner should feel:

* simple
* visual
* flexible
* map-connected
* low friction

It should NOT feel like:

* a spreadsheet
* a project management tool
* a complicated booking dashboard

The user should be able to create a useful itinerary quickly.

---

# 3. GUEST TRIPS

Guests should be able to create trips locally.

Do NOT force account creation to start planning.

Guest trip data should use the local persistence architecture from Phase 8.

When a guest creates an account:

### Merge the local trip into their account.

---

# 4. ACCOUNT TRIPS

Authenticated users should be able to:

* create trips
* edit trips
* delete trips
* duplicate trips
* add/remove items
* reorder items
* change dates/days
* view itinerary
* view map
* share public trips

Private trips remain private by default.

---

# 5. TRIP ROUTES

Implement:

```text
/trips
/trips/[id]
```

Optional creation flow:

```text
/trips/new
```

Use the routing conventions already established.

---

# 6. TRIP LIST PAGE

Create a clean trip dashboard.

Show:

* Trip name
* Destination/region
* Dates
* Number of days
* Number of itinerary items
* Estimated budget
* Last updated

Actions:

* Open
* Edit
* Duplicate
* Delete

Do not overload the dashboard.

---

# 7. EMPTY STATE

If there are no trips:

> Your next adventure starts here.

Provide:

> Create a trip

and:

> Explore India

Do not show an empty grid.

---

# 8. CREATE TRIP

Minimum fields:

* Trip name
* Start date
* End date
* Optional destination/region
* Optional budget
* Optional travellers

Do not make unnecessary fields mandatory.

---

# 9. TRIP DURATION

Calculate:

```text
end date - start date
```

Store the actual itinerary duration.

Validate:

* end >= start
* reasonable date range

Do not allow malformed date ranges.

---

# 10. TRIP ITEMS

Trip items can reference:

* Destination
* Festival
* Experience
* Food
* Event

Use the existing normalized content system.

Do NOT copy entire content records into trips.

Store references.

---

# 11. ITINERARY STRUCTURE

A trip should support:

```text
Trip
 ├── Day 1
 │    ├── Destination
 │    ├── Experience
 │    └── Food
 │
 ├── Day 2
 │    ├── Festival
 │    ├── Experience
 │    └── Destination
 │
 └── Day 3
      └── ...
```

Every item should have:

* day
* order
* content reference
* location
* optional notes for future use

---

# 12. DAY MANAGEMENT

Users should be able to:

* add days
* remove days where appropriate
* rename/label days if useful
* move items between days

Do not allow invalid itinerary states.

For example:

If a trip has 3 days, an item cannot silently remain on Day 5.

---

# 13. DRAG AND DROP

Implement drag-and-drop/reordering where it improves UX.

Support:

* reorder within day
* move item between days

Use an accessible implementation.

Do not make drag-and-drop the only way to reorder.

Provide accessible alternative controls.

---

# 14. ADD TO TRIP

The following surfaces should be able to add content:

* Festival page
* Destination page
* Experience
* Food
* Map preview
* Recommendation card

When the user clicks:

> Add to Trip

If they have existing trips:

Show:

> Add to existing trip

If no trip exists:

Offer:

> Create a trip

---

# 15. GUEST ADD TO TRIP

Guests should be able to:

1. Create local trip.
2. Add destinations/festivals.
3. Reorder itinerary.
4. Continue browsing.

Do not interrupt the flow with login prompts.

---

# 16. MULTIPLE TRIPS

Users may have multiple trips.

Examples:

* Kerala October
* Northeast 2027
* Rajasthan Weekend

Do not assume one active trip per user.

---

# 17. ACTIVE TRIP

Allow the user to have a currently selected/active trip context.

For example:

> Add to Trip

can default to:

> Kerala October

But the user must be able to choose another trip.

Do not make active-trip state mandatory globally.

---

# 18. ITINERARY VIEW

The primary trip page should show:

### Trip header

* name
* dates
* destination
* budget

### Day-by-day itinerary

Each day:

* date
* items
* empty state
* add item action

---

# 19. ITINERARY ITEM CARD

Show:

* image
* name
* type
* location
* optional date
* remove
* move
* map action

Keep the card compact.

---

# 20. MAP VIEW

Every trip should have a map view.

Display:

* itinerary locations
* route order
* day grouping
* geographic distribution

Use the existing map architecture.

Do NOT build a second map system.

---

# 21. MAP ↔ ITINERARY

Users should be able to:

### Click itinerary item

→ map centers on item.

### Click map item

→ itinerary item becomes highlighted.

### Change itinerary order

→ map reflects the new order where appropriate.

Maintain synchronization.

---

# 22. ROUTE VISUALIZATION

V1 does NOT require turn-by-turn routing.

If practical, display:

* ordered connection lines
* geographic sequence

Do NOT pretend lines represent actual driving routes unless a routing service is used.

If no routing provider exists:

Use simple itinerary sequence visualization.

---

# 23. LOCATION VALIDATION

When adding content to a trip:

Use the content's existing geographic data.

Do not allow arbitrary fake coordinates.

If content has approximate location:

Preserve approximate precision.

---

# 24. TRIP BUDGET

Use the destination budget system.

The trip should calculate an approximate budget.

Consider:

* destinations
* duration
* traveller count
* destination cost levels

Do not present estimates as guaranteed prices.

Use ranges.

---

# 25. BUDGET DISPLAY

Example:

```text
Estimated trip budget

₹18K – ₹25K
```

Breakdown can eventually include:

* Stay
* Transport
* Food
* Experiences

V1 may show only a high-level estimate.

Do not build expense tracking yet.

---

# 26. FESTIVAL DATE INTEGRATION

If a festival is added to a trip:

Check whether the itinerary dates overlap with the festival dates.

If there is a conflict:

Show a useful warning.

Example:

> This festival is outside your current trip dates.

Do not silently modify trip dates.

---

# 27. EXPECTED FESTIVAL DATES

If a festival date is expected rather than confirmed:

Do not show:

> Confirmed conflict

Instead communicate uncertainty.

Example:

> Festival dates are not confirmed yet.

Use the existing festival date-status system.

---

# 28. DESTINATION DURATION

Do not automatically assume a destination requires a fixed number of days unless the data model provides such information.

The trip planner can initially allow users to organize items manually.

Later recommendation systems can suggest duration.

---

# 29. SMART SUGGESTIONS

Create a lightweight suggestion layer.

While planning, show:

> You might also like

based on:

* nearby destinations
* festivals
* experiences
* food

Use the existing recommendation/nearby services.

Do NOT automatically add anything to the itinerary.

---

# 30. EMPTY DAY

If a day has no items:

Show:

> Nothing planned yet.

Actions:

* Add from Saved
* Explore nearby
* Search
* Browse map

Do not make the planner feel broken.

---

# 31. ADD FROM SAVED

Users should be able to add existing saved items directly to a trip.

Example:

```text
Saved
  ↓
Select
  ↓
Add to Day
```

Do not duplicate saved content.

---

# 32. DISCOVERY FROM TRIP

The planner should provide lightweight discovery.

For example:

> Near your Day 2 plans

Show:

* nearby destination
* experience
* food
* festival

Use geographic relevance.

Keep suggestions limited.

---

# 33. REMOVE ITEM

Removing an itinerary item must NOT delete:

* saved state
* content
* visited state

It only removes the item from the trip.

---

# 34. DELETE TRIP

Deleting a trip must NOT delete:

* saved content
* visited content
* account
* preferences

Only the trip is deleted.

For destructive actions, require confirmation.

---

# 35. DUPLICATE TRIP

Allow users to duplicate a trip.

The duplicate should:

* create a new trip ID
* copy itinerary structure
* copy trip metadata
* not create duplicate content records
* remain independent afterward

---

# 36. TRIP VISIBILITY

Default:

> Private

Support:

### Private

Only owner.

### Public

Anyone with the shared link can view.

Do NOT make trips discoverable through a public directory in V1.

---

# 37. PUBLIC TRIP PAGE

For public trips, create a read-only view.

Potential route:

```text
/trips/[id]/share
```

or an equivalent canonical sharing route.

The shared page should show:

* trip name
* dates
* itinerary
* locations
* map
* approximate budget if appropriate

Do NOT expose private user data.

---

# 38. SHARING

Allow:

* copy link
* native share where available

For public trips:

The shared link should work without authentication.

Private trips should not be accessible through the public link.

---

# 39. SECURITY

Every private trip operation must:

1. authenticate user
2. authorize ownership
3. validate input
4. prevent access to another user's trip

Never trust:

```text userId
```

from the client.

Use authenticated server identity.

---

# 40. GUEST TRIP SECURITY

Guest trips remain local.

Do not expose guest trip data through public APIs.

---

# 41. GUEST → ACCOUNT TRIP MERGE

When a guest creates an account:

Merge:

* trip
* itinerary
* metadata

If the account already has a trip with the same name:

Do not silently overwrite it.

Use a deterministic strategy.

For example:

> Kerala October (Imported)

or another clear approach.

Document the strategy.

---

# 42. MERGE SAFETY

Trip merge should be:

* idempotent
* retry-safe
* authenticated
* transactional where appropriate

Do not delete local trip data before successful server synchronization.

---

# 43. TRIP PERSISTENCE

Guest:

```text
local browser storage
```

Authenticated:

```text
database
```

Use the existing persistence abstraction.

Do not scatter localStorage calls throughout the UI.

---

# 44. TRIP DATA MODEL

Review the existing Phase 1 schema.

Ensure it supports:

* trips
* trip items
* day
* order
* content reference
* location
* visibility
* metadata

If schema changes are required, create proper migrations.

Do NOT destroy existing trip data.

---

# 45. ITINERARY ORDERING

Use a robust ordering strategy.

Do not depend on fragile array indexes if the database needs independent updates.

The implementation should support frequent reordering without corrupting the itinerary.

---

# 46. CONCURRENT EDITS

V1 does not require real-time collaborative editing.

However:

Do not silently overwrite newer server data if the same user has multiple tabs open.

Use a reasonable last-write/update strategy.

Document limitations.

---

# 47. ANALYTICS

Track:

* trip created
* trip opened
* item added
* item removed
* item reordered
* day changed
* trip duplicated
* trip deleted
* map opened
* suggestion clicked
* trip shared
* share link copied
* guest trip merged
* trip budget viewed

Do not track sensitive trip details unnecessarily.

---

# 48. SEO

Private trips:

* noindex
* protected

Public trips:

* indexability can be enabled if content is meaningful
* use canonical URLs
* dynamic Open Graph metadata

Do not expose private trip content through search engines.

---

# 49. PERFORMANCE

Trip pages should remain responsive with:

* many itinerary items
* multiple days
* map rendering

Use:

* efficient database queries
* optimistic UI where safe
* batched updates
* debounced saves where appropriate

Do not send the entire trip object on every small reorder if avoidable.

---

# 50. MOBILE EXPERIENCE

Mobile should be a first-class experience.

Recommended structure:

```text
Trip header
    ↓
Day selector
    ↓
Itinerary
    ↓
Add item
    ↓
Map
```

Use:

* bottom sheets
* sticky actions where useful
* touch-friendly reorder controls

Do not force desktop drag-and-drop patterns onto mobile.

---

# 51. DESKTOP EXPERIENCE

Desktop can support:

```text
┌──────────────────────────────────────────┐
│ Trip Header                              │
├──────────────────────┬───────────────────┤
│ Itinerary            │ Map               │
│                      │                   │
│ Day 1                │                   │
│ Day 2                │                   │
│ Day 3                │                   │
└──────────────────────┴───────────────────┘
```

Keep the map visible without making it dominate the planner.

---

# 52. DESIGN

Use the existing Phase 2 design system.

The trip planner should feel like an extension of the travel discovery experience.

Avoid:

* spreadsheet appearance
* enterprise dashboard styling
* excessive controls
* clutter
* dense tables

---

# 53. ACCESSIBILITY

Support:

* keyboard navigation
* accessible buttons
* alternative reorder controls
* semantic day/item structure
* focus management
* readable contrast
* reduced motion

Drag-and-drop must not be the only interaction.

---

# 54. ERROR HANDLING

Handle:

* trip not found
* unauthorized trip
* invalid dates
* failed save
* failed reorder
* failed merge
* network failure
* deleted content
* missing location

Do not expose stack traces.

---

# 55. DELETED/UNAVAILABLE CONTENT

If a content item referenced by a trip is later removed:

Do not crash the trip.

Show:

> This discovery is no longer available.

Allow the user to remove it.

Preserve the rest of the itinerary.

---

# 56. TESTING

Test:

### Guest

1. Create trip.
2. Add destination.
3. Add festival.
4. Add experience.
5. Reorder.
6. Move item between days.
7. Refresh.
8. Reopen browser.
9. Confirm persistence.

### Account

1. Create trip.
2. Add items.
3. Edit dates.
4. Reorder.
5. Duplicate.
6. Delete.
7. Log out.
8. Log back in.
9. Confirm persistence.

### Guest → Account

1. Create trip as guest.
2. Add multiple items.
3. Create account.
4. Confirm trip merges.
5. Retry merge.
6. Confirm no duplicates.
7. Confirm local data isn't lost.

### Festival conflicts

Test:

* confirmed festival date
* expected festival date
* unknown date

### Sharing

Test:

* private trip
* public trip
* shared link
* unauthorized access

### Map

Test:

* itinerary → map
* map → itinerary
* reorder → map update

### Responsive

Test desktop, tablet and mobile.

Run:

* TypeScript
* lint
* tests
* production build

Fix all regressions before finishing.

---

# 57. ACCEPTANCE CRITERIA

Phase 9 is complete when:

* `/trips` works.
* Trips can be created.
* Guests can create local trips.
* Authenticated users can create cloud trips.
* Trip metadata works.
* Trip duration works.
* Multiple trips work.
* Trip items work.
* Destinations can be added.
* Festivals can be added.
* Experiences can be added.
* Food/events can be added where supported.
* Day-by-day itinerary works.
* Items can be reordered.
* Items can move between days.
* Accessible reorder controls exist.
* Save state remains independent from trip state.
* Visited state remains independent.
* Trip budget estimate works.
* Festival date conflicts work.
* Expected-date uncertainty works.
* Map integration works.
* Itinerary ↔ map synchronization works.
* Nearby suggestions work.
* Saved content can be added.
* Empty days work.
* Trips can be duplicated.
* Trips can be deleted safely.
* Private trips are protected.
* Public trips can be shared.
* Guest trips merge into accounts.
* Merge is idempotent.
* Merge does not lose data.
* Mobile works.
* Desktop works.
* Loading states work.
* Error states work.
* Analytics are wired.
* SEO/privacy behavior is correct.
* No previous phase is broken.
* TypeScript passes.
* Lint passes.
* Production build passes.

---

# 58. FINAL REPORT

When finished, report:

1. Trip data architecture.
2. Guest trip persistence.
3. Account trip persistence.
4. Guest-to-account merge strategy.
5. Itinerary ordering implementation.
6. Day management.
7. Map integration.
8. Budget estimation.
9. Festival date conflict handling.
10. Public/private sharing architecture.
11. Security/authorization.
12. Analytics.
13. Files created/modified.
14. Tests/checks performed.
15. Known limitations.

Do NOT automatically proceed to the next phase.

The next phase will build the **Admin CMS & Content Operations system**, which will allow the platform's festival, destination, experience, food and geographic content to be managed without editing code.


# PHASE 10 — ADMIN CMS & CONTENT OPERATIONS

You are continuing development of the India travel discovery platform.

Before making changes:

1. Inspect the existing repository.
2. Read `/docs/product-spec.md`.
3. Read `/docs/architecture.md`.
4. Read `/docs/database.md`.
5. Inspect the completed Phase 2 design system.
6. Inspect the completed Phase 3 Living India Map.
7. Inspect the completed Phase 4 Festival Discovery System.
8. Inspect the completed Phase 5 Destination Discovery System.
9. Inspect the completed Phase 6 Search/Calendar/Seasonal Discovery system.
10. Inspect the completed Phase 7 Personalization/Recommendation system.
11. Inspect the completed Phase 8 Accounts/Saves/Visited system.
12. Inspect the completed Phase 9 Trip Planner.
13. Understand all existing content models and relationships.
14. Do NOT rewrite working functionality.
15. Reuse existing services, components, database models and validation logic.

---

# 1. GOAL

Build the first production-quality **Admin CMS & Content Operations system**.

The purpose is to allow authorized administrators to manage the platform's content without editing source code.

Admins should be able to manage:

* Festivals
* Festival dates/events
* Destinations
* Experiences
* Food
* Locations
* Media
* Categories
* Tags
* Featured content
* Verification status
* Seasonal recommendations
* Content relationships

The CMS should be functional but intentionally simple.

It is an internal tool, not a public-facing product.

---

# 2. CORE PRINCIPLE

The public product should remain:

> Editorial + curated + trustworthy.

The CMS should make maintaining that quality easy.

Do NOT build an enterprise CMS with hundreds of configuration screens.

Prioritize the workflows that are actually needed to maintain the travel platform.

---

# 3. ADMIN ACCESS

Admin routes:

```text id="p1n1y5"
/admin
/admin/festivals
/admin/destinations
/admin/experiences
/admin/food
/admin/locations
/admin/media
/admin/categories
/admin/tags
/admin/verification
```

Additional routes can be created if needed.

---

# 4. SECURITY

Admin access must be server-side protected.

Do NOT rely on:

```text id="k9k1vw"
if (user.role === "admin")
```

only in frontend code.

Every admin API/server action must independently verify:

1. Authentication
2. Admin authorization
3. Input validation

A normal user must never be able to call admin mutations.

---

# 5. ADMIN ROLE

V1 requires:

### Admin

One administrative role.

Do not build complex:

* editor roles
* reviewer roles
* permissions matrix
* organization roles

unless the existing architecture already supports them.

However, design the authorization layer so roles can expand later.

---

# 6. ADMIN DASHBOARD

Implement:

```text id="f7w3d2"
/admin
```

The dashboard should provide a useful overview.

Potential metrics:

* Total festivals
* Total destinations
* Total experiences
* Total food items
* Content needing verification
* Festivals with missing dates
* Content missing images
* Recent updates
* Zero-result search opportunities where available

Do not build meaningless vanity metrics.

---

# 7. CONTENT OPERATIONS

The admin should be able to quickly identify:

### What needs attention?

Examples:

* Missing festival date
* Expected festival date
* Missing location
* Missing image
* Missing description
* Unverified content
* Stale verification
* Broken relationships

This is more valuable than a generic dashboard.

---

# 8. FESTIVAL CMS

Implement:

```text id="4y9d3s"
/admin/festivals
```

Support:

* list
* search
* filter
* create
* edit
* preview
* archive/delete where safe

Do not hard-delete content if relationships make that unsafe.

Prefer an archive/unpublished state if appropriate.

---

# 9. FESTIVAL FORM

Allow editing:

### Basic

* Name
* Slug
* Description
* Category
* Classification

### Location

* State
* Region
* City
* Coordinates
* Location precision

### Dates

* Current-year start
* Current-year end
* Date status

### Content

* Story
* What to expect
* Transport
* Accommodation
* Food relationships
* Experience relationships

### Media

* Hero image
* Gallery

### Taxonomy

* Tags
* Traveller-fit tags

Do not create one enormous form.

Use logical sections/tabs.

---

# 10. FESTIVAL DATE STATUS

Admin must be able to set:

* Confirmed
* Expected
* Date not announced

If an expected date becomes confirmed:

Admin can update it.

Do not automatically overwrite dates without a clear workflow.

---

# 11. FESTIVAL VERIFICATION

Support:

* Verification status
* Source
* Last verified
* Confidence
* Reviewer/admin
* Notes if appropriate

This information is primarily internal.

Do not expose internal notes publicly.

---

# 12. FESTIVAL RELATIONSHIPS

Admins should be able to connect a festival with:

* Destination
* Location
* Experiences
* Food
* Nearby festivals

Use searchable relationship selectors.

Do NOT require admins to enter IDs manually.

---

# 13. DESTINATION CMS

Implement:

```text id="9z5h7q"
/admin/destinations
```

Support:

* list
* search
* filter
* create
* edit
* preview
* archive

---

# 14. DESTINATION FORM

Support:

### Basic

* Name
* Slug
* Description
* Destination type
* Hidden/public classification

### Location

* State
* Region
* City
* Coordinates
* Precision

### Seasonal

* Best time
* Alternative good time
* Explanation

### Budget

* Budget level
* Approximate trip range

### Content

* Overview
* Things to do
* Transport
* Accommodation
* Travel tips

### Relationships

* Festivals
* Experiences
* Food
* Nearby destinations

### Media

* Hero
* Gallery

### Taxonomy

* Tags

---

# 15. BEST-TIME MANAGEMENT

Admins should be able to:

* review system suggestion
* verify recommendation
* override recommendation
* mark as unavailable/unknown

The public site should use the correct effective value.

Do not destroy the original system suggestion when an admin overrides it.

Preserve the distinction between:

### System suggestion

and

### Admin decision

---

# 16. EXPERIENCE CMS

Implement:

```text id="2ax1gd"
/admin/experiences
```

Support:

* create
* edit
* archive
* search
* categories
* tags
* location
* media
* relationships

Keep the interface simpler than Festival/Destination CMS.

---

# 17. FOOD CMS

Implement:

```text id="9u6v01"
/admin/food
```

Support:

* create
* edit
* archive
* search
* region
* location
* tags
* media
* destination relationships
* festival relationships

---

# 18. LOCATION CMS

Implement:

```text id="gj7e8y"
/admin/locations
```

Allow admins to manage:

* State/UT
* Region
* City
* geographic hierarchy
* coordinates
* location precision
* geographic identifiers

Do NOT allow arbitrary hierarchy corruption.

Use validation.

---

# 19. GEOGRAPHIC DATA

For states and geographic boundaries:

Do not let admins manually edit geographic polygon geometry through a normal text field.

Boundary data should remain controlled.

Admins should primarily manage:

* labels
* metadata
* associated content

---

# 20. MEDIA CMS

Implement:

```text id="w9q1cc"
/admin/media
```

Support:

* upload/reference
* preview
* alt text
* ordering
* metadata
* association with content

Use the media architecture from Phase 1.

Do not store large binary files directly in PostgreSQL.

Use the configured storage/CDN architecture.

---

# 21. MEDIA VALIDATION

When uploading/referencing images:

Validate:

* file type
* reasonable size
* dimensions where appropriate

Do not trust file extensions alone.

If the current storage provider supports safe image transformation, use it.

---

# 22. ALT TEXT

Make alt text manageable.

For meaningful content images:

Require or strongly encourage useful alt text.

Do not use:

> image.jpg

as alt text.

---

# 23. CATEGORIES

Implement category management where appropriate.

Support:

* Festival categories
* Destination types
* Experience categories
* Food categories

Do not allow uncontrolled duplicate category names.

---

# 24. TAGS

Implement tag management.

Support:

* create
* rename
* archive
* search

Do not allow accidental duplicate tags due to casing/spacing differences.

Normalize appropriately.

---

# 25. FEATURED CONTENT

Admins should be able to mark content as:

> Featured

This can influence:

* Homepage
* Explore
* Festival discovery
* Destination discovery

Do not hardcode featured IDs in source code.

---

# 26. EDITORIAL PRIORITY

If the product supports editorial ranking, allow a simple priority mechanism.

Example:

```text id="d9s4u3"
Priority: 1–100
```

Do not create a complex editorial scheduling system yet.

---

# 27. PUBLISHING STATE

Content should support:

* Draft
* Published
* Archived

Only published content should appear publicly.

Draft content must never accidentally appear on public pages.

---

# 28. PREVIEW

Admins should be able to preview content before publishing.

Preview should show approximately how the content will appear publicly.

Do not expose drafts to search engines.

---

# 29. SLUG MANAGEMENT

Slugs should be:

* unique
* URL-safe
* stable

If a published slug changes:

Do not blindly break the old URL.

Where practical, create a redirect strategy.

Do not create duplicate canonical pages.

---

# 30. VALIDATION

Admin forms must validate:

* required fields
* slug format
* date consistency
* geographic data
* relationships
* media
* budget ranges

Do not rely only on frontend validation.

Validate on the server.

---

# 31. DATE VALIDATION

For festivals:

Ensure:

```text id="e1x8y9"
end date >= start date
```

Prevent impossible dates.

Do not allow invalid current-year records.

---

# 32. CONTENT QUALITY CHECKS

Create basic automated checks for:

### Festival

* missing date
* missing location
* missing hero image
* missing description

### Destination

* missing best time
* missing location
* missing hero
* missing description

### Experience/Food

* missing name
* missing location/category
* missing image where required

Surface these in the admin dashboard.

---

# 33. VERIFICATION QUEUE

Create:

```text id="t7n5u8"
/admin/verification
```

Show content requiring attention.

Possible queues:

* Missing dates
* Expected dates
* Unverified content
* Stale verification
* Missing images
* Missing relationships

Allow admins to open the relevant edit page directly.

---

# 34. STALE CONTENT

Use the verification metadata from Phase 1.

Define a reasonable stale threshold.

Do not invent a false "accuracy" guarantee.

The dashboard should communicate:

> Needs review

rather than:

> Incorrect

unless verified.

---

# 35. AUDIT LOG

Create an internal audit log.

Track:

* admin
* action
* entity type
* entity ID
* timestamp
* meaningful change metadata

Examples:

```text id="8y3i8s"
Admin updated festival date
Admin published destination
Admin changed destination best-time recommendation
Admin archived experience
```

Do not store unnecessary sensitive data.

---

# 36. CHANGE HISTORY

For critical fields such as:

* festival dates
* location
* destination best time
* publishing state

preserve enough change history to understand what happened.

Do not build a full Git-like versioning system.

---

# 37. BULK OPERATIONS

V1 may support limited bulk operations:

* publish
* archive
* assign category
* assign tags

Do not build complex bulk editing for every field.

---

# 38. SEARCH

Admin search should support:

* name
* slug
* location
* category
* status

Use efficient server-side search.

Do not load all content into the browser.

---

# 39. FILTERS

Useful filters:

### Festival

* category
* status
* date status
* verification
* published/draft

### Destination

* type
* hidden/public
* verification
* published/draft

### General

* missing content
* recently updated
* stale

Keep filters practical.

---

# 40. RELATIONSHIP MANAGEMENT

Relationship selectors should support:

* search
* selection
* removal
* preview

For example:

Destination:

```text
Festivals
[Hornbill Festival ×]
[Add festival]
```

Do not make admins navigate across multiple pages just to create basic relationships.

---

# 41. CONTENT PREVIEW

Provide:

> Preview

for important content.

Preview should use the same public components where practical.

Avoid maintaining two separate rendering systems.

---

# 42. ADMIN DESIGN

The CMS should be visually consistent with the product but can be more utilitarian.

Prioritize:

* clarity
* speed
* information density
* easy editing

Do NOT make it look like the consumer homepage.

---

# 43. ADMIN NAVIGATION

Use a simple sidebar:

```text id="4v3m2c"
Dashboard

Content
├── Festivals
├── Destinations
├── Experiences
├── Food
├── Locations

Media

Taxonomy
├── Categories
├── Tags

Verification

Settings
```

Keep it simple.

---

# 44. RESPONSIVE

The CMS should work on desktop.

Mobile should remain usable but is not the primary target.

Do not spend excessive time making complex admin tables perfect on mobile.

---

# 45. ERROR HANDLING

Handle:

* unauthorized access
* failed save
* validation error
* upload failure
* relationship failure
* database failure
* stale data/conflict

Provide useful feedback.

Never expose stack traces.

---

# 46. SECURITY

Protect against:

* unauthorized admin mutations
* IDOR
* malicious file uploads
* invalid relationships
* forged client IDs
* privilege escalation

Server-side authorization is mandatory.

---

# 47. ANALYTICS

Admin actions are primarily operational rather than product analytics.

Use audit logs for admin activity.

Do not send every admin action to public analytics unless there is a clear reason.

---

# 48. SEO

All admin routes must be:

* protected
* noindex
* unavailable to anonymous users

Draft/preview pages must not accidentally become indexable.

---

# 49. PERFORMANCE

Admin pages should:

* paginate lists
* query server-side
* avoid loading thousands of records
* batch relationships where appropriate

Do not fetch the entire database into the browser.

---

# 50. DATABASE SAFETY

When modifying content:

* use transactions for multi-table mutations
* respect foreign keys
* handle deletion carefully
* prefer archive when appropriate

Do not cascade-delete important content accidentally.

---

# 51. PUBLIC PRODUCT INTEGRATION

After CMS changes:

Public pages should immediately or eventually reflect:

* updated festival data
* updated destination data
* updated images
* changed relationships
* featured content
* published/unpublished status

Do not duplicate content in separate CMS-only storage.

The database remains the source of truth.

---

# 52. CACHE INVALIDATION

If the public site uses caching:

When admins publish/update content:

Invalidate the relevant cached pages/data.

For example:

Festival update:

```text
festival page
festival listing
calendar
map
search
nearby content
```

Do not purge the entire site unnecessarily.

Use targeted invalidation where practical.

---

# 53. SEED / DEMO DATA

Ensure the CMS works with the existing demo dataset.

Do not hardcode demo records into admin UI.

---

# 54. DO NOT BUILD YET

Do NOT build:

* multi-admin organization management
* complex workflow approvals
* automated web scraping
* AI content generation
* automatic fact verification
* booking management
* user moderation
* community management
* advanced analytics dashboards

Those can come later.

---

# 55. TESTING

Test:

### Authorization

* anonymous cannot access admin
* normal user cannot access admin
* admin can access admin

### Festivals

* create
* edit
* publish
* archive
* update dates
* update location
* update relationships
* verification

### Destinations

* create
* edit
* publish
* archive
* best-time override
* budget
* relationships

### Media

* upload/reference
* validation
* alt text
* association

### Taxonomy

* create
* edit
* duplicate prevention

### Verification

* queue
* update
* resolve issue

### Audit

* actions recorded
* meaningful changes traceable

### Public integration

* published content appears
* draft content does not appear
* updates propagate
* cached content invalidates correctly

Run:

* TypeScript
* lint
* tests
* production build

Fix all regressions.

---

# 56. ACCEPTANCE CRITERIA

Phase 10 is complete when:

* `/admin` works.
* Admin authentication/authorization works.
* Normal users cannot access admin.
* Festival CMS works.
* Destination CMS works.
* Experience CMS works.
* Food CMS works.
* Location CMS works.
* Media management works.
* Categories work.
* Tags work.
* Featured content works.
* Draft/published/archived states work.
* Preview works.
* Festival date management works.
* Destination best-time management works.
* Verification queue works.
* Content quality checks work.
* Audit log works.
* Critical change history works.
* Relationship management works.
* Search/filter/pagination work.
* Validation works server-side.
* Security checks work.
* Public content reflects CMS changes.
* Cache invalidation works where applicable.
* Admin routes are protected/noindex.
* Desktop works.
* Mobile remains usable.
* No previous phase is broken.
* TypeScript passes.
* Lint passes.
* Production build passes.

---

# 57. FINAL REPORT

When finished, report:

1. Admin architecture.
2. Authorization model.
3. CMS entities supported.
4. Publishing workflow.
5. Verification workflow.
6. Media architecture.
7. Relationship management.
8. Audit log implementation.
9. Cache invalidation strategy.
10. Security controls.
11. Files created/modified.
12. Tests/checks performed.
13. Remaining limitations.

Do NOT automatically proceed to the next phase.

The next phase will focus on **Analytics, Content Intelligence and Product Observability**, using the events and operational data collected across the platform.


