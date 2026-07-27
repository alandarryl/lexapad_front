'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { PromptResponse, EssayGradeResponse } from '@/types/api';
import { 
  GraduationCap, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Award, 
  FileEdit, 
  RefreshCw,
  BookOpen,
  HelpCircle,
  Key
} from 'lucide-react';

export default function EssaysPage() {
  // Options du formulaire de génération de sujet
  const [category, setCategory] = useState('philosophie');
  const [difficulty, setDifficulty] = useState('moyen');
  const [topicInterest, setTopicInterest] = useState('');

  // États du sujet et de la dissertation
  const [prompt, setPrompt] = useState<PromptResponse | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [essayContent, setEssayContent] = useState('');

  // États d'évaluation et de chargement
  const [gradeResult, setGradeResult] = useState<EssayGradeResponse | null>(null);
  const [generatingPrompt, setGeneratingPrompt] = useState(false);
  const [gradingEssay, setGradingEssay] = useState(false);

  // Générer un sujet via l'IA
  const handleGeneratePrompt = async () => {
    setGeneratingPrompt(true);
    setGradeResult(null);
    try {
      const res = await api.generateEssayPrompt({
        category,
        difficulty,
        topicInterest: topicInterest.trim() || undefined,
      });
      setPrompt(res);
      setCustomTitle(res.title);
    } catch (err) {
      console.error('Erreur génération sujet:', err);
      alert('Impossible de générer un sujet pour le moment.');
    } finally {
      setGeneratingPrompt(false);
    }
  };

  // Soumettre la dissertation pour évaluation
  const handleGradeEssay = async () => {
    const activeTitle = customTitle.trim() || prompt?.title || 'Sujet libre';

    if (!essayContent.trim()) {
      alert('Veuillez rédiger ou coller le texte de votre dissertation.');
      return;
    }

    setGradingEssay(true);
    try {
      const res = await api.gradeEssay({
        promptTitle: activeTitle,
        essayContent,
      });
      setGradeResult(res);
    } catch (err) {
      console.error('Erreur notation dissertation:', err);
      alert('Erreur lors de la notation de la dissertation.');
    } finally {
      setGradingEssay(false);
    }
  };

  // Obtenir la couleur du badge de note
  const getScoreBadgeColor = (score: number) => {
    if (score >= 15) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (score >= 10) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  return (
    <main className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-indigo-500" /> Évaluation de Dissertation
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Générez des sujets académiques et obtenez une correction personnalisée par l'IA.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne gauche : Génération de sujet */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" /> Générateur de Sujet
            </h2>

            {/* Formulaire */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Discipline
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="philosophie">Philosophie</option>
                  <option value="littérature">Littérature</option>
                  <option value="histoire">Histoire</option>
                  <option value="culture générale">Culture Générale</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Niveau / Difficulté
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="facile">Facile (Initiation)</option>
                  <option value="moyen">Moyen (Baccalauréat)</option>
                  <option value="difficile">Difficile (Supérieur)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Thème ou Mot-Clé (Optionnel)
                </label>
                <input
                  type="text"
                  placeholder="ex: technologie, liberté, art..."
                  value={topicInterest}
                  onChange={(e) => setTopicInterest(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-600"
                />
              </div>

              <button
                onClick={handleGeneratePrompt}
                disabled={generatingPrompt}
                className="w-full mt-2 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20"
              >
                {generatingPrompt ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Génération...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Proposer un sujet
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Affichage des détails du sujet proposé */}
          {prompt && (
            <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <BookOpen className="w-4 h-4" /> Sujet proposé
              </div>

              <h3 className="text-lg font-bold text-white">{prompt.title}</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{prompt.description}</p>

              {prompt.keyQuestions?.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" /> Pistes de réflexion :
                  </span>
                  <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 pl-1">
                    {prompt.keyQuestions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}

              {prompt.suggestedKeywords?.length > 0 && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mb-2">
                    <Key className="w-3.5 h-3.5" /> Mots-clés suggérés :
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {prompt.suggestedKeywords.map((kw, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] bg-slate-950 text-indigo-300 border border-indigo-900/50 px-2 py-0.5 rounded-md"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Colonne droite : Rédaction et Correction */}
        <div className="space-y-6 lg:col-span-2">
          {/* Zone de rédaction */}
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileEdit className="w-5 h-5 text-indigo-400" /> Votre Dissertation
              </h2>
              <span className="text-xs text-slate-500 font-mono">
                {essayContent.trim() ? essayContent.trim().split(/\s+/).length : 0} mots
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Sujet de la dissertation
                </label>
                <input
                  type="text"
                  placeholder="Saisissez ou choisissez un sujet ci-contre..."
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Contenu de votre copie
                </label>
                <textarea
                  placeholder="Rédigez ou collez votre dissertation ici (Introduction, Développement, Conclusion)..."
                  value={essayContent}
                  onChange={(e) => setEssayContent(e.target.value)}
                  rows={14}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 rounded-xl p-4 text-sm focus:outline-none focus:border-indigo-500 resize-y leading-relaxed"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleGradeEssay}
                  disabled={gradingEssay || !essayContent.trim()}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20"
                >
                  {gradingEssay ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Évaluation par l'IA...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Évaluer ma dissertation
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Affichage des résultats de l'évaluation */}
          {gradeResult && (
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* En-tête Note & Bilan */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Note Globale
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-extrabold text-white">
                      {gradeResult.overallScore}
                    </span>
                    <span className="text-slate-400 text-lg font-medium">/ 20</span>
                  </div>
                </div>

                <div
                  className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 ${getScoreBadgeColor(
                    gradeResult.overallScore
                  )}`}
                >
                  <Award className="w-4 h-4" />
                  {gradeResult.overallScore >= 16
                    ? 'Excellent travail !'
                    : gradeResult.overallScore >= 12
                    ? 'Bon travail'
                    : gradeResult.overallScore >= 10
                    ? 'Moyen / À approfondir'
                    : 'Axe de progrès important'}
                </div>
              </div>

              {/* Remarque générale */}
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Appréciation Générale
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-slate-800/60">
                  {gradeResult.generalFeedback}
                </p>
              </div>

              {/* Critères détaillés */}
              {gradeResult.detailedCriteria?.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Critères de Notation
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {gradeResult.detailedCriteria.map((criterion, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-indigo-300">{criterion.category}</span>
                          <span className="text-slate-200">
                            {criterion.score} / {criterion.maxScore}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{criterion.feedback}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Points Forts & Axes d'amélioration */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Points forts */}
                {gradeResult.strengths?.length > 0 && (
                  <div className="bg-emerald-950/20 border border-emerald-900/30 p-4 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Points Forts
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {gradeResult.strengths.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-500">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Axes d'amélioration */}
                {gradeResult.areasForImprovement?.length > 0 && (
                  <div className="bg-amber-950/20 border border-amber-900/30 p-4 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> Axes d'Amélioration
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {gradeResult.areasForImprovement.map((area, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-500">•</span>
                          <span>{area}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Exemple de reformulation / amélioration */}
              {gradeResult.rewriteExample && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Proposition d'Amélioration / Reformulation
                  </h3>
                  <div className="bg-indigo-950/30 border border-indigo-900/40 p-4 rounded-xl text-xs text-slate-300 italic leading-relaxed">
                    "{gradeResult.rewriteExample}"
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}