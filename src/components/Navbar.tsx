'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ArrowRight, LayoutDashboard } from 'lucide-react';

export function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    }
  }, []);

  return (
    <header className="w-full border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-slate-100 tracking-wide">
            Lexapad
          </span>
        </Link>

        {/* Actions (Selon l'état de connexion) */}
        <div className="flex items-center gap-4 text-sm font-medium">
          {isLoggedIn ? (
            <Link
              href="/notes"
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/20"
            >
              <LayoutDashboard className="w-4 h-4" />
              Accéder au Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-slate-300 hover:text-white px-3 py-2 transition-colors"
              >
                Se connecter
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/20"
              >
                S'inscrire
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}