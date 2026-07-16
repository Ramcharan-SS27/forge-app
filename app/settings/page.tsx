'use client';

import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { Profile } from '@/lib/types';
import Sidebar from '@/components/Sidebar';
import { ExternalLink, Check } from 'lucide-react';

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [sessionCount, setSessionCount] = useState(1);
  const [memories, setMemories] = useState('');

  useEffect(() => {
    setProfile(storage.profile.get());
    setApiKey(storage.apiKey.get());
    setSessionCount(storage.session.get());
    setMemories(storage.memories.get());
  }, []);

  const saveKey = () => {
    storage.apiKey.set(apiKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const resetAll = () => {
    if (!confirm('This will delete your profile, goals, projects, and all memory. Are you sure?')) return;
    storage.clearAll();
    window.location.href = '/';
  };

  return (
    <div className="flex min-h-screen bg-forge-bg">
      <Sidebar profileName={profile?.name} sessionCount={sessionCount} memories={memories} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-forge-text">Settings</h1>
            <p className="text-forge-text2 text-sm mt-1">Configure Forge for your environment.</p>
          </div>

          {/* API Key */}
          <div className="bg-forge-surface border border-forge-border rounded-2xl p-6 mb-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-forge-text font-semibold">Anthropic API Key</h2>
                <p className="text-forge-text2 text-sm mt-1">
                  Required to power Forge. Your key is stored locally and never sent anywhere except Anthropic's API.
                </p>
              </div>
            </div>

            <div className="bg-forge-surface2 border border-forge-border rounded-xl p-4 mb-4">
              <div className="text-[10px] text-forge-warning font-bold tracking-widest mb-2">HOW TO GET YOUR KEY</div>
              <ol className="text-forge-text2 text-sm space-y-1 list-decimal list-inside">
                <li>Go to <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" className="text-forge-accent hover:underline inline-flex items-center gap-1">console.anthropic.com <ExternalLink size={11} /></a></li>
                <li>Create a free account</li>
                <li>Go to API Keys → Create Key</li>
                <li>Paste it below</li>
              </ol>
              <p className="text-forge-text3 text-xs mt-3">Free tier gives ~$5 of credits — plenty to run Forge for months.</p>
            </div>

            <div className="bg-forge-surface2 border border-forge-border rounded-xl p-4 mb-4">
              <div className="text-[10px] text-forge-accent font-bold tracking-widest mb-2">FOR VERCEL DEPLOYMENT</div>
              <p className="text-forge-text2 text-sm">
                On Vercel, set <code className="bg-forge-bg text-forge-accent px-1.5 py-0.5 rounded text-xs">ANTHROPIC_API_KEY</code> in your project's Environment Variables. The field below is only needed for local use or if you didn't set the env variable.
              </p>
            </div>

            <div className="flex gap-3">
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="sk-ant-api03-..."
                className="flex-1 bg-forge-surface2 border border-forge-border rounded-xl px-4 py-2.5 text-forge-text text-sm focus:outline-none focus:border-forge-accent font-mono"
              />
              <button onClick={saveKey}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  saved ? 'bg-forge-success/20 text-forge-success border border-forge-success/30' : 'bg-forge-accent text-white hover:opacity-90'
                }`}>
                {saved ? <><Check size={14} /> Saved</> : 'Save Key'}
              </button>
            </div>
          </div>

          {/* Profile info */}
          {profile && (
            <div className="bg-forge-surface border border-forge-border rounded-2xl p-6 mb-4">
              <h2 className="text-forge-text font-semibold mb-4">Your Profile</h2>
              <div className="space-y-2">
                {Object.entries(profile).map(([k, v]) => (
                  <div key={k} className="flex items-start gap-4">
                    <div className="text-forge-text3 text-xs w-32 pt-0.5 capitalize">{k.replace(/_/g, ' ')}</div>
                    <div className="text-forge-text2 text-sm flex-1">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Danger zone */}
          <div className="bg-forge-surface border border-forge-danger/20 rounded-2xl p-6">
            <h2 className="text-forge-danger font-semibold mb-2">Danger Zone</h2>
            <p className="text-forge-text2 text-sm mb-4">Reset all data. This deletes your profile, goals, projects, skills, chat history, and memory. Cannot be undone.</p>
            <button onClick={resetAll}
              className="bg-forge-danger/10 border border-forge-danger/30 text-forge-danger text-sm px-4 py-2 rounded-xl hover:bg-forge-danger/20 transition-colors">
              Reset Everything
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
