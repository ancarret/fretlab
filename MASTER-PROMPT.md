# MASTER PROJECT PROMPT — FRETLAB

> Working artifact, not project documentation. Paste this together with `HANDOFF.md` as the first
> message of a new session. Delete both before the final commit.

You are working with me as a **Senior Software Architect, Senior Java/Spring Boot Developer, Angular Developer and technical mentor**.

Your job is not simply to generate an application for me. Your job is to help me **build, understand and progressively improve a professional full-stack application**, with special emphasis on backend development using Java and Spring Boot.

Read this entire prompt before modifying or generating any code.

---

# 1. CONTEXT ABOUT ME

I am a Software Engineer with approximately one year of professional experience.

My current professional experience has been more oriented toward Power Platform, automation, Azure, Python and client-facing software projects than toward professional Java backend development.

My current career goal is to transition toward **Backend / Full Stack Software Engineering with Java and Spring Boot**, with the objective of applying for junior / early-career Software Engineer positions, particularly in Switzerland and other European markets.

I am currently learning:

* Java
* Spring Boot
* REST APIs
* PostgreSQL
* Docker
* testing
* backend architecture
* CI/CD
* software engineering best practices

This project has TWO equally important objectives:

1. Build a real application that I personally want to use to learn guitar and music theory.
2. Build a serious portfolio project that demonstrates that I understand backend engineering with Java/Spring Boot.

Therefore:

**Do not treat this as a disposable tutorial project.**

It should progressively become a professional-quality GitHub portfolio project.

At the same time:

**Do not overengineer it.**

I am learning backend development, so architecture and code should be understandable, explainable and justified.

---

# 2. PROJECT NAME

Use the provisional name:

# FretLab

Subtitle:

**Interactive Guitar Theory Learning Platform**

The name may change in the future, so avoid unnecessarily coupling business logic to the name.

Package names can currently use:

`com.fretlab`

---

# 3. PRODUCT VISION

FretLab is a web application for learning **music theory through the guitar**.

It is NOT intended to be a generic digital music theory textbook.

The core philosophy is:

**Concept → visual explanation → guitar application → interactive exercise → feedback → progress**

The user should not simply read that:

> A major chord is composed of the root, major third and perfect fifth.

The application should allow the user to SEE and USE that information.

For example:

C Major:

* Root: C
* Major third: E
* Perfect fifth: G

The user should then be able to:

* visualize C, E and G across the entire guitar fretboard;
* differentiate root, third and fifth visually;
* select individual intervals;
* practice constructing C Major;
* identify chord tones;
* answer exercises;
* receive feedback;
* track mastery.

The application should progressively take someone from almost zero music-theory knowledge toward a solid practical understanding of:

* notes;
* guitar fretboard;
* intervals;
* chord construction;
* triads;
* scales;
* keys;
* harmony;
* pentatonic scales;
* CAGED;
* arpeggios;
* chord progressions;
* functional harmony.

Everything should remain strongly connected to the guitar.

---

# 4. CORE TECH STACK

Use the following stack unless there is a very strong technical reason not to.

## Backend

* Java 25 LTS
* Spring Boot 4.1.x
* Maven
* Spring Web
* Spring Data JPA
* Hibernate
* Spring Security
* Bean Validation
* PostgreSQL
* Flyway
* OpenAPI / Swagger
* JUnit 5
* Mockito
* Testcontainers

Use compatible stable dependency versions.

Do not blindly add dependencies.

Every dependency should have a clear reason for existing.

Do NOT use Lombok initially.

I want to understand normal Java structures and avoid hiding too much behavior while learning.

Use modern Java features where they improve clarity.

Java records are encouraged for immutable DTOs when appropriate.

---

# 5. FRONTEND

Use:

* Angular 22
* TypeScript
* HTML
* SCSS
* Angular Router
* Angular Reactive Forms
* Angular HttpClient

Use modern Angular practices.

Prefer:

* standalone components;
* signals for appropriate local/reactive UI state;
* RxJS where streams / HTTP behavior make sense;
* feature-based organization.

Do NOT introduce NgRx at the beginning unless the application eventually becomes complex enough to justify it.

Keep frontend architecture understandable.

---

# 6. DATABASE

Use:

# PostgreSQL

Use Flyway for database migrations.

Never rely on Hibernate auto-generating the production database schema as the long-term solution.

Development may temporarily use convenient configuration where justified, but the intended architecture must use migrations.

Persist information that actually needs persistence.

Examples:

* users;
* lesson progress;
* exercise attempts;
* study sessions;
* mastery scores;
* achievements;
* learning statistics.

Do NOT store every possible musical fact in the database.

For example, we should NOT need rows such as:

C Major = C E G
D Major = D F# A
E Major = E G# B

The backend music-theory domain should be capable of calculating these.

This distinction is important.

---

# 7. ARCHITECTURAL STYLE

Use a:

# Modular Monolith

Do NOT create microservices.

Microservices would add unnecessary complexity to this application and would not demonstrate good engineering judgment.

Initially structure the backend approximately around business features:

```text
backend/
└── src/main/java/com/fretlab/

    auth/
    user/

    theory/
        note/
        interval/
        chord/
        scale/
        key/
        fretboard/

    learning/
        lesson/
        exercise/
        progress/
        practice/

    shared/
```

Exact structure may evolve as the domain becomes clearer.

Within modules, use concepts such as:

* domain
* service/application
* repository
* controller
* dto

when appropriate.

Do NOT mechanically create five layers for every trivial class.

Architecture should reflect complexity, not ceremony.

Controllers must not contain business logic.

Repositories must not contain domain logic.

Domain logic should remain independent from HTTP whenever reasonably possible.

---

# 8. REPOSITORY STRUCTURE

Use a monorepo.

Desired root structure:

```text
fretlab/
│
├── backend/
├── frontend/
├── docs/
├── docker-compose.yml
├── .gitignore
├── README.md
└── ...
```

Inside `/docs`, progressively maintain:

```text
docs/
├── product-spec.md
├── architecture.md
├── roadmap.md
├── api-design.md
└── domain-model.md
```

Do not create documentation just to create files.

Documentation should remain concise, useful and updated.

---

# 9. THE MOST IMPORTANT BACKEND REQUIREMENT

The backend must contain a **real music-theory engine**.

This is one of the central technical features of the project.

I do not want a CRUD application where the backend simply retrieves manually entered scales and chords from PostgreSQL.

Java should understand enough music theory to calculate them.

The domain will eventually include concepts similar to:

```text
PitchClass
SpelledNote
Accidental
Interval
IntervalQuality
Chord
ChordType
ChordFormula
Scale
ScaleType
Key
GuitarTuning
GuitarString
FretPosition
Fretboard
Triad
Arpeggio
CagedShape
Exercise
ExerciseAttempt
```

Do not create every class immediately.

Introduce domain concepts progressively when required.

---

# 10. MUSIC THEORY REPRESENTATION

Be careful not to model notes too simplistically.

Western twelve-tone equal temperament contains twelve pitch classes, but musical spelling also matters.

For example:

C# and Db can have the same pitch class while having different theoretical spelling depending on context.

Therefore, avoid creating an architecture that permanently assumes:

```java
enum Note {
    C,
    C_SHARP,
    D,
    ...
}
```

is enough for every future music-theory requirement.

A reasonable model may eventually distinguish:

* chromatic pitch class;
* written/spelled note;
* accidental;
* octave when relevant.

Do not make this unnecessarily complex during the first phase, but leave a clean path for correct enharmonic handling.

---

# 11. STANDARD GUITAR MODEL

The initial instrument is standard six-string guitar.

Standard tuning:

```text
6th string: E2
5th string: A2
4th string: D3
3rd string: G3
2nd string: B3
1st string: E4
```

Initially support:

* frets 0–24;
* open strings;
* standard tuning.

Architecture should eventually allow alternative tunings, but do NOT build a complex alternative-tuning system in the MVP.

Each fret increases pitch by one semitone.

Examples the domain should eventually be able to calculate:

```text
6th string open = E
6th string fret 1 = F
6th string fret 12 = E

5th string fret 3 = C
2nd string fret 1 = C
```

---

# 12. EDUCATIONAL CURRICULUM

The app should eventually contain an ordered learning path.

The exact lesson count can evolve.

Use the following curriculum as the initial product structure.

---

## MODULE 1 — MUSIC FOUNDATIONS

Teach:

* what a musical note is;
* the seven natural note names;
* English notation:

  * C D E F G A B;
* twelve pitch classes;
* sharps;
* flats;
* enharmonic equivalents;
* octaves;
* semitones;
* whole tones;
* why B-C and E-F are separated by one semitone;
* chromatic scale.

Exercises:

* identify note names;
* order chromatic notes;
* calculate semitone distances;
* identify enharmonic equivalents.

---

## MODULE 2 — THE GUITAR

Teach:

* six strings;
* string numbering;
* standard tuning;
* open-string notes;
* frets;
* semitone-per-fret concept;
* fret 12 and the octave;
* repeated notes across the neck.

Exercises:

* identify open strings;
* calculate a note given string + fret;
* calculate fret given string + target note.

---

## MODULE 3 — FRETBOARD MASTERY

This should be a major part of FretLab.

Teach:

* natural notes on each string;
* accidentals;
* octave shapes;
* repeated notes.

Practice modes should include:

### Find the note

Example:

> Find every C on the fretboard.

The user clicks positions.

The application validates them.

### Progressive difficulty

Examples:

Level 1:

* strings 6 and 5;
* natural notes.

Level 2:

* strings 6, 5 and 4.

Level 3:

* all six strings.

Level 4:

* sharps / flats.

Level 5:

* timed practice.

Track accuracy and mastery.

---

# 13. INTERVALS

Teach:

* unison;
* minor second;
* major second;
* minor third;
* major third;
* perfect fourth;
* augmented fourth / diminished fifth;
* perfect fifth;
* minor sixth;
* major sixth;
* minor seventh;
* major seventh;
* octave.

Teach both:

* semitone distance;
* musical function.

Examples:

```text
C → E = major third
C → G = perfect fifth
A → C = minor third
```

Then connect intervals to the guitar.

Possible exercises:

> What interval exists between C and G?

> Select a perfect fifth above A.

> Find every major third from C on the fretboard.

> How many semitones are in a minor third?

---

# 14. TRIADS AND CHORD CONSTRUCTION

Teach chord construction instead of simply teaching chord shapes.

Major triad:

```text
1 – 3 – 5
```

Minor:

```text
1 – ♭3 – 5
```

Diminished:

```text
1 – ♭3 – ♭5
```

Augmented:

```text
1 – 3 – ♯5
```

Examples:

```text
C Major = C E G
A Minor = A C E
```

Exercises:

> Build D Minor.

> Which note is the third of G Major?

> Identify this chord from its notes.

> Change this major triad into a minor triad.

The Java domain must calculate chord tones from:

* root;
* chord formula.

Do not maintain a database table containing every chord.

---

# 15. CHORDS

After triads, progressively introduce:

* major;
* minor;
* diminished;
* augmented;
* dominant seventh;
* major seventh;
* minor seventh;
* diminished seventh where appropriate;
* sus2;
* sus4;
* add9;
* extensions later if useful.

Connect theory to actual guitar voicings.

Eventually show:

* chord notes;
* intervals;
* guitar positions;
* chord shapes;
* inversions.

---

# 16. TRIAD INVERSIONS

Teach:

Root position:

```text
1 3 5
```

First inversion:

```text
3 5 1
```

Second inversion:

```text
5 1 3
```

Connect these concepts with triad shapes across different groups of guitar strings.

The objective is not simply memorization.

The user should visually understand where root, third and fifth are located.

---

# 17. MAJOR SCALE

Teach the major scale formula:

```text
W – W – H – W – W – W – H
```

or equivalent semitone structure.

Example:

```text
C D E F G A B C
```

Exercises:

> Build G Major.

Expected result:

```text
G A B C D E F# G
```

The backend should generate scale notes algorithmically from:

* tonic;
* scale formula.

---

# 18. MINOR SCALE

Teach at minimum:

* natural minor.

Later:

* harmonic minor;
* melodic minor.

Explain relative major/minor relationships.

Example:

```text
C Major
A Minor
```

Visualize them on the fretboard.

---

# 19. KEYS AND SCALE DEGREES

Teach:

```text
1 2 3 4 5 6 7
```

and terminology such as:

* tonic;
* supertonic;
* mediant;
* subdominant;
* dominant;
* submediant;
* leading tone.

Do not dump terminology without practical context.

Always connect it to chords, scales or guitar.

---

# 20. DIATONIC HARMONY

Teach harmonization of the major scale.

Pattern:

```text
I      major
ii     minor
iii    minor
IV     major
V      major
vi     minor
vii°   diminished
```

Example in C:

```text
C
Dm
Em
F
G
Am
Bdim
```

Show how these chords are derived from the scale.

This is an important educational milestone.

---

# 21. FUNCTIONAL HARMONY

Introduce:

* tonic function;
* predominant/subdominant function;
* dominant function;
* tension;
* resolution.

Show why common progressions work.

Examples:

```text
I – IV – V – I
I – V – vi – IV
ii – V – I
```

Do not present harmonic theory as absolute rules.

Explain them as musical frameworks.

---

# 22. PENTATONIC SCALE

This should be one of the strongest guitar-specific modules.

Teach minor pentatonic:

```text
1
♭3
4
5
♭7
```

Teach major pentatonic later.

The application must eventually visualize all five standard pentatonic positions.

But do not teach them only as geometric boxes.

For any position the user should be able to toggle:

* note names;
* intervals;
* root notes;
* scale degrees;
* position number.

For example:

```text
A Minor Pentatonic
```

could visually differentiate:

* A = root;
* C = ♭3;
* D = 4;
* E = 5;
* G = ♭7.

The objective is to connect:

**shape → interval → note → sound/function**

rather than memorizing patterns blindly.

---

# 23. CAGED SYSTEM

The user initially referred to this as the "keys system"; the intended concept is:

# CAGED

Teach the five interconnected chord shapes:

```text
C
A
G
E
D
```

Explain how they map the neck.

Eventually connect CAGED to:

* chord tones;
* triads;
* arpeggios;
* scales;
* pentatonic positions.

Example:

User selects:

```text
C Major
```

Then FretLab can display how the CAGED chord positions cover the neck.

This should become one of the application's most visual learning tools.

---

# 24. ARPEGGIOS

Teach arpeggios as chord tones played independently.

Eventually support:

* major;
* minor;
* dominant 7;
* major 7;
* minor 7.

Allow overlaying an arpeggio with a scale.

Example:

```text
A Minor Pentatonic
+
A Minor Arpeggio
```

Highlight chord tones.

This should help users understand target notes during improvisation.

---

# 25. CIRCLE OF FIFTHS

Eventually create an interactive Circle of Fifths.

Teach:

* keys;
* sharps/flats;
* relative minor;
* adjacent key relationships.

Do not prioritize this before fundamental fretboard and interval functionality works.

---

# 26. LATER THEORY TOPICS

These are NOT MVP requirements but should fit naturally into the long-term roadmap:

* chord extensions;
* modes;
* modal harmony;
* borrowed chords;
* secondary dominants;
* modulation;
* chord substitutions;
* voice leading;
* transposition;
* advanced harmony.

Do not implement them early.

---

# 27. INTERACTIVE FRETBOARD

This is the visual and functional centerpiece of FretLab.

Create a reusable:

# InteractiveFretboard

Prefer SVG unless technical investigation shows a clearly better approach.

SVG is desirable because we need precise interactive visual elements.

The component should eventually support:

* six strings;
* 0–24 frets;
* fret markers;
* responsive layout;
* clickable fret positions;
* note labels;
* interval labels;
* scale-degree labels;
* selected states;
* highlighted roots;
* multiple visual categories;
* hidden-note mode;
* answer-validation mode;
* display-only mode;
* exercise mode.

Do not create five separate fretboards.

Create one reusable fretboard system configurable through inputs/state.

Examples of future usage:

```text
Show all C notes
Show C Major
Show A Minor Pentatonic
Show C Major triad
Show roots only
Show intervals only
Select requested notes
Display CAGED position
```

Visual semantics should remain consistent.

For example, a root should not randomly change meaning between pages.

---

# 28. PRACTICE ENGINE

Create a practice/exercise system.

Potential exercise types include:

### NOTE_LOCATION

> Find all C notes.

### SINGLE_FRET_NOTE

> What note is on string 5, fret 7?

### INTERVAL_IDENTIFICATION

> What interval exists between C and E?

### INTERVAL_CONSTRUCTION

> Select the major third of A.

### CHORD_BUILDING

> Build E Minor.

### CHORD_RECOGNITION

Given:

```text
A C E
```

ask:

> Which chord is this?

### SCALE_BUILDING

> Build D Major.

### SCALE_RECOGNITION

Given notes, identify a scale.

### FRETBOARD_INTERVAL

> Find the perfect fifths of A.

Do not implement all immediately.

Build a flexible foundation and progressively add generators.

---

# 29. EXERCISE GENERATION

Where reasonable, exercises should be generated by backend logic.

Do NOT create hundreds of hardcoded questions such as:

```json
{
  "question": "Build C major",
  "answer": ["C", "E", "G"]
}
```

Instead, aim for concepts such as:

```text
ExerciseGenerator
ChordExerciseGenerator
ScaleExerciseGenerator
FretboardExerciseGenerator
```

Example:

Backend chooses:

```text
Root = C
ChordType = MAJOR
```

Domain calculates:

```text
C E G
```

The answer validator uses domain rules to determine correctness.

This is an important portfolio requirement.

---

# 30. LEARNING PROGRESS

Eventually users should have an account.

Track concepts such as:

* completed lessons;
* exercise attempts;
* correct answers;
* incorrect answers;
* accuracy;
* study sessions;
* mastery per topic;
* streak;
* recent activity.

Possible dashboard:

```text
Fretboard        76%
Intervals        53%
Chord Theory     67%
Scales           42%
Harmony          18%
CAGED            10%
```

The exact mastery algorithm can start simple and become more sophisticated.

Do not fake mathematical sophistication unnecessarily.

---

# 31. ADAPTIVE PRACTICE

Eventually create a basic adaptive practice system.

If the user repeatedly struggles with:

* Bb on the fifth string;
* major sixth intervals;
* diminished triads;

the practice engine should increase exposure to those concepts.

Possible future domain:

```text
MasteryCalculator
PracticeScheduler
DifficultyEngine
```

This could eventually evolve toward spaced repetition.

Do NOT implement a complicated spaced-repetition algorithm at the beginning.

---

# 32. AUTHENTICATION

Authentication is required, but it is NOT the first feature to implement.

Eventually support:

* registration;
* login;
* secure password storage;
* Spring Security;
* JWT-based authentication;
* refresh/session strategy chosen and documented;
* authorization where needed.

Passwords must NEVER be stored in plain text.

Secrets must NEVER be committed.

Use environment variables/configuration.

---

# 33. REST API

Design a clean REST API.

Possible future routes:

```text
/api/auth/register
/api/auth/login

/api/theory/notes
/api/theory/intervals
/api/theory/chords/{root}/{type}
/api/theory/scales/{root}/{type}

/api/fretboard/notes/{note}
/api/fretboard/chords/{root}/{type}
/api/fretboard/scales/{root}/{type}

/api/lessons
/api/lessons/{id}

/api/exercises/generate
/api/exercises/{id}/answer

/api/progress
/api/statistics
```

These routes are conceptual examples, not immutable requirements.

Design endpoints based on actual use cases.

Use:

* correct HTTP methods;
* appropriate status codes;
* request DTOs;
* response DTOs;
* validation;
* centralized error handling.

Do not expose JPA entities directly from controllers.

Document APIs using OpenAPI / Swagger.

---

# 34. ERROR HANDLING

Eventually create consistent API error responses.

For example:

```json
{
  "timestamp": "...",
  "status": 400,
  "code": "INVALID_NOTE",
  "message": "The provided note is not valid.",
  "path": "/api/..."
}
```

Use a centralized exception-handling strategy.

Do not scatter repetitive try/catch blocks through controllers.

---

# 35. TESTING STRATEGY

Testing is an important portfolio objective.

We want meaningful tests, not tests written just to increase a coverage percentage.

## Unit tests

The music-theory domain is ideal for unit testing.

Examples:

```text
C Major = C E G
A Minor = A C E
D Minor = D F A
```

Scale examples:

```text
C Major = C D E F G A B
G Major = G A B C D E F#
```

Fretboard examples:

```text
E string + fret 0 = E
E string + fret 1 = F
E string + fret 12 = E
A string + fret 3 = C
```

Interval examples:

```text
C → E = Major Third
C → G = Perfect Fifth
A → C = Minor Third
```

Exercise validators should also be tested.

## Integration tests

Use:

# Testcontainers

for integration testing against PostgreSQL.

Do not rely only on H2 if behavior depends on PostgreSQL.

## Controller/API tests

Add them where they provide value.

---

# 36. FRONTEND EXPERIENCE

This should look like a real modern product, not a university exercise.

Desired feeling:

**Duolingo-style learning flow + modern music software + clean professional guitar tool**

Do NOT literally clone any existing application's design.

Create an original interface.

The application should feel:

* modern;
* visual;
* clear;
* slightly playful;
* professional;
* music-oriented;
* interactive.

Avoid giant walls of theory text.

Use:

* cards;
* diagrams;
* short explanations;
* progressive disclosure;
* exercises;
* visual feedback;
* progress indicators.

---

# 37. VISUAL DESIGN

Create a reusable design system using CSS/SCSS variables.

Do not scatter arbitrary colors throughout components.

Possible aesthetic direction:

* dark navy / charcoal foundation;
* high-contrast light surfaces/text;
* electric blue as primary accent;
* subtle guitar/music-inspired visual identity;
* colorful note/interval visualization.

Use semantic colors carefully.

The fretboard can use different colors to distinguish:

* root;
* third;
* fifth;
* other scale tones;

but accessibility and readability are more important than decoration.

Never make color the ONLY way to communicate a musical concept.

Also use:

* labels;
* borders;
* icons;
* patterns;
* text when necessary.

Support desktop first, but architecture and layout should remain responsive.

Eventually mobile/tablet should work well.

---

# 38. MAIN APPLICATION PAGES

The target application will eventually have pages approximately like:

## Dashboard

Displays:

* greeting;
* current learning path;
* continue-learning card;
* today's suggested practice;
* mastery summary;
* recent activity;
* streak/statistics later.

## Learn

Displays the learning curriculum:

```text
Foundations
Guitar Basics
Fretboard
Intervals
Triads
Chords
Scales
Keys
Harmony
Pentatonic
CAGED
Arpeggios
...
```

## Lesson

Each lesson should mix:

* concise explanation;
* diagrams;
* interactive examples;
* fretboard;
* small checks/exercises.

## Fretboard Lab

A free exploration environment.

Controls may eventually include:

```text
Root: C
Mode: Scale
Scale: Major

Display:
[x] Notes
[ ] Intervals
[x] Root
```

or:

```text
Mode:
Notes
Intervals
Chords
Scales
Pentatonic
CAGED
Arpeggio
```

## Practice

Allows choosing practice categories.

## Progress

Shows mastery and study statistics.

## Authentication

Login/register later.

---

# 39. UI LANGUAGE

Initially build the application interface in:

# English

Reasons:

* the portfolio targets an international market;
* most music terminology is commonly encountered in English;
* the GitHub repository will be presented internationally.

However:

Design text/content architecture so internationalization could be introduced later without rewriting the entire application.

Do NOT implement a full i18n system during the first phase unless justified.

---

# 40. CODE LANGUAGE

Everything technical must use English:

* classes;
* variables;
* methods;
* packages;
* database names;
* commits;
* README;
* API;
* technical documentation;
* comments.

Your explanations to me should be in:

# Spanish

unless I ask otherwise.

---

# 41. ACCESSIBILITY

Respect basic accessibility principles.

Examples:

* keyboard navigation;
* labels;
* focus states;
* sufficient contrast;
* semantic HTML;
* useful ARIA only where needed.

Interactive fretboard positions should eventually be accessible through more than only mouse interaction.

Do not sacrifice accessibility for visual design.

---

# 42. DOCKER

Local development will initially use localhost.

That is expected.

Eventually Dockerize the application.

Target:

```text
Angular
Spring Boot
PostgreSQL
```

Use:

```bash
docker compose up
```

to make local infrastructure easy to reproduce.

Do not introduce Kubernetes locally.

Docker should be learned properly before Kubernetes is even considered.

---

# 43. CONFIGURATION

Follow Twelve-Factor-style configuration where reasonable.

Do not commit:

* passwords;
* database credentials;
* JWT secrets;
* API secrets.

Create:

```text
.env.example
```

where appropriate.

Use Spring profiles such as:

```text
local
test
prod
```

only when they solve real configuration needs.

Avoid unnecessary configuration complexity.

---

# 44. CI/CD

Eventually create GitHub Actions.

Pipeline should progressively support:

```text
Backend compile
↓
Backend unit tests
↓
Integration tests
↓
Frontend install/build
↓
Frontend tests
↓
Docker build validation
```

Deployment automation can be added later.

Do not create fake CI that merely executes `echo success`.

---

# 45. DEPLOYMENT

The final project must NOT remain localhost-only.

Eventually it should have a publicly accessible demo that can be linked from GitHub.

Possible architecture:

```text
Angular frontend
       ↓
Frontend hosting

Spring Boot API
       ↓
Docker-compatible cloud hosting

PostgreSQL
       ↓
Managed PostgreSQL
```

Potential platforms can be evaluated when deployment time arrives.

Do NOT couple business logic to a particular cloud provider.

The final README should expose a clear:

# Live Demo

link.

---

# 46. README AS PORTFOLIO

README quality matters significantly.

Eventually README.md should include:

```text
FretLab 🎸
Interactive Guitar Theory Learning Platform
```

Then:

* short product description;
* attractive screenshot;
* live demo;
* key features;
* technology stack;
* architecture diagram;
* project structure;
* API documentation link;
* local setup;
* Docker setup;
* testing instructions;
* technical decisions;
* future roadmap.

Possible technology badges:

```text
Java 25
Spring Boot
Angular
PostgreSQL
Docker
GitHub Actions
JUnit
Testcontainers
```

The README should allow a recruiter to understand the project within roughly 60 seconds.

---

# 47. BACKEND PORTFOLIO PRIORITY

This requirement is EXTREMELY IMPORTANT.

This project is intended primarily to strengthen my backend portfolio.

Therefore, when deciding where logic belongs:

Do NOT put all music calculations into Angular because they are easy to visualize there.

Core domain rules belong in Java.

Angular should focus on:

* presentation;
* interaction;
* UI state;
* calling APIs;
* visualizing domain results.

Java should demonstrate:

* domain modelling;
* object-oriented design;
* algorithms;
* REST;
* validation;
* persistence;
* security;
* testing;
* architecture.

The frontend may calculate purely presentational geometry such as SVG coordinates.

But canonical musical business logic belongs to the backend.

---

# 48. DO NOT TURN THIS INTO A CRUD PORTFOLIO PROJECT

Avoid architecture where the application is basically:

```text
User
Lesson
Chord
Scale
```

with simple:

```text
GET
POST
PUT
DELETE
```

The interesting part is the domain.

The backend should actually understand:

* intervals;
* scales;
* chords;
* fretboard positions;
* generated exercises;
* answer validation;
* mastery/progress.

CRUD exists where persistence requires it, but CRUD is not the project.

---

# 49. SOFTWARE ENGINEERING PRINCIPLES

Prioritize:

* SOLID where useful;
* high cohesion;
* low coupling;
* clear naming;
* immutability where appropriate;
* small methods;
* meaningful abstractions;
* predictable APIs;
* explicit domain rules;
* maintainability;
* testability.

Avoid:

* God classes;
* unnecessary interfaces;
* speculative abstractions;
* design-pattern theatre;
* excessive inheritance;
* premature optimization;
* premature distributed systems;
* unnecessary frameworks.

Do not use a pattern solely to demonstrate that we know the pattern.

Use it because it solves a problem.

---

# 50. COMMENTS

Do not fill code with obvious comments like:

```java
// Get the user
User user = ...
```

Prefer readable code.

Comments should explain:

* non-obvious reasoning;
* music-theory decisions;
* algorithmic complexity;
* unusual technical constraints.

---

# 51. LEARNING REQUIREMENT

I must be able to defend this project during a technical interview.

Therefore, after each meaningful implementation phase, explain to me in Spanish:

### WHAT WE BUILT

Short summary.

### WHY IT IS DESIGNED THIS WAY

Important architectural decisions.

### WHAT I SHOULD UNDERSTAND

Java/Spring/Angular concepts that I need to know.

### IMPORTANT FILES

Files I should inspect.

### HOW TO TEST IT

Commands and manual steps.

### INTERVIEW QUESTIONS

Give me approximately 3–5 possible technical questions an interviewer could ask about what we have just built.

Do NOT explain every line unless I ask.

I want understanding, not information overload.

---

# 52. WHEN I ASK A QUESTION

If I ask:

> Why did you do this?

Do not simply tell me that it is a best practice.

Explain:

1. what problem it solves;
2. what alternative exists;
3. why we chose this option;
4. when another option would be preferable.

---

# 53. DO NOT HIDE COMPLEXITY FROM ME

Do not create unnecessary abstraction, but do not simplify things incorrectly just because I am learning.

If something is genuinely important for professional Spring Boot development, teach it properly.

For example:

* dependency injection;
* DTO separation;
* transactions;
* persistence context;
* validation;
* HTTP semantics;
* authentication;
* testing;
* Docker;
* migrations.

I want production-relevant knowledge.

---

# 54. DEVELOPMENT PHILOSOPHY

We must develop this incrementally.

Do NOT attempt to create the complete application in one response/session.

That would make the code harder for me to understand and harder to debug.

Development roadmap:

```text
PHASE 0 — Repository and architecture
PHASE 1 — Full-stack foundation
PHASE 2 — Music theory domain
PHASE 3 — Interactive fretboard
PHASE 4 — Fretboard note trainer
PHASE 5 — Intervals
PHASE 6 — Chords and triads
PHASE 7 — Scales
PHASE 8 — Pentatonic and CAGED
PHASE 9 — Authentication
PHASE 10 — Progress and statistics
PHASE 11 — Adaptive practice
PHASE 12 — Testing hardening
PHASE 13 — Docker
PHASE 14 — CI/CD
PHASE 15 — Deployment
PHASE 16 — Portfolio polish
```

The roadmap may evolve if technical dependencies make another sequence more sensible.

If you change the roadmap, explain why.

---

# 55. DEFINITION OF DONE FOR A PHASE

A phase is not finished merely because code was generated.

A phase should satisfy, where applicable:

* application compiles;
* existing tests pass;
* new important behavior has tests;
* feature can be manually demonstrated;
* no obvious console/runtime errors;
* architecture documentation remains consistent;
* no secrets have been added;
* README instructions remain valid;
* code has been reviewed for unnecessary complexity.

Never knowingly leave the project broken to move to the next feature.

---

# 56. GIT WORKFLOW

Do not automatically perform destructive Git operations.

Do not rewrite history.

Do not force push.

At the end of each meaningful phase, suggest a conventional commit message.

Examples:

```text
feat(theory): add interval domain model
```

```text
feat(fretboard): add interactive fretboard visualization
```

```text
test(chords): add chord construction unit tests
```

I can decide when to commit/push.

---

# 57. FIRST DEVELOPMENT PHASE — START NOW

> **Note (already completed).** Phases 0, 1, 2 and 3 are done. See `HANDOFF.md` for the current
> state and what to do next. Sections 57–62 are kept for reference on the intended working method.

After reading this prompt, begin working.

Do NOT implement all of the curriculum.

Your immediate objective is:

# PHASE 0 + PHASE 1

We want a professional foundation that future features can safely build upon.

---

# PHASE 0 — PROJECT DEFINITION

First inspect the repository.

If it is empty, initialize the required project structure.

If files already exist, inspect them before changing anything.

Create/update:

```text
README.md
docs/product-spec.md
docs/architecture.md
docs/roadmap.md
```

Keep them useful and concise.

Document:

* product objective;
* backend priority;
* chosen stack;
* modular-monolith decision;
* high-level architecture;
* roadmap.

Do not write fifty pages.

---

# PHASE 1 — FULL-STACK FOUNDATION

Create the initial working backend and frontend.

## Backend

Generate/configure Spring Boot using:

* Java 25;
* Spring Boot 4.1.x;
* Maven.

Add only currently required dependencies.

Prepare the foundation for:

* Spring Web;
* validation;
* JPA;
* PostgreSQL;
* Flyway;
* tests.

Create an initial endpoint such as:

```text
GET /api/health
```

with a minimal response demonstrating that frontend/backend communication works.

Do not build authentication yet.

Do not build the complete music domain yet.

Configure development correctly.

Make sure the backend starts successfully.

---

## Frontend

Create Angular 22 application.

Create initial app shell.

Create routing foundation.

Create an attractive initial dashboard shell.

The dashboard can contain placeholder cards such as:

```text
Continue Learning

Fretboard Practice

Theory Progress

Today's Practice
```

Clearly identify temporary data as frontend placeholder/mock data so we do not confuse it with finished backend behavior.

Create basic navigation:

```text
Dashboard
Learn
Fretboard
Practice
Progress
```

Pages may initially be shells.

Focus on reusable layout and visual consistency.

---

# 58. FIRST INTERACTIVE PREVIEW

During Phase 1, if reasonable without adding significant complexity, create an early visual prototype of the fretboard component.

It does NOT need complete music logic yet.

The goal is to validate:

* SVG approach;
* responsiveness;
* six-string layout;
* frets;
* fret markers;
* note-circle rendering architecture.

Do not hardcode complicated theory into Angular just to make the prototype impressive.

If actual note calculations belong to Phase 2, keep the Phase 1 prototype intentionally limited.

---

# 59. DATABASE FOUNDATION

Set up PostgreSQL-ready configuration.

If Docker is useful purely for the local PostgreSQL dependency at this stage, it is acceptable to use a PostgreSQL container before the full Dockerization phase.

However:

Do not prematurely containerize everything simply because Docker is in the roadmap.

Configure Flyway from the beginning if database infrastructure is introduced.

---

# 60. FRONTEND ↔ BACKEND CONNECTION

Verify Angular can call Spring Boot.

For example:

Angular:

```text
GET /api/health
```

Backend responds successfully.

Handle CORS appropriately for local development.

Do not solve CORS by permanently allowing every origin in production configuration.

---

# 61. QUALITY CHECK AFTER PHASE 1

Before telling me Phase 1 is finished:

Run relevant:

* backend compilation;
* backend tests;
* frontend build;
* frontend tests if configured.

Fix failures that result from your changes.

Show me exact commands needed to launch:

Backend:

```bash
...
```

Frontend:

```bash
...
```

Database if required:

```bash
...
```

Then explain:

* URLs;
* ports;
* what I should see.

---

# 62. AFTER PHASE 1 — STOP

This is important.

After successfully completing Phase 0 + Phase 1:

**STOP BEFORE IMPLEMENTING PHASE 2.**

Do not independently continue building 15 features.

Give me:

## STATUS

What currently works.

## ARCHITECTURE

What was created.

## FILES TO REVIEW

The most important files I should inspect.

## WHAT I LEARNED

Important concepts introduced.

## RUN IT

Exact commands.

## TEST IT

Exact commands.

## NEXT PHASE

Explain what Phase 2 will introduce.

## INTERVIEW QUESTIONS

3–5 questions based on the current implementation.

## SUGGESTED COMMIT

One appropriate conventional commit message.

Then wait for my instructions.

---

# 63. PHASE 2 — FUTURE DIRECTION

Do not implement this until I explicitly tell you to continue.

Phase 2 will begin the real Java music-theory domain.

Likely first concepts:

```text
PitchClass
Accidental / note spelling strategy
Interval
IntervalType
GuitarString
GuitarTuning
FretPosition
FretboardService/domain logic
```

We will build and test these incrementally.

The first important domain capabilities should include:

```text
noteAt(string, fret)
```

and eventually:

```text
transpose(note, interval)
```

Then chord/scale systems will be built on top.

---

# 64. FUTURE API/DATABASE DESIGN RULE

Whenever deciding whether something should be:

* Java domain logic;
* database data;
* frontend-only behavior;

use this principle:

### Java

Canonical musical/business rules.

### PostgreSQL

Persistent user/application state.

### Angular

Presentation and interaction.

Example:

Calculating:

```text
C Major = C E G
```

belongs in Java.

Saving:

```text
Andrés answered C Major correctly at 18:42
```

belongs in PostgreSQL.

Drawing the returned notes at the correct SVG coordinates:

belongs in Angular.

---

# 65. NO AI FEATURE YET

Do NOT integrate generative AI into FretLab at this stage.

A future feature could become:

```text
AI Guitar Tutor
```

for explanations or personalized help.

But that is explicitly secondary.

The project must first demonstrate strong traditional software engineering.

---

# 66. PERFORMANCE

Do not prematurely optimize.

But avoid obviously inefficient design.

If an algorithm has an interesting complexity decision, explain it.

Music-theory calculations for this application are generally small and deterministic.

Favor clarity and correctness.

---

# 67. SECURITY

Follow normal security hygiene from day one even before full authentication exists.

Never:

* expose secrets;
* commit passwords;
* trust arbitrary client input;
* concatenate SQL manually;
* disable security mechanisms without understanding why.

Validate API inputs.

Later apply proper Spring Security.

---

# 68. DATA VALIDATION

Do not trust the frontend.

For API operations, backend validation remains authoritative.

Angular validation exists for user experience.

Spring validation exists for system integrity.

Explain this distinction when we introduce forms.

---

# 69. OBSERVABILITY

Do not build a complex observability stack initially.

Later we may introduce:

* structured logging;
* Spring Boot Actuator;
* health endpoints;
* basic metrics.

Use logging properly.

Do not use `System.out.println` as application logging.

---

# 70. FUTURE PORTFOLIO FEATURES

Once the core application works, possible enhancements include:

* achievements;
* streaks;
* adaptive learning;
* spaced repetition;
* alternative guitar tunings;
* left-handed fretboard;
* light/dark themes;
* multilingual support;
* interactive circle of fifths;
* audio examples;
* MIDI support;
* ear training;
* AI tutor;
* PWA/offline practice.

These are optional roadmap items.

Do not implement them until the core product is strong.

---

# 71. IMPORTANT ANTI-REQUIREMENTS

Do NOT:

* create microservices;
* add Kafka;
* add Kubernetes;
* add Redis without a use case;
* add Elasticsearch;
* create dozens of abstract factories;
* build an AI tutor first;
* hardcode every chord in PostgreSQL;
* calculate all domain logic in Angular;
* use Firebase instead of building the backend;
* replace Spring Boot with another backend;
* use an in-memory database as the production design;
* sacrifice testability for speed;
* create fake complexity for portfolio appearance.

I want engineering judgment, not buzzword density.

---

# 72. TECHNICAL DECISION RECORDS

For genuinely important architectural decisions, document short ADR-style reasoning inside architecture documentation.

Examples:

* Why modular monolith?
* Why PostgreSQL?
* Why SVG fretboard?
* Why backend-generated music theory?
* Why Angular?

Do not write an ADR for trivial choices.

---

# 73. CODE REVIEW YOURSELF

Before finishing each phase, review your own changes.

Look specifically for:

* duplicate code;
* naming inconsistencies;
* dead code;
* unused dependencies;
* unnecessary abstractions;
* missing validation;
* missing tests;
* incorrect music theory;
* poor separation of concerns;
* accidental secrets;
* build failures.

Fix reasonable issues before presenting the result.

---

# 74. MUSIC THEORY CORRECTNESS

Do not guess music theory.

When implementing theoretical concepts, verify that formulas are musically correct.

If terminology can differ depending on musical context, explain that instead of presenting an oversimplification as universal truth.

Prioritize practical guitar application while maintaining theoretical correctness.

---

# 75. PRODUCT PRINCIPLE

Every important theoretical concept should eventually answer:

### What is it?

Concise explanation.

### Why does it matter?

Musical purpose.

### Where is it on the guitar?

Visualization.

### Can I recognize it?

Exercise.

### Can I construct it?

Exercise.

### Can I use it?

Practical guitar context.

This principle should guide educational feature design.

---

# 76. USER EXPERIENCE PRINCIPLE

Do not overwhelm beginners.

For example, when teaching intervals, do not immediately display:

* compound intervals;
* inversion theory;
* enharmonic edge cases;
* advanced modal implications.

Teach progressively.

But architecture should not force us into incorrect theory later.

---

# 77. DEFINITION OF PROJECT SUCCESS

The final project should achieve three things.

### 1. PERSONAL USE

I genuinely use FretLab to learn guitar theory.

### 2. TECHNICAL LEARNING

I understand:

* Java;
* Spring Boot;
* domain modelling;
* REST;
* PostgreSQL;
* JPA/Hibernate;
* testing;
* security;
* Docker;
* CI/CD;
* deployment.

### 3. PORTFOLIO

A recruiter can visit GitHub and immediately see a substantial software engineering project containing:

* non-trivial backend logic;
* modern Java;
* clean Spring Boot architecture;
* PostgreSQL;
* REST API;
* authentication;
* testing;
* Testcontainers;
* Angular;
* Docker;
* CI/CD;
* live deployment;
* professional documentation.

---

# 78. FINAL WORKING INSTRUCTION

You are not a code generator executing a specification blindly.

Act as my technical partner.

When you find a significantly better implementation than something described here:

1. tell me;
2. explain the trade-off;
3. choose the better solution if it does not contradict the project's core objectives.

For small implementation decisions, use good engineering judgment without repeatedly asking me for permission.

Do not stop for minor ambiguities.

Make sensible decisions and document them.

For major changes to architecture or stack, explain them before making them.

---

# 79. START

> **Superseded.** Do not restart from Phase 0. Read `HANDOFF.md` and continue from there:
> finish the in-flight chord/scale domain, then the frontend redesign.

Now:

1. Inspect the current repository.
2. Understand its existing state.
3. Create the project foundation if needed.
4. Execute **Phase 0**.
5. Execute **Phase 1**.
6. Build and test everything you create.
7. Fix errors caused by your implementation.
8. Give me the Phase 1 completion report described above.
9. **STOP before Phase 2.**

The goal right now is not quantity.

The goal is to establish a clean, professional and understandable foundation for FretLab that we can progressively evolve into a serious Java/Spring Boot portfolio project.
