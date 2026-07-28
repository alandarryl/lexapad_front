'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ArrowLeft, Save, Trash2, Type } from 'lucide-react';

export default function NoteEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  // Vérification stricte
  const noteId = resolvedParams.id;
  const isNew = noteId === 'new';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [fontName, setFontName] = useState('Inter');
  const [fontSize, setFontSize] = useState(16);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  // Charger la note UNIQUEMENT si ce n'est pas une nouvelle note
  useEffect(() => {
    // 🔒 Vérification de la session
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    if (isNew) {
      setLoading(false);
      return;
    }

    async function loadNote() {
      try {
        setLoading(true);
        const note = await api.getNoteById(noteId);
        setTitle(note.title || '');
        setContent(note.content || '');
        setFontName(note.fontName || 'Inter');
        setFontSize(note.fontSize || 16);
      } catch (err: any) {
        console.error('Erreur chargement note:', err);
        if (err?.response?.status === 401 || err?.status === 401) {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }
        alert(`Impossible de charger cette note (404 / non trouvée).`);
        router.push('/notes');
      } finally {
        setLoading(false);
      }
    }

    loadNote();
  }, [noteId, isNew, router]);

// Sauvegarder la note
  const handleSave = async () => {
    if (!title.trim()) {
      alert('Veuillez donner un titre à votre note.');
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        // On récupère le vrai ID (UUID) s'il existe en mémoire
        const storedUserId = localStorage.getItem('userId');

        const payload: any = {
          title,
          content,
          fontName,
          fontSize,
          letterSpacing: 0,
          lineHeight: 1.5,
        };

        // N'ajouter le champ userId QUE s'il s'agit d'un ID valide
        if (storedUserId) {
          payload.userId = storedUserId;
        }

        await api.createNote(payload);
      } else {
        await api.updateNote(noteId, {
          title,
          content,
          fontName,
          fontSize,
        });
      }
      router.push('/notes');
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      alert('Erreur lors de la sauvegarde. Vérifiez les champs du formulaire.');
    } finally {
      setSaving(false);
    }
  };

  // Supprimer la note
  const handleDelete = async () => {
    if (!confirm('Es-tu sûr de vouloir supprimer cette note ?')) return;

    try {
      await api.deleteNote(noteId);
      router.push('/notes');
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Impossible de supprimer la note.');
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-slate-400 animate-pulse">
        Chargement de l'éditeur...
      </div>
    );
  }

  return (
    <main className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Barre d'outils supérieure */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button
          onClick={() => router.push('/notes')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Retour aux notes
        </button>

        <div className="flex items-center gap-3">
          {!isNew && (
            <button
              onClick={handleDelete}
              className="p-2.5 text-red-400 hover:bg-red-950/40 border border-red-900/50 rounded-xl transition-all"
              title="Supprimer la note"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Sauvegarde...' : 'Enregistrer'}
          </button>
        </div>
      </div>

      {/* Réglages typographiques */}
      <div className="flex flex-wrap items-center gap-4 p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-sm">
        <div className="flex items-center gap-2 text-slate-400">
          <Type className="w-4 h-4 text-indigo-400" />
          <span>Police:</span>
        </div>
        <select
          value={fontName}
          onChange={(e) => setFontName(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
        >
          <option value="Inter">Inter</option>
          <option value="Roboto">Roboto</option>
          <option value="Serif">Serif</option>
          <option value="Monospace">Monospace</option>
        </select>

        <div className="flex items-center gap-2 text-slate-400 ml-4">
          <span>Taille:</span>
          <input
            type="number"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-16 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2 py-1.5 text-center focus:outline-none focus:border-indigo-500"
            min={12}
            max={36}
          />
          <span>px</span>
        </div>
      </div>

      {/* Zone d'édition */}
      <div className="space-y-4 bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl">
        <input
          type="text"
          placeholder="Titre de la note..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-transparent text-2xl font-bold text-white placeholder-slate-600 focus:outline-none"
        />

        <textarea
          placeholder="Commence à rédiger ton texte ici..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={12}
          style={{ fontFamily: fontName, fontSize: `${fontSize}px` }}
          className="w-full bg-transparent text-slate-200 placeholder-slate-600 focus:outline-none resize-y leading-relaxed"
        />
      </div>
    </main>
  );
}