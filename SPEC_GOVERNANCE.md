# Spec Governance Verification Contract

This document defines the traceability/no-impact contract for
`verify:spec-governance` and the CI gate expected to enforce it.

## Required CI Check

- **Check name**: `verify-spec-governance`
- **Required status**: pass before merge
- **Minimum commands**:

```bash
npm test
npm run build
```

If the PR updates static deployment output, include:

```bash
npm run build:docs
```

## Traceability Contract

Every layout rule in `AGENTS.override.md` must be anchored to executable
verification logic in `scripts/verify-refactor-architecture.mjs`.

Current traceability map:

- `78vh` image-area intent
  -> `DEFAULT_LAYOUT_VARS['--desktop-main-height']` assertion
- `321px` side-width floor
  -> `--desktop-side-width` + desktop `minmax(...321px...)` assertions
- narrow-desktop horizontal scrolling
  -> desktop CSS `overflow-x: scroll` assertion
- `99px` frame-to-footer spacing
  -> base CSS `--content-footer-gap: 99px` assertion
- required command text in policy docs
  -> `AGENTS.override.md` assertions for
     `npm run build` / `npm run build:docs`

When adding or changing a guarded rule:

1. Update `AGENTS.override.md` (policy source),
2. Update `scripts/verify-refactor-architecture.mjs` (enforcement),
3. Update this traceability map (documentation).

## No-Impact Contract

`scripts/verify-refactor-architecture.mjs` must remain side-effect free:

- allowed: reading tracked files and asserting invariants
- disallowed: file writes, network calls, dependency mutations,
  or generated artifacts

This guarantees `npm test` is safe to run locally and in CI
without mutating the repository.

## Code Quality Review (2026-04-03)

- Verification script centralizes invariant checks in one entrypoint
  and exits fast on contract drift.
- Guardrails are explicit/readable, with direct assertions for
  the highest-risk layout regressions.
- Known gap: no dedicated lint script exists yet, so lint gating
  should not be marked required until tooling is added.
