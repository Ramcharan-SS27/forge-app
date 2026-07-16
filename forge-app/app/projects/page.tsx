'use client';

import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { projectPlanSystem } from '@/lib/prompts';
import { Project, Profile } from '@/lib/types';
import Sidebar from '@/components/Sidebar';
import Markdown from '@/components/Markdown';
import { Plus, Trash2, Zap } from 'lucide-react';

function id() { return Math.random().toString(36).slice(2, 10); }

const STATUS_COLORS: Record<string, string> = {
  planning: 'bg-forge-warning/10 text-forge-warning border-forge-warning/20',
  active:   'bg-forge-success/10 text-forge-success border-forge-success/20',
  paused:   'bg-forge-surface2 text-forge-text3 border-forge-border',
  done:     'bg-forge-accent/10 text-forge-accent border-forge-accent/20',
};

export default function ProjectsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sessionCount, setSessionCount] = useState(1);
  const [memories, setMemories] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [planning, setPlanning] = useState<string | null>(null);

  const [form, setForm] = useState({ title: '', description: '', tech_stack: '', deadline: '', status: 'planning' as Project['status'] });

  useEffect(() => {
    setProfile(storage.profile.get());
    setProjects(storage.projects.get());
    setSessionCount(storage.session.get());
    setMemories(storage.memories.get());
  }, []);

  const addProject = () => {
    if (!form.title.trim() || !profile) return;
    const p: Project = {
      id: id(), title: form.title, description: form.description,
      status: form.status, created_at: new Date().toISOString(),
      tech_stack: form.tech_stack.split(',').map(s => s.trim()).filter(Boolean),
      deadline: form.deadline, next_steps: [],
    };
    storage.projects.add(p);
    setProjects(storage.projects.get());
    setForm({ title: '', description: '', tech_stack: '', deadline: '', status: 'planning' });
    setShowAdd(false);
  };

  const generatePlan = async (p: Project) => {
    if (!profile) return;
    setPlanning(p.id);
    try {
      const apiKey = storage.apiKey.get();
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(apiKey ? { 'x-api-key': apiKey } : {}) },
        body: JSON.stringify({
          system: projectPlanSystem(profile),
          messages: [{ role: 'user', content: `Project: ${p.title}\nDescription: ${p.description}\nTech stack: ${p.tech_stack.join(', ')}\nDeadline: ${p.deadline || 'not set'}\nStatus: ${p.status}` }],
        }),
      });
      const data = await res.json();
      const plan = data.content?.[0]?.text ?? 'Could not generate plan.';
      storage.projects.update(p.id, { ai_plan: plan });
      setProjects(storage.projects.get());
      setExpanded(p.id);
    } catch {}
    setPlanning(null);
  };

  const updateStatus = (id: string, status: Project['status']) => {
    storage.projects.update(id, { status });
    setProjects(storage.projects.get());
  };

  const deleteProject = (id: string) => {
    storage.projects.delete(id);
    setProjects(storage.projects.get());
    if (expanded === id) setExpanded(null);
  };

  return (
    <div className="flex min-h-screen bg-forge-bg">
      <Sidebar profileName={profile?.name} sessionCount={sessionCount} memories={memories} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-forge-text">Projects</h1>
              <p className="text-forge-text2 text-sm mt-1">Track what you're building. AI helps plan each one.</p>
            </div>
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 bg-forge-accent text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
              <Plus size={16} /> New Project
            </button>
          </div>

          {/* Add modal */}
          {showAdd && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <div className="bg-forge-surface border border-forge-border rounded-2xl p-6 w-full max-w-lg animate-fadeup">
                <h2 className="text-forge-text font-semibold text-lg mb-5">New Project</h2>
                <div className="space-y-3">
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="Project name" autoFocus
                    className="w-full bg-forge-surface2 border border-forge-border rounded-xl px-4 py-2.5 text-forge-text text-sm focus:outline-none focus:border-forge-accent" />
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="What are you building and why?" rows={3}
                    className="w-full bg-forge-surface2 border border-forge-border rounded-xl px-4 py-2.5 text-forge-text text-sm focus:outline-none focus:border-forge-accent resize-none" />
                  <input value={form.tech_stack} onChange={e => setForm({ ...form, tech_stack: e.target.value })}
                    placeholder="Tech stack (comma separated — e.g. Next.js, Postgres, Anthropic API)"
                    className="w-full bg-forge-surface2 border border-forge-border rounded-xl px-4 py-2.5 text-forge-text text-sm focus:outline-none focus:border-forge-accent" />
                  <div className="flex gap-3">
                    <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })}
                      className="flex-1 bg-forge-surface2 border border-forge-border rounded-xl px-4 py-2.5 text-forge-text text-sm focus:outline-none focus:border-forge-accent" />
                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Project['status'] })}
                      className="flex-1 bg-forge-surface2 border border-forge-border rounded-xl px-4 py-2.5 text-forge-text text-sm focus:outline-none focus:border-forge-accent">
                      <option value="planning">Planning</option>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={() => setShowAdd(false)} className="flex-1 bg-forge-surface2 border border-forge-border text-forge-text2 rounded-xl py-2.5 text-sm">Cancel</button>
                  <button onClick={addProject} className="flex-1 bg-forge-accent text-white rounded-xl py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity">Create</button>
                </div>
              </div>
            </div>
          )}

          {/* Projects grid */}
          {projects.length === 0 ? (
            <div className="text-center py-20 text-forge-text3">
              <div className="text-4xl mb-4">📦</div>
              <div className="text-sm">No projects yet. Add your first one.</div>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map(p => (
                <div key={p.id} className="bg-forge-surface border border-forge-border rounded-2xl overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-forge-text font-semibold text-lg">{p.title}</h3>
                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold border ${STATUS_COLORS[p.status]}`}>
                            {p.status}
                          </span>
                        </div>
                        {p.description && <p className="text-forge-text2 text-sm">{p.description}</p>}
                      </div>
                      <button onClick={() => deleteProject(p.id)} className="text-forge-text3 hover:text-forge-danger transition-colors ml-4">
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {p.tech_stack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {p.tech_stack.map(t => (
                          <span key={t} className="bg-forge-surface2 border border-forge-border text-forge-text3 text-[10px] px-2 py-0.5 rounded-md">{t}</span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <select value={p.status} onChange={e => updateStatus(p.id, e.target.value as Project['status'])}
                        className="bg-forge-surface2 border border-forge-border text-forge-text2 text-xs px-2 py-1.5 rounded-lg focus:outline-none">
                        <option value="planning">Planning</option>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="done">Done</option>
                      </select>
                      <button onClick={() => generatePlan(p)} disabled={planning === p.id}
                        className="flex items-center gap-1.5 bg-forge-surface2 border border-forge-border text-forge-text2 text-xs px-3 py-1.5 rounded-lg hover:border-forge-accent hover:text-forge-accent transition-all disabled:opacity-50">
                        <Zap size={11} />
                        {planning === p.id ? 'Generating...' : p.ai_plan ? 'Regenerate Plan' : 'Generate AI Plan'}
                      </button>
                      {p.ai_plan && (
                        <button onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                          className="text-forge-text3 text-xs hover:text-forge-text2 transition-colors ml-auto">
                          {expanded === p.id ? 'Hide plan ↑' : 'View plan ↓'}
                        </button>
                      )}
                    </div>
                  </div>

                  {expanded === p.id && p.ai_plan && (
                    <div className="border-t border-forge-border px-5 py-4">
                      <div className="text-[10px] text-forge-accent font-bold tracking-widest mb-3">AI PROJECT PLAN</div>
                      <Markdown content={p.ai_plan} />
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
