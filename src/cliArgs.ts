import { exit } from 'node:process';

const LEVEL_OPTIONS = ['junior', 'intermediate', 'senior'] as const;
const TECH_FOCUS_OPTIONS = ['frontend', 'backend', 'fullstack'] as const;

export type LevelOption = (typeof LEVEL_OPTIONS)[number];
export type TechFocusOption = (typeof TECH_FOCUS_OPTIONS)[number];

export interface CliArgs {
  level: LevelOption;
  domain: string;
  tech_focus: TechFocusOption;
  stack: string[];
  duration: string;
  count: number;
}

export function parseCliArgs(argv: string[] = process.argv.slice(2)): CliArgs {
  const parsed: Record<string, string> = {};

  for (const arg of argv) {
    if (!arg.startsWith('--')) {
      continue;
    }

    const equalsIndex = arg.indexOf('=');
    const key = equalsIndex === -1 ? arg.slice(2) : arg.slice(2, equalsIndex);
    const rawValue = equalsIndex === -1 ? '' : arg.slice(equalsIndex + 1);
    const value = rawValue.replace(/^['"]|['"]$/g, '');

    if (key) {
      parsed[key] = value;
    }
  }

  const requiredKeys = ['level', 'domain', 'tech_focus', 'stack', 'duration', 'count'] as const;
  const missingKeys = requiredKeys.filter((key) => !(key in parsed) || parsed[key].length === 0);

  if (missingKeys.length > 0) {
    console.error(`Missing required CLI options: ${missingKeys.join(', ')}`);
    exit(1);
  }

  const levelInput = parsed.level;
  if (!LEVEL_OPTIONS.includes(levelInput as LevelOption)) {
    console.error(`Invalid level "${levelInput}". Expected one of: ${LEVEL_OPTIONS.join(', ')}`);
    exit(1);
  }

  const techFocusInput = parsed.tech_focus;
  if (!TECH_FOCUS_OPTIONS.includes(techFocusInput as TechFocusOption)) {
    console.error(`Invalid tech_focus "${techFocusInput}". Expected one of: ${TECH_FOCUS_OPTIONS.join(', ')}`);
    exit(1);
  }

  const stack = parsed.stack
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  if (stack.length === 0) {
    console.error('Stack must contain at least one technology (comma separated).');
    exit(1);
  }

  const count = Number.parseInt(parsed.count, 10);
  if (!Number.isFinite(count) || count < 1) {
    console.error('Count must be a positive integer.');
    exit(1);
  }

  return {
    level: levelInput as LevelOption,
    domain: parsed.domain,
    tech_focus: techFocusInput as TechFocusOption,
    stack,
    duration: parsed.duration,
    count,
  };
}
