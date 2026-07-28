'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Board } from '@/types/api';
import { LayoutGrid, Plus, Calendar, ArrowRight, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function BoardsPage() {
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  // Charger les tableaux au montage avec vérification d'authentification
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    async function loadBoards() {
      try {
        const data = await api.getBoards();
        setBoards(data || []);
      } catch (err: any) {
        console.error('Erreur au chargement des tableaux:', err);
        if (err?.response?.status === 401 || err?.status === 401) {
          localStorage.removeItem('token');
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    }

    loadBoards();
  }, [router]);

  // Créer un nouveau tableau
  const handleCreateBoard = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    try {
      const titleToSave = newTitle.trim() || 'Nouveau tableau';
      const newBoard = await api.createBoard(titleToSave);

      setNewTitle('');
      setIsCreating(false);

      // Vérification : ID valide renvoyé par le backend
      if (newBoard?.id && newBoard.id !== '00000000-0000-0000-0000-000000000000') {
        router.push(`/boards/${newBoard.id}`);
      } else {
        const refreshedBoards = await api.getBoards();
        setBoards(refreshedBoards || []);
      }
    } catch (err) {
      console.error('Erreur lors de la création :', err);
      alert('Impossible de créer le tableau.');
    }
  };

  // Supprimer un tableau
  const handleDeleteBoard = async (e: React.MouseEvent, boardId: string) => {
    e.preventDefault();
    e.stopPropagation(); // Empêche la redirection vers le tableau

    if (!confirm('Voulez-vous vraiment supprimer ce tableau et tout son contenu ?')) {
      return;
    }

    const previousBoards = [...boards];
    setBoards((prev) => prev.filter((b) => b.id !== boardId));

    try {
      await api.deleteBoard(boardId);
    } catch (err: any) {
      console.error('Erreur lors de la suppression du tableau :', err);
      setBoards(previousBoards); // Restauration si erreur
      alert('Impossible de supprimer le tableau.');
    }
  };

  return (
    <main className="p-8 max-w-6xl mx-auto space-y-8">
      {/* En-tête */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <LayoutGrid className="w-8 h-8 text-indigo-400" />
            Tableaux Visuels (Canvas)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Organise tes idées, cartes et post-its sur un espace de brainstorming spatial.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Nouveau Tableau
        </button>
      </div>

      {/* Formulaire de création rapide */}
      {isCreating && (
        <form
          onSubmit={handleCreateBoard}
          className="p-6 rounded-2xl bg-slate-900 border border-indigo-500/50 space-y-4 shadow-xl"
        >
          <h2 className="text-lg font-bold text-white">Créer un nouveau tableau</h2>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Titre du tableau (ex: Brainstorming projet, Plan de mémoire)..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
              className="flex-1 bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all cursor-pointer"
            >
              Créer
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2.5 rounded-xl text-sm transition-all cursor-pointer"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Grille de tableaux */}
      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : boards.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <p className="text-slate-400">Aucun tableau visuel pour le moment.</p>
          <button
            onClick={() => setIsCreating(true)}
            className="text-sm text-indigo-400 hover:underline font-medium cursor-pointer"
          >
            Créer votre premier tableau
          </button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {boards.map((board, index) => {
            const boardKey = board.id || `temp-board-${index}`;
            const boardHref = board.id ? `/boards/${board.id}` : '#';

            return (
              <Link href={boardHref} key={boardKey}>
                <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/70 hover:shadow-xl hover:shadow-indigo-500/10 transition-all cursor-pointer group flex flex-col justify-between h-48 relative">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-950/60 text-indigo-400 border border-indigo-900/40">
                        {board.items?.length || 0} carte(s)
                      </span>

                      {/* Bouton de suppression du tableau */}
                      {board.id && (
                        <button
                          onClick={(e) => handleDeleteBoard(e, board.id)}
                          title="Supprimer le tableau"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800/80 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <h3 className="font-bold text-xl text-white group-hover:text-indigo-300 transition-colors">
                      {board.title}
                    </h3>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {board.createdAt ? new Date(board.createdAt).toLocaleDateString() : "Aujourd'hui"}
                    </span>
                    <span className="flex items-center gap-1 text-indigo-400 group-hover:translate-x-1 transition-transform">
                      Ouvrir <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}