# FretLab 🎸

**Interactive guitar theory learning platform.**

FretLab doesn't ask you to memorise that a major chord is "root, major third, perfect fifth" — it
shows you where those three notes live on the neck, lets you build the chord yourself, and tells
you whether you got it right.

**[Try it live → fretlab-3jv.pages.dev](https://fretlab-3jv.pages.dev)**

![Java](https://img.shields.io/badge/Java-25-e76f00)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1-6db33f)
![Spring Security](https://img.shields.io/badge/Spring%20Security-JWT-6db33f)
![Angular](https://img.shields.io/badge/Angular-22-dd0031)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-336791)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ed)
![Tests](https://img.shields.io/badge/tests-190%2B%20backend%20%C2%B7%2072%20frontend-brightgreen)

<img src="docs/media/demo.gif" width="100%" alt="FretLab demo: Dashboard, Fretboard Lab, Lesson 1's piano, and the Practice hub">

*Dashboard → Fretboard Lab (notes and chords, colour-coded by role) → Lesson 1's piano synced live
to the neck → the Practice hub.*

## What it does

Every concept — notes, intervals, chords, scales — is something you can see and click on a
fretboard, colour-coded by musical role (root, third, fifth, seventh) rather than by an arbitrary
shape, using the same colour everywhere in the app:

- **Theory engine** — notes with correct enharmonic spelling, intervals, chords (11 formulas, with
  inversions), scales (major, three minor variants, both pentatonics), diatonic harmony.
- **Fretboard Lab** — a reusable fretboard with Notes / Chords / Scales explore modes.
- **Practice trainers** — "Find the Note" and "Find the Interval", backend-generated and scored
  live, not a fixed question bank.
- **Lessons** — guided theory lessons that build on the same fretboard and piano components used
  everywhere else in the app.
- **Accounts & progress** — JWT auth, and per-topic mastery computed live from recorded attempts.
- **English/Spanish** — a runtime language switch; note names are never translated.

## Why it's more than a CRUD app

The backend owns a real **music theory domain** that *computes* theory rather than looking it up —
there's no `chords` table or `scales` table. `Chord`, `Scale` and `Interval` are formulas applied
to a root, verified by unit tests against known-correct theory (`G major`'s seventh is spelled
**F♯**, never the enharmonically identical but wrong `G♭`). The two practice trainers are
backend-generated exercise engines: the server picks a target and the difficulty rules, the client
grades itself against theory data fetched separately, and every signed-in attempt is recorded —
mastery on the Progress page is a live query over those attempts, never a number that could drift
from what actually happened.

## Tech stack

**Backend** — Java 25, Spring Boot 4.1, Spring Web MVC, Spring Security (JWT), Spring Data JPA,
Flyway, PostgreSQL, springdoc OpenAPI, JUnit 5, AssertJ, Testcontainers.

**Frontend** — Angular 22 (standalone, zoneless, signals), TypeScript, SCSS design tokens, Vitest.

**Infrastructure** — Docker Compose locally; Cloudflare Pages, Render and Neon in production.

Architecture notes (modular monolith, why theory is computed rather than stored, RFC 9457 errors,
and six more ADRs) are in [docs/architecture.md](docs/architecture.md).

## Running it locally

```bash
cp .env.example .env
docker compose up --build
```

The app is then at <http://localhost:4200>, the API docs at
<http://localhost:8080/swagger-ui.html>.

```bash
cd backend  && ./mvnw verify   # unit + web-slice + Testcontainers integration tests
cd frontend && npm test        # Vitest component tests
```
