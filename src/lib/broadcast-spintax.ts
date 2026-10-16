/**
 * Spintax (Spin Syntax) parser and utility functions.
 * Allows templates and variables to specify variations like:
 *   "{Hi|Hello|Hey} {{name}}, {hope you are doing well|quick question for you}"
 *
 * Each recipient gets a uniquely randomized variation, keeping bulk sends
 * natural, unique, and safe against automated spam detection filters.
 */

/**
 * Recursively resolves Spintax patterns `{option1|option2|option3}`.
 * Supports nesting, e.g. `{Hi|Hello {there|friend}}`.
 */
export function parseSpintax(text: string): string {
  if (!text || typeof text !== 'string') return text ?? '';

  const spintaxRegex = /\{([^{}]+)\}/g;

  let current = text;
  let matches = spintaxRegex.test(current);

  // Loop until all nested braces are resolved or limit iterations to avoid runaway loops
  let iterations = 0;
  while (matches && iterations < 10) {
    iterations++;
    current = current.replace(spintaxRegex, (_, match) => {
      const options = match.split('|');
      const chosen = options[Math.floor(Math.random() * options.length)];
      return chosen ?? '';
    });
    spintaxRegex.lastIndex = 0;
    matches = spintaxRegex.test(current);
  }

  return current;
}

/**
 * Checks if a string contains valid spintax pattern `{...|...}`.
 */
export function hasSpintax(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  return /\{[^{}]+\|[^{}]+\}/.test(text);
}

/**
 * Calculates total possible unique permutations for a text containing spintax.
 * Caps at 10,000 for display sanity.
 */
export function countSpintaxVariations(text: string): number {
  if (!text || typeof text !== 'string') return 1;

  const spintaxRegex = /\{([^{}]+)\}/g;
  let total = 1;
  let match: RegExpExecArray | null;

  while ((match = spintaxRegex.exec(text)) !== null) {
    const options = match[1].split('|');
    if (options.length > 1) {
      total *= options.length;
      if (total >= 10000) return 10000;
    }
  }

  return total;
}

/**
 * Generates sample variations to display live in the wizard preview.
 */
export function sampleSpintaxVariations(text: string, count = 3): string[] {
  if (!hasSpintax(text)) return [text];

  const samples = new Set<string>();
  for (let i = 0; i < count * 5; i++) {
    samples.add(parseSpintax(text));
    if (samples.size >= count) break;
  }

  return Array.from(samples);
}
