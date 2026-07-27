'use client';

import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import { Note } from '@/types/api';
import { 
  Palette, 
  Plus, 
  Save, 
  Trash2, 
  Eraser, 
  RotateCcw, 
  Calendar, 
  Pencil, 
  Sparkles 
} from 'lucide-react';
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas';

const PALETTE_COLORS = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#ffffff', // White
];

export default function DrawingsPage() {
  const [drawings, setDrawings] = useState<Note[]>([]);
  const [activeDrawing, setActiveDrawing] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [strokeColor, setStrokeColor] = useState('#6366f1');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [eraseMode, setEraseMode] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const canvasRef = useRef<ReactSketchCanvasRef>(null);

  // Charger uniquement les croquis (ceux dont le contenu est une image DataURL)
  useEffect(() => {
    loadDrawings();
  }, []);

  const loadDrawings = async () => {
    try {
      setLoading(true);
      const allNotes = await api.getNotes();
      // Filtrer pour ne garder que les notes visuelles / dessins
      const filtered = allNotes.filter((n) => n.content?.startsWith('data:image'));
      setDrawings(filtered);
    } catch (err) {
      console.error('Erreur chargement croquis:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sélectionner un croquis existant pour affichage / modification
  const handleSelectDrawing = (drawing: Note) => {
    setActiveDrawing(drawing);
    setTitle(drawing.title || '');
    canvasRef.current?.clearCanvas();
  };

  // Réinitialiser pour un nouveau dessin
  const handleNewDrawing = () => {
    setActiveDrawing(null);
    setTitle('');
    canvasRef.current?.clearCanvas();
  };

  // Action d'effaçage (Gomme vs Pinceau)
  const toggleEraser = () => {
    const nextState = !eraseMode;
    setEraseMode(nextState);
    canvasRef.current?.eraseMode(nextState);
  };

  // Annuler le dernier trait
  const handleUndo = () => {
    canvasRef.current?.undo();
  };

  // Sauvegarder le dessin
  const handleSave = async () => {
    if (!title.trim()) {
      alert('Veuillez donner un titre à votre croquis.');
      return;
    }

    if (!canvasRef.current) return;

    setSaving(true);
    try {
      // Exporter le canvas au format PNG Base64
      const imageBase64 = await canvasRef.current.exportImage('png');

      if (activeDrawing?.id) {
        // Mise à jour
        await api.updateNote(activeDrawing.id, {
          title,
          content: imageBase64,
        });
      } else {
        // Création
        await api.createNote({
          title,
          content: imageBase64,
          fontName: 'Drawing',
          fontSize: 0,
          letterSpacing: 0,
          lineHeight: 1,
          userId: 'user_test_jonathan',
        });
      }

      await loadDrawings();
      alert('Croquis sauvegardé avec succès !');
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du dessin:', err);
      alert('Impossible de sauvegarder le croquis.');
    } finally {
      setSaving(false);
    }
  };

  // Supprimer un croquis
  const handleDelete = async (id: string) => {
    if (!confirm('Es-tu sûr de vouloir supprimer ce croquis ?')) return;

    try {
      await api.deleteNote(id);
      if (activeDrawing?.id === id) {
        handleNewDrawing();
      }
      await loadDrawings();
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Impossible de supprimer le croquis.');
    }
  };

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Palette className="w-8 h-8 text-indigo-500" /> Espace Dessin & Schémas
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Exprime tes idées visuellement, fais des croquis ou prends des notes manuscrites.
          </p>
        </div>

        <button
          onClick={handleNewDrawing}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Nouveau Dessin
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Liste / Galerie des croquis enregistrés */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            Mes Croquis ({drawings.length})
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-slate-900/50 border border-slate-800 animate-pulse" />
              ))}
            </div>
          ) : drawings.length === 0 ? (
            <p className="text-xs text-slate-500 italic">Aucun croquis enregistré pour le moment.</p>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {drawings.map((drawing) => {
                const isSelected = activeDrawing?.id === drawing.id;
                return (
                  <div
                    key={drawing.id}
                    onClick={() => handleSelectDrawing(drawing)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer group flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-slate-900 border-indigo-500 shadow-md shadow-indigo-500/10'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm text-white group-hover:text-indigo-300 transition-colors truncate">
                        {drawing.title}
                      </h3>
                      {drawing.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(drawing.id!);
                          }}
                          className="text-slate-500 hover:text-red-400 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Aperçu miniature de l'image */}
                    <div className="h-20 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center p-1">
                      <img
                        src={drawing.content}
                        alt={drawing.title}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(drawing.updateAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Zone de Dessin Principale */}
        <div className="lg:col-span-3 space-y-4">
          {/* Barre d'outils du Pinceau / Canvas */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            {/* Palette de Couleurs */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium mr-1">Couleur:</span>
              {PALETTE_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setStrokeColor(color);
                    setEraseMode(false);
                    canvasRef.current?.eraseMode(false);
                  }}
                  className={`w-6 h-6 rounded-full border transition-all ${
                    strokeColor === color && !eraseMode ? 'scale-125 border-white ring-2 ring-indigo-500/50' : 'border-transparent hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            {/* Taille du pinceau */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Épaisseur:</span>
              <input
                type="range"
                min="1"
                max="20"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="w-24 accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Outils : Gomme / Annuler */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleEraser}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  eraseMode
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <Eraser className="w-3.5 h-3.5" /> Gomme
              </button>

              <button
                onClick={handleUndo}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all"
                title="Annuler le dernier trait"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Annuler
              </button>
            </div>

            {/* Bouton de Sauvegarde */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>

          {/* Zone du Titre et de la Toile */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4">
            <input
              type="text"
              placeholder="Titre de votre croquis..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent text-xl font-bold text-white placeholder-slate-600 focus:outline-none border-b border-slate-800 pb-2"
            />

            {/* Affiche le dessin enregistré actuel si on en consulte un */}
            {activeDrawing && (
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Dessin enregistré sélectionné</span>
                <button
                  onClick={handleNewDrawing}
                  className="text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Pencil className="w-3 h-3" /> Basculer sur une nouvelle zone vierge
                </button>
              </div>
            )}

            {/* Zone de dessin réactive */}
            <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
              <ReactSketchCanvas
                ref={canvasRef}
                strokeWidth={strokeWidth}
                strokeColor={strokeColor}
                canvasColor="#020617"
                style={{ height: '520px', width: '100%' }}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}