import { readFile } from 'node:fs/promises';

const DEFAULT_TRACEABILITY_PATH = new URL('../spec/contracts/traceability.json', import.meta.url);

const requiredRootKeys = ['schema_version', 'generated_at', 'contracts'];
const requiredContractKeys = [
  'contract_id',
  'source_path',
  'source_range',
  'spec_path',
  'verification_cmd',
  'last_verified_sha',
  'inference_flag',
];

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const isIsoDatetime = (value) => isNonEmptyString(value) && !Number.isNaN(Date.parse(value));
const isGitSha = (value) => isNonEmptyString(value) && /^[0-9a-f]{7,40}$/i.test(value.trim());

const fileFromArgs = process.argv[2];
const traceabilityPath = fileFromArgs ? new URL(fileFromArgs, `file://${process.cwd()}/`) : DEFAULT_TRACEABILITY_PATH;

const content = await readFile(traceabilityPath, 'utf8');
let parsed;

try {
  parsed = JSON.parse(content);
} catch (error) {
  console.error(`[traceability] Invalid JSON: ${error.message}`);
  process.exit(1);
}

const errors = [];

if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
  errors.push('Root must be a JSON object.');
} else {
  for (const key of requiredRootKeys) {
    if (!(key in parsed)) {
      errors.push(`Missing root key: ${key}`);
    }
  }

  if (!isNonEmptyString(parsed.schema_version)) {
    errors.push('schema_version must be a non-empty string.');
  }

  if (!isIsoDatetime(parsed.generated_at)) {
    errors.push('generated_at must be an ISO datetime string.');
  }

  if (!Array.isArray(parsed.contracts) || parsed.contracts.length < 1) {
    errors.push('contracts must be a non-empty array.');
  } else {
    parsed.contracts.forEach((contract, index) => {
      const label = `contracts[${index}]`;

      if (typeof contract !== 'object' || contract === null || Array.isArray(contract)) {
        errors.push(`${label} must be an object.`);
        return;
      }

      for (const key of requiredContractKeys) {
        if (!(key in contract)) {
          errors.push(`${label} missing key: ${key}`);
        }
      }

      if (!isNonEmptyString(contract.contract_id)) {
        errors.push(`${label}.contract_id must be a non-empty string.`);
      }

      if (!isNonEmptyString(contract.source_path) || !contract.source_path.startsWith('src/')) {
        errors.push(`${label}.source_path must start with "src/".`);
      }

      if (!isNonEmptyString(contract.source_range)) {
        errors.push(`${label}.source_range must be a non-empty string.`);
      }

      if (!isNonEmptyString(contract.spec_path) || !contract.spec_path.startsWith('spec/')) {
        errors.push(`${label}.spec_path must start with "spec/".`);
      }

      if (!isNonEmptyString(contract.verification_cmd)) {
        errors.push(`${label}.verification_cmd must be a non-empty string.`);
      }

      if (!isGitSha(contract.last_verified_sha)) {
        errors.push(`${label}.last_verified_sha must be a 7-40 char git SHA.`);
      }

      if (typeof contract.inference_flag !== 'boolean') {
        errors.push(`${label}.inference_flag must be a boolean.`);
      }
    });
  }
}

if (errors.length > 0) {
  console.error('[traceability] Validation failed:');
  for (const error of errors) {
    console.error(` - ${error}`);
  }
  process.exit(1);
}

console.log('PASS: traceability contract schema validated.');
