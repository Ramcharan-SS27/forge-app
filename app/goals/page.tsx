'use client';

import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { goalAnalysisSystem } from '@/lib/prompts';
import { Goal, WorkLog, Profile } from '@/lib/types';
import Sidebar from '@/components/Sidebar';
import Markdown from '@/components/Markdown';
import { Plus, ChevronDown, ChevronUp, Trash2, Clock } from 'lucide-react';

function id() { return Math.random().toString(36).slice(2, 10); }

export default function GoalsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [sessionCount, setSessionCount] = useState(1);
  const [memories, setMemories] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showLog, setShowLog] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<string | null>(null);

  const [newGoal, setNewGoal] = useState({ title: '', description: '', target_date: '' });
  const [logEntry, setLogEntry] = useState({ description: '', hours: '' });

  useEffect(() => {
    setProfile(storage.profile.get());
    setGoals(storage.goals.get());
    setSessionCount(storage.session.get());
    setMemories(storage.memories.get());
  }, []);

  const addGoal = () => {
    if (!newGoal.title.trim()) return;
    const g: Goal = {
      id: id(), title: newGoal.title, description: newGoal.description,
      target_date: newGoal.target_date, created_at: new Date().toISOString(),
      progress: 0, logs: [],
    };
    storage.goals.add(g);
    const updated = storage.goals.get();
    setGoals(updated);
    setNewGoal({ title: '', description: '', target_date: '' });
    setShowAdd(false);
  };

  const logWork = (goalId: string) => {
    if (!logEntry.description.trim()) return;
    const log: WorkLog = {
      id: id(), date: new Date().toISOString(),
      description: logEntry.description, hours: parseFloat(logEntry.hours) || 1,
    };
    const goal = goals.find(g => g.id === goalId)!;
    const newLogs = [...goal.logs, log];
    const progress = Math.min(100, Math.round((newLogs.length / 20) * 100));
    storage.goals.update(goalId, { logs: newLogs, progress });
    setGoals(storage.goals.get());
    setLogEntry({ description: '', hours: '' });
    setShowLog(null);
  };

  const analyze = async (goal: Goal) => {
    if (!profile) return;
    setAnalyzing(goal.id);
    try {
      const apiKey = storage.apiKey.get();
      const logsText = goal.logs.map(l => `${new Date(l.date).toLocaleDateString()}: ${l.description} (${l.hours}h)`).join('\n');
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(apiKey ? { 'x-api-key': apiKey } : {}) },
        body: JSON.stringify({
          system: goalAnalysisSystem(profile),
          messages: [{ role: 'user', content: `Goal: ${goal.title}\nDescription: ${goal.description}\nTarget: ${goal.target_date}\nProgress: ${goal.progress}%\n\nWork logs:\n${logsText || 'No logs yet.'}` }],
        }),
      });
      const data = await res.json();
      const analysis = data.content?.[0]?.text ?? 'Could not generate analysis.';
      storage.goals.update(goal.id, { ai_analysis: analysis });
      setGoals(storage.goals.get());
    } catch {}
    setAnalyzing(null);
  };

  const deleteGoal = (id: string) => {
    storage.goals.delete(id);
    setGoals(storage.goals.get());
  };

  const updateProgress = (id: string, progress: number) => {
    storage.goals.update(id, { progress });
    setGoals(storage.goals.get());
  };

  return (
    <div className="flex min-h-screen bg-forge-bg">
      <Sidebar profileName={profile?.name} sessionCount={sessionCount} memories={memories} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-8">

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-forge-text">Goals</h1>
              <p className="text-forge-text2 text-sm mt-1">Set targets, log work, track progress.</p>
            </div>
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 bg-forge-accent text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
              <Plus size={16} /> Add Goal
            </button>
          </div>

          {/* Add goal modal */}
          {showAdd && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <div className="bg-forge-surface border border-forge-border rounded-2xl p-6 w-full max-w-md animate-fadeup">
                <h2 className="text-forge-text font-semibold text-lg mb-5">New Goal</h2>
                <div className="space-y-3">
                  <input value={newGoal.title} onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                    placeholder="Goal title" autoFocus
                    className="w-full bg-forge-surface2 border border-forge-border rounded-xl px-4 py-2.5 text-forge-text text-sm focus:outline-none focus:border-forge-accent" />
                  <textarea value={newGoal.description} onChange={e => setNewGoal({ ...newGoal, description: e.target.value })}
                    placeholder="What does success look like?" rows={3}
                    className="w-full bg-forge-surface2 border border-forge-border rounded-xl px-4 py-2.5 text-forge-text text-sm focus:outline-none focus:border-forge-accent resize-none" />
                  <input type="date" value={newGoal.target_date} onChange={e => setNewGoal({ ...newGoal, target_date: e.target.value })}
                    className="w-full bg-forge-surface2 border border-forge-border rounded-xl px-4 py-2.5 text-forge-text text-sm focus:outline-none focus:border-forge-accent" />
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={() => setShowAdd(false)} className="flex-1 bg-forge-surface2 border border-forge-border text-forge-text2 rounded-xl py-2.5 text-sm hover:text-forge-text transition-colors">Cancel</button>
                  <button onClick={addGoal} className="flex-1 bg-forge-accent text-white rounded-xl py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity">Create Goal</button>
                </div>
              </div>
            </div>
          )}

          {/* Log work modal */}
          {showLog && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <div className="bg-forge-surface border border-forge-border rounded-2xl p-6 w-full max-w-md animate-fadeup">
                <h2 className="text-forge-text font-semibold text-lg mb-5">Log Work</h2>
                <div className="space-y-3">
                  <textarea value={logEntry.description} onChange={e => setLogEntry({ ...logEntry, description: e.target.value })}
                    placeholder="What did you work on?" rows={3} autoFocus
                    className="w-full bg-forge-surface2 border border-forge-border rounded-xl px-4 py-2.5 text-forge-text text-sm focus:outline-none focus:border-forge-accent resize-none" />
                  <input type="number" value={logEntry.hours} onChange={e => setLogEntry({ ...logEntry, hours: e.target.value })}
                    placeholder="Hours spent" min="0.25" step="0.25"
                    className="w-full bg-forge-surface2 border border-forge-border rounded-xl px-4 py-2.5 text-forge-text text-sm focus:outline-none focus:border-forge-accent" />
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={() => setShowLog(null)} className="flex-1 bg-forge-surface2 border border-forge-border text-forge-text2 rounded-xl py-2.5 text-sm">Cancel</button>
                  <button onClick={() => logWork(showLog)} className="flex-1 bg-forge-accent text-white rounded-xl py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity">Log It</button>
                </div>
              </div>
            </div>
          )}

          {/* Goals list */}
          {goals.length === 0 ? (
            <div className="text-center py-20 text-forge-text3">
              <Target size={32} className="mx-auto mb-4 opacity-30" />
              <div className="text-sm">No goals yet. Add your first one.</div>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map(g => (
                <div key={g.id} className="bg-forge-surface border border-forge-border rounded-2xl overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-forge-text font-semibold">{g.title}</h3>
                        {g.description && <p className="text-forge-text2 text-sm mt-1">{g.description}</p>}
                        {g.target_date && (
                          <div className="flex items-center gap-1 mt-2 text-forge-text3 text-xs">
                            <Clock size={11} /> Target: {new Date(g.target_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <span className="text-forge-accent text-sm font-semibold">{g.progress}%</span>
                        <button onClick={() => deleteGoal(g.id)} className="text-forge-text3 hover:text-forge-danger transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-2 bg-forge-surface2 rounded-full overflow-hidden mb-3">
                      <div className="h-full rounded-full bg-forge-accent transition-all" style={{ width: `${g.progress}%` }} />
                    </div>

                    {/* Progress slider */}
                    <input type="range" min={0} max={100} value={g.progress}
                      onChange={e => updateProgress(g.id, parseInt(e.target.value))}
                      className="w-full accent-forge-accent" />

                    <div className="flex gap-2 mt-3">
                      <button onClick={() => setShowLog(g.id)}
                        className="flex items-center gap-1.5 bg-forge-surface2 border border-forge-border text-forge-text2 text-xs px-3 py-1.5 rounded-lg hover:border-forge-accent hover:text-forge-accent transition-all">
                        <Plus size={12} /> Log Work
                      </button>
                      <button onClick={() => analyze(g)} disabled={analyzing === g.id}
                        className="flex items-center gap-1.5 bg-forge-surface2 border border-forge-border text-forge-text2 text-xs px-3 py-1.5 rounded-lg hover:border-forge-accent hover:text-forge-accent transition-all disabled:opacity-50">
                        {analyzing === g.id ? '...' : '🧠 AI Analysis'}
                      </button>
                      <button onClick={() => setExpanded(expanded === g.id ? null : g.id)}
                        className="flex items-center gap-1 text-forge-text3 text-xs ml-auto hover:text-forge-text2 transition-colors">
                        {g.logs.length} logs {expanded === g.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                    </div>
                  </div>

                  {/* AI Analysis */}
                  {g.ai_analysis && (
                    <div className="px-5 pb-4 border-t border-forge-border pt-4">
                      <div className="text-[10px] text-forge-accent font-bold tracking-widest mb-2">FORGE ANALYSIS</div>
                      <Markdown content={g.ai_analysis} />
                    </div>
                  )}

                  {/* Work logs */}
                  {expanded === g.id && g.logs.length > 0 && (
                    <div className="border-t border-forge-border">
                      {g.logs.slice().reverse().map(log => (
                        <div key={log.id} className="px-5 py-3 border-b border-forge-border last:border-0 flex items-start justify-between">
                          <div>
                            <div className="text-forge-text text-sm">{log.description}</div>
                            <div className="text-forge-text3 text-xs mt-0.5">{new Date(log.date).toLocaleDateString()}</div>
                          </div>
                          <div className="text-forge-text2 text-xs ml-4 shrink-0">{log.hours}h</div>
                        </div>
                      ))}
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

function Target({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  );
}
