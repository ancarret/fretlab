# Roadmap

Phases are delivered one at a time. A phase is done when it compiles, its tests pass, the feature
can be demonstrated by hand, and the documentation still matches the code.

| Phase | Scope | Status |
| --- | --- | --- |
| 0 | Repository, documentation, architectural decisions | ✅ Done |
| 1 | Full-stack foundation: Spring Boot + Angular + PostgreSQL wired end to end, fretboard prototype | ✅ Done |
| 2 | Music theory domain: pitch class, note spelling, interval, tuning, chords, scales, diatonic harmony | ✅ Done |
| 3 | Interactive fretboard driven by real backend data | ✅ Done |
| 4 | Fretboard note trainer with progressive difficulty | ✅ Done |
| 5 | Intervals: domain, API, visualisation, exercises | ✅ Done |
| 6 | Chords and triads: formulas, construction, inversions | ✅ Done |
| 7 | Scales: major, natural minor, degrees, keys | ✅ Done |
| 8 | Pentatonic positions and the CAGED system | ⚠️ Partial — see note |
| 9 | Authentication: registration, login, Spring Security, JWT | ✅ Done |
| 10 | Progress and statistics: attempts, mastery, dashboard | ✅ Done |
| 11 | Adaptive practice: weakness detection, scheduling | ⚠️ Deferred — see note |
| 12 | Testing hardening | ⏳ Next |
| 13 | Full Dockerisation of all three services | ✅ Done |
| 14 | CI/CD with GitHub Actions | ✅ Written, unverified on GitHub — see note |
| 15 | Public deployment and live demo | ✅ Prepared — see note; awaits accounts only the user can create |
| 16 | Portfolio polish: README, screenshots, architecture diagram | |

## Phase 1 — delivered

**Backend.** Spring Boot 4.1 on Java 25. `GET /api/health` reporting the Maven build version.
Typed configuration bound from `fretlab.*`. Configuration-driven CORS. Centralised RFC 9457 error
handling. Flyway baseline migration against PostgreSQL 18. OpenAPI documentation via springdoc.
Tests: a `@WebMvcTest` web slice and a Testcontainers integration test.

**Frontend.** Angular 22, standalone and zoneless. App shell with sidebar navigation and a live API
status indicator. Five lazily-loaded routes plus a not-found page. SCSS design token system.
A reusable SVG fretboard component — six strings, configurable fret count, inlays, keyboard-operable
positions — exercised by the Fretboard Lab screen. Vitest component tests.

**Infrastructure.** Docker Compose running PostgreSQL 18.

## Phase 2 — delivered

The first real domain code, and the part of the project that must be strongest. Plain Java, zero
Spring annotations.

```
Note              a written note: letter + accidental (C# and Db differ in spelling, not pitch)
Pitch             a sounding pitch: MIDI number, 60 = C4
Accidental        natural, sharp, flat, and their doubles
Interval          semitone distance plus musical quality (simple intervals only)
ChordType         an interval formula from the root — major, minor, dominant 7th, ...
Chord             a root applied to a ChordType, with reverse chord identification
ScaleType         an interval formula from the tonic — major, the three minors, both pentatonics
Scale             a tonic applied to a ScaleType, with diatonic-triad harmonization
GuitarTuning      standard tuning first; the model allows others later
GuitarString      a string and its open pitch
FretPosition      a string/fret coordinate
Fretboard         noteAt(string, fret) and positionsOf(pitchClass)
```

Note spelling is modelled as letter + accidental from the outset, never as a twelve-value enum: G
major must spell its seventh **F♯**, never G♭, and a pitch-class-only model cannot express that.
`Interval.above(note)` picks the letter first (from the interval's number) and derives the
accidental afterwards — that ordering is what makes the spelling come out right.

Chords and scales apply the same idea one level up: a formula of intervals applied to a root/tonic,
never a lookup table. `Scale.harmonize()` is the clearest demonstration — it derives C major's
`I ii iii IV V vi vii°` (`C · Dm · Em · F · G · Am · Bdim`) purely by stacking thirds within the
scale and identifying each resulting triad, with no chord table anywhere.

Verified with unit tests against known-correct theory:

```
E string, fret 0  = E        C → E = major third            C major   = C E G
E string, fret 1  = F        C → G = perfect fifth           A minor   = A C E
E string, fret 12 = E        A → C = minor third             G major   = G A B C D E F#
A string, fret 3  = C                                        A harmonic minor ends G#
```

Endpoints: `/api/theory/{notes,intervals,fretboard,chords,scales}`, documented in Swagger UI.

## Phase 3 — delivered

The interactive fretboard now reflects real backend data instead of the Phase 1 prototype.

`TheoryService` uses Angular 22's `httpResource()`, refetching reactively whenever an input signal
changes. `FretboardLab` exposes fret count, spelling and a reference-note toggle; clicking a
position selects the note under it. `<app-fretboard>` gained an `emphasis: 'primary' | 'secondary'`
input so highlighted notes read as figure against a hollow reference layer, rather than every dot
competing for attention equally.

## Phase 4 — delivered

The first exercise generator, and the first code under `learning/` — the module the master prompt
reserves for lessons, exercises, progress and practice.

```
com.fretlab.learning.practice
├── Difficulty                  five levels: which strings, whether accidentals, whether timed
├── FretboardChallenge          a difficulty + a target note — no answer positions attached
└── FretboardChallengeGenerator picks the target, given an injectable source of randomness
```

The generator deliberately does not compute *where* the target note sounds — that is
`Fretboard.positionsOf(pitchClass)`, already built and tested in Phase 2. Repeating it here would
create a second, divergent source of truth for the same fact. Instead `GET
/api/practice/fretboard/challenge?level=LEVEL_3` returns only what the theory module cannot supply:
which note to ask about, and which strings/accidentals are fair game at this level. The Angular
trainer fetches the full neck from the existing theory endpoint and grades clicks by comparing the
two — presentation logic acting on domain data, not a reimplementation of music theory in
TypeScript.

Levels, matching the curriculum: strings 5–6 → add string 4 → all six strings → add accidentals →
add a stopwatch. Note names stay hidden until found, so the trainer is a genuine recall exercise
rather than a labelled reference like the Fretboard Lab.

Endpoint: `GET /api/practice/fretboard/challenge?level=LEVEL_1..5`. Frontend: `/practice/fretboard-trainer`.

## Phase 5–7 — delivered

Intervals, chords and scales all gained a matching frontend on top of the Phase 2 domain, plus one
addition to the domain itself:

- **Interval trainer** (`/practice/interval-trainer`): the backend hands out a root and an interval;
  every occurrence of the root is a landmark, and the player finds every occurrence of the target.
- **Chord domain**: `Chord.notes(inversion)` and `Chord.inversionName(inversion)` — root position,
  first/second/(third) inversion, as a rotation of the existing formula, not new theory.
- **Fretboard Lab modes**: the lab is now one component with an "Explore: Notes | Chords | Scales"
  switch, matching the master prompt's own vision of a single reusable fretboard driven by state.
  Chords mode colours root/third/fifth/seventh and offers the inversion picker; Scales mode colours
  the same degrees across all six scale formulas, pentatonics included.

Chord- and scale-degree colouring (which array index is "the fifth") is a small fixed lookup table
in the frontend, not new backend endpoints — reasonable because it never decides a pitch or a
spelling, only which of five colours an already-correct note gets.

## Phase 8 — partial, by design

Pentatonic scales are fully correct and visualised (Scales mode, `MAJOR_PENTATONIC` /
`MINOR_PENTATONIC`). The five-box CAGED system is deliberately **not** implemented yet.

**Why stop here.** A pentatonic "position" or a CAGED shape is a claim about which specific frets
a hand plays as one pattern — real geometry, not a fact `Fretboard.positionsOf` already proves
correct. Encoding five box shapes from memory, with no guitar or authoritative source to check them
against in this session, is exactly the kind of guessed music theory the project's own ground rules
rule out. The honest options were: ship a plausible-looking but unverified shape table, or defer it.
Deferring was the better trade-off — especially with authentication, progress tracking, Docker and
CI/CD still ahead, all work with no correctness ambiguity.

**How to do it properly, later:** derive positions algorithmically from data already proven correct,
rather than hardcoding fret numbers. A "box" is a maximal window of consecutive frets in which every
one of the scale's pitch classes appears on every string that carries it — computable from
`Fretboard.positionsOf` directly, verifiable by unit test, and correct by construction rather than
by memory.

## Phase 9 — delivered

Stateless JWT authentication, `com.fretlab.auth` and `com.fretlab.user`.

- `User` is a plain JPA entity (not a record — Hibernate needs a mutable, no-arg-constructible
  shape), migrated in `V2__users.sql`. Passwords are BCrypt hashes, never plain text.
- `JwtService` is framework-free: it only knows how to sign and verify a token, independent of
  Spring or HTTP, so it is unit-tested with no servlet context at all.
- `SecurityConfig` is stateless (`SessionCreationPolicy.STATELESS`, CSRF disabled — there is no
  session cookie for CSRF to forge), theory/practice stay public, everything else requires a bearer
  token. An unauthenticated request is routed through Spring MVC's own `HandlerExceptionResolver`
  into the existing `GlobalExceptionHandler`, so a 401 gets the same `ProblemDetail` shape as every
  other error instead of Spring Security's bare default response.
- Frontend: `AuthService` keeps the session in `localStorage` plus a signal, `authInterceptor`
  attaches it to FretLab's own requests only, and `/login`/`/register` are real, validated forms.
  The trade-off against an httpOnly cookie is written up as a doc comment on `AuthService` itself.

Verified end-to-end against a real Postgres and the real Spring Security filter chain
(`AuthIntegrationTest`), not mocked: register → login → call the protected `/api/auth/me` →
rejected without a token → theory/practice endpoints stay reachable regardless.

## Internationalisation — English/Spanish runtime switch

Added outside the phase sequence, on request. A `TranslationService` signal plus a `translate`
pipe, not `@angular/localize` — the requirement was one running app where a visitor flips a switch
and the same page re-renders, not a separate compiled bundle per locale. Every English UI string in
the app now has a Spanish counterpart, looked up by key so a missing translation falls back to
English rather than showing a blank. Note names, chord symbols and Roman numerals are deliberately
never translated — they are music notation, not UI copy, and the app's letter-name convention is
kept regardless of interface language. The choice persists in `localStorage` across visits.

## Phase 10 — delivered

`com.fretlab.learning.progress`: one table, `exercise_attempts`, and mastery is always a query over
it — `Mastery.summarize(List<Attempt>)` computes accuracy as correct/attempted, per
`ExerciseType`, live, rather than a running total that could drift from what actually happened.

- `ExerciseType` currently has exactly two values, `FRETBOARD_NOTE` and `INTERVAL` — one per trainer
  that actually exists. Adding a value with nothing that can ever record it would be dead vocabulary.
- `POST /api/progress/attempts` and `GET /api/progress/summary` require a signed-in account; theory
  and practice stay usable without one. The frontend's `ProgressService.recordAttempt` checks
  `AuthService.isAuthenticated()` itself and silently skips recording for an anonymous visitor —
  practising was never a mistake just because nobody is signed in to remember it.
- The `/progress` page now has three real states — signed out (an invitation, not an error), signed
  in with nothing recorded yet, and signed in with real mastery bars — verified end to end with a
  real registration, real clicks in the fretboard trainer, and a real summary read back afterwards.

**A real bug this phase surfaced and fixed.** Adding Spring Security in Phase 9 quietly broke CORS
for every *protected* endpoint: Spring Security's filter chain runs before Spring MVC's own CORS
handling, so a browser's preflight `OPTIONS` request to `/api/progress/summary` hit
`anyRequest().authenticated()` and was rejected before CORS was ever considered. No existing test
caught it, because `MockMvc`'s plain `get()`/`post()` calls never send an `Origin` header and so
never exercise CORS at all — only a real browser (or a test that adds `Origin` and
`Access-Control-Request-Method` headers on purpose) can see this class of bug. Fixed by giving
Spring Security and Spring MVC the same `CorsConfigurationSource` bean instead of two independent
configurations, with a regression test (`AuthIntegrationTest.corsPreflightToAProtectedEndpoint...`)
added specifically because the existing suite had a blind spot here.

## Phase 11 — deferred, by design

The master prompt is explicit that adaptive practice should start simple and grow, not arrive as a
sophisticated scheduler on day one. Phase 10's mastery is per `ExerciseType` (fretboard note vs.
interval) — genuinely useful for showing overall progress, but too coarse to adapt *within* an
exercise: it cannot say "this account is weak on B♭ specifically" or "on major sixths specifically",
only "weak on the fretboard trainer generally". Building a scheduler on top of that granularity would
either be a no-op dressed up as a feature (there is only one difficulty knob it could turn) or would
require tracking mastery per note/interval first — a real, separate piece of schema and domain work,
better done deliberately in its own pass than bolted on to make this phase's checkbox green.

## Phase 13 — delivered (ahead of Phase 12)

Taken out of order: Docker was next because it is unambiguous, well-specified work, while testing
hardening benefits from having the full containerised topology to test *against* (in particular,
CORS through nginx's reverse proxy is a materially different scenario from CORS between two dev
servers, and is worth its own test once Phase 12 is picked back up).

- `backend/Dockerfile` — multi-stage: `eclipse-temurin:25-jdk` builds the jar, `eclipse-temurin:25-jre`
  runs it as a non-root user. Dependencies are resolved in their own layer before source is copied
  in, so an edit to a `.java` file never re-triggers a full dependency download.
- `frontend/Dockerfile` — multi-stage: `node:24-alpine` builds the Angular bundle, `nginx:alpine`
  serves it and reverse-proxies `/api/*` to the backend container. The browser only ever talks to
  one origin, which is why `FRETLAB_CORS_ALLOWED_ORIGINS` is empty in `docker-compose.yml` — ADR-6's
  "empty list disables CORS" rule, exercised for real rather than only in local dev.
- `docker-compose.yml` now runs all three services with proper health-gated startup ordering
  (`depends_on: condition: service_healthy`), verified with a real registration → practice session →
  progress check driven through the containerised stack end to end, including confirming a direct
  deep-link like `/practice/fretboard-trainer` survives a hard refresh (nginx's SPA fallback) rather
  than 404ing.

## Phase 14 — written, honestly not yet verified on GitHub

`.github/workflows/ci.yml`: backend (`mvnw verify` — unit, web-slice and Testcontainers integration
tests together), then frontend (build, then Vitest), then both Dockerfiles built as a final gate —
the same shape the master prompt itself lays out, cheapest failure first.

**What is and is not actually proven.** Every individual command the workflow runs has been
executed and verified directly in this environment throughout this project (`mvnw verify`, `npm run
build`, `ng test --watch=false`, `docker build` for both images) — that is not in question. What is
not yet proven is the workflow *file* running successfully on GitHub's own infrastructure, because
that needs a real GitHub repository and a push, and nothing in this project has been committed or
pushed yet. One concrete cross-platform risk was already caught by inspection rather than by a
failed run: this repo is developed on Windows with `core.filemode=false`, so `mvnw`'s executable bit
is not reliably preserved in the git object — the workflow runs `chmod +x mvnw` explicitly rather
than trusting whatever bit ends up committed.

**To actually verify it:** push this repository to GitHub. The first push to a branch with this
workflow file present will trigger it automatically.

## Phase 15 — prepared, awaiting accounts only the user can create

**The constraint driving every choice here: free, indefinitely, with as little friction as
possible.** That rules out a single all-in-one host, because this is three services with different
hosting needs — a static bundle, a long-running JVM process, and a stateful database — and the free
tier that fits one of those rarely fits the other two. A same-cost VPS alternative was also priced
out and rejected: checked directly against Contabo's and Netcup's current pricing pages rather than
assumed, the cheapest reputable option lands around €5.50–8/month, not the €3 hoped for, and it
trades zero recurring cost for real recurring cost plus server maintenance — not worth it against a
free split that, once the choices below were corrected, has no cold-start-free-tier trap worth
paying to avoid.

**The split chosen, and what changed getting here:**

| Service | Host | Why this one |
| --- | --- | --- |
| Frontend (static Angular build) | **Cloudflare Pages** | Free, unlimited bandwidth, no card, no cold start, serves from the domain root |
| Backend (long-running Spring Boot process) | **Render** (free web service) | Builds straight from the existing `backend/Dockerfile`, redeploys on every push |
| Database (stateful PostgreSQL) | **Neon** (free Postgres) | Direct connection is IPv4-reachable, which matters — see below |

GitHub Pages was the original choice for the frontend and Supabase-or-Neon the original choice for
the database; both changed after verifying claims against current provider documentation instead of
trusting general knowledge, which is worth recording since it reversed real decisions:

- **Neon over Supabase, not "either one."** Flyway (which runs the schema migrations at startup)
  needs a direct, non-pooled connection — both providers' own docs say so, since a transaction-mode
  pooler doesn't reliably support the session-level operations migrations depend on. Supabase's
  direct connection is IPv6-only unless you pay for its IPv4 add-on, and Render has no outbound
  IPv6 — that combination would have made migrations fail on first deploy. Neon's direct connection
  is IPv4-reachable by default, so it was switched to before any Supabase-specific code existed.
- **Cloudflare Pages over GitHub Pages.** Functionally similar, but Cloudflare serves from the
  project's own root domain (`fretlab.pages.dev`) rather than a `username.github.io/repo/` subpath,
  which removes the need for Angular's `baseHref` override entirely. It also has native GitHub
  integration that builds and deploys on every push by itself, so the custom
  `deploy-pages.yml` GitHub Actions workflow built for GitHub Pages was deleted rather than kept
  unused. SPA routing fallback is a one-line `_redirects` file
  (`frontend/public/_redirects` → `/* /index.html 200`) instead of GitHub Pages' `404.html` copy
  trick.

This is still a real architectural change from the Docker Compose deployment, not just "upload it
somewhere": Compose puts nginx and Spring Boot behind one origin, so the backend's CORS allow-list
stays empty (ADR-6) and the frontend calls a relative `/api` path. Split across three hosts, the
frontend and backend are different origins, so both sides of that same-origin trick had to be
undone:

- **`FRETLAB_CORS_ALLOWED_ORIGINS`** — already an environment variable, so no code changed; it just
  gets set to the Cloudflare Pages origin when the Render service is configured.
- **API base URL** — [environment.ts](../frontend/src/environments/environment.ts) hardcodes the
  relative `/api` path the Compose deployment relies on. A third environment,
  [environment.cloudflare-pages.ts](../frontend/src/environments/environment.cloudflare-pages.ts),
  supplies the Render service's absolute URL instead, wired to a matching `cloudflare-pages` build
  configuration in `angular.json` and a `build:cloudflare-pages` npm script.
- **Dynamic port binding** — `server.port: ${PORT:8080}` was added to `application.yml`; Render
  assigns its free-tier services a port at runtime via `$PORT` rather than letting the container
  choose one, unlike the Docker Compose deployment where 8080 is fixed.

[`render.yaml`](../render.yaml) is a Render Blueprint that turns the backend's setup into a single
"New Blueprint Instance" action instead of manual dashboard clicking. It deliberately leaves the
database credentials and the CORS origin as `sync: false` (entered by hand in Render's dashboard)
rather than committing them — those values depend on accounts that don't exist until the user
creates them, and the CORS origin in particular is only known once the Cloudflare Pages project
exists and its exact URL is visible.

**The trade-offs, stated plainly rather than glossed over:** Render's free web services sleep after
roughly 15 minutes without traffic; the first request afterward pays a 30–50 second cold start
while the container restarts. Render also appears to require a card at signup as a fraud-prevention
hold (refunded, not an actual charge) — checked against current community reports rather than
assumed, and found to be an industry-wide pattern in 2026 (Koyeb's equivalent hold is $29), not
something specific to Render or avoidable by picking a different host in the same category. For a
portfolio demo checked occasionally rather than a product under load, both are acceptable trades for
zero recurring cost — but they are real trades, not footnotes.

**What still requires the user, and cannot be done from here:** creating a Neon account and
database, creating a Cloudflare account and connecting it to the repository, and creating a Render
account and connecting it to the repository via the Blueprint. Everything on the code side — the
environment split, the build configuration, and the Render Blueprint — was prepared and
build-verified locally ahead of that, the same way Phase 14's CI workflow was written and
individually verified before ever running on real GitHub infrastructure.

## Later, and deliberately not yet

Achievements, streaks, spaced repetition, alternative tunings, left-handed layout, light theme,
internationalisation, interactive circle of fifths, audio playback, MIDI, ear training, an AI tutor,
offline PWA support.

None of these are started until the core learning loop works. An AI tutor in particular is
explicitly secondary: the project must first demonstrate traditional software engineering.
