import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const NO_SPEC_IMPACT_PATH = new URL('../spec/no-spec-impact.yaml', import.meta.url);

const REQUIRED_NO_SPEC_IMPACT_KEYS = [
  'change_id',
  'pr_ref',
  'touched_src_paths',
  'rationale',
  'reviewer',
  'date',
];

const docsOrStaticImpactPaths = ['docs/', 'spec/'];

const runCapture = (command, args) => {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  if (result.status !== 0) {
    const stderr = result.stderr?.trim();
    throw new Error(stderr || `Command failed: ${command} ${args.join(' ')}`);
  }

  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
};

const runStep = (label, command, args) => {
  console.log(`\n[verify:spec-governance] ${label}`);
  const result = spawnSync(command, args, { stdio: 'inherit' });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const stripInlineComment = (line) => {
  const hashIndex = line.indexOf('#');
  if (hashIndex === -1) {
    return line;
  }

  return line.slice(0, hashIndex);
};

const parseNoSpecImpactYaml = (raw) => {
  const lines = raw.split(/\r?\n/);
  const parsed = {};
  const errors = [];

  let lineIndex = 0;

  while (lineIndex < lines.length) {
    const line = stripInlineComment(lines[lineIndex]).trimEnd();

    if (!line.trim()) {
      lineIndex += 1;
      continue;
    }

    if (/^\s/.test(line)) {
      errors.push(`Unexpected indentation at line ${lineIndex + 1}.`);
      lineIndex += 1;
      continue;
    }

    const match = line.match(/^([a-z_][a-z0-9_]*):(?:\s*(.*))?$/i);
    if (!match) {
      errors.push(`Invalid top-level syntax at line ${lineIndex + 1}: ${line.trim()}`);
      lineIndex += 1;
      continue;
    }

    const [, key, rawValue = ''] = match;

    if (key in parsed) {
      errors.push(`Duplicate key: ${key}`);
      lineIndex += 1;
      continue;
    }

    if (key === 'touched_src_paths') {
      if (rawValue.trim() === '[]') {
        parsed[key] = [];
        lineIndex += 1;
        continue;
      }

      if (rawValue.trim()) {
        errors.push(`touched_src_paths must be an empty value or [] at line ${lineIndex + 1}.`);
      }

      const list = [];
      lineIndex += 1;

      while (lineIndex < lines.length) {
        const nextRaw = stripInlineComment(lines[lineIndex]).trimEnd();

        if (!nextRaw.trim()) {
          lineIndex += 1;
          continue;
        }

        if (!/^\s/.test(nextRaw)) {
          break;
        }

        const item = nextRaw.trim().match(/^-\s+(.+)$/);
        if (!item) {
          errors.push(`Invalid list item for touched_src_paths at line ${lineIndex + 1}.`);
          lineIndex += 1;
          continue;
        }

        list.push(item[1].trim().replace(/^['"]|['"]$/g, ''));
        lineIndex += 1;
      }

      parsed[key] = list;
      continue;
    }

    if (!rawValue.trim()) {
      errors.push(`Missing scalar value for key ${key} at line ${lineIndex + 1}.`);
      lineIndex += 1;
      continue;
    }

    parsed[key] = rawValue.trim().replace(/^['"]|['"]$/g, '');
    lineIndex += 1;
  }

  return { parsed, errors };
};

const validateNoSpecImpact = ({ fileContent, touchedSrcPaths, enforceExactCoverage }) => {
  const { parsed, errors } = parseNoSpecImpactYaml(fileContent);

  const unknownKeys = Object.keys(parsed).filter((key) => !REQUIRED_NO_SPEC_IMPACT_KEYS.includes(key));
  if (unknownKeys.length > 0) {
    errors.push(`Unknown top-level key(s): ${unknownKeys.join(', ')}`);
  }

  for (const requiredKey of REQUIRED_NO_SPEC_IMPACT_KEYS) {
    if (!(requiredKey in parsed)) {
      errors.push(`Missing key: ${requiredKey}`);
    }
  }

  if (Array.isArray(parsed.touched_src_paths)) {
    const invalidPath = parsed.touched_src_paths.find((path) => !path.startsWith('src/'));
    if (invalidPath) {
      errors.push(`touched_src_paths must only include src/** paths. Invalid value: ${invalidPath}`);
    }
  } else {
    errors.push('touched_src_paths must be a YAML list.');
  }

  if (typeof parsed.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(parsed.date)) {
    errors.push('date must be YYYY-MM-DD.');
  }

  for (const key of ['change_id', 'pr_ref', 'rationale', 'reviewer']) {
    if (typeof parsed[key] !== 'string' || parsed[key].trim().length === 0) {
      errors.push(`${key} must be a non-empty string.`);
    }
  }

  if (enforceExactCoverage && Array.isArray(parsed.touched_src_paths)) {
    const expected = [...new Set(touchedSrcPaths)].sort();
    const actual = [...new Set(parsed.touched_src_paths)].sort();

    if (expected.length !== actual.length || expected.some((path, index) => actual[index] !== path)) {
      errors.push(
        `touched_src_paths must exactly match changed src/** files. expected=${JSON.stringify(expected)} actual=${JSON.stringify(actual)}`,
      );
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.map((error) => ` - ${error}`).join('\n'));
  }
};

const getChangedFiles = () => {
  if (process.env.CI) {
    return runCapture('git', ['diff', '--name-only', 'origin/main...HEAD']);
  }

  const staged = runCapture('git', ['diff', '--name-only', '--cached']);
  if (staged.length > 0) {
    return staged;
  }

  return runCapture('git', ['diff', '--name-only', 'HEAD']);
};

const changedFiles = getChangedFiles();
const srcChangedPaths = changedFiles.filter((path) => path.startsWith('src/'));
const srcChanged = srcChangedPaths.length > 0;
const specChanged = changedFiles.some((path) => path.startsWith('spec/'));
const docsOrStaticImpacted = changedFiles.some(
  (path) => docsOrStaticImpactPaths.some((prefix) => path.startsWith(prefix)) || path === 'package.json' || path.startsWith('src/'),
);
const mustUseNoSpecImpact = srcChanged && !specChanged;

console.log('[verify:spec-governance] changed files:');
if (changedFiles.length === 0) {
  console.log(' - (none detected)');
} else {
  for (const file of changedFiles) {
    console.log(` - ${file}`);
  }
}

console.log('[verify:spec-governance] linkage policy:');
console.log(` - srcChanged: ${srcChanged}`);
console.log(` - specChanged: ${specChanged}`);
console.log(` - docsOrStaticImpacted: ${docsOrStaticImpacted}`);

runStep('Step 1/6: validate traceability contract', 'node', ['scripts/validate-spec-traceability.mjs']);

if (mustUseNoSpecImpact) {
  if (!existsSync(NO_SPEC_IMPACT_PATH)) {
    throw new Error(
      'src/** changed without spec/** change. Provide spec/no-spec-impact.yaml with touched_src_paths exactly matching changed src files.',
    );
  }

  const noImpactContent = await readFile(NO_SPEC_IMPACT_PATH, 'utf8');
  validateNoSpecImpact({
    fileContent: noImpactContent,
    touchedSrcPaths: srcChangedPaths,
    enforceExactCoverage: true,
  });
  console.log('[verify:spec-governance] Step 2/6: no-spec-impact validation passed (required path).');
} else {
  console.log('[verify:spec-governance] Step 2/6: no-spec-impact validation skipped (not required).');
}

runStep('Step 3/6: run npm test', 'npm', ['test']);
runStep('Step 4/6: run npm run build', 'npm', ['run', 'build']);

if (docsOrStaticImpacted) {
  runStep('Step 5/6: run npm run build:docs (conditional branch: impacted)', 'npm', ['run', 'build:docs']);
} else {
  console.log('[verify:spec-governance] Step 5/6: build:docs skipped (no docs/static impact).');
}

console.log('[verify:spec-governance] Step 6/6: runtime order completed.');
console.log('PASS: verify:spec-governance gate passed.');
