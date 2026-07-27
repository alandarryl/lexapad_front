'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Note } from '@/types/api';

export default function HomePage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNotes() {
      try {
        const data = await api.getNotes();
        setNotes(data);
      } catch (err: any) {
        setError(err.message || 'Impossible de charger les notes');
      } finally {
        setLoading(false);
      }
    }

    loadNotes();
  }, []);

  return (
    <main className="min-h-screen p-8 bg-slate-950 text-slate-100 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="border-b border-slate-800 pb-4">
          <h1 className="text-3xl font-bold tracking-tight text-indigo-400">Lexapad Web</h1>
          <p className="text-slate-400 text-sm mt-1">Test de connexion API .NET (Render) & Supabase</p>
        </header>

        {loading && (
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 animate-pulse text-slate-400">
            Chargement des notes depuis Render...
          </div>
        )}

        {error && (
          <div className="p-4 rounded-lg bg-red-950/50 border border-red-800 text-red-300">
            ⚠️ {error}
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-200">Tes Notes ({notes.length})</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {notes.map((note) => (
                <div key={note.id} className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-colors">
                  <h3 className="font-semibold text-lg text-indigo-300">{note.title}</h3>
                  <p className="text-slate-300 text-sm mt-2 line-clamp-3">{note.content}</p>
                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
                    <span>Police: {note.fontName} ({note.fontSize}px)</span>
                    <span>{new Date(note.updateAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}