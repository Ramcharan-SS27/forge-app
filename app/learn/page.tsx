'use client';

import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { curriculumSystem } from '@/lib/prompts';
import { Skill, Profile } from '@/lib/types';
import Sidebar from '@/components/Sidebar';
import Markdown from '@/components/Markdown';
import { Plus, Trash2, Zap } from 'lucide-react';

function id() { return Math.random().toString(36).slice(2, 10); }

const LEVEL_COLORS: Record<string, string> = {
  beginner:     'bg-forge-success/10 text-forge-success',
  intermediate: 'bg-forge-warning/10 text-forge-warning',
  advanced:     'bg-forge-accent/10 text-forge-accent',
};

export default function LearnPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [sessionCount, setSessionCount] = useState(1);
  const [memories, setMemories] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);

  const [form, setForm] = useState({ name: '', level: 'beginner' as Skill['level'] });

  useEffect(() => {
    setProfile(storage.profile.get());
    setSkills(storage.skills.get());
    setSessionCount(storage.session.get());
    setMemories(storage.memories.get());
  }, []);

  const addSkill = () => {
    if (!form.name.trim()) return;
    const s: Skill = {
      id: id(), name: form.name, level: form.level,
      progress: 0, created_at: new Date().toISOString(),
    };
    storage.skills.add(s);
    setSkills(storage.skills.get());
    setForm({ name: '', level: 'beginner' });
    setShowAdd(false);
  };

  const generateCurriculum = async (skill: Skill) => {
    if (!profile) return;
    setGenerating(skill.id);
    try {
      const apiKey = storage.apiKey.get();
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(apiKey ? { 'x-api-key': apiKey } : {}) },
        body: JSON.stringify({
          system: curriculumSystem(profile),
          messages: [{ role: 'user', content: `Skill: ${skill.name}\nCurrent level: ${skill.level}\nMy goal: ${profile.primary_goal}` }],
        }),
      });
      const data = await res.json();
      const curriculum = data.content?.[0]?.text ?? 'Could not generate curriculum.';
      storage.skills.update(skill.id, { curriculum });
      setSkills(storage.skills.get());
      setExpanded(skill.id);
    } catch {}
    setGenerating(null);
  };

  const updateProgress = (id: string, progress: number) => {
    storage.skills.update(id, { progress });
    setSkills(storage.skills.get());
  };

  const deleteSkill = (id: string) => {
    storage.skills.delete(id);
    setSkills(storage.skills.get());
    if (expanded === id) setExpanded(null);
  };

  return (
    <div className="flex min-h-screen bg-forge-bg">
      <Sidebar profileName={profile?.name} sessionCount={sessionCount} memories={memories} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-forge-text">Learning Path</h1>
              <p className="text-forge-text2 text-sm mt-1">Track skills. Forge generates your personal curriculum.</p>
            </div>
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 bg-forge-accent text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
              <Plus size={16} /> Add Skill
            </button>
          </div>

          {/* Add modal */}
          {showAdd && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <div className="bg-forge-surface border border-forge-border rounded-2xl p-6 w-full max-w-md animate-fadeup">
                <h2 className="text-forge-text font-semibold text-lg mb-5">Add Skill</h2>
                <div className="space-y-3">
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="What do you want to learn? (e.g. RAG pipelines, System Design)" autoFocus
                    className="w-full bg-forge-surface2 border border-forge-border rounded-xl px-4 py-2.5 text-forge-text text-sm focus:outline-none focus:border-forge-accent" />
                  <div>
                    <div className="text-forge-text2 text-xs mb-2">Current level</div>
                    <div className="flex gap-2">
                      {(['beginner', 'intermediate', 'advanced'] as const).map(l => (
                        <button key={l} onClick={() => setForm({ ...form, level: l })}
                          className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all capitalize ${
                            form.level === l ? 'border-forge-accent bg-forge-accent/10 text-forge-accent' : 'border-forge-border text-forge-text3 hover:text-forge-text2'
                          }`}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={() => setShowAdd(false)} className="flex-1 bg-forge-surface2 border border-forge-border text-forge-text2 rounded-xl py-2.5 text-sm">Cancel</button>
                  <button onClick={addSkill} className="flex-1 bg-forge-accent text-white rounded-xl py-2.5 text-sm font-semibold hover:opacity-90">Add</button>
                </div>
              </div>
            </div>
          )}

          {/* Skills list */}
          {skills.length === 0 ? (
            <div className="text-center py-20 text-forge-text3">
              <div className="text-4xl mb-4">📚</div>
              <div className="text-sm">No skills tracked yet. Add what you're learning.</div>
            </div>
          ) : (
            <div className="space-y-4">
              {skills.map(s => (
                <div key={s.id} className="bg-forge-surface border border-forge-border rounded-2xl overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-forge-text font-semibold">{s.name}</h3>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold capitalize ${LEVEL_COLORS[s.level]}`}>
                          {s.level}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-forge-accent text-sm font-semibold">{s.progress}%</span>
                        <button onClick={() => deleteSkill(s.id)} className="text-forge-text3 hover:text-forge-danger transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="h-2 bg-forge-surface2 rounded-full overflow-hidden mb-3">
                      <div className="h-full rounded-full bg-forge-accent transition-all" style={{ width: `${s.progress}%` }} />
                    </div>
                    <input type="range" min={0} max={100} value={s.progress}
                      onChange={e => updateProgress(s.id, parseInt(e.target.value))}
                      className="w-full accent-forge-accent mb-3" />

                    <div className="flex items-center gap-2">
                      <button onClick={() => generateCurriculum(s)} disabled={generating === s.id}
                        className="flex items-center gap-1.5 bg-forge-surface2 border border-forge-border text-forge-text2 text-xs px-3 py-1.5 rounded-lg hover:border-forge-accent hover:text-forge-accent transition-all disabled:opacity-50">
                        <Zap size={11} />
                        {generating === s.id ? 'Generating...' : s.curriculum ? 'Regenerate Curriculum' : 'Generate Curriculum'}
                      </button>
                      {s.curriculum && (
                        <button onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                          className="text-forge-text3 text-xs hover:text-forge-text2 transition-colors ml-auto">
                          {expanded === s.id ? 'Hide ↑' : 'View curriculum ↓'}
                        </button>
                      )}
                    </div>
                  </div>

                  {expanded === s.id && s.curriculum && (
                    <div className="border-t border-forge-border px-5 py-4">
                      <div className="text-[10px] text-forge-accent font-bold tracking-widest mb-3">YOUR CURRICULUM</div>
                      <Markdown content={s.curriculum} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
