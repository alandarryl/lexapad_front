'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FileText, Layout, Sparkles, BookOpen, Palette, GraduationCap, LogOut, User } from 'lucide-react';

const navigation = [
  { name: 'Notes', href: '/notes', icon: FileText },
  { name: 'Croquis', href: '/drawings', icon: Palette },
  { name: 'Canvas', href: '/boards', icon: Layout },
  { name: 'Dissertation', href: '/essays', icon: GraduationCap },
  { name: 'Analyse IA', href: '/analysis', icon: Sparkles },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserEmail(localStorage.getItem('userEmail'));
    }
  }, [pathname]);

  // 🙈 Masque la Sidebar sur la page d'accueil (/), de connexion (/login) et d'inscription (/register)
  if (pathname === '/' || pathname === '/login' || pathname === '/register') {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    router.push('/login');
  };

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

      {/* Footer Info & Logout */}
      <div className="p-4 border-t border-slate-800 space-y-3 text-xs">
        {userEmail && (
          <div className="flex items-center gap-2 text-slate-300 px-2 py-1 rounded-lg bg-slate-800/50">
            <User className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span className="truncate">{userEmail}</span>
          </div>
        )}
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}