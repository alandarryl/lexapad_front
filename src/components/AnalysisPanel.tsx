'use client';

import { AnalysisResult } from '@/types/api';
import { Sparkles, Check, BookOpen, Lightbulb, AlertCircle, X } from 'lucide-react';

interface AnalysisPanelProps {
  result: AnalysisResult | null;
  loading: boolean;
  onClose: () => void;
  onApplyCorrection: (correctedText: string) => void;
}

export default function AnalysisPanel({
  result,
  loading,
  onClose,
  onApplyCorrection,
}: AnalysisPanelProps) {
  if (loading) {
    return (
      <aside className="w-80 bg-slate-900 border-l border-slate-800 p-6 flex flex-col items-center justify-center space-y-4 animate-pulse">
        <Sparkles className="w-8 h-8 text-indigo-400 animate-spin" />
        <p className="text-sm text-slate-300 font-medium">Analyse par Llama 3.3 en cours...</p>
        <p className="text-xs text-slate-500 text-center">Correction, suggestions de style et évaluation de la clarté.</p>
      </aside>
    );
  }

  if (!result) return null;

  // Calcul de la couleur du score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40';
    if (score >= 50) return 'text-amber-400 border-amber-500/30 bg-amber-950/40';
    return 'text-rose-400 border-rose-500/30 bg-rose-950/40';
  };

  return (
    <aside className="w-96 bg-slate-900/95 border-l border-slate-800 p-6 flex flex-col h-full overflow-y-auto space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h2 className="font-bold text-white text-lg">Analyse Lexapad</h2>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Score de clarté */}
      <div className={`p-4 rounded-xl border flex items-center justify-between ${getScoreColor(result.clarityScore)}`}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Score de clarté</p>
          <p className="text-2xl font-black mt-0.5">{result.clarityScore} / 100</p>
        </div>
        <div className="text-3xl font-bold opacity-30">#</div>
      </div>

      {/* Texte corrigé & Bouton d'application */}
      {result.correctedText && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" /> Version suggérée
            </span>
            <button
              onClick={() => onApplyCorrection(result.correctedText)}
              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3 py-1.5 rounded-lg transition-all shadow-md shadow-indigo-600/20 active:scale-95"
            >
              Appliquer la correction
            </button>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-slate-200 italic leading-relaxed">
            "{result.correctedText}"
          </div>
        </div>
      )}

      {/* Suggestions de vocabulaire */}
      {result.vocabularySuggestions?.length > 0 && (
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-indigo-400" /> Vocabulaire recommandé
          </span>
          <div className="space-y-2">
            {result.vocabularySuggestions.map((sugg, i) => (
              <div key={i} className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-900/40 text-xs text-indigo-200">
                {sugg}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Remarques grammaticales */}
      {result.grammarFeedback?.length > 0 && (
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-400" /> Remarques grammaticales
          </span>
          <div className="space-y-2">
            {result.grammarFeedback.map((fb, i) => (
              <div key={i} className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/30 text-xs text-amber-200">
                {fb}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conseils de structure */}
      {result.structuralAdvice && (
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-sky-400" /> Conseil de structure
          </span>
          <p className="p-3 rounded-lg bg-sky-950/20 border border-sky-900/30 text-xs text-sky-200 leading-relaxed">
            {result.structuralAdvice}
          </p>
        </div>
      )}
    </aside>
  );
}