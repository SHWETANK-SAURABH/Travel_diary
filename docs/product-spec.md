# PHASE 1 — Project Foundation & Architecture

You are building a production-quality India travel discovery platform.

The product vision is documented in:

`/docs/product-spec.md`

If that file does not exist yet, create it from the product requirements provided in this prompt and treat it as the source of truth for the project.

## IMPORTANT

Do NOT try to build the entire product in this phase.

This phase is ONLY about establishing the technical foundation and architecture.

Do not build the full homepage, interactive India map, festival UI, destination UI, recommendation engine, trip planner, or advanced CMS yet.

The architecture must, however, be designed so all of those features can be added without major rewrites.

---

# 1. FIRST: INSPECT THE REPOSITORY

Before changing anything:

1. Inspect the entire existing repository.
2. Identify whether a project already exists.
3. Identify the current framework, package manager, dependencies, folder structure, database setup, environment configuration, and existing components.
4. Check whether there is existing code that should be preserved.
5. Do NOT blindly overwrite existing files.
6. If this is an empty repository, initialize the project cleanly.

Explain briefly what you found before implementing.

---

# 2. PRODUCT CONTEXT

The product is a complete India travel discovery platform built around three pillars:

### DISCOVER

Festivals, destinations, hidden gems, food and experiences.

### EXPLORE

A living interactive map of India that changes based on month, location and discovery layers.

### PLAN

Optional personal trip planning.

The major differentiator is:

# THE LIVING MAP OF INDIA

The map must eventually connect:

India
→ State
→ City/Region
→ Festival/Destination
→ Experience
→ Trip

The map is not a decorative component. It is a core product system.

---

# 3. CHOOSE THE TECH STACK

If the repository does not already have an appropriate stack, use a modern production-ready stack optimized for:

* SEO
* map performance
* scalability
* maintainability
* development speed
* reasonable V1 cost

Preferred direction:

### Frontend

Next.js + TypeScript

Use the current stable version available in the environment.

### Styling

Tailwind CSS

Create a reusable design system rather than scattering styles throughout components.

### Database

PostgreSQL.

The data is highly relational, including:

Festival ↔ Location
Festival ↔ Destination
Festival ↔ Event
Destination ↔ Experience
Destination ↔ Food
Destination ↔ Festival
User ↔ Saved Content
User ↔ Trips
Trip ↔ Locations

Use a PostgreSQL-compatible ORM such as Prisma or another well-maintained option if there is a strong reason.

The architecture must support geospatial data efficiently.

Prefer PostGIS/geospatial support where appropriate.

### Authentication

Use a mature authentication solution that supports:

* Email authentication
* Google authentication

Do not implement custom authentication cryptography.

### Map

Choose a map technology based on:

* Custom styling
* India geographic boundaries
* vector rendering
* clustering
* performance
* cost
* future scalability

Do not automatically default to Google Maps.

The map architecture must support future:

* state boundaries
* city locations
* festival locations
* destination locations
* layers
* clustering
* month filtering
* viewport-based loading

### Media

Use an architecture compatible with:

* object storage
* CDN delivery
* responsive images
* image optimization

Do not hardcode the application around local image files.

### Deployment

Choose an architecture that can start cheaply but scale later.

---

# 4. CREATE THE PROJECT ARCHITECTURE

Create a clean modular architecture.

The exact folder structure can be chosen based on the framework, but conceptually separate:

```text
src/
├── app/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── map/
│   ├── festivals/
│   ├── destinations/
│   ├── trips/
│   └── discovery/
├── features/
│   ├── festivals/
│   ├── destinations/
│   ├── map/
│   ├── search/
│   ├── recommendations/
│   ├── trips/
│   ├── users/
│   ├── analytics/
│   └── admin/
├── lib/
│   ├── db/
│   ├── auth/
│   ├── geo/
│   ├── search/
│   ├── recommendations/
│   ├── media/
│   └── analytics/
├── types/
└── config/
```

Do not blindly copy this structure if a better framework-native structure exists.

The important requirement is modularity.

Avoid creating one giant `utils` file or giant components.

---

# 5. DATABASE DESIGN

Design the database before building UI.

Create a normalized schema capable of supporting the future product.

At minimum model these entities:

## User

Fields should support:

* id
* name
* email
* authentication provider information
* preferences
* createdAt
* updatedAt

Preferences should support:

* travel dates
* budget
* duration
* traveller count
* travel style
* crowd preference
* interests

Do not make these preferences mandatory.

---

## Location

Create a geographic hierarchy supporting:

```text
India
├── State / Union Territory
│   ├── Region
│   │   └── City
│   │       ├── Festival
│   │       ├── Destination
│   │       └── Experience
```

Store geographic coordinates where appropriate.

The system must support approximate vs precise locations.

---

## Festival

Design fields for:

* id
* slug
* name
* description
* category
* popularity classification
* status
* location
* coordinates
* start date
* end date
* duration
* recurring information
* current-year information
* expected/confirmed date status
* images
* tags
* traveller-fit tags
* createdAt
* updatedAt

Do not hardcode festival categories into application logic.

Use database-backed categories or a flexible taxonomy.

Initial categories:

* Regional Cultural Festivals
* Harvest Festivals
* Food Festivals
* Arts & Music Festivals
* Modern / Local Festivals

Initial popularity labels:

* Popular
* Hidden
* Local/Emerging

---

## Festival Year/Event Record

Although the public product uses one permanent festival page, the database should be able to associate festival information with the current year's event occurrence.

Design this carefully.

We need to support:

* festival recurrence
* current-year dates
* confirmed dates
* expected dates
* date not announced
* AI suggested dates
* admin verified dates

Do NOT build historical public festival archives in this phase.

---

## Destination

Support:

* id
* slug
* name
* description
* location
* coordinates
* best time
* alternative good time
* best-time explanation
* budget level
* approximate cost
* images
* tags
* createdAt
* updatedAt

Best-time recommendations must be able to be:

* system suggested
* admin verified
* admin overridden

---

## Experience

Support:

* id
* name
* description
* location
* category
* tags
* images
* related destinations
* related festivals

Keep this extensible.

---

## Food

Support:

* id
* name
* description
* region
* location
* images
* related destinations
* related festivals
* tags

---

## Event

Support:

* id
* name
* date
* location
* event type
* related festival
* related destination

---

## Media

Do not tightly couple media to one content type.

Design a reusable media relationship system.

Support:

* image URL/reference
* alt text
* type
* metadata
* ordering
* associated content

---

## Saved Content

Users should eventually be able to save:

* festivals
* destinations
* experiences
* food

Design this polymorphically or using a clean relational strategy.

---

## Visited Content

Users can mark:

* festival
* destination
* experience

as visited.

V1 only requires a simple visited state.

Do NOT add visit dates, notes or reviews yet.

---

## Trip

Support:

* user
* name
* visibility
* estimated budget
* days
* itinerary items
* geographic locations
* createdAt
* updatedAt

Do not build the trip UI yet.

---

## Trip Item

Support:

* day
* order
* content reference
* location
* optional notes for future use

---

## Tags / Interests

Create an extensible tagging system.

Initial interests can include:

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

Do not hardcode these throughout the frontend.

---

## Verification

Create internal models/fields for:

* source
* verification status
* last verified
* confidence
* reviewer
* change tracking

These are internal CMS fields.

They should not be prominently exposed to public users.

---

# 6. RELATIONSHIPS

Make sure the schema can support:

```text
Festival
├── Location
├── Destination
├── Event
├── Experience
├── Food
└── Nearby content

Destination
├── Location
├── Festival
├── Experience
├── Food
└── Nearby destination

User
├── Preferences
├── Saved content
├── Visited content
└── Trips

Trip
└── Trip items
```

The exact database implementation is your decision.

Prioritize correctness and scalability.

---

# 7. GEOSPATIAL ARCHITECTURE

This is extremely important.

The future map will need:

* geographic bounding-box queries
* nearby content
* clustering
* state/city hierarchy
* exact locations
* approximate locations
* viewport-based loading

Design the geographic data model so we can later query:

> "Give me all festivals/destinations visible inside this map viewport."

Do NOT design the application around loading all geographic data into the browser.

The future map must use server-side/efficient geographic queries.

---

# 8. API / SERVER ARCHITECTURE

Create clear service boundaries for future APIs.

At minimum establish patterns for:

```text
Festival Service
Destination Service
Location/Geo Service
Search Service
Recommendation Service
Trip Service
User Service
Media Service
Analytics Service
Admin Service
```

Do not necessarily implement every service yet.

Create the architecture/interfaces necessary for them.

Avoid unnecessary microservices.

A modular monolith is preferred for V1 unless the existing repository has a strong reason for something else.

---

# 9. ROUTING ARCHITECTURE

Establish clean routes for the future product.

At minimum prepare:

```text
/
 /explore
 /map
 /festivals
 /festivals/[slug]
 /destinations
 /destinations/[slug]
 /hidden-india
 /calendar
 /search
 /trips
 /trips/[id]
 /profile
 /admin
```

Do not build all pages yet.

Create only the minimum route structure needed for the foundation.

Festival URLs must support:

```text
/festivals/hornbill-festival
```

Destination URL structure can be selected based on the best long-term SEO approach.

---

# 10. DESIGN SYSTEM FOUNDATION

Create the basic design system now.

The visual direction is:

* Premium
* Modern Indian
* Vibrant
* Sophisticated
* Editorial
* Exploratory

Do NOT make it look like a generic SaaS dashboard.

Avoid:

* excessive gradients
* excessive glassmorphism
* excessive rounded cards
* clutter
* childish travel-app aesthetics

Create reusable:

* typography
* spacing
* buttons
* inputs
* badges
* cards
* navigation
* panels
* modal/bottom sheet foundations
* loading states
* skeleton states

The map and festival sections can later develop their own personality while remaining within the same design system.

---

# 11. RESPONSIVE FOUNDATION

Prioritize:

* Desktop
* Mobile

Tablet should remain functional.

Create responsive layout primitives.

Do not simply shrink desktop components for mobile.

The future map must support:

Desktop:

* map + side panel

Mobile:

* map + bottom sheet

---

# 12. STATE MANAGEMENT

Choose a sensible state strategy.

Separate:

### Server state

Database/content/API information.

### UI state

Map selection, open panels, filters, etc.

### Local guest state

Guest saves and trip information.

### Account state

Cloud-synced saved content and preferences.

Do not introduce a massive global state system unless justified.

---

# 13. GUEST PERSISTENCE

Architect guest persistence now.

Guest users must eventually be able to:

* save content
* build trips

without an account.

Use browser-local persistence.

When they eventually create an account, the system must support:

### Automatic merge of local guest data into their account.

Do not implement the complete UI yet.

Just establish the architecture.

---

# 14. AUTHENTICATION FOUNDATION

Prepare authentication for:

* Email
* Google

Authentication should be optional.

Do not force account creation for browsing.

Do not implement advanced authentication features yet.

Use secure established libraries/providers.

Never implement password hashing/authentication primitives manually.

---

# 15. SEARCH FOUNDATION

V1 search will be normal search, not AI search.

Design the content model so universal search can eventually search:

* festivals
* destinations
* cities
* states
* experiences
* food
* events
* hidden gems

Do not build the search UI yet.

Prepare appropriate searchable fields and database indexes.

---

# 16. RECOMMENDATION FOUNDATION

Do not build the recommendation UI yet.

However, design the data model so recommendations can use:

* budget
* duration
* traveller count
* travel style
* crowd preference
* interests
* season
* festivals/events
* overall travel quality
* uniqueness

The recommendation engine will eventually return:

### Top 5 recommendations

and explain why each result matches.

---

# 17. ANALYTICS FOUNDATION

Create a clean analytics abstraction.

Eventually track:

* page views
* festival views
* destination views
* map interactions
* map marker clicks
* map zoom
* state exploration
* search queries
* zero-result searches
* saves
* trip creation
* recommendation clicks

Do not tightly couple the entire codebase to one analytics provider.

Create a service/adapter abstraction.

---

# 18. ADMIN FOUNDATION

Prepare the architecture for a CMS/admin system.

V1 will have one admin role.

Admin will eventually manage:

* festivals
* destinations
* events
* food
* experiences
* locations
* images
* verification
* featured content

Do not build the entire admin dashboard in this phase.

Establish the route protection and data model foundations.

---

# 19. SEO FOUNDATION

SEO is a major product requirement.

Prepare the architecture for:

* dynamic metadata
* canonical URLs
* sitemap
* robots
* Open Graph
* structured data
* indexable festival pages
* indexable destination pages
* clean URLs

Do not generate fake SEO pages.

Only real content entities should become indexable pages.

---

# 20. SEED DATA

Create a small, clearly marked demo/seed dataset.

It should demonstrate:

* multiple Indian states
* famous festivals
* niche festivals
* famous destinations
* hidden destinations
* multiple categories
* locations
* dates
* nearby relationships

Do not pretend demo data is verified production data.

Clearly mark seed/demo content internally.

Keep seed data easy to replace.

---

# 21. ENVIRONMENT CONFIGURATION

Create a safe environment variable structure.

For example:

```text
DATABASE_URL=
AUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MAP_PROVIDER_KEY=
MEDIA_STORAGE_KEY=
ANALYTICS_KEY=
```

Only include variables actually required by the selected stack.

Create:

`.env.example`

Never commit secrets.

---

# 22. DOCUMENTATION

Create:

```text
/docs/product-spec.md
/docs/architecture.md
/docs/database.md
/docs/development.md
```

Document:

* architecture
* major decisions
* database relationships
* local setup
* environment variables
* development commands
* future map architecture

Keep documentation concise and useful.

---

# 23. CODE QUALITY

Use:

* TypeScript strictness
* reusable components
* meaningful names
* modular services
* clear types
* validation
* error handling
* database constraints
* indexes where appropriate

Avoid:

* `any` everywhere
* giant components
* duplicated business logic
* hardcoded festival data in UI
* hardcoded categories throughout components
* giant global state
* unnecessary abstractions

---

# 24. DO NOT BUILD YET

Do NOT implement these fully in Phase 1:

* Full interactive India map
* Homepage
* Festival UI
* Destination UI
* Search UI
* Calendar UI
* Recommendation UI
* Trip builder UI
* Full CMS
* Community
* Reviews
* AI travel assistant
* Booking
* Live weather
* Offline support

Only establish the architecture required for them.

---

# 25. VERIFICATION

After implementation:

1. Run TypeScript checks.
2. Run linting.
3. Run tests if configured.
4. Run database migration/validation.
5. Run the production build.
6. Fix all errors.
7. Check that the application starts cleanly.
8. Verify environment configuration.
9. Verify no secrets are committed.
10. Verify the database schema is coherent.

Do not finish with a broken build.

---

# 26. ACCEPTANCE CRITERIA

Phase 1 is complete only when:

* The project starts successfully.
* The chosen stack is documented.
* Database schema exists.
* Migrations work.
* Seed data can be loaded.
* Core entity relationships exist.
* Authentication architecture exists.
* Guest persistence architecture exists.
* Routing foundation exists.
* Design system foundation exists.
* Geospatial architecture is prepared.
* API/service boundaries are clear.
* Analytics abstraction exists.
* Admin architecture is prepared.
* SEO foundation is prepared.
* `.env.example` exists.
* Documentation exists.
* Type checking passes.
* Linting passes.
* Production build passes.

Most importantly:

### Do not sacrifice architectural quality just to produce visible UI in this phase.

The goal of Phase 1 is to create a foundation that allows us to build the **Living Map of India** and the rest of the travel platform without major rewrites.

When finished, provide:

1. A concise summary of what was implemented.
2. The chosen tech stack and why.
3. The final project structure.
4. The database entities and key relationships.
5. Any architectural decisions that may affect future phases.
6. Commands to run the project.
7. Tests/checks performed.
8. Any remaining issues or decisions that need attention.

Do not proceed to Phase 2 automatically.























