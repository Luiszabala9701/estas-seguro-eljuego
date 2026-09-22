export type Value = string | boolean | number;
export type Certainty = 'certain' | 'uncertain' | 'withheld';
export type Condition =
  | { all: Condition[] } | { any: Condition[] } | { not: Condition }
  | { flag: string; eq: Value }
  | { claim: string; eq: Value; ever?: boolean }
  | { evidence: string; audience?: 'player' | 'investigator' }
  | { visited: string }
  | { stat: 'suspicion' | 'tension'; gte: number };
export type Effect =
  | { type: 'declare'; fact: string; value: Value; certainty?: Certainty }
  | { type: 'evidence'; id: string; audience?: 'player' | 'investigator' | 'both' }
  | { type: 'flag'; key: string; value: Value }
  | { type: 'adjust'; suspicion?: number; tension?: number }
  | { type: 'remember'; fact: string; value: Value; text: string };
export interface Option {
  id: string; text: string; hint?: string; when?: Condition; effects?: Effect[];
  to: string | { when: Condition; to: string }[];
  fallback?: string;
}
export interface InputCategory {
  id: string; label: string; patterns: string[]; negatedPatterns?: string[];
  effects: Effect[];
}
export interface InputDomain { prompt: string; categories: InputCategory[]; to: string; fallback: string }
export interface Scene {
  id: string; chapter: string; time: string;
  kind: 'interview' | 'memory' | 'evidence' | 'decision' | 'revelation';
  speaker?: string; text: string; aside?: string;
  variants?: { when: Condition; text: string }[];
  onEnter?: Effect[]; options: Option[]; input?: InputDomain;
  presentation?: Record<string, { reply: string; effects: Effect[] }>;
}
export interface Character {
  id: string; name: string; role: string; description: string; personality: string;
  relationship: string; knowledge: string[]; secret: string; participation: string;
}
export interface Evidence {
  id: string; caseId: string; title: string; kind: 'record' | 'photo' | 'audio' | 'document' | 'testimony' | 'object';
  description: string; content: string; source: string; time: string;
  facts: Record<string, Value>; reliability: 'confirmed' | 'disputed';
  possibleContradictions: string[]; visual: string;
  challenge?: { evidence: string; reply: string };
}
export interface NarrativeRule {
  id: string; kind: 'temporal' | 'relationship' | 'logical'; when: Condition;
  facts: string[]; description: string;
  rectification: { fact: string; value: Value };
}
export interface Ending {
  id: string; title: string; subtitle: string; text: string; consequence: string;
  when?: Condition; reveals: string[];
}
export interface CaseData {
  id: string; number: string; title: string; genre: string; description: string;
  duration: string; color: string; protagonist: string; investigator: string;
  initialScene: string; initialKnowledge: Record<string, Value>;
  truth: Record<string, Value>; factLabels: Record<string, string>;
  valueLabels: Record<string, string>; timeline: { time: string; event: string }[];
  characters: Character[]; evidence: Evidence[]; rules: NarrativeRule[];
  scenes: Scene[]; endings: Ending[];
}
export interface Declaration {
  id: string; caseId: string; characterId: string; questionId: string;
  fact: string; value: Value; original: string; narrativeTime: string; order: number;
  certainty: Certainty; status: 'active' | 'rectified' | 'uncertain' | 'withheld';
  verification: 'true' | 'false' | 'unknown'; evidenceIds: string[];
}
export interface Contradiction {
  id: string; type: 'logical' | 'evidence' | 'temporal' | 'relationship' | 'possible';
  fact: string; declarationIds: string[]; evidenceIds: string[]; description: string;
  used: boolean; status: 'pending' | 'rectified' | 'explained' | 'unresolved' | 'insufficient';
  explanation?: string;
  ruleId?: string;
}
export interface GameState {
  version: 2; caseId: string; sceneId: string; phase: string; order: number;
  declarations: Declaration[]; contradictions: Contradiction[];
  playerKnowledge: Record<string, Value>; investigatorEvidence: string[];
  discoveredEvidence: string[]; presentedEvidence: string[];
  evidenceDiscovery: Record<string, { order: number; time: string }>;
  flags: Record<string, Value>; suspicion: number; tension: number;
  choices: { scene: string; option: string; text: string; order: number }[];
  memories: string[]; visited: string[]; endingId?: string;
  lastReaction?: string;
}
export interface Progress {
  unlocked: string[]; completed: string[]; endings: Record<string, string[]>;
  evidence: Record<string, string[]>; scenes: Record<string, string[]>;
}
export interface Settings { audio: boolean; volume: number; reducedMotion: boolean; instantText: boolean; showStats: boolean; textSize: 'normal' | 'large' }
export interface SaveData { version: 2; savedAt: string; game: GameState | null; progress: Progress; settings: Settings }
