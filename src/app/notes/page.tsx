'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Note } from '@/types/api';
import { Plus, FileText, Calendar } from 'lucide-react';

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotes() {
      try {
        const data = await api.getNotes();
        setNotes(data);
      } catch (err) {
        console.error('Erreur au chargement des notes:', err);
      } finally {
        setLoading(false);
      }
    }
    loadNotes();
  }, []);

  return (
    <main className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Mes Notes</h1>
          <p className="text-sm text-slate-400 mt-1">Gère et édite tes documents en toute simplicité.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-md shadow-indigo-600/20">
          <Plus className="w-4 h-4" /> Nouvelle Note
        </button>
      </div>

      {/* Grid de notes */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 text-indigo-400 mb-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs font-mono">{note.fontName} ({note.fontSize}px)</span>
                </div>
                <h3 className="font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                  {note.title}
                </h3>
                <p className="text-slate-400 text-sm mt-2 line-clamp-3 leading-relaxed">
                  {note.content}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(note.updateAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}