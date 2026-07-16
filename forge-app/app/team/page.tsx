'use client';

import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { COMPANY } from '@/lib/company.config';
import { FDE_TRACK } from '@/lib/tracks';
import { Profile } from '@/lib/types';
import Sidebar from '@/components/Sidebar';
import { Users, TrendingUp, Target, Award } from 'lucide-react';

// In production, this would come from Supabase.
// For MVP, we simulate with the current user's data.

interface TeamMember {
  name: string;
  role: string;
  currentWeek: number;
  completedMilestones: number;
  lastActive: string;
  streak: number;
}

// Demo data for CEO view — replace with real Supabase query in production
const DEMO_TEAM: TeamMember[] = [
  { name: 'You', role: 'Developer', currentWeek: 1, completedMilestones: 0, lastActive: 'Today', streak: 1 },
  { name: 'Alex R.', role: 'Frontend Dev', currentWeek: 3, completedMilestones: 2, lastActive: 'Yesterday', streak: 5 },
  { name: 'Priya K.', role: 'Backend Dev', currentWeek: 5, completedMilestones: 4, lastActive: 'Today', streak: 12 },
  { name: 'Sam T.', role: 'DevOps', currentWeek: 2, completedMilestones: 1, lastActive: '3 days ago', streak: 0 },
  { name: 'Mira L.', role: 'Full Stack', currentWeek: 7, completedMilestones: 6, lastActive: 'Today', streak: 21 },
];

export default function TeamPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sessionCount, setSessionCount] = useState(1);
  const [memories, setMemories] = useState('');
  const [team] = useState<TeamMember[]>(DEMO_TEAM);

  useEffect(() => {
    setProfile(storage.profile.get());
    setSessionCount(storage.session.get());
    setMemories(storage.memories.get());
  }, []);

  const avgProgress = Math.round(team.reduce((a, m) => a + (m.completedMilestones / FDE_TRACK.milestones.length) * 100, 0) / team.length);
  const activeToday = team.filter(m => m.lastActive === 'Today').length;
  const onTrack = team.filter(m => m.currentWeek >= 3).length;

  return (
    <div className="flex min-h-screen bg-forge-bg">
      <Sidebar profileName={profile?.name} sessionCount={sessionCount} memories={memories} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">

          <div className="mb-8">
            <div className="text-forge-accent text-[10px] font-bold tracking-widest mb-2">{COMPANY.name.toUpperCase()}</div>
            <h1 className="text-2xl font-bold text-forge-text">Team Upskilling Dashboard</h1>
            <p className="text-forge-text2 text-sm mt-1">
              {COMPANY.mission.split('\n')[0]}
            </p>
          </div>

          {/* Company stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Team Members', value: team.length, icon: Users, color: 'text-forge-accent' },
              { label: 'Active Today', value: activeToday, icon: TrendingUp, color: 'text-forge-success' },
              { label: 'Avg Progress', value: `${avgProgress}%`, icon: Target, color: 'text-forge-warning' },
              { label: 'On Track', value: onTrack, icon: Award, color: 'text-forge-accent' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-forge-surface border border-forge-border rounded-2xl p-5">
                <Icon size={18} className={`${color} mb-3`} />
                <div className="text-2xl font-bold text-forge-text">{value}</div>
                <div className="text-forge-text2 text-xs mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Company track progress */}
          <div className="bg-forge-surface border border-forge-border rounded-2xl p-6 mb-6">
            <div className="text-[10px] text-forge-accent font-bold tracking-widest mb-4">COMPANY FDE TRACK PROGRESS</div>
            <div className="flex gap-0">
              {FDE_TRACK.milestones.map((m, i) => {
                const membersHere = team.filter(t => t.currentWeek === m.week).length;
                const membersCompleted = team.filter(t => t.completedMilestones >= i + 1).length;
                return (
                  <div key={m.id} className="flex-1 text-center">
                    <div className="text-forge-text3 text-[9px] mb-1">W{m.week}</div>
                    <div className="relative h-12 flex items-end justify-center">
                      <div
                        className="w-4 rounded-t-sm transition-all"
                        style={{
                          height: `${Math.max(4, (membersCompleted / team.length) * 48)}px`,
                          background: membersCompleted > 0 ? '#7c6af7' : '#1c1c32',
                        }}
                      />
                      {membersHere > 0 && (
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-forge-warning" />
                      )}
                    </div>
                    <div className="text-forge-text3 text-[9px] mt-1">{membersCompleted}</div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-1.5 text-forge-text3 text-xs">
                <div className="w-3 h-3 rounded-sm bg-forge-accent" /> Completed
              </div>
              <div className="flex items-center gap-1.5 text-forge-text3 text-xs">
                <div className="w-2 h-2 rounded-full bg-forge-warning" /> Currently here
              </div>
            </div>
          </div>

          {/* Team leaderboard */}
          <div className="bg-forge-surface border border-forge-border rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-forge-border">
              <div className="text-[10px] text-forge-accent font-bold tracking-widest">TEAM LEADERBOARD</div>
            </div>
            <div>
              {[...team].sort((a, b) => b.completedMilestones - a.completedMilestones).map((member, i) => (
                <div key={member.name} className="flex items-center gap-4 px-6 py-4 border-b border-forge-border last:border-0">
                  <div className={`w-6 text-sm font-bold ${i === 0 ? 'text-forge-warning' : 'text-forge-text3'}`}>
                    {i === 0 ? '🏆' : `#${i + 1}`}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-forge-text font-medium text-sm">{member.name}</span>
                      <span className="text-forge-text3 text-xs">{member.role}</span>
                      {member.streak > 0 && (
                        <span className="text-forge-warning text-xs ml-auto">🔥 {member.streak}d</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex-1 h-1.5 bg-forge-surface2 rounded-full overflow-hidden">
                        <div className="h-full bg-forge-accent rounded-full"
                          style={{ width: `${(member.completedMilestones / FDE_TRACK.milestones.length) * 100}%` }} />
                      </div>
                      <span className="text-forge-text3 text-xs shrink-0">Week {member.currentWeek}</span>
                      <span className="text-forge-text3 text-xs shrink-0">{member.lastActive}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-4 bg-forge-surface2 border border-forge-border rounded-xl">
            <div className="text-forge-text3 text-xs">
              <span className="text-forge-accent font-semibold">Production note:</span> Team data comes from each developer's Forge instance.
              To enable real team dashboards, connect Forge to Supabase — each user's progress syncs to a shared table.
              See <code className="text-forge-accent">COMPANY_SETUP.md</code> for instructions.
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
