'use client';

import { useState } from 'react';
import { Profile } from '@/lib/types';

const QUESTIONS = [
  {
    id: 'name' as keyof Profile,
    q: "What should Forge call you?",
    type: 'text',
    placeholder: 'Your name or handle...',
  },
  {
    id: 'learning_style' as keyof Profile,
    q: 'How do you best absorb new information?',
    type: 'choice',
    opts: ['Visual — diagrams, maps, videos', 'Reading & writing notes', 'Hands-on building & experimenting', 'Teaching or discussing with others'],
  },
  {
    id: 'primary_goal' as keyof Profile,
    q: "What's your #1 focus right now?",
    type: 'choice',
    opts: ['Land an FDE / AI engineering role', 'Build & ship my AI companion app', 'Level up my technical AI skills', 'I need direction — start fresh'],
  },
  {
    id: 'biggest_block' as keyof Profile,
    q: 'What holds you back most?',
    type: 'choice',
    opts: ['Starting — I overthink everything', 'Staying consistent over time', 'Information overload, too many paths', 'Not knowing what to focus on'],
  },
  {
    id: 'daily_time' as keyof Profile,
    q: 'How much focused time can you give daily?',
    type: 'choice',
    opts: ['30–60 minutes', '1–2 hours', '3–4 hours', '4+ hours — I\'m all in'],
  },
];

interface Props { onComplete: (profile: Profile) => void; }

export default function Onboarding({ onComplete }: Props) {
  const [idx, setIdx] = useState(0);
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [text, setText] = useState('');

  const q = QUESTIONS[idx];

  const answer = (val: string) => {
    const np = { ...profile, [q.id]: val };
    setProfile(np);
    setText('');
    if (idx < QUESTIONS.length - 1) {
      setIdx(idx + 1);
    } else {
      onComplete(np as Profile);
    }
  };

  return (
    <div className="min-h-screen bg-forge-bg flex items-center justify-center p-6">
      <div className="max-w-lg w-full animate-fadeup">
        <div className="text-forge-accent font-black text-xl tracking-[0.25em] mb-1">FORGE</div>
        <div className="text-forge-text3 text-[11px] tracking-widest mb-10">ONE-TIME SETUP · YOUR AI COMPANION</div>

        {/* Progress */}
        <div className="flex gap-1.5 mb-8">
          {QUESTIONS.map((_, i) => (
            <div key={i} className="h-[3px] flex-1 rounded-full transition-all duration-300"
              style={{ background: i <= idx ? '#7c6af7' : '#1c1c32' }} />
          ))}
        </div>

        <div className="text-forge-text3 text-xs tracking-widest mb-2">{idx + 1} / {QUESTIONS.length}</div>
        <h2 className="text-forge-text text-2xl font-semibold mb-7 leading-snug">{q.q}</h2>

        {q.type === 'text' ? (
          <div className="flex gap-3">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && text.trim() && answer(text.trim())}
              placeholder={q.placeholder}
              autoFocus
              className="flex-1 bg-forge-surface border border-forge-border rounded-xl px-4 py-3 text-forge-text text-sm focus:outline-none focus:border-forge-accent transition-colors"
            />
            <button onClick={() => text.trim() && answer(text.trim())}
              className="bg-forge-accent text-white px-5 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
              Next
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {q.opts!.map(opt => (
              <button key={opt} onClick={() => answer(opt)}
                className="bg-forge-surface border border-forge-border rounded-xl px-5 py-3.5 text-forge-text2 text-sm text-left transition-all hover:border-forge-accent hover:text-forge-text hover:bg-forge-surface2">
                {opt}
              </button>
            ))}
          </div>
        )}

        <div className="mt-10 text-forge-text3 text-xs">Your profile is saved locally — Forge remembers you across sessions.</div>
      </div>
    </div>
  );
}
