import type { CaseData, Progress } from './engine/types';

export interface Achievement {
  id: string;
  kind: 'ending' | 'case' | 'game';
  caseId?: string;
  title: string;
  description: string;
  unlocked: boolean;
  current: number;
  total: number;
}

const found = (progress: Progress, caseId: string, collection: 'endings' | 'evidence') =>
  new Set(progress[collection][caseId] ?? []);

export function caseCompletion(progress: Progress, data: CaseData): { current: number; total: number; percent: number; complete: boolean } {
  const endings = found(progress, data.id, 'endings');
  const evidence = found(progress, data.id, 'evidence');
  const current = data.endings.filter(item => endings.has(item.id)).length + data.evidence.filter(item => evidence.has(item.id)).length;
  const total = data.endings.length + data.evidence.length;
  return { current, total, percent: total ? Math.round(current / total * 100) : 100, complete: current === total };
}

export function achievements(progress: Progress, cases: CaseData[]): Achievement[] {
  const items: Achievement[] = [];
  for (const data of cases) {
    const unlockedEndings = found(progress, data.id, 'endings');
    data.endings.forEach((ending, index) => items.push({
      id: `ending:${data.id}:${ending.id}`,
      kind: 'ending',
      caseId: data.id,
      title: unlockedEndings.has(ending.id) ? ending.title : `Desenlace oculto ${String(index + 1).padStart(2, '0')}`,
      description: unlockedEndings.has(ending.id) ? ending.subtitle : `Descubrí otro final de «${data.title}».`,
      unlocked: unlockedEndings.has(ending.id),
      current: unlockedEndings.has(ending.id) ? 1 : 0,
      total: 1
    }));
    const completion = caseCompletion(progress, data);
    items.push({
      id: `case:${data.id}`,
      kind: 'case',
      caseId: data.id,
      title: `Expediente íntegro: ${data.title}`,
      description: `Encontrá sus ${data.endings.length} finales y las ${data.evidence.length} pruebas del caso.`,
      unlocked: completion.complete,
      current: completion.current,
      total: completion.total
    });
  }
  const caseAchievements = items.filter(item => item.kind === 'case');
  const completedCases = caseAchievements.filter(item => item.unlocked).length;
  items.push({
    id: 'game:complete',
    kind: 'game',
    title: '¿Estás completamente seguro?',
    description: 'Completá al 100% los tres expedientes.',
    unlocked: completedCases === cases.length,
    current: completedCases,
    total: cases.length
  });
  return items;
}

export const unlockedAchievementIds = (progress: Progress, cases: CaseData[]): string[] => achievements(progress, cases).filter(item => item.unlocked).map(item => item.id);
