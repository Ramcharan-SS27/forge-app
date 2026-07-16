'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MessageSquare, Target, FolderKanban, BookOpen, Settings, Map, Users } from 'lucide-react';
import { COMPANY } from '@/lib/company.config';

const nav = [
  { href: '/',         icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/chat',     icon: MessageSquare,   label: 'Chat' },
  { href: '/track',    icon: Map,             label: 'FDE Track', highlight: true },
  { href: '/goals',    icon: Target,          label: 'Goals' },
  { href: '/projects', icon: FolderKanban,    label: 'Projects' },
  { href: '/learn',    icon: BookOpen,        label: 'Learn' },
  { href: '/team',     icon: Users,           label: 'Team' },
  { href: '/settings', icon: Settings,        label: 'Settings' },
];

interface SidebarProps {
  profileName?: string;
  sessionCount?: number;
  memories?: string;
}

export default function Sidebar({ profileName, sessionCount, memories }: SidebarProps) {
  const path = usePathname();
  return (
    <aside className="w-52 bg-forge-sidebar border-r border-forge-border flex flex-col shrink-0 h-screen sticky top-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-forge-border">
        <div className="text-forge-accent font-black text-lg tracking-[0.25em]">FORGE</div>
        <div className="text-forge-text3 text-[9px] tracking-widest mt-0.5">{COMPANY.name.toUpperCase()}</div>
      </div>

      {/* Nav */}
      <nav className="py-3 flex-1 overflow-y-auto">
        <div className="text-forge-text3 text-[9px] tracking-[0.25em] px-4 mb-1.5">NAVIGATE</div>
        {nav.map(({ href, icon: Icon, label, highlight }) => {
          const active = path === href || (href !== '/' && path.startsWith(href));
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-2.5 px-4 py-2 text-sm transition-all border-l-2 ${
                active
                  ? 'border-forge-accent bg-forge-surface2 text-forge-text font-semibold'
                  : highlight
                  ? 'border-transparent text-forge-accent/70 hover:text-forge-accent hover:bg-forge-surface'
                  : 'border-transparent text-forge-text3 hover:text-forge-text2 hover:bg-forge-surface'
              }`}>
              <Icon size={14} />
              <span>{label}</span>
              {highlight && !active && (
                <span className="ml-auto text-[9px] bg-forge-accent/15 text-forge-accent px-1.5 py-0.5 rounded font-bold">90D</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Memory indicator */}
      {memories && (
        <div className="mx-3 mb-2 p-2.5 bg-forge-surface border border-forge-border rounded-xl">
          <div className="text-[9px] text-forge-text3 tracking-widest mb-1">🧠 MEMORY</div>
          <div className="text-[10px] text-forge-text3 leading-relaxed line-clamp-3">{memories}</div>
        </div>
      )}

      {/* Profile */}
      <div className="px-4 py-3 border-t border-forge-border">
        {profileName && (
          <>
            <div className="text-[9px] text-forge-text3 tracking-widest mb-0.5">YOU</div>
            <div className="text-forge-text2 text-xs font-medium">{profileName}</div>
            {sessionCount && <div className="text-forge-text3 text-[10px]">Session #{sessionCount}</div>}
          </>
        )}
      </div>
    </aside>
  );
}
