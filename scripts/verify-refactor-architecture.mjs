import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { DEFAULT_LAYOUT_VARS, MOBILE_BREAKPOINT } from '../src/constants/layout.js';

const load = (path) => readFile(new URL(path, import.meta.url), 'utf8');

const productsSource = await load('../src/data/products.js');
const desktopCss = await load('../src/styles/desktop.css');
const mobileCss = await load('../src/styles/mobile.css');
const baseCss = await load('../src/styles/base.css');
const styleIndexCss = await load('../src/styles/index.css');
const agentsOverride = await load('../AGENTS.override.md');
const packageJson = JSON.parse(await load('../package.json'));

const reactRuntimeGuardFiles = [
  '../src/App.jsx',
  '../src/components/DesktopObjectStage.jsx',
  '../src/components/FooterContent.jsx',
  '../src/components/MobileBottomNav.jsx',
  '../src/components/MobileObjectStage.jsx',
  '../src/components/NavArrows.jsx',
  '../src/components/ProductCopy.jsx',
  '../src/components/SiteHeader.jsx',
];

assert.equal(
  DEFAULT_LAYOUT_VARS['--desktop-main-min-height'],
  '802px',
  'Desktop main image area minimum height must stay at 802px',
);
assert.equal(
  DEFAULT_LAYOUT_VARS['--desktop-main-height'],
  'max(var(--desktop-main-min-height, 802px), 78vh)',
  'Desktop main image area height must keep 78vh intent with the 802px minimum guard',
);
assert.equal(
  DEFAULT_LAYOUT_VARS['--desktop-main-min-width'],
  '625px',
  'Desktop main column minimum width must stay at 625px',
);
assert.equal(
  DEFAULT_LAYOUT_VARS['--desktop-side-min-width'],
  '321px',
  'Desktop side column minimum width must stay at 321px',
);
assert.match(
  DEFAULT_LAYOUT_VARS['--desktop-main-width'],
  /max\(var\(--desktop-main-min-width,\s*625px\),\s*calc\(var\(--desktop-main-height,\s*78vh\)\s*\*\s*625\s*\/\s*802\)\)/,
  'Desktop main column width must scale proportionally while preserving the minimum width',
);
assert.match(
  DEFAULT_LAYOUT_VARS['--desktop-side-width'],
  /max\(var\(--desktop-side-min-width,\s*321px\),\s*calc\(var\(--desktop-main-height,\s*78vh\)\s*\*\s*321\s*\/\s*802\)\)/,
  'Desktop side column width must scale proportionally while preserving the minimum width',
);
assert.equal(DEFAULT_LAYOUT_VARS['--desktop-copy-height'], '185px', 'Desktop copy block height invariant must be preserved');

for (const productId of ['wall-shelf', 'kitchen-rack', 'pocket-tray', 'plain-shelf']) {
  assert.match(productsSource, new RegExp(`id:\\s*['"]${productId}['"]`), `Missing product id: ${productId}`);
}

const imageArrayMatches = [...productsSource.matchAll(/images:\s*\[([^\]]+)\]/g)];
assert.ok(imageArrayMatches.length >= 4, 'Expected at least 4 product image arrays');
for (const [index, match] of imageArrayMatches.entries()) {
  const imageCount = match[1]
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean).length;
  assert.equal(imageCount, 3, `Product image array #${index + 1} must keep 3-image stage`);
}

assert.match(desktopCss, /overflow-x:\s*scroll;/, 'Desktop view must preserve horizontal scroll behavior');
assert.match(
  desktopCss,
  /minmax\(var\(--desktop-side-width, 321px\), var\(--desktop-side-width, 321px\)\)/,
  'Desktop right column must remain fixed-width through the shared width variable',
);
assert.match(
  desktopCss,
  /\.desktop-content-frame[\s\S]*min-width:\s*calc\(\s*var\(--desktop-main-min-width,\s*625px\)\s*\+\s*var\(--desktop-side-min-width,\s*321px\)\s*\+\s*var\(--desktop-column-gap-min,\s*16px\)\s*\);/,
  'Desktop frame minimum width must clamp against both column minimum widths',
);
assert.match(
  desktopCss,
  /\.desktop-left-column[\s\S]*min-width:\s*var\(--desktop-main-min-width,\s*625px\);/,
  'Desktop main column must clamp to a 625px minimum width',
);
assert.match(
  desktopCss,
  /\.desktop-right-column[\s\S]*min-width:\s*var\(--desktop-side-min-width,\s*321px\);/,
  'Desktop side column must clamp to a 321px minimum width',
);
assert.match(
  desktopCss,
  /\.desktop-detail-grid[\s\S]*min-width:\s*var\(--desktop-side-min-width,\s*321px\);/,
  'Desktop detail image grid must clamp to the side minimum width',
);
assert.match(desktopCss, /main-image-wrap img[\s\S]*object-fit:\s*contain;/, 'Main desktop image must keep object-fit: contain');
assert.match(desktopCss, /detail-image img[\s\S]*object-fit:\s*contain;/, 'Detail desktop images must keep object-fit: contain');

assert.match(baseCss, /--content-footer-gap:\s*99px;/, 'Frame-to-footer spacing must remain 99px');
assert.match(
  mobileCss,
  new RegExp(`@media \\(max-width:\\s*${MOBILE_BREAKPOINT - 1}px\\)`),
  `Mobile breakpoint must match layout constant (${MOBILE_BREAKPOINT - 1}px)`,
);

for (const layer of ['./base.css', './transitions.css', './desktop.css', './mobile.css']) {
  assert.match(styleIndexCss, new RegExp(`@import ['"]${layer.replace('.', '\\.')}['"];`), `Missing style layer import: ${layer}`);
}

for (const requiredText of ['78vh', '321px', '99px', 'npm run build', 'npm run build:docs']) {
  assert.match(agentsOverride, new RegExp(requiredText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
}

const hasAutomaticReactJsxRuntime =
  Boolean(packageJson.devDependencies?.['@vitejs/plugin-react']) ||
  Boolean(packageJson.devDependencies?.['@vitejs/plugin-react-swc']) ||
  Boolean(packageJson.dependencies?.['@vitejs/plugin-react']) ||
  Boolean(packageJson.dependencies?.['@vitejs/plugin-react-swc']);

if (!hasAutomaticReactJsxRuntime) {
  for (const jsxPath of reactRuntimeGuardFiles) {
    const jsxSource = await load(jsxPath);
    const hasJsxMarkup = /<[\w]/.test(jsxSource);
    if (!hasJsxMarkup) {
      continue;
    }

    assert.match(
      jsxSource,
      /import\s+[\w*\s{},]+\s+from\s+['"]react['"]/,
      `Missing React import in ${jsxPath} while automatic JSX runtime plugin is absent`,
    );
  }
}

console.log('PASS: refactor architecture invariants verified.');
