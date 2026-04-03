# Inament Canonical Specification

This `spec/` tree is the canonical authored source for product and implementation contracts.
`docs/` is publish output only and must not be used as an authored source.

## Structure

- `appendices/layout-invariants.md` — desktop/mobile layout contracts
- `appendices/object-catalog-and-carousel.md` — product catalog and carousel behavior
- `appendices/spec-governance.md` — governance rules and merge gate behavior
- `contracts/traceability.json` — machine-readable source-to-spec traceability map
- `no-spec-impact.yaml` — optional artifact when `src/**` changes do not require spec updates

## Governance Entry Point

Use a single gate command:

```bash
npm run verify:spec-governance
```

The gate enforces:

1. `src/**` to `spec/**` linkage policy
2. traceability schema validation
3. no-spec-impact validation (when required)
4. runtime execution order:
   - `npm test`
   - `npm run build`
   - conditional `npm run build:docs`
