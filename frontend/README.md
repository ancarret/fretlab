# FretLab — frontend

Angular 22 client. See the [root README](../README.md) for the full project and
[docs/architecture.md](../docs/architecture.md) for the decisions behind this structure.

```bash
npm start    # dev server on http://localhost:4200
npm run build
npm test     # Vitest
```

The dev server expects the API on `http://localhost:8080` (see `src/environments/`).

## Structure

```
src/app/
├── core/        app-wide singletons: API services, layout pieces
├── features/    one folder per route, lazily loaded
└── shared/      reusable components (fretboard, page header)
src/styles/      design tokens and base styles
```

## Conventions

- **Standalone and zoneless.** State a template reads lives in a signal; components use
  `ChangeDetectionStrategy.OnPush`.
- **Tokens, not literals.** Colours, spacing and radii come from `src/styles/_tokens.scss`.
  A component that hardcodes `#4d8dff` is a bug.
- **No music theory here.** The frontend draws what the backend computes. Working out which note
  sits under a fret is the Java domain's job — duplicating it in TypeScript would create a second
  source of truth. Presentational geometry (SVG coordinates, layout) does belong here.
- **Placeholders are labelled.** Any screen rendering hardcoded content shows the `Placeholder`
  badge, so a shell is never mistaken for a finished feature.
