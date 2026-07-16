import { Profile, Message, Goal, Project, Skill, DailyBrief } from './types';

const K = {
  PROFILE: 'forge_profile',
  HISTORY: 'forge_history',
  MEMORIES: 'forge_memories',
  SESSION: 'forge_session_count',
  GOALS: 'forge_goals',
  PROJECTS: 'forge_projects',
  SKILLS: 'forge_skills',
  BRIEF: 'forge_brief',
  API_KEY: 'forge_api_key',
};

function get<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; }
  catch { return null; }
}

function set<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function del(key: string): void {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(key); } catch {}
}

export const storage = {
  profile: {
    get: () => get<Profile>(K.PROFILE),
    set: (v: Profile) => set(K.PROFILE, v),
    clear: () => del(K.PROFILE),
  },
  history: {
    get: () => get<Message[]>(K.HISTORY) ?? [],
    set: (v: Message[]) => set(K.HISTORY, v.slice(-40)),
    clear: () => del(K.HISTORY),
  },
  memories: {
    get: () => get<string>(K.MEMORIES) ?? '',
    set: (v: string) => set(K.MEMORIES, v),
    clear: () => del(K.MEMORIES),
  },
  session: {
    get: () => get<number>(K.SESSION) ?? 0,
    increment: () => {
      const n = (get<number>(K.SESSION) ?? 0) + 1;
      set(K.SESSION, n);
      return n;
    },
  },
  goals: {
    get: () => get<Goal[]>(K.GOALS) ?? [],
    set: (v: Goal[]) => set(K.GOALS, v),
    add: (g: Goal) => { const all = get<Goal[]>(K.GOALS) ?? []; set(K.GOALS, [...all, g]); },
    update: (id: string, u: Partial<Goal>) => {
      const all = get<Goal[]>(K.GOALS) ?? [];
      set(K.GOALS, all.map(g => g.id === id ? { ...g, ...u } : g));
    },
    delete: (id: string) => set(K.GOALS, (get<Goal[]>(K.GOALS) ?? []).filter(g => g.id !== id)),
  },
  projects: {
    get: () => get<Project[]>(K.PROJECTS) ?? [],
    set: (v: Project[]) => set(K.PROJECTS, v),
    add: (p: Project) => { const all = get<Project[]>(K.PROJECTS) ?? []; set(K.PROJECTS, [...all, p]); },
    update: (id: string, u: Partial<Project>) => {
      const all = get<Project[]>(K.PROJECTS) ?? [];
      set(K.PROJECTS, all.map(p => p.id === id ? { ...p, ...u } : p));
    },
    delete: (id: string) => set(K.PROJECTS, (get<Project[]>(K.PROJECTS) ?? []).filter(p => p.id !== id)),
  },
  skills: {
    get: () => get<Skill[]>(K.SKILLS) ?? [],
    set: (v: Skill[]) => set(K.SKILLS, v),
    add: (s: Skill) => { const all = get<Skill[]>(K.SKILLS) ?? []; set(K.SKILLS, [...all, s]); },
    update: (id: string, u: Partial<Skill>) => {
      const all = get<Skill[]>(K.SKILLS) ?? [];
      set(K.SKILLS, all.map(s => s.id === id ? { ...s, ...u } : s));
    },
    delete: (id: string) => set(K.SKILLS, (get<Skill[]>(K.SKILLS) ?? []).filter(s => s.id !== id)),
  },
  brief: {
    get: () => get<DailyBrief>(K.BRIEF),
    set: (v: DailyBrief) => set(K.BRIEF, v),
  },
  apiKey: {
    get: () => get<string>(K.API_KEY) ?? '',
    set: (v: string) => set(K.API_KEY, v),
    clear: () => del(K.API_KEY),
  },
  clearAll: () => Object.values(K).forEach(del),
};
