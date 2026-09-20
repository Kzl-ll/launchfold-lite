import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runLint, formatFinding } from './copy-lint.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(__dirname, 'fixtures');

function lintFixture(...segments) {
  return runLint({ root: path.join(fixturesDir, ...segments) });
}

function hasRule(result, id) {
  return [...result.errors, ...result.warnings].some((finding) => finding.id === id);
}

const RULE_IDS = [
  'E001',
  'E002',
  'E003',
  'E004',
  'E005',
  'E006',
  'W001',
  'W002',
  'W101',
  'W102',
  'W103',
  'W104',
  'W105',
  'W106',
  'W107',
];

for (const id of RULE_IDS) {
  test(`${id}: fires on its fail fixture`, () => {
    const result = lintFixture(id, 'fail');
    assert.equal(hasRule(result, id), true, `expected ${id} to fire on the fail fixture`);
  });

  test(`${id}: does not fire on its pass fixture`, () => {
    const result = lintFixture(id, 'pass');
    assert.equal(hasRule(result, id), false, `expected ${id} not to fire on the pass fixture`);
  });
}

test('formatFinding matches the documented output format', () => {
  const line = formatFinding({
    id: 'E004',
    severity: 'error',
    file: 'landing/cta.yaml',
    field: 'button.label',
    text: 'Submit',
    message: 'is generic. Say what they get, e.g. "Join the beta".',
  });
  assert.equal(
    line,
    'ERROR E004 landing/cta.yaml › button.label: "Submit" is generic. Say what they get, e.g. "Join the beta".',
  );
});

test('formatFinding pads WARN to line up with ERROR', () => {
  const line = formatFinding({
    id: 'W101',
    severity: 'warn',
    file: 'landing/hero.yaml',
    field: 'subheadline',
    text: 'seamless',
    message: 'is filler. Name the concrete result instead.',
  });
  assert.equal(
    line,
    'WARN  W101 landing/hero.yaml › subheadline: "seamless" is filler. Name the concrete result instead.',
  );
});

test('config: ignoreRules suppresses a rule and reports it as ignored, not silently dropped', () => {
  const result = lintFixture('config-ignore');
  assert.equal(hasRule(result, 'E004'), false);
  assert.equal(
    result.ignored.some((finding) => finding.id === 'E004'),
    true,
  );
});

test('config: extraFillerWords extends the default filler word list', () => {
  const result = lintFixture('config-extra-filler');
  assert.equal(
    result.warnings.some((finding) => finding.id === 'W101' && finding.text === 'megasonic'),
    true,
  );
});

test('demo content (Shipnote) has 0 errors and 0 warnings', () => {
  const result = runLint();
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.warnings, []);
});

test('runs in under 1 second on the demo content', () => {
  const start = performance.now();
  runLint();
  const duration = performance.now() - start;
  assert.ok(duration < 1000, `expected under 1000ms, got ${duration}ms`);
});
