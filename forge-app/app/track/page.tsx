'use client';

import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { FDE_TRACK, Milestone } from '@/lib/tracks';
import { COMPANY } from '@/lib/company.config';
import { milestoneCoachSystem } from '@/lib/prompts';
import { Profile } from '@/lib/types';
import Sidebar from '@/components/Sidebar';
import Markdown from '@/components/Markdown';
import { CheckCircle, Circle, Lock, ChevronDown, ChevronUp, Zap, ExternalLink } from 'lucide-react';

interface TrackProgress {
  currentWeek: number;
  completedMilestones: string[];
}

function id() { return Math.random().toString(36).slice(2, 10); }

export default function TrackPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sessionCount, setSessionCount] = useState(1);
  const [memories, setMemories] = useState('');
  const [progress, setProgress] = useState<TrackProgress>({ currentWeek: 1, completedMilestones: [] });
  const [expanded, setExpanded] = useState<string | null>('m1');
  const [coaching, setCoaching] = useState<string | null>(null);
  const [coachInput, setCoachInput] = useState('');
  const [coachResponse, setCoachResponse] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    setProfile(storage.profile.get());
    setSessionCount(storage.session.get());
    setMemories(storage.memories.get());
    const saved = localStorage.getItem('forge_track_progress');
    if (saved) setProgress(JSON.parse(saved));
  }, []);

  const saveProgress = (p: TrackProgress) => {
    setProgress(p);
    localStorage.setItem('forge_track_progress', JSON.stringify(p));
  };

  const completeMilestone = (milestoneId: string) => {
    const m = FDE_TRACK.milestones.find(m => m.id === milestoneId)!;
    const completed = [...progress.completedMilestones, milestoneId];
    const nextWeek = Math.min(m.week + 1, FDE_TRACK.milestones.length);
    saveProgress({ currentWeek: nextWeek, completedMilestones: completed });
  };

  const askCoach = async (milestone: Milestone) => {
    if (!coachInput.trim() || !profile) return;
    const q = coachInput;
    setCoachInput('');
    setLoading(milestone.id);
    try {
      const apiKey = storage.apiKey.get();
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(apiKey ? { 'x-api-key': apiKey } : {}) },
        body: JSON.stringify({
          system: milestoneCoachSystem(profile, milestone),
          messages: [{ role: 'user', content: q }],
        }),
      });
      const data = await res.json();
      setCoachResponse(prev => ({ ...prev, [milestone.id]: data.content?.[0]?.text ?? 'Could not get coaching.' }));
    } catch {}
    setLoading(null);
  };

  const totalMilestones = FDE_TRACK.milestones.length;
  const completedCount = progress.completedMilestones.length;
  const overallProgress = Math.round((completedCount / totalMilestones) * 100);

  const milestoneStatus = (m: Milestone): 'completed' | 'current' | 'locked' => {
    if (progress.completedMilestones.includes(m.id)) return 'completed';
    if (m.week === progress.currentWeek) return 'current';
    return 'locked';
  };

  return (
    <div className="flex min-h-screen bg-forge-bg">
      <Sidebar profileName={profile?.name} sessionCount={sessionCount} memories={memories} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-8">

          {/* Header */}
          <div className="mb-8">
            <div className="text-forge-accent text-[10px] font-bold tracking-widest mb-2">{COMPANY.name.toUpperCase()}</div>
            <h1 className="text-2xl font-bold text-forge-text">{FDE_TRACK.name}</h1>
            <p className="text-forge-text2 text-sm mt-1">{FDE_TRACK.description}</p>
          </div>

          {/* Overall progress */}
          <div className="bg-forge-surface border border-forge-border rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-forge-text font-semibold">Your Journey</div>
                <div className="text-forge-text2 text-sm mt-0.5">Week {progress.currentWeek} of {totalMilestones} · {FDE_TRACK.duration}</div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-forge-accent">{overallProgress}%</div>
                <div className="text-forge-text3 text-xs">{completedCount}/{totalMilestones} milestones</div>
              </div>
            </div>
            <div className="h-2 bg-forge-surface2 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-forge-accent transition-all duration-500" style={{ width: `${overallProgress}%` }} />
            </div>
            <div className="flex justify-between mt-2">
              {FDE_TRACK.milestones.map(m => (
                <div key={m.id} className={`w-2 h-2 rounded-full ${
                  progress.completedMilestones.includes(m.id) ? 'bg-forge-accent' :
                  m.week === progress.currentWeek ? 'bg-forge-warning' : 'bg-forge-surface2'
                }`} />
              ))}
            </div>
          </div>

          {/* Milestones */}
          <div className="space-y-3">
            {FDE_TRACK.milestones.map(m => {
              const status = milestoneStatus(m);
              const isExpanded = expanded === m.id;

              return (
                <div key={m.id} className={`bg-forge-surface border rounded-2xl overflow-hidden transition-all ${
                  status === 'current' ? 'border-forge-accent/50' :
                  status === 'completed' ? 'border-forge-success/30' :
                  'border-forge-border'
                }`}>
                  {/* Milestone header */}
                  <button
                    className="w-full flex items-center gap-4 p-5 text-left hover:bg-forge-surface2/50 transition-colors"
                    onClick={() => setExpanded(isExpanded ? null : m.id)}
                    disabled={status === 'locked'}
                  >
                    <div className="shrink-0">
                      {status === 'completed' ? (
                        <CheckCircle size={22} className="text-forge-success" />
                      ) : status === 'current' ? (
                        <div className="w-5 h-5 rounded-full border-2 border-forge-accent flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-forge-accent" />
                        </div>
                      ) : (
                        <Lock size={18} className="text-forge-text3" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold tracking-widest ${
                          status === 'current' ? 'text-forge-accent' :
                          status === 'completed' ? 'text-forge-success' : 'text-forge-text3'
                        }`}>WEEK {m.week}</span>
                        {status === 'current' && (
                          <span className="bg-forge-accent/15 text-forge-accent text-[10px] px-2 py-0.5 rounded-full font-semibold">CURRENT</span>
                        )}
                        {status === 'completed' && (
                          <span className="bg-forge-success/15 text-forge-success text-[10px] px-2 py-0.5 rounded-full font-semibold">DONE</span>
                        )}
                      </div>
                      <div className={`font-semibold mt-0.5 ${status === 'locked' ? 'text-forge-text3' : 'text-forge-text'}`}>
                        {m.title}
                      </div>
                      <div className="text-forge-text2 text-xs mt-0.5 line-clamp-1">{m.description}</div>
                    </div>

                    {status !== 'locked' && (
                      isExpanded ? <ChevronUp size={16} className="text-forge-text3 shrink-0" /> : <ChevronDown size={16} className="text-forge-text3 shrink-0" />
                    )}
                  </button>

                  {/* Expanded content */}
                  {isExpanded && status !== 'locked' && (
                    <div className="border-t border-forge-border">

                      {/* Skills */}
                      <div className="px-5 py-4 border-b border-forge-border">
                        <div className="text-[10px] text-forge-text3 font-bold tracking-widest mb-2">SKILLS THIS WEEK</div>
                        <div className="flex flex-wrap gap-1.5">
                          {m.skills.map(s => (
                            <span key={s} className="bg-forge-surface2 border border-forge-border text-forge-text2 text-xs px-2.5 py-1 rounded-lg">{s}</span>
                          ))}
                        </div>
                      </div>

                      {/* Daily tasks */}
                      <div className="px-5 py-4 border-b border-forge-border">
                        <div className="text-[10px] text-forge-text3 font-bold tracking-widest mb-3">DAILY TASKS</div>
                        <ol className="space-y-2">
                          {m.dailyTasks.map((task, i) => (
                            <li key={i} className="flex gap-3 text-sm text-forge-text2">
                              <span className="text-forge-accent font-mono text-xs pt-0.5 shrink-0">0{i + 1}</span>
                              {task}
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Checkpoint & Project */}
                      <div className="px-5 py-4 border-b border-forge-border grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-[10px] text-forge-warning font-bold tracking-widest mb-1.5">CHECKPOINT</div>
                          <div className="text-forge-text2 text-sm">{m.checkpoint}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-forge-success font-bold tracking-widest mb-1.5">MINI PROJECT</div>
                          <div className="text-forge-text2 text-sm">{m.project}</div>
                        </div>
                      </div>

                      {/* Resources */}
                      {m.resources.length > 0 && (
                        <div className="px-5 py-4 border-b border-forge-border">
                          <div className="text-[10px] text-forge-text3 font-bold tracking-widest mb-2">RESOURCES</div>
                          <div className="space-y-1.5">
                            {m.resources.map((r, i) => (
                              <a key={i} href={r.url} target="_blank" rel="noreferrer"
                                className="flex items-center gap-2 text-forge-accent text-sm hover:underline">
                                <ExternalLink size={12} />
                                {r.title}
                                <span className="text-forge-text3 text-xs ml-auto capitalize">{r.type}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* AI Coach */}
                      <div className="px-5 py-4 border-b border-forge-border">
                        <div className="text-[10px] text-forge-accent font-bold tracking-widest mb-3">ASK FORGE — WEEK {m.week} COACH</div>
                        {coachResponse[m.id] && (
                          <div className="bg-forge-surface2 border border-forge-border rounded-xl p-4 mb-3">
                            <Markdown content={coachResponse[m.id]} />
                          </div>
                        )}
                        <div className="flex gap-2">
                          <input
                            value={coaching === m.id ? coachInput : ''}
                            onChange={e => { setCoaching(m.id); setCoachInput(e.target.value); }}
                            onKeyDown={e => { if (e.key === 'Enter') askCoach(m); }}
                            placeholder={`Ask about ${m.title}...`}
                            className="flex-1 bg-forge-surface2 border border-forge-border rounded-xl px-4 py-2.5 text-forge-text text-sm focus:outline-none focus:border-forge-accent"
                          />
                          <button onClick={() => askCoach(m)} disabled={loading === m.id}
                            className="flex items-center gap-1.5 bg-forge-accent text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-40">
                            <Zap size={14} />
                            {loading === m.id ? '...' : 'Ask'}
                          </button>
                        </div>
                      </div>

                      {/* Complete button */}
                      {status === 'current' && (
                        <div className="px-5 py-4">
                          <button onClick={() => completeMilestone(m.id)}
                            className="w-full bg-forge-success/10 border border-forge-success/30 text-forge-success font-semibold py-3 rounded-xl hover:bg-forge-success/20 transition-colors text-sm">
                            ✓ Mark Week {m.week} Complete — Move to Week {m.week + 1}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </main>
    </div>
  );
}
