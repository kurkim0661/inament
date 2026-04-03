# Appendix — Layout Invariants

The following invariants must remain true after any refactor:

1. Desktop image-area target keeps `78vh` intent.
2. Desktop right column width is fixed at `321px` minimum/target.
3. Narrow desktop uses horizontal scrolling instead of per-image distortion.
4. Main/detail image-area heights stay synchronized.
5. Frame-to-footer spacing remains `99px`.

Primary source files:
- `src/constants/layout.js`
- `src/styles/base.css`
- `src/styles/desktop.css`
- `src/styles/mobile.css`
