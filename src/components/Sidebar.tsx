'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Layout, Sparkles, BookOpen, Palette, GraduationCap } from 'lucide-react';

const navigation = [
  { name: 'Notes', href: '/notes', icon: FileText },
  { name: 'Croquis', href: '/drawings', icon: Palette },
  { name: 'Canvas', href: '/boards', icon: Layout },
  { name: 'Dissertation', href: '/essays', icon: GraduationCap },
  { name: 'Analyse IA', href: '/analysis', icon: Sparkles },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col h-screen sticky top-0">
      {/* Header / Logo */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-slate-100 tracking-wide">Lexapad</h1>
          <p className="text-xs text-slate-400">Éditeur augmenté par l'IA</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
        <p className="font-mono">API Status: <span className="text-emerald-400">Online</span></p>
      </div>
    </aside>
  );
}