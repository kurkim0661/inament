# Appendix — Spec Governance

## Canonical rules

1. Authored specifications live under `spec/**`.
2. `docs/**` is output only.
3. If `src/**` changed and `spec/**` did not, `spec/no-spec-impact.yaml` is required.
4. `spec/no-spec-impact.yaml` must declare exact `touched_src_paths` coverage.
5. Governance must run through `npm run verify:spec-governance`.

## CI policy

Required check name:

- `spec-governance-gate / verify-spec-governance`

This check blocks merge when governance validation fails.
