# Appendix — Object Catalog & Carousel Contract

## Product Catalog Contract

- Product definitions are canonical in `src/data/products.js`.
- Each product entry must include:
  - stable `id`
  - `images` with a fixed 3-image stage
  - copy fields consumed by UI components

## Carousel Contract

- Carousel state transitions and directional controls are implemented by hooks/components:
  - `src/hooks/useObjectCarousel.js`
  - `src/components/DesktopObjectStage.jsx`
  - `src/components/MobileObjectStage.jsx`

## Verification

- `npm test` (refactor architecture invariant checks)
- `npm run build`
