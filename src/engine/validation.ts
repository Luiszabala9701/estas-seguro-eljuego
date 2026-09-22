import type { CaseData, Condition, Effect } from './types';
export function validateCase(data: CaseData): string[] {
  const errors: string[] = [];
  const scenes = new Set(data.scenes.map(s => s.id));
  const proofs = new Set(data.evidence.map(e => e.id));
  const facts = new Set(Object.keys(data.truth));
  const flags = new Set<string>();
  const allEffects = data.scenes.flatMap(s => [...(s.onEnter ?? []), ...s.options.flatMap(o => o.effects ?? []), ...(s.input?.categories.flatMap(c => c.effects) ?? []), ...Object.values(s.presentation ?? {}).flatMap(p => p.effects)]);
  allEffects.filter(e => e.type === 'flag').forEach(e => flags.add(e.key));
  ['rectified', 'challenged', 'explained'].forEach(f => flags.add(f));
  if (scenes.size !== data.scenes.length) errors.push('IDs de escenas duplicados.');
  if (proofs.size !== data.evidence.length) errors.push('IDs de pruebas duplicados.');
  if (new Set(data.endings.map(e => e.id)).size !== data.endings.length) errors.push('IDs de finales duplicados.');
  if (data.endings.length < 4) errors.push('Se requieren cuatro finales.');
  if (data.endings.at(-1)?.when) errors.push('Falta final de respaldo.');
  const destination = (id: string) => { if (id !== '$ending' && !scenes.has(id)) errors.push(`Escena desconocida: ${id}`); };
  const evidence = (id: string) => { if (!proofs.has(id)) errors.push(`Prueba desconocida: ${id}`); };
  const condition = (c: Condition): void => {
    if ('all' in c) c.all.forEach(condition);
    else if ('any' in c) c.any.forEach(condition);
    else if ('not' in c) condition(c.not);
    else if ('evidence' in c) evidence(c.evidence);
    else if ('visited' in c) destination(c.visited);
    else if ('claim' in c && !facts.has(c.claim)) errors.push(`Hecho desconocido: ${c.claim}`);
    else if ('flag' in c && !flags.has(c.flag)) errors.push(`Variable sin definición: ${c.flag}`);
  };
  const effect = (e: Effect) => {
    if (e.type === 'evidence') evidence(e.id);
    if (e.type === 'declare' && !facts.has(e.fact)) errors.push(`Hecho desconocido: ${e.fact}`);
  };
  destination(data.initialScene);
  allEffects.forEach(effect);
  for (const s of data.scenes) {
    s.variants?.forEach(v => condition(v.when));
    if (new Set(s.options.map(o => o.id)).size !== s.options.length) errors.push(`Opciones duplicadas: ${s.id}`);
    if (!s.options.some(o => !o.when) && !s.input) errors.push(`Escena sin salida garantizada: ${s.id}`);
    for (const o of s.options) {
      if (o.when) condition(o.when);
      if (typeof o.to === 'string') destination(o.to);
      else { o.to.forEach(r => { condition(r.when); destination(r.to); }); if (!o.fallback) errors.push(`Transición sin alternativa: ${s.id}/${o.id}`); else destination(o.fallback); }
    }
    if (s.input) { destination(s.input.to); destination(s.input.fallback); if (!s.input.categories.some(c => c.id === 'other') || !s.input.categories.some(c => c.id === 'silence')) errors.push(`Texto sin escape: ${s.id}`); }
    Object.keys(s.presentation ?? {}).forEach(evidence);
  }
  data.evidence.forEach(e => { if (e.caseId !== data.id) errors.push(`Prueba de otro caso: ${e.id}`); if (e.challenge) evidence(e.challenge.evidence); Object.keys(e.facts).forEach(f => { if (!facts.has(f)) errors.push(`Hecho de prueba desconocido: ${f}`); }); });
  data.rules.forEach(r => { condition(r.when); r.facts.forEach(f => { if (!facts.has(f)) errors.push(`Hecho de regla desconocido: ${f}`); }); });
  data.endings.forEach(e => { if (e.when) condition(e.when); });
  const reached = new Set<string>();
  const visit = (id: string) => {
    if (reached.has(id) || id === '$ending') return;
    reached.add(id);
    const s = data.scenes.find(s => s.id === id); if (!s) return;
    s.options.forEach(o => { if (typeof o.to === 'string') visit(o.to); else o.to.forEach(r => visit(r.to)); if (o.fallback) visit(o.fallback); });
    if (s.input) visit(s.input.to);
  };
  visit(data.initialScene);
  scenes.forEach(id => { if (!reached.has(id)) errors.push(`Escena inalcanzable: ${id}`); });
  return errors;
}
