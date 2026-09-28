# FretLab 🎸

**Interactive Guitar Theory Learning Platform**

Learn music theory *through the guitar*. FretLab does not ask you to memorise that a major chord
is "root, major third, perfect fifth" — it shows you where those three notes live on the neck,
lets you build the chord yourself, and tells you whether you got it right.

> **Status: the core learning loop is feature-complete and fully tested.** Music theory (notes,
> intervals, chords with inversions, scales, diatonic harmony), two backend-generated practice
> trainers with real scoring, JWT authentication, and progress tracking derived from real recorded
> attempts all work end to end against a real PostgreSQL database, fully containerised and verified
> locally. **It is not yet publicly deployed** — see [Try it online](#try-it-online) below for
> exactly what's left, all of it free. See [docs/roadmap.md](docs/roadmap.md) for exactly what has
> shipped, what was deliberately deferred and why, and what's next. Screens still showing hardcoded
> content are labelled **Placeholder** in the UI, never silently.

![Java](https://img.shields.io/badge/Java-25-e76f00)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1-6db33f)
![Spring Security](https://img.shields.io/badge/Spring%20Security-JWT-6db33f)
![Angular](https://img.shields.io/badge/Angular-22-dd0031)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-336791)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ed)
![Tests](https://img.shields.io/badge/tests-190%2B%20backend%20%C2%B7%2039%20frontend-brightgreen)

---

## Try it online

**Not live yet.** The code, CI and deployment config are all ready and verified — what's left is
three account-creation steps that only a human can do (no card needed for any of them):

- [x] Code pushed to GitHub, CI running on every push
- [ ] GitHub Pages enabled (repo → **Settings → Pages → Source → GitHub Actions**)
- [ ] Free PostgreSQL database created on [Supabase](https://supabase.com/) or [Neon](https://neon.tech/)
- [ ] Backend deployed on [Render](https://render.com/) (free web service, built from
      [`render.yaml`](render.yaml))

The reasoning behind this exact three-way split — why not one host, why not Render's own free
Postgres — is in
[docs/roadmap.md#phase-15](docs/roadmap.md#phase-15--prepared-awaiting-accounts-only-the-user-can-create).

| Service | Host | Note |
| --- | --- | --- |
| Frontend | GitHub Pages | Free, no time limit, no cold start |
| Backend | Render (free web service) | Sleeps after ~15 min idle; first request after that takes 30–50s |
| Database | Supabase or Neon | Render's own free Postgres is deleted after 90 days — these aren't |

**Setup, in order:**

1. **Repository → Settings → Pages → Source → GitHub Actions.** The only manual step Pages needs;
   [`deploy-pages.yml`](.github/workflows/deploy-pages.yml) already builds and publishes on every
   push to `main` — check the **Actions** tab, it likely already ran once (on the first push) and
   failed at the deploy step simply because Pages wasn't enabled yet. Once you flip this setting,
   either push anything or re-run that failed job from the Actions tab.
2. **Create a free Postgres database** on Supabase or Neon. Keep its connection URL, username and
   password handy.
3. **Create a Render account → New → Blueprint**, point it at this repository. Render reads
   [`render.yaml`](render.yaml) and creates the backend web service. When prompted, fill in:
   - `FRETLAB_DB_URL` / `FRETLAB_DB_USERNAME` / `FRETLAB_DB_PASSWORD` — from step 2
   - `FRETLAB_CORS_ALLOWED_ORIGINS` — `https://ancarret.github.io`
   - `FRETLAB_JWT_SECRET` — Render generates this automatically
4. **If Render assigns a URL other than `fretlab-backend.onrender.com`** (that name is global and
   may already be taken), update it in
   [environment.github-pages.ts](frontend/src/environments/environment.github-pages.ts) and push —
   `deploy-pages.yml` rebuilds automatically.

Once all three checkboxes above are ticked, the app is live at
**`https://ancarret.github.io/fretlab/`** — that URL is fixed by the GitHub username and repo name,
it doesn't change per step.

## The idea

Most theory apps are digital textbooks. FretLab follows one loop instead:

**concept → visual explanation → guitar application → exercise → feedback → progress**

The neck is the centrepiece. Every concept — notes, intervals, chords, scales — is something you
can see and click on a fretboard, coloured by musical role (root, third, fifth, seventh) rather
than by arbitrary shape, using the same colour everywhere in the app.

## What makes it interesting technically

The backend is not a CRUD wrapper around a table of chords. Java owns a real **music theory
domain** that *computes* theory rather than looking it up — there is no `chords` table, no
`scales` table. `Chord`, `Scale` and `Interval` are formulas applied to a root, verified by unit
tests against known-correct theory (`G major` spells its seventh **F♯**, never the enharmonically
identical but wrong `G♭`).

| Concern | Belongs to | Example |
| --- | --- | --- |
| Canonical musical rules | **Java** | `C major = C E G`; `Scale.harmonize()` derives `I ii iii IV V vi vii°` |
| Persistent application state | **PostgreSQL** | accounts, and every recorded exercise attempt |
| Presentation and interaction | **Angular** | drawing those notes at the right SVG coordinates |

Two practice trainers are backend-generated exercise engines, not a fixed question bank: the
server picks a target note or a root+interval pair and the difficulty rules, the client grades
itself against theory data it fetches separately, and a signed-in attempt is recorded — mastery on
the Progress page is a live query over those attempts, never a separately maintained number that
could drift from what actually happened.

## Features

- **Theory engine** — notes with correct enharmonic spelling, intervals, chords (11 formulas, with
  inversions), scales (major, three minor variants, both pentatonics), diatonic harmony.
- **Fretboard Lab** — one reusable fretboard component with a Notes / Chords / Scales explore mode,
  root/third/fifth/seventh colour-coded consistently everywhere.
- **Practice trainers** — "Find the Note" (five progressive difficulty levels, the last one timed)
  and "Find the Interval", both backend-generated and scored live.
- **Authentication** — registration, login, stateless JWT, BCrypt password hashing.
- **Progress tracking** — real per-topic mastery, computed from recorded attempts, visible once
  signed in.
- **English/Spanish** — a runtime language switch, not a separate build per locale; every string in
  the UI is a translation key, note names are never translated (that's notation, not UI copy).
- **Fully Dockerised** — Angular behind nginx, Spring Boot, PostgreSQL, three containers, one
  `docker compose up`.

## Tech stack

**Backend** — Java 25, Spring Boot 4.1, Maven, Spring Web MVC, Spring Security, JWT (jjwt), Spring
Data JPA, Bean Validation, Flyway, PostgreSQL 18, springdoc OpenAPI, JUnit 5, AssertJ,
Testcontainers.

**Frontend** — Angular 22 (standalone, zoneless, signals), TypeScript, Reactive Forms, SCSS design
tokens, Vitest.

**Infrastructure** — Locally: Docker Compose (nginx serving the Angular build and reverse-proxying
`/api`, Spring Boot, PostgreSQL). Live: GitHub Pages, Render and a managed Postgres (Supabase or
Neon) instead of the container — see [Try it online](#try-it-online).

## Architecture

A **modular monolith**: one deployable, organised by business capability rather than by technical
layer. See [docs/architecture.md](docs/architecture.md) for the reasoning and eight ADRs (modular
monolith vs. microservices, computed vs. stored theory, SVG fretboard, RFC 9457 errors, Flyway vs.
Hibernate DDL, configuration-driven CORS, Testcontainers vs. H2, stateless JWT vs. server sessions).

```
com.fretlab
├── system            Operational endpoints (health)
├── shared            Cross-cutting concerns (configuration, error handling)
├── theory            Note, interval, chord, scale, fretboard — the domain engine
├── learning
│   ├── practice      Backend-generated fretboard/interval challenges
│   └── progress      Exercise attempts and mastery, derived by query
├── auth              JWT issuing/verification, Spring Security config
└── user              The User entity and its repository
```

## Project structure

```
fretlab/
├── backend/            Spring Boot application (+ Dockerfile)
├── frontend/           Angular application (+ Dockerfile, nginx.conf)
├── docs/               Product spec, architecture, roadmap
├── docker-compose.yml  Postgres + backend + frontend, wired together
└── .env.example        Copy to .env; .env is never committed
```

## Running it locally (for development)

This runs your own copy on your machine, against a local Postgres container — it's not how the live
app (see [Try it online](#try-it-online) above) gets its data, and you don't need any of this just
to use the app once it's deployed.

### Option A — Docker Compose (the whole stack, one command)

```bash
cp .env.example .env   # adjust if you want, defaults work for local use
docker compose up --build
```

| URL | What |
| --- | --- |
| <http://localhost:4200> | The app |
| <http://localhost:8080/swagger-ui.html> | API documentation |

The frontend container serves the compiled Angular build through nginx, which reverse-proxies
`/api/*` to the backend container — the browser only ever talks to one origin, which is why the
backend's CORS allow-list can (and in this deployment does) stay empty.

### Option B — run each piece natively (faster edit/reload loop)

**Prerequisites:** JDK 25 (the Maven Wrapper is included), Node.js ≥ 24.15, Docker Desktop (for
PostgreSQL and for the Testcontainers-based integration tests).

```bash
# 1. Database
docker compose up -d db

# 2. Backend — serves http://localhost:8080
cd backend
./mvnw spring-boot:run
# If your default JDK isn't 25: JAVA_HOME="/path/to/jdk-25" ./mvnw spring-boot:run

# 3. Frontend — serves http://localhost:4200
cd frontend
npm start
```

| Endpoint | Purpose |
| --- | --- |
| `GET /api/health` | Reachability probe |
| `GET/POST /api/auth/*` | Register, login, current session |
| `GET /api/theory/*` | Notes, intervals, chords, scales, fretboard |
| `GET /api/practice/*` | Backend-generated practice challenges |
| `GET/POST /api/progress/*` | Recorded attempts and mastery (requires a session) |
| `/swagger-ui.html` | Interactive API documentation |

## Testing

```bash
cd backend  && ./mvnw verify   # unit + web-slice + Testcontainers integration tests
cd frontend && npm test        # Vitest component tests
```

Integration tests start a real PostgreSQL 18 container, so Docker must be running. They verify
against the same engine as production rather than approximating it with an in-memory database —
including a full register → login → protected-endpoint flow through the real Spring Security
filter chain, not a mocked one.

## Technical decisions

Recorded as ADRs in [docs/architecture.md](docs/architecture.md) — each states the alternative
considered and why it lost, not just the choice made:

1. Modular monolith, not microservices
2. Music theory computed in Java, never stored in PostgreSQL
3. The fretboard is SVG
4. Errors follow RFC 9457 Problem Details
5. Flyway owns the schema; Hibernate only validates it
6. CORS is configured, not wildcarded
7. Integration tests use Testcontainers, not H2
8. Stateless JWT sessions, kept in `localStorage` — and why not an httpOnly cookie

## Roadmap

Phase-by-phase plan and what actually shipped in each in [docs/roadmap.md](docs/roadmap.md),
including two deliberate scope decisions worth reading if you're evaluating the judgment behind
them: the CAGED system and adaptive practice were both deferred rather than shipped half-verified,
with the reasoning written down at the point the call was made.
