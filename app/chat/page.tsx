'use client';

import { useState, useEffect, useRef } from 'react';
import { storage } from '@/lib/storage';
import { chatSystem, memorySystem } from '@/lib/prompts';
import { Message, Profile } from '@/lib/types';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';

const MODES = [
  { key: 'PLAN',    icon: '🗺️', label: 'Plan',    desc: 'Structure your week & goals' },
  { key: 'LEARN',   icon: '⚡', label: 'Learn',   desc: 'Personalized skill building' },
  { key: 'WORK',    icon: '🔨', label: 'Work',    desc: 'Active problem solving' },
  { key: 'REFLECT', icon: '🪞', label: 'Reflect', desc: 'Review & recalibrate' },
];

const QUICKSTARTS: Record<string, string[]> = {
  PLAN:    ['Build my weekly plan', 'Break down my FDE prep', 'What should I focus on today?'],
  LEARN:   ['Teach me RAG pipelines hands-on', 'Create my AI learning curriculum', 'Explain vector embeddings'],
  WORK:    ['Review my architecture approach', "I'm stuck — help me think", 'Help me write this function'],
  REFLECT: ['Review my week with me', 'Am I on track?', 'What patterns should I notice?'],
};

function fmt(text: string): string {
  return text
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.*?)\*/g,'<em style="color:#9090c0">$1</em>')
    .replace(/`([^`]+)`/g,'<code style="background:#141428;padding:1px 5px;border-radius:4px;font-size:0.8rem;color:#9b8dff">$1</code>')
    .replace(/→/g,'<strong style="color:#7c6af7">→</strong>')
    .replace(/\n/g,'<br/>');
}

export default function ChatPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [memories, setMemories] = useState('');
  const [sessionCount, setSessionCount] = useState(1);
  const [mode, setMode] = useState('PLAN');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQuicks, setShowQuicks] = useState(true);
  const [memToast, setMemToast] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const p = storage.profile.get();
    setProfile(p);
    if (p) {
      const hist = storage.history.get();
      const mem = storage.memories.get();
      const sc = storage.session.get();
      setMessages(hist);
      setMemories(mem);
      setSessionCount(sc);
      setShowQuicks(hist.length === 0);
      if (hist.length === 0) {
        addWelcome(p, mem, sc);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const addWelcome = async (p: Profile, mem: string, sc: number) => {
    setLoading(true);
    try {
      const apiKey = storage.apiKey.get();
      const system = chatSystem(p, 'PLAN', mem, sc);
      const userMsg = sc > 1
        ? `I'm back. Session #${sc}. What should we work on?`
        : `I'm ${p.name}. Just set up my profile. Goal: ${p.primary_goal}. Let's start.`;
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(apiKey ? { 'x-api-key': apiKey } : {}) },
        body: JSON.stringify({ system, messages: [{ role: 'user', content: userMsg }] }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text ?? "Welcome to Forge. What are we working on?";
      const initMsgs: Message[] = [{ role: 'assistant', content: reply, timestamp: Date.now() }];
      setMessages(initMsgs);
      storage.history.set(initMsgs);
    } catch { setMessages([{ role: 'assistant', content: `Welcome${profile?.name ? `, ${profile.name}` : ''}. What are we working on today?`, timestamp: Date.now() }]); }
    setLoading(false);
  };

  const send = async (text?: string) => {
    const msg = text ?? input;
    if (!msg.trim() || loading || !profile) return;
    setInput('');
    setShowQuicks(false);

    const userMsg: Message = { role: 'user', content: msg, timestamp: Date.now() };
    const next = [...messages, userMsg];
    setMessages(next);
    setLoading(true);

    storage.history.set(next);

    try {
      const apiKey = storage.apiKey.get();
      const system = chatSystem(profile, mode, memories, sessionCount);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(apiKey ? { 'x-api-key': apiKey } : {}) },
        body: JSON.stringify({ system, messages: next.slice(-20).map(m => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text ?? data.error ?? 'Something went wrong.';
      const final = [...next, { role: 'assistant' as const, content: reply, timestamp: Date.now() }];
      setMessages(final);
      storage.history.set(final);

      if (final.length % 8 === 0) extractMemories(final);
    } catch { setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Check your API key in Settings.', timestamp: Date.now() }]); }

    setLoading(false);
  };

  const extractMemories = async (msgs: Message[]) => {
    try {
      const apiKey = storage.apiKey.get();
      const existing = storage.memories.get();
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(apiKey ? { 'x-api-key': apiKey } : {}) },
        body: JSON.stringify({
          system: memorySystem(),
          messages: [{ role: 'user', content: `Existing:\n${existing || 'none'}\n\nConversation:\n${msgs.slice(-12).map(m => `${m.role}: ${m.content.slice(0,200)}`).join('\n')}` }],
        }),
      });
      const data = await res.json();
      const newMem = data.content?.[0]?.text ?? existing;
      setMemories(newMem);
      storage.memories.set(newMem);
      setMemToast(true);
      setTimeout(() => setMemToast(false), 2500);
    } catch {}
  };

  const activeMode = MODES.find(m => m.key === mode)!;

  if (!profile) return (
    <div className="min-h-screen bg-forge-bg flex items-center justify-center">
      <div className="text-center">
        <div className="text-forge-text2 text-sm mb-4">No profile found.</div>
        <Link href="/" className="text-forge-accent hover:underline text-sm">Complete setup →</Link>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-forge-bg overflow-hidden">
      <Sidebar profileName={profile.name} sessionCount={sessionCount} memories={memories} />

      {/* Memory toast */}
      {memToast && (
        <div className="fixed bottom-20 right-6 bg-forge-surface border border-forge-accent/30 rounded-xl px-4 py-2 text-xs text-forge-accent z-50 animate-fadeup">
          🧠 Memory updated
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mode bar */}
        <div className="border-b border-forge-border flex items-center gap-1 px-4 py-2 bg-forge-sidebar">
          {MODES.map(m => (
            <button key={m.key} onClick={() => setMode(m.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                mode === m.key ? 'bg-forge-accent/15 text-forge-accent font-semibold' : 'text-forge-text3 hover:text-forge-text2'
              }`}>
              <span>{m.icon}</span>{m.label}
            </button>
          ))}
          <div className="ml-auto text-forge-text3 text-xs">{activeMode.desc}</div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeup`}>
              <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-forge-accent-dim border border-forge-accent/30 text-forge-text rounded-br-sm'
                  : 'bg-forge-surface border border-forge-border text-forge-text rounded-bl-sm'
              }`}
                dangerouslySetInnerHTML={{ __html: fmt(m.content) }} />
            </div>
          ))}

          {loading && (
            <div className="flex">
              <div className="bg-forge-surface border border-forge-border rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
                {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-forge-accent dot" style={{ animationDelay: `${i * 0.2}s` }} />)}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick starts */}
        {showQuicks && (
          <div className="px-6 pb-3 flex gap-2 flex-wrap">
            {QUICKSTARTS[mode].map(q => (
              <button key={q} onClick={() => send(q)}
                className="bg-forge-surface border border-forge-border rounded-full px-3 py-1.5 text-forge-text3 text-xs hover:border-forge-accent hover:text-forge-text2 transition-all">
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-6 pb-5 flex gap-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={`${activeMode.icon} ${activeMode.desc}...`}
            className="flex-1 bg-forge-surface border border-forge-border rounded-xl px-4 py-3 text-forge-text text-sm focus:outline-none focus:border-forge-accent transition-colors"
          />
          <button onClick={() => send()} disabled={loading || !input.trim()}
            className="bg-forge-accent text-white px-5 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
