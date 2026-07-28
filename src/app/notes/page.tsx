'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Note } from '@/types/api';
import { Plus, FileText, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function NotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔒 Vérification de la session
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    async function loadNotes() {
      try {
        const data = await api.getNotes();
        setNotes(data);
      } catch (err: any) {
        console.error('Erreur au chargement des notes:', err);
        // Si la session est invalide ou expirée
        if (err?.response?.status === 401 || err?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userEmail');
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    }

    loadNotes();
  }, [router]);

  return (
    <main className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Mes Notes</h1>
          <p className="text-sm text-slate-400 mt-1">Gère et édite tes documents en toute simplicité.</p>
        </div>
        <Link 
          href="/notes/new"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
          <Plus className="w-4 h-4" /> Nouvelle Note
        </Link>
      </div>

      {/* Grid de Notes */}
      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <Link
              href={`/notes/${note.id}`}
              key={note.id}
            >
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/70 hover:shadow-xl hover:shadow-indigo-500/10 transition-all cursor-pointer group flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5 text-indigo-400 font-medium text-xs bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-800/40">
                      <FileText className="w-3.5 h-3.5" />
                      <span>{note.fontName} ({note.fontSize}px)</span>
                    </div>
                  </div>

                  {/* Titre de la note */}
                  <h3 className="font-bold text-lg text-white group-hover:text-indigo-300 transition-colors">
                    {note.title}
                  </h3>

                  {/* Contenu */}
                  <p className="text-slate-300 text-sm mt-2 line-clamp-3 leading-relaxed">
                    {note.content}
                  </p>
                </div>

                {/* Pied de carte */}
                <div className="mt-6 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {new Date(note.updateAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}