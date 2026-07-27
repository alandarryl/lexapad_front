'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { AnalysisResult } from '@/types/api';
import AnalysisPanel from '@/components/AnalysisPanel';
import { Sparkles, FileText, Eraser } from 'lucide-react';

export default function AnalysisPage() {
  const [content, setContent] = useState('');
  const [context, setContext] = useState('dissertation');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!content.trim()) return;

    setLoading(true);
    try {
      const data = await api.analyzeText(content, context);
      setResult(data);
    } catch (err) {
      console.error("Erreur lors de l'analyse :", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCorrection = (correctedText: string) => {
    setContent(correctedText);
  };

  return (
    <main className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Zone de saisie principale */}
      <div className="flex-1 flex flex-col p-8 space-y-6 overflow-y-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-indigo-400" />
              Analyseur Linguistique IA
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Colle ou rédige ton texte pour obtenir une correction, des suggestions de vocabulaire et des conseils de style.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Choix du contexte */}
            <select
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500"
            >
              <option value="dissertation">Dissertation / Académique</option>
              <option value="email">E-mail professionnel</option>
              <option value="creative">Récit créatif</option>
              <option value="note">Prise de note générale</option>
            </select>

            {/* Bouton Effacer */}
            <button
              onClick={() => {
                setContent('');
                setResult(null);
              }}
              className="p-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
              title="Effacer le texte"
            >
              <Eraser className="w-5 h-5" />
            </button>

            {/* Bouton Lancer l'analyse */}
            <button
              onClick={handleAnalyze}
              disabled={loading || !content.trim()}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Analyse...' : 'Lancer l\'analyse'}
            </button>
          </div>
        </div>

        {/* Zone d'écriture */}
        <div className="flex-1 flex flex-col bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Colle ton texte ici pour l'analyser (ex: un paragraphe de dissertation, une lettre, une idée)..."
            className="w-full h-full bg-transparent text-slate-100 placeholder-slate-500 resize-none outline-none text-base leading-relaxed"
          />
          <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              {content.trim() ? content.trim().split(/\s+/).length : 0} mots
            </span>
            <span>Propulsé par Llama 3.3 via Groq</span>
          </div>
        </div>
      </div>

      {/* Panneau latéral de résultats */}
      {result && (
        <AnalysisPanel
          result={result}
          loading={loading}
          onClose={() => setResult(null)}
          onApplyCorrection={handleApplyCorrection}
        />
      )}
    </main>
  );
}