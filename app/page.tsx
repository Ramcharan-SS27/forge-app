'use client';

import { useState, useEffect, useCallback } from 'react';
import { storage } from '@/lib/storage';
import { briefSystem } from '@/lib/prompts';
import { Profile, Goal, Project, Skill } from '@/lib/types';
import Sidebar from '@/components/Sidebar';
import Onboarding from '@/components/Onboarding';
import Markdown from '@/components/Markdown';
import Link from 'next/link';
import { Target, FolderKanban, BookOpen, RefreshCw, Zap } from 'lucide-react';

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [brief, setBrief] = useState('');
  const [briefLoading, setBriefLoading] = useState(false);
  const [sessionCount, setSessionCount] = useState(1);
  const [memories, setMemories] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const p = storage.profile.get();
    setProfile(p);
    if (p) {
      const g = storage.goals.get();
      const pr = storage.projects.get();
      const sk = storage.skills.get();
      const mem = storage.memories.get();
      setGoals(g);
      setProjects(pr);
      setSkills(sk);
      setMemories(mem);
      const count = storage.session.increment();
      setSessionCount(count);

      const cached = storage.brief.get();
      const today = new Date().toDateString();
      if (cached?.date === today) {
        setBrief(cached.content);
      } else {
        generateBrief(p, g, pr, mem);
      }
    }
    setReady(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateBrief = useCallback(async (p: Profile, g: Goal[], pr: Project[], mem: string) => {
    setBriefLoading(true);
    setBrief('');
    try {
      const apiKey = storage.apiKey.get();
      const res = await fetch('/api/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(apiKey ? { 'x-api-key': apiKey } : {}) },
        body: JSON.stringify({ system: briefSystem(p, g, pr, mem) }),
      });
      const data = await res.json();
      if (data.content) {
        setBrief(data.content);
        storage.brief.set({ date: new Date().toDateString(), content: data.content });
      }
    } catch { setBrief('Could not generate brief. Check your API key in Settings.'); }
    setBriefLoading(false);
  }, []);

  const handleProfileComplete = (p: Profile) => {
    storage.profile.set(p);
    storage.session.increment();
    setProfile(p);
    setSessionCount(1);
    generateBrief(p, [], [], '');
  };

  if (!ready) return (
    <div className="min-h-screen bg-forge-bg flex items-center justify-center">
      <div className="flex gap-1.5">{[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-forge-accent dot" style={{ animationDelay: `${i * 0.2}s` }} />)}</div>
    </div>
  );

  if (!profile) return <Onboarding onComplete={handleProfileComplete} />;

  const today = new Date();
  const hour = today.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const activeProjects = projects.filter(p => p.status === 'active');
  const streak = goals.reduce((acc, g) => {
    const recentLog = g.logs.some(l => new Date(l.date).toDateString() === today.toDateString());
    return recentLog ? acc + 1 : acc;
  }, 0);

  return (
    <div className="flex min-h-screen bg-forge-bg">
      <Sidebar profileName={profile.name} sessionCount={sessionCount} memories={memories} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-8">

          {/* Header */}
          <div className="mb-8 animate-fadeup">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-forge-text">{greeting}, {profile.name}.</h1>
                <div className="text-forge-text2 text-sm mt-1">
                  {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · Session #{sessionCount}
                </div>
              </div>
              {streak > 0 && (
                <div className="flex items-center gap-2 bg-forge-surface border border-forge-border rounded-xl px-4 py-2">
                  <Zap size={14} className="text-forge-warning" />
                  <span className="text-forge-warning text-sm font-semibold">{streak} active today</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Active Goals', value: goals.length, icon: Target, href: '/goals', color: 'text-forge-accent' },
              { label: 'Projects', value: activeProjects.length, icon: FolderKanban, href: '/projects', color: 'text-forge-success' },
              { label: 'Skills Learning', value: skills.length, icon: BookOpen, href: '/learn', color: 'text-forge-warning' },
            ].map(({ label, value, icon: Icon, href, color }) => (
              <Link key={label} href={href}
                className="bg-forge-surface border border-forge-border rounded-2xl p-5 hover:border-forge-accent transition-all group">
                <div className={`${color} mb-3 group-hover:scale-110 transition-transform inline-block`}>
                  <Icon size={20} />
                </div>
                <div className="text-3xl font-bold text-forge-text">{value}</div>
                <div className="text-forge-text2 text-xs mt-1">{label}</div>
              </Link>
            ))}
          </div>

          {/* Daily Brief */}
          <div className="bg-forge-surface border border-forge-border rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-forge-accent text-[10px] font-bold tracking-widest">FORGE'S DAILY BRIEF</div>
                <div className="text-forge-text3 text-xs mt-0.5">Refreshes each morning</div>
              </div>
              <button onClick={() => generateBrief(profile, goals, projects, memories)}
                disabled={briefLoading}
                className="flex items-center gap-1.5 text-forge-text3 hover:text-forge-text2 text-xs transition-colors disabled:opacity-40">
                <RefreshCw size={12} className={briefLoading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>

            {briefLoading ? (
              <div className="flex items-center gap-2 py-4">
                <div className="flex gap-1">{[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-forge-accent dot" style={{ animationDelay: `${i * 0.2}s` }} />)}</div>
                <span className="text-forge-text3 text-sm">Generating your brief...</span>
              </div>
            ) : brief ? (
              <Markdown content={brief} />
            ) : (
              <div className="text-forge-text3 text-sm py-4">Brief will appear here. Check your API key in Settings if it doesn't load.</div>
            )}
          </div>

          {/* Goals + Projects */}
          <div className="grid grid-cols-2 gap-4">

            {/* Goals */}
            <div className="bg-forge-surface border border-forge-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="text-forge-accent text-[10px] font-bold tracking-widest">ACTIVE GOALS</div>
                <Link href="/goals" className="text-forge-text3 hover:text-forge-accent text-xs transition-colors">View all →</Link>
              </div>
              {goals.length === 0 ? (
                <div className="text-forge-text3 text-sm py-2">
                  No goals set yet.{' '}
                  <Link href="/goals" className="text-forge-accent hover:underline">Add your first →</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {goals.slice(0, 3).map(g => (
                    <div key={g.id}>
                      <div className="flex justify-between mb-1">
                        <span className="text-forge-text text-sm font-medium">{g.title}</span>
                        <span className="text-forge-text3 text-xs">{g.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-forge-surface2 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-forge-accent transition-all" style={{ width: `${g.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Projects */}
            <div className="bg-forge-surface border border-forge-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="text-forge-accent text-[10px] font-bold tracking-widest">PROJECTS</div>
                <Link href="/projects" className="text-forge-text3 hover:text-forge-accent text-xs transition-colors">View all →</Link>
              </div>
              {projects.length === 0 ? (
                <div className="text-forge-text3 text-sm py-2">
                  No projects yet.{' '}
                  <Link href="/projects" className="text-forge-accent hover:underline">Add one →</Link>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {projects.slice(0, 3).map(p => (
                    <div key={p.id} className="flex items-center justify-between">
                      <span className="text-forge-text text-sm font-medium">{p.title}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        p.status === 'active' ? 'bg-forge-success/10 text-forge-success' :
                        p.status === 'planning' ? 'bg-forge-warning/10 text-forge-warning' :
                        p.status === 'done' ? 'bg-forge-accent/10 text-forge-accent' :
                        'bg-forge-surface2 text-forge-text3'
                      }`}>{p.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
