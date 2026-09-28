# FretLab — handoff prompt for a new session

> Paste `MASTER-PROMPT.md` and then this whole file as the first message of the new session.
> Both are working artifacts — delete them before the final commit.

---

## 0. How to work with me

- Explanations to me in **Spanish**. All code, comments, docs, commits in **English**.
- I am a software engineer with ~1 year of experience, coming from Power Platform / Azure /
  Python, moving into **Java + Spring Boot backend**, job-hunting for junior/early-career roles in
  Switzerland and Europe. I must be able to **defend every decision in a technical interview**.
- Justify decisions with trade-offs (problem solved → alternative → why this one → when the other
  is better). "It's a best practice" is not an answer.
- **No Lombok.** Records for immutable DTOs are welcome.
- Don't commit or push unless I ask. Suggest conventional commit messages instead.
- I am low on token budget. Work efficiently, avoid re-reading files you already know, and tell me
  when you are close to running out so I can continue later.

---

## 1. Where the project is

Monorepo at `C:\Users\carretero\personal\web-musical`. Git initialised, **branch `main`, zero
commits so far** — everything is untracked working tree.

```
web-musical/
├── backend/            Spring Boot 4.1.1 · Java 25 · Maven wrapper
├── frontend/           Angular 22 · standalone · zoneless · signals · Vitest
├── docs/               product-spec.md · architecture.md · roadmap.md
├── docker-compose.yml  PostgreSQL 18-alpine
├── .env.example
├── .gitignore
├── README.md
└── HANDOFF.md          ← this file, delete later
```

### Environment gotchas (already solved, don't re-solve)

| Thing | Value |
| --- | --- |
| JDK 25 | `C:\Program Files\BellSoft\LibericaJDK-25-Full` — **default `JAVA_HOME` points at JDK 21**, so prefix Maven calls: `JAVA_HOME="/c/Program Files/BellSoft/LibericaJDK-25-Full" ./mvnw ...` |
| Maven | Not installed globally. Use `./mvnw` (wrapper is committed). |
| Node | 24.19.0 (upgraded — Angular 22 needs ≥ 24.15) |
| Docker | Docker Desktop must be **running** for Testcontainers and for `docker compose up -d`. |
| Ports | backend 8080, frontend 4200, PostgreSQL 5432 |
| PostgreSQL 18 | `PGDATA=/var/lib/postgresql/18/docker`, so the compose volume mounts `/var/lib/postgresql` (the parent), **not** `/data`. Already fixed. |
| Jar lock | The running backend locks `target/*.jar`. **Kill the process on 8080 before `./mvnw verify`**, or `repackage` fails. |

---

## 2. What is DONE and verified green

### Phase 0 + 1 — foundation ✅

- `README.md`, `docs/product-spec.md`, `docs/architecture.md` (7 ADRs), `docs/roadmap.md`.
- Backend: `GET /api/health` returning the Maven-filtered build version; typed
  `@ConfigurationProperties` (`FretlabProperties`); config-driven CORS; Flyway `V1__baseline.sql`;
  springdoc OpenAPI at `/swagger-ui.html`; `ddl-auto: validate`; `open-in-view: false`.
- Centralised errors: `GlobalExceptionHandler extends ResponseEntityExceptionHandler`, producing
  **RFC 9457 `ProblemDetail`** extended with `code` + `timestamp`. A 405 stays a 405 (verified).
- Frontend: app shell with sidebar nav, live "API online" badge, 5 lazy routes + not-found,
  SCSS design tokens in `src/styles/_tokens.scss`, reusable SVG `<app-fretboard>`.
- Infra: `docker compose up -d` gives PostgreSQL 18.6, data persisting correctly.

### Phase 2 — music theory domain ✅ (this is the important part)

Pure Java, **zero Spring annotations** in the domain packages.

```
com.fretlab.theory
├── note/       NoteLetter · Accidental · Note · Pitch · Spelling
├── interval/   IntervalQuality · Interval
├── fretboard/  FretPosition · GuitarString · GuitarTuning · Fretboard
└── web/        NoteController · IntervalController · FretboardController + DTO records
```

Key design (defend this in interviews):

- **`Note` (written) is separate from `Pitch` (sounding).** `Note = NoteLetter + Accidental`;
  `Pitch = MIDI number` (60 = C4). `Pitch.spell(Spelling)` bridges them. This is what makes the
  seventh of G major come out **F♯ and never G♭**.
- **`Interval.above(Note)` picks the letter first** (from the interval number), then derives the
  accidental needed to hit the semitone count. That ordering is the whole trick.
- `Interval.between(Note, Note)` returns simple intervals only.
- `Fretboard.pitchAt(string, fret)` / `positionsOf(pitchClass)`.
- `DomainException` carries an `ErrorCode`, mapped to HTTP 400 by the global handler.

**Bug already found and fixed by a test:** interval shorthand must be matched
**case-sensitively** (`M3` major vs `m3` minor). Same rule applied to chord symbols.

Endpoints live and verified:

```
GET /api/theory/notes?spelling=SHARPS|FLATS
GET /api/theory/notes/transpose?from=G&interval=MAJOR_SEVENTH     → F#
GET /api/theory/intervals
GET /api/theory/intervals/between?from=C&to=E                     → MAJOR_THIRD
GET /api/theory/fretboard?tuning=STANDARD&frets=12&spelling=SHARPS
GET /api/theory/fretboard/positions?note=C&frets=12               → 6 positions
```

Notes go in **query params, not path segments**, because `#` would need percent-encoding in a path.

### Phase 3 — fretboard on real data ✅

- `TheoryService` uses Angular 22 **`httpResource()`** — refetches reactively on signal change.
- `FretboardLab` rewritten: fret count (12/15/24), spelling toggle (sharps/flats), show/hide
  reference notes, 12 note chips derived from the API response, click any position to select the
  note under it, "C appears at 6 positions" summary.
- `<app-fretboard>` gained `emphasis: 'primary' | 'secondary'` so highlighted notes read as figure
  against a hollow reference layer.

### Test status at last green run

- **Backend: 97 tests passing** (`NoteTest` 24, `PitchTest` 10, `IntervalTest` 28, `FretboardTest`
  20, `TheoryApiTest` 11, `HealthControllerTest` 2, `ApplicationIntegrationTest` 2 with
  Testcontainers against real PostgreSQL).
- **Frontend: 9 tests passing** (app shell, fretboard component, fretboard-lab API integration).

---

## 3. What is IN FLIGHT — finish this first

I started chords + scales and the session was cut off mid-way. **Nothing here has been compiled or
tested yet.** Current state:

| File | State |
| --- | --- |
| `shared/error/ErrorCode.java` | ✅ has `INVALID_CHORD_TYPE`, `INVALID_SCALE_TYPE` added |
| `theory/chord/ChordType.java` | ✅ written — 11 formulas, `parse()` case-sensitive on symbols |
| `theory/chord/Chord.java` | ✅ written — `notes()`, `symbol()`, `identify(List<Note>)` |
| `theory/scale/` | ⚠️ **empty directory, nothing written** |
| tests for chord/scale | ❌ none |
| web layer for chord/scale | ❌ none |

**First actions in the new session:**

1. Run `JAVA_HOME="/c/Program Files/BellSoft/LibericaJDK-25-Full" ./mvnw -B -ntp test-compile` in
   `backend/` to confirm the two new chord files actually compile.
2. Write `theory/scale/ScaleType.java` + `Scale.java`. Planned (all verified musically correct):
   - `MAJOR` = P1 M2 M3 P4 P5 M6 M7 → C major = C D E F G A B; G major = G A B C D E **F♯**
   - `NATURAL_MINOR` = P1 M2 m3 P4 P5 m6 m7 → A minor = A B C D E F G
   - `HARMONIC_MINOR` = P1 M2 m3 P4 P5 m6 M7 → A harmonic minor ends **G♯**
   - `MELODIC_MINOR` (ascending) = P1 M2 m3 P4 P5 M6 M7
   - `MAJOR_PENTATONIC` = P1 M2 M3 P5 M6 → C = C D E G A
   - `MINOR_PENTATONIC` = P1 m3 P4 P5 m7 → A = A C D E G
   - **Deliberately skip the blues scale** — its ♭5/♯4 spelling is genuinely ambiguous and I don't
     want guessed theory in the domain.
3. Add **diatonic harmony**: `Scale.triads()` builds a triad on each degree from scale tones
   (degrees i, i+2, i+4 mod 7) and runs `Chord.identify(...)`. C major must come out
   **C · Dm · Em · F · G · Am · Bdim**. This is the killer demo — make sure it is tested.
4. Unit tests with the known-correct theory above, then web layer:
   ```
   GET /api/theory/chords?root=C&type=MAJOR            → C E G
   GET /api/theory/chords/identify?notes=A,C,E         → Am
   GET /api/theory/scales?tonic=G&type=MAJOR           → G A B C D E F#
   GET /api/theory/scales/harmonize?tonic=C&type=MAJOR → I ii iii IV V vi vii°
   ```
5. Extend `docs/roadmap.md` and `docs/architecture.md` to cover what landed.

`add9` and other extensions need **compound intervals**, which `Interval` does not model yet
(it is simple intervals only). Note it as future work rather than faking it.

---

## 4. The other big task — FRONTEND REDESIGN

This is a **priority** and it is new feedback from me:

> The frontend currently looks like the typical thing an AI generates. I don't want that. I know
> the backend is what matters for my portfolio, but the frontend has to look **professional,
> elegant and genuinely designed** — not like every other AI-generated dashboard.

What exists now (and what reads as generic): dark navy `#080d1a` background, electric-blue accent
`#4d8dff`, rounded cards in a grid, a sidebar with 5 stroke icons, generic "mastery bars", a hero
card with a gradient. It is competent but it is the default AI aesthetic.

Constraints for the redesign:

- Keep the token system in `src/styles/_tokens.scss` — components must never hardcode colours.
- Keep accessibility: focus-visible rings, keyboard-operable fretboard positions, `aria-label`s,
  colour never the only cue, `prefers-reduced-motion` respected.
- Keep the "Placeholder" badge convention on any screen still rendering hardcoded data.
- Musical role colours must stay globally consistent (a root is the same colour everywhere).
- The fretboard is the centrepiece — it should feel like a real instrument tool, not a chart.
- Desktop first, but it must not break at phone width.
- Don't regress the 9 frontend tests (they query `.nav__link`, `.marker`, `.marker--primary`,
  `.note-chip`, `.summary` — rename with care, update tests if you do).

Think about an actual visual identity: typography with personality (a real typeface, not just the
system stack), a more distinctive palette, considered spacing and hierarchy, maybe a warmer
instrument-inspired direction rather than generic SaaS dark mode. Show me the direction before
rewriting every component.

---

## 5. Remaining roadmap after that

```
4  Fretboard note trainer (progressive difficulty, scoring)
5  Intervals UI + exercises
6  Chords/triads UI + inversions
7  Scales UI
8  Pentatonic positions + CAGED
9  Authentication (Spring Security + JWT)
10 Progress & statistics (first real DB tables — until now only V1__baseline exists)
11 Adaptive practice
12 Testing hardening
13 Full Dockerisation
14 CI/CD (GitHub Actions)
15 Public deployment + live demo link
16 Portfolio polish
```

Note: the database currently has **only the Flyway baseline migration and no domain tables** —
that is intentional. Music theory is computed in Java, never stored. Real tables arrive with
authentication and progress.

---

## 6. Commands

```bash
# Database
docker compose up -d

# Backend  (kill anything on 8080 first if rebuilding)
cd backend
JAVA_HOME="/c/Program Files/BellSoft/LibericaJDK-25-Full" ./mvnw spring-boot:run
JAVA_HOME="/c/Program Files/BellSoft/LibericaJDK-25-Full" ./mvnw verify

# Frontend
cd frontend
npm start
npx ng test --watch=false
npm run build
```

Swagger UI: <http://localhost:8080/swagger-ui.html>

---

## 7. Suggested first commit (nothing is committed yet)

Once the in-flight chord/scale work compiles and is green, this is roughly the split I want:

```
feat: bootstrap FretLab full-stack foundation
feat(theory): add music theory domain with correct enharmonic spelling
feat(fretboard): drive the interactive fretboard from the theory API
```

I will decide when to actually commit — suggest, don't run it.
