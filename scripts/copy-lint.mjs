import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import {
  PLACEHOLDER_TERMS,
  REQUIRED_SECTIONS,
  GENERIC_CTA_LABELS,
  WEAK_CTA_LABELS,
  DEFAULT_FILLER_WORDS,
  REQUIRED_POSITIONING_HEADINGS,
} from './copy-lint.rules.mjs';

const TEXT_TRUNCATE_LENGTH = 60;

function truncate(text) {
  if (text.length <= TEXT_TRUNCATE_LENGTH) return text;
  return `${text.slice(0, TEXT_TRUNCATE_LENGTH - 3)}...`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stripHtmlComments(markdown) {
  return markdown.replace(/<!--[\s\S]*?-->/g, '');
}

function loadConfig(configPath) {
  if (!existsSync(configPath)) {
    return { extraFillerWords: [], ignoreRules: [] };
  }
  const raw = JSON.parse(readFileSync(configPath, 'utf-8'));
  return {
    extraFillerWords: raw.extraFillerWords ?? [],
    ignoreRules: raw.ignoreRules ?? [],
  };
}

function loadLandingFiles(landingDir) {
  const files = {};
  if (!existsSync(landingDir)) return files;
  for (const entry of readdirSync(landingDir)) {
    if (!entry.endsWith('.yaml') && !entry.endsWith('.yml')) continue;
    const name = entry.replace(/\.ya?ml$/, '');
    const raw = readFileSync(path.join(landingDir, entry), 'utf-8');
    files[name] = parseYaml(raw) ?? {};
  }
  return files;
}

function walkStrings(value, fieldPath = '') {
  const results = [];
  if (typeof value === 'string') {
    results.push({ field: fieldPath, value });
  } else if (Array.isArray(value)) {
    value.forEach((item, i) => {
      results.push(...walkStrings(item, fieldPath ? `${fieldPath}[${i}]` : `[${i}]`));
    });
  } else if (value && typeof value === 'object') {
    for (const [key, val] of Object.entries(value)) {
      results.push(...walkStrings(val, fieldPath ? `${fieldPath}.${key}` : key));
    }
  }
  return results;
}

function parsePositioningSections(markdown) {
  const sections = {};
  let current = null;
  let buffer = [];
  const flush = () => {
    if (current !== null) sections[current] = buffer.join('\n');
    buffer = [];
  };
  for (const line of markdown.split('\n')) {
    const match = /^##\s+(.+?)\s*$/.exec(line);
    if (match) {
      flush();
      current = match[1].trim();
    } else if (current !== null) {
      buffer.push(line);
    }
  }
  flush();
  return sections;
}

function sectionIsEmpty(text) {
  return stripHtmlComments(text).trim().length === 0;
}

function meaningfulWords(text) {
  return new Set((text.toLowerCase().match(/[a-z']+/g) ?? []).filter((w) => w.length >= 4));
}

// ---- individual rule checks -------------------------------------------------

function checkPlaceholders(positioningText, landingFiles) {
  const findings = [];
  const scan = (file, field, text) => {
    for (const { pattern, label } of PLACEHOLDER_TERMS) {
      if (pattern.test(text)) {
        findings.push({
          id: 'E001',
          severity: 'error',
          file,
          field,
          text: label,
          message: 'looks like placeholder text. Replace it with real copy.',
        });
      }
    }
  };
  scan('positioning.md', undefined, stripHtmlComments(positioningText));
  for (const [name, data] of Object.entries(landingFiles)) {
    for (const { field, value } of walkStrings(data)) {
      scan(`landing/${name}.yaml`, field, value);
    }
  }
  return findings;
}

function checkRequiredSections(landingFiles) {
  const findings = [];
  for (const section of REQUIRED_SECTIONS) {
    if (!(section in landingFiles)) {
      findings.push({
        id: 'E002',
        severity: 'error',
        file: `landing/${section}.yaml`,
        message: `Required section file is missing. Create landing/${section}.yaml following its schema.`,
      });
    }
  }
  const pricing = landingFiles.pricing;
  if (pricing?.hidden) {
    const reason = pricing.hiddenReason ?? '';
    if (reason.length < 20) {
      findings.push({
        id: 'E002',
        severity: 'error',
        file: 'landing/pricing.yaml',
        field: 'hiddenReason',
        text: reason,
        message: 'must be at least 20 characters explaining why pricing is hidden when hidden: true.',
      });
    }
  }
  return findings;
}

function checkHeadlineLength(hero) {
  if (!hero || typeof hero.headline !== 'string') return [];
  const len = hero.headline.length;
  if (len > 90) {
    return [
      {
        id: 'E003',
        severity: 'error',
        file: 'landing/hero.yaml',
        field: 'headline',
        text: hero.headline,
        message: `is ${len} characters; headlines must be 90 or fewer. Cut it down.`,
      },
    ];
  }
  if (len > 70) {
    return [
      {
        id: 'W001',
        severity: 'warn',
        file: 'landing/hero.yaml',
        field: 'headline',
        text: hero.headline,
        message: `is ${len} characters; keep headlines to 70 or fewer for a 5-second read.`,
      },
    ];
  }
  return [];
}

function checkCtaLabel(file, field, label) {
  if (typeof label !== 'string') return [];
  const normalized = label.trim().toLowerCase();
  if (GENERIC_CTA_LABELS.includes(normalized)) {
    return [
      {
        id: 'E004',
        severity: 'error',
        file,
        field,
        text: label,
        message: 'is generic. Say what they get, e.g. "Join the beta".',
      },
    ];
  }
  if (WEAK_CTA_LABELS.includes(normalized)) {
    return [
      {
        id: 'W002',
        severity: 'warn',
        file,
        field,
        text: label,
        message: 'is weak. State the specific benefit, e.g. "Reserve my early-bird spot".',
      },
    ];
  }
  return [];
}

function checkFaqCount(faq) {
  if (!faq || !Array.isArray(faq.items)) return [];
  if (faq.items.length < 3) {
    return [
      {
        id: 'E005',
        severity: 'error',
        file: 'landing/faq.yaml',
        field: 'items',
        message: `FAQ has ${faq.items.length} item(s); at least 3 are required.`,
      },
    ];
  }
  return [];
}

function checkFounderRequired(hero, landingFiles) {
  if (!hero?.proof) return [];
  if (hero.proof.type === 'none-yet' && !('founder' in landingFiles)) {
    return [
      {
        id: 'E006',
        severity: 'error',
        file: 'landing/hero.yaml',
        field: 'proof.type',
        text: 'none-yet',
        message: 'requires landing/founder.yaml to exist when no other proof is set. Add a founder note or change proof.type.',
      },
    ];
  }
  return [];
}

function checkFillerWords(landingFiles, fillerWords) {
  const findings = [];
  const matchers = fillerWords.map((word) => ({
    word,
    pattern: new RegExp(`\\b${escapeRegExp(word)}\\b`, 'i'),
  }));
  for (const [name, data] of Object.entries(landingFiles)) {
    for (const { field, value } of walkStrings(data)) {
      for (const { word, pattern } of matchers) {
        if (pattern.test(value)) {
          findings.push({
            id: 'W101',
            severity: 'warn',
            file: `landing/${name}.yaml`,
            field,
            text: word,
            message: 'is filler. Name the concrete result instead.',
          });
        }
      }
    }
  }
  return findings;
}

function checkEgocentric(landingFiles) {
  const weRe = /\b(we|our|us)\b/gi;
  const youRe = /\b(you|your)\b/gi;
  let weCount = 0;
  let youCount = 0;
  for (const data of Object.values(landingFiles)) {
    for (const { value } of walkStrings(data)) {
      weCount += (value.match(weRe) ?? []).length;
      youCount += (value.match(youRe) ?? []).length;
    }
  }
  if (weCount > youCount) {
    return [
      {
        id: 'W102',
        severity: 'warn',
        file: 'landing/*.yaml',
        message: `Copy uses "we/our/us" ${weCount} times vs "you/your" ${youCount} times. Rewrite toward the visitor.`,
      },
    ];
  }
  return [];
}

function checkOutcomesQuality(problem) {
  if (!problem) return [];
  const findings = [];
  const pains = new Set((problem.pains ?? []).map((p) => p.trim().toLowerCase()));
  (problem.outcomes ?? []).forEach((outcome, i) => {
    const trimmed = outcome.trim();
    if (trimmed.length < 15) {
      findings.push({
        id: 'W103',
        severity: 'warn',
        file: 'landing/problem.yaml',
        field: `outcomes[${i}]`,
        text: outcome,
        message: 'is too short to state a concrete outcome. Say what changes for the visitor.',
      });
    } else if (pains.has(trimmed.toLowerCase())) {
      findings.push({
        id: 'W103',
        severity: 'warn',
        file: 'landing/problem.yaml',
        field: `outcomes[${i}]`,
        text: outcome,
        message: 'repeats a pains item word-for-word. Describe the outcome instead of restating the pain.',
      });
    }
  });
  return findings;
}

function checkSubheadlineLength(hero) {
  if (!hero || typeof hero.subheadline !== 'string') return [];
  const len = hero.subheadline.length;
  if (len > 160) {
    return [
      {
        id: 'W104',
        severity: 'warn',
        file: 'landing/hero.yaml',
        field: 'subheadline',
        text: hero.subheadline,
        message: `is ${len} characters; keep the subheadline to 160 or fewer.`,
      },
    ];
  }
  return [];
}

function checkExclamations(landingFiles) {
  const findings = [];
  for (const [name, data] of Object.entries(landingFiles)) {
    let count = 0;
    for (const { value } of walkStrings(data)) {
      count += (value.match(/!/g) ?? []).length;
    }
    if (count > 1) {
      findings.push({
        id: 'W105',
        severity: 'warn',
        file: `landing/${name}.yaml`,
        message: `Contains ${count} exclamation marks. Use at most one per section.`,
      });
    }
  }
  return findings;
}

function checkPositioningHeadings(positioningText) {
  const sections = parsePositioningSections(positioningText);
  const findings = [];
  for (const heading of REQUIRED_POSITIONING_HEADINGS) {
    const body = sections[heading];
    if (body === undefined || sectionIsEmpty(body)) {
      findings.push({
        id: 'W106',
        severity: 'warn',
        file: 'positioning.md',
        field: heading,
        message: 'heading is empty. Answer it before writing landing copy.',
      });
    }
  }
  return findings;
}

function checkHeadlineRelevance(hero) {
  if (!hero || typeof hero.headline !== 'string') return [];
  const headlineWords = meaningfulWords(hero.headline);
  const sourceWords = new Set([
    ...meaningfulWords(hero.outcome ?? ''),
    ...meaningfulWords(hero.pain ?? ''),
  ]);
  if (sourceWords.size === 0) return [];
  const overlaps = [...headlineWords].some((word) => sourceWords.has(word));
  if (!overlaps) {
    return [
      {
        id: 'W107',
        severity: 'warn',
        file: 'landing/hero.yaml',
        field: 'headline',
        text: hero.headline,
        message: 'shares no meaningful words with hero.outcome or hero.pain. Ground the headline in the specific outcome or pain.',
      },
    ];
  }
  return [];
}

// ---- public API ---------------------------------------------------------

export function runLint({ root = process.cwd() } = {}) {
  const positioningPath = path.join(root, 'positioning.md');
  const landingDir = path.join(root, 'src/content/landing');
  const configPath = path.join(root, 'copylint.config.json');

  const config = loadConfig(configPath);
  const fillerWords = [...DEFAULT_FILLER_WORDS, ...config.extraFillerWords];

  const positioningText = existsSync(positioningPath) ? readFileSync(positioningPath, 'utf-8') : '';
  const landingFiles = loadLandingFiles(landingDir);
  const hero = landingFiles.hero;
  const problem = landingFiles.problem;
  const faq = landingFiles.faq;
  const cta = landingFiles.cta;

  let findings = [
    ...checkPlaceholders(positioningText, landingFiles),
    ...checkRequiredSections(landingFiles),
    ...checkHeadlineLength(hero),
    ...(hero ? checkCtaLabel('landing/hero.yaml', 'primaryCta.label', hero.primaryCta?.label) : []),
    ...(cta ? checkCtaLabel('landing/cta.yaml', 'button.label', cta.button?.label) : []),
    ...checkFaqCount(faq),
    ...checkFounderRequired(hero, landingFiles),
    ...checkFillerWords(landingFiles, fillerWords),
    ...checkEgocentric(landingFiles),
    ...checkOutcomesQuality(problem),
    ...checkSubheadlineLength(hero),
    ...checkExclamations(landingFiles),
    ...checkPositioningHeadings(positioningText),
    ...checkHeadlineRelevance(hero),
  ];

  const ignored = [];
  if (config.ignoreRules.length > 0) {
    const kept = [];
    for (const finding of findings) {
      if (config.ignoreRules.includes(finding.id)) {
        ignored.push(finding);
      } else {
        kept.push(finding);
      }
    }
    findings = kept;
  }

  return {
    errors: findings.filter((f) => f.severity === 'error'),
    warnings: findings.filter((f) => f.severity === 'warn'),
    ignored,
  };
}

export function formatFinding(finding) {
  const severityLabel = finding.severity === 'error' ? 'ERROR' : 'WARN ';
  let location = finding.file;
  if (finding.field) location += ` › ${finding.field}`;
  const body =
    finding.text !== undefined ? `"${truncate(String(finding.text))}" ${finding.message}` : finding.message;
  return `${severityLabel} ${finding.id} ${location}: ${body}`;
}

function toJsonFinding(finding) {
  return {
    id: finding.id,
    severity: finding.severity,
    file: finding.file,
    field: finding.field,
    text: finding.text !== undefined ? truncate(String(finding.text)) : undefined,
    message: finding.message,
  };
}

function pluralize(count, word) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

function groupByRule(findings) {
  const byRule = new Map();
  for (const finding of findings) {
    byRule.set(finding.id, [...(byRule.get(finding.id) ?? []), finding]);
  }
  return byRule;
}

function main() {
  const args = process.argv.slice(2);
  const strict = args.includes('--strict');
  const json = args.includes('--json');

  const { errors, warnings, ignored } = runLint();

  if (json) {
    const payload = {
      errors: errors.map(toJsonFinding),
      warnings: warnings.map(toJsonFinding),
      summary: { errors: errors.length, warnings: warnings.length },
    };
    if (ignored.length > 0) payload.ignored = ignored.map(toJsonFinding);
    console.log(JSON.stringify(payload, null, 2));
  } else {
    console.log(`copy-lint: ${pluralize(errors.length, 'error')}, ${pluralize(warnings.length, 'warning')}`);
    for (const finding of errors) console.log(formatFinding(finding));
    for (const finding of warnings) console.log(formatFinding(finding));
    for (const [id, list] of groupByRule(ignored)) {
      console.log(`ignored: ${id} (${pluralize(list.length, 'finding')} suppressed by copylint.config.json)`);
    }
  }

  process.exit(errors.length > 0 || (strict && warnings.length > 0) ? 1 : 0);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
