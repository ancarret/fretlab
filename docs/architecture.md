# Architecture

## Shape

```
┌──────────────┐     HTTP/JSON      ┌──────────────────┐     JDBC      ┌──────────────┐
│  Angular 22  │ ─────────────────► │  Spring Boot 4.1 │ ────────────► │ PostgreSQL 18│
│  :4200       │                    │  :8080           │               │  :5432       │
└──────────────┘                    └──────────────────┘               └──────────────┘
  presentation                       domain + API                       persistent state
```

One deployable backend, one frontend bundle, one database.

## Where logic lives

This is the single most important rule in the project, because getting it wrong would quietly turn
FretLab into a CRUD app with a clever UI.

| Kind of logic | Home | Example |
| --- | --- | --- |
| Canonical musical rules | Java domain | `C major = C E G`; `string 5, fret 3 = C` |
| Persistent user/application state | PostgreSQL | a recorded exercise attempt |
| Presentation and interaction | Angular | SVG coordinates, selection state, animations |

Angular may compute presentational geometry. It must never compute what a note *is*. Duplicating a
musical rule in TypeScript creates a second source of truth that will drift from the backend.

## Backend module structure

A **modular monolith** organised by business capability:

```
com.fretlab
├── FretlabBackendApplication
├── system/                 operational endpoints (health)
├── shared/
│   ├── config/             typed configuration, CORS, OpenAPI
│   └── error/              error codes, global exception handler
├── theory/                 note, interval, chord, scale, fretboard — see ADR-2; key planned
├── learning/
│   ├── practice/           backend-generated fretboard/interval challenges
│   └── progress/           exercise attempts and mastery, derived by query — see Phase 10 in
│                           roadmap.md; lesson, exercise planned
├── auth/                   JWT issuing/verification, Spring Security config — see ADR-8
└── user/                   the `User` entity and its repository
```

Every class under `theory` is plain Java with zero Spring annotations. `theory/web` is the only
package in the module that knows HTTP exists, which is what lets the domain be unit-tested without
starting a Spring context.

Inside a module, use `domain`, `service`, `repository`, `controller` and `dto` **only when the
module is complex enough to need them**. A module with three classes gets three classes, not five
folders. Architecture should reflect complexity, not ceremony.

Two rules hold regardless of size:

- Controllers contain no business logic and never expose JPA entities — requests and responses are
  DTOs, preferably records.
- Domain logic does not depend on HTTP or on persistence frameworks.

## Frontend structure

```
src/app/
├── core/          app-wide singletons: API services, layout pieces
├── features/      one folder per route, lazily loaded
└── shared/        reusable components (fretboard, page header)
```

Standalone components, signals for local state, `OnPush` change detection throughout. Angular 22
runs zoneless, so state that the template reads is held in signals rather than plain fields.

Design tokens live in `src/styles/_tokens.scss` as CSS custom properties. Components reference
tokens and never hardcode a colour or spacing value, so theming is a token swap — the dark theme
(`prefers-color-scheme: dark`) is exactly that, redefining surface and ink tokens only.

`core/i18n` holds the English/Spanish runtime switch: every component takes translation *keys*, not
display strings, and renders them through a `translate` pipe backed by a signal — the same pattern
as the dark theme, a lookup swap rather than a rewrite. Note names and chord/scale/interval names
sourced from the backend are translated by a small dictionary keyed on their stable `id`, never on
the API's own English text, so the UI language and the wire format stay independent of each other.

Visual direction: a luthier's notebook rather than a SaaS dashboard. Warm paper surfaces, a serif
display face (Fraunces) over a neutral sans (Instrument Sans), hierarchy from rules and type instead
of shadows, and a single vermilion accent. The fretboard is drawn as the instrument — rosewood,
bone nut, nickel frets — and its tokens stay the same in both themes. Musical-role colours are
never the only cue: the root marker is also a different shape, and every marker carries a label.

## Configuration

Twelve-factor: one `application.yml` with environment variables overriding every deployment-specific
value. No profile proliferation — a profile is added when it solves a real problem, not by default.

```yaml
spring.datasource.url: ${FRETLAB_DB_URL:jdbc:postgresql://localhost:5432/fretlab}
fretlab.cors.allowed-origins: ${FRETLAB_CORS_ALLOWED_ORIGINS:http://localhost:4200}
```

Committed defaults are local-development values only, never production credentials. Real secrets
arrive as environment variables; `.env` is git-ignored and `.env.example` documents its shape.

The application version reaches runtime through Maven resource filtering (`@project.version@`), so
the deployed build is identifiable from `/api/health` and from the OpenAPI document.

---

# Decision records

## ADR-1 — Modular monolith, not microservices

**Decision.** One Spring Boot application, internally split by business capability.

**Why.** FretLab has one user base, one database and one deployment cadence. Microservices would
add network calls, distributed transactions and operational overhead to solve coordination problems
the project does not have. Splitting a domain before its boundaries are understood produces a
distributed monolith — the worst of both.

**Alternative.** Microservices per module. Reasonable if modules needed independent scaling or
separate teams. Neither applies.

**Revisit when.** A module needs a genuinely different scaling profile or release cycle. Module
boundaries are already drawn, so extraction stays possible.

## ADR-2 — Music theory is computed in Java, not stored in PostgreSQL

**Decision.** No `chords`, `scales` or `intervals` tables. The domain derives them.

**Why.** Music theory is generative. A major triad is a root plus the formula `1–3–5`; a major
scale is a tonic plus `W W H W W W H`. Storing every chord in every key means thousands of rows
that encode one rule each, cannot answer a question the seed data did not anticipate, and turn a
formula bug into a data migration. Computing them makes the rules explicit, unit-testable and
the source of generated exercises.

**Alternative.** Seed the database with precomputed theory. Faster to start, but it makes the
backend a lookup table and eliminates the part of this project worth building.

**Consequence.** The database stores only what genuinely persists: accounts, attempts, progress,
mastery.

## ADR-3 — The fretboard is SVG

**Decision.** Render the neck as inline SVG rather than canvas or DOM elements.

**Why.** Every fret position must be individually interactive, styleable and reachable by keyboard
and screen readers. SVG elements are real DOM nodes: they accept CSS custom properties, focus
outlines, `aria-label` and event bindings. They also scale to any viewport without redrawing.

**Alternative.** Canvas — faster for thousands of shapes, but it is a single opaque element with no
accessibility and manual hit-testing. A six-string, 24-fret neck is ~150 shapes; SVG is nowhere near
its performance limits.

**Known gap.** Every position is currently its own tab stop. A roving-tabindex grid with arrow-key
navigation is the intended improvement once the component leaves prototype status.

## ADR-4 — Errors follow RFC 9457 Problem Details

**Decision.** Error bodies are `application/problem+json`, extended with a FretLab `code` and
`timestamp`.

```json
{
  "type": "about:blank",
  "title": "Not Found",
  "status": 404,
  "detail": "No endpoint matches this request.",
  "instance": "/api/nope",
  "code": "RESOURCE_NOT_FOUND",
  "timestamp": "2026-09-18T12:00:16.250Z"
}
```

**Why.** RFC 9457 is the standard for HTTP error payloads and Spring models it natively as
`ProblemDetail`. Inventing a bespoke envelope means clients cannot reuse existing tooling. The two
extra members cover what the standard leaves open: a stable machine-readable `code` that clients
branch on independently of the HTTP status, and a `timestamp` for correlating with logs.

**Implementation note.** `GlobalExceptionHandler` extends `ResponseEntityExceptionHandler` rather
than catching `Exception` broadly. That keeps Spring's own status mapping — an unsupported media
type stays a 415 instead of collapsing into a 500 — while `handleExceptionInternal` gives one place
to decorate every response.

## ADR-5 — Flyway owns the schema; Hibernate only validates it

**Decision.** `spring.jpa.hibernate.ddl-auto: validate`, with all schema changes as versioned
Flyway migrations.

**Why.** `ddl-auto: update` infers schema changes from entity diffs. It cannot express a data
migration, cannot be reviewed before it runs, silently skips destructive changes, and produces a
different schema depending on which version of the code touched the database first. Migrations are
ordered, reviewable files that run identically everywhere. `validate` then turns any drift between
entities and schema into a startup failure rather than a runtime surprise.

**Alternative.** Liquibase — equally valid; Flyway's plain-SQL migrations are simpler to read and
review.

## ADR-6 — CORS is configured, not wildcarded

**Decision.** Allowed origins come from configuration and default to `http://localhost:4200`. An
empty list disables CORS entirely.

**Why.** In development Angular (`:4200`) and Spring Boot (`:8080`) are different origins, so the
browser requires explicit permission. `allowedOrigins("*")` would ship that development convenience
to production. Configuration-driven origins mean a deployment serving both apps behind one reverse
proxy supplies an empty list and runs with CORS switched off.

**Alternative.** An Angular dev-server proxy, which makes requests same-origin and sidesteps CORS in
development. It works, but it hides a real production concern behind a dev-only tool and does
nothing for other API clients.

**Credentials.** `allowCredentials` is deliberately *not* enabled. It will be revisited when
authentication lands, together with the token-storage strategy.

## ADR-7 — Integration tests use Testcontainers, not H2

**Decision.** Integration tests run against a real PostgreSQL 18 container.

**Why.** H2 approximates PostgreSQL. It differs on types, sequences, upserts, JSON and locking —
exactly the areas where bugs hide. A test suite that passes against H2 and fails in production is
worse than no suite, because it is trusted. Testcontainers costs container startup time and a Docker
dependency, which is a fair price for tests that mean something.

**Balance.** Not every test pays that price. Web-layer behaviour is covered by `@WebMvcTest` slices
that need no database and run in milliseconds; only tests that genuinely exercise persistence boot a
container.

## ADR-8 — Stateless JWT sessions, kept in `localStorage`

**Decision.** Authentication issues a JWT on register/login. The API validates it per request via a
custom filter and keeps no server-side session (`SessionCreationPolicy.STATELESS`). The frontend
keeps the token in `localStorage` and attaches it itself via an HTTP interceptor, rather than the
browser sending it automatically as a cookie would.

**Why not server-side sessions.** A session needs a store (in-memory or shared) that every instance
of a horizontally-scaled API must consult on every request. A JWT is self-contained and verified
with only the signing key — the actual meaning of "stateless" here — which keeps the backend able to
scale to multiple instances with no shared session store to add later.

**Why not an httpOnly cookie.** A cookie the browser attaches automatically is safe from XSS token
theft, which `localStorage` is not: an injected script can read `localStorage` directly. But an
automatically-attached cookie reopens CSRF and needs `SameSite`/`Secure` flags plus a
credentials-mode dance to work across Angular's `:4200` and Spring Boot's `:8080` in development.
`localStorage` plus an explicit `Authorization` header is the simpler mechanism for a pure API
client with no server-rendered forms to protect, and CSRF protection is correctly disabled in
`SecurityConfig` as a result — there is no session cookie for a forged cross-site request to ride on.

**Consequence.** A stolen token cannot be revoked before it expires without extra infrastructure (a
blocklist), so the token lifetime is kept short (one hour by default) rather than session-cookie-long.

**Revisit when.** The app gains server-rendered pages or first-party-only usage where an httpOnly
cookie's XSS protection would matter more than the CSRF/CORS complexity it adds.
