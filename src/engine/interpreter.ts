import type { InputDomain, InputCategory } from './types';
export const normalize = (text: string): string => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
export type Interpretation = { kind: 'recognized'; category: InputCategory; original: string } | { kind: 'ambiguous' | 'unknown'; candidates: InputCategory[]; original: string };

// Patterns belong to a question's deliberately small domain. A negation never
// becomes an affirmative statement. Whole phrases protect against substrings.
export function interpret(original: string, domain: InputDomain): Interpretation {
  const text = normalize(original);
  const matches: InputCategory[] = [];
  const denied = new Set<string>();
  for (const category of domain.categories) {
    let accepted = false;
    const explicitSpans = category.patterns.filter(p => /^(no |nunca |jamas |prefiero no)/.test(p)).flatMap(p => [...text.matchAll(new RegExp(`(?:^|\\s)(?:${p})(?=$|\\s)`, 'g'))].map(m => [m.index, m.index + m[0].length] as const));
    for (const pattern of category.patterns) {
      const regex = new RegExp(`(?:^|\\s)(?:${pattern})(?=$|\\s)`, 'g');
      for (const match of text.matchAll(regex)) {
        const before = text.slice(0, match.index).trim().split(' ').slice(-4).join(' ');
        const isExplicitNegation = /^(no|nunca|jamas|prefiero no)\b/.test(match[0].trim());
        const insideExplicit = explicitSpans.some(([start, end]) => match.index >= start && match.index + match[0].length <= end);
        if (!isExplicitNegation && !insideExplicit && /\b(no|nunca|jamas|ni|tampoco)\b/.test(before)) { denied.add(category.id); continue; }
        if (category.negatedPatterns?.some(p => new RegExp(p).test(text))) continue;
        accepted = true;
      }
    }
    if (accepted) matches.push(category);
  }
  // Uncertainty about a concrete place is not a definite location assertion.
  if (matches.length > 1 || matches.some(c => denied.has(c.id)) || (matches.length === 1 && /\b(quizas|tal vez|puede ser|creo|o)\b/.test(text) && !['unknown', 'silence'].includes(matches[0]!.id))) {
    return { kind: 'ambiguous', candidates: matches, original };
  }
  return matches.length === 1 ? { kind: 'recognized', category: matches[0]!, original } : { kind: 'unknown', candidates: [], original };
}
