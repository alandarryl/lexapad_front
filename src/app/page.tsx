'use client';

import Link from 'next/link';
import { Navbar } from '@/components/Navbar'; // 👈 Import de la Navbar
import { 
  Sparkles, 
  Layout, 
  FileText, 
  GraduationCap, 
  ArrowRight 
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Navbar Modulaire */}
      <Navbar />

      {/* --- HERO SECTION --- */}
      <header className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 text-center space-y-8 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium animate-pulse">
            <Sparkles className="w-4 h-4" />
            <span>Nouveau : Analyse de texte alimentée par l'IA</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-100 max-w-4xl mx-auto leading-tight">
            Pensez, rédigez et organisez vos idées avec <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Lexapad</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-normal">
            L'éditeur de texte intelligent combinant la prise de notes structurée, un canvas visuel infini et un assistant pédagogique IA.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 text-base"
            >
              Créer un compte gratuit
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-base"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </header>

      {/* --- FEATURES GRID --- */}
      <main className="max-w-6xl mx-auto px-6 py-16 w-full">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-100">Un écosystème complet pour vos réflexions</h2>
          <p className="text-slate-400 text-sm md:text-base">Tout ce dont vous avez besoin pour capturer et structurer vos connaissances.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4 hover:border-slate-700 transition-colors">
            <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl w-fit">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg text-slate-100">Notes augmentées</h3>
            <p className="text-slate-400 text-sm">Rédigez du contenu propre avec typographie ajustable et sauvegarde sécurisée.</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4 hover:border-slate-700 transition-colors">
            <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl w-fit">
              <Layout className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg text-slate-100">Canvas Visuel</h3>
            <p className="text-slate-400 text-sm">Organisez vos idées sous forme de cartes et post-its interactifs.</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4 hover:border-slate-700 transition-colors">
            <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl w-fit">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg text-slate-100">Dissertations</h3>
            <p className="text-slate-400 text-sm">Générez des sujets et obtenez une évaluation détaillée basée sur des critères précis.</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4 hover:border-slate-700 transition-colors">
            <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl w-fit">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg text-slate-100">Analyse IA</h3>
            <p className="text-slate-400 text-sm">Améliorez le vocabulaire, la clarté et la grammaire de vos textes en un clic.</p>
          </div>
        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Lexapad — Plateforme d'apprentissage et de rédaction intelligente.</p>
      </footer>
    </div>
  );
}