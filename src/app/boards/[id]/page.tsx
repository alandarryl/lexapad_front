'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Board, CanvasItem } from '@/types/api';
import { ArrowLeft, Plus, Trash2, LayoutGrid, Save } from 'lucide-react';
import Link from 'next/link';

export default function BoardDetailPage() {
  const params = useParams();
  const boardId = params.id as string;
  const router = useRouter();

  const [board, setBoard] = useState<Board | null>(null);
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [loading, setLoading] = useState(true);

  // État pour gérer le glisser-déposer
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const colors = ['#1e293b', '#312e81', '#064e3b', '#701a75', '#713f12'];

  // Charger le tableau et ses éléments
  useEffect(() => {
    async function loadBoard() {
      try {
        const data = await api.getBoardById(boardId);
        setBoard(data);
        if (data) {
                    setBoard(data);
                    setItems(data.items || []);
                    }
      } catch (err) {
        console.error('Erreur chargement tableau :', err);
      } finally {
        setLoading(false);
      }
    }
    if (boardId) loadBoard();
  }, [boardId]);

  // CORRECTION 2 : Gestion globale du Drag & Drop sur `window`
  useEffect(() => {
    if (!draggingId) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      
      // Prise en compte du scroll interne du canvas
      const scrollLeft = canvasRef.current.scrollLeft;
      const scrollTop = canvasRef.current.scrollTop;

      const newX = Math.max(0, e.clientX - rect.left + scrollLeft - dragOffset.x);
      const newY = Math.max(0, e.clientY - rect.top + scrollTop - dragOffset.y);

      setItems((prev) =>
        prev.map((i) =>
          i.id === draggingId ? { ...i, positionX: newX, positionY: newY } : i
        )
      );
    };

    const handleMouseUp = () => {
      setItems((latestItems) => {
        const draggedItem = latestItems.find((i) => i.id === draggingId);
        if (draggedItem) handleSaveItem(draggedItem);
        return latestItems;
      });
      setDraggingId(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingId, dragOffset]);

  const handleAddItem = async () => {
    const newItem = {
      content: 'Nouvelle carte...',
      positionX: 100 + items.length * 20,
      positionY: 100 + items.length * 20,
      color: colors[items.length % colors.length],
      width: 220,
      height: 140,
    };

    try {
      const saved = await api.upsertCanvasItem(boardId, newItem);
      setItems((prev) => [...prev, saved]);
    } catch (err) {
      console.error('Erreur ajout carte :', err);
    }
  };

  const handleContentChange = (id: string, content: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, content } : item))
    );
  };

  const handleSaveItem = async (item: CanvasItem) => {
    try {
      await api.upsertCanvasItem(boardId, {
        id: item.id,
        content: item.content,
        positionX: item.positionX,
        positionY: item.positionY,
        color: item.color,
      });
    } catch (err) {
      console.error('Erreur sauvegarde carte :', err);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await api.deleteCanvasItem(itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (err) {
      console.error('Erreur suppression carte :', err);
    }
  };

  // Initialisation du drag
  const handleMouseDown = (e: React.MouseEvent, item: CanvasItem) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scrollLeft = canvasRef.current.scrollLeft;
    const scrollTop = canvasRef.current.scrollTop;

    setDraggingId(item.id);
    setDragOffset({
      x: e.clientX - rect.left + scrollLeft - item.positionX,
      y: e.clientY - rect.top + scrollTop - item.positionY,
    });
  };

  if (loading) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Chargement du canvas...
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none">
      <header className="h-16 border-b border-slate-800 bg-slate-900/80 px-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <Link
            href="/boards"
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-indigo-400" />
            <h1 className="font-bold text-lg text-white">
              {board?.title || 'Tableau sans titre'}
            </h1>
          </div>
        </div>

        <button
          onClick={handleAddItem}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Ajouter un post-it
        </button>
      </header>

      <div
        ref={canvasRef}
        className="flex-1 relative overflow-auto bg-slate-950 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px]"
      >
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              left: `${item.positionX}px`,
              top: `${item.positionY}px`,
              backgroundColor: item.color || '#1e293b',
            }}
            className="absolute w-60 rounded-2xl border border-slate-700/60 shadow-2xl p-4 flex flex-col gap-3 group transition-shadow"
          >
            {/* Poignée de déplacement */}
            <div
              onMouseDown={(e) => handleMouseDown(e, item)}
              className="flex items-center justify-between border-b border-white/10 pb-2 cursor-grab active:cursor-grabbing"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Post-it
              </span>
              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                <button
                  onClick={() => handleSaveItem(item)}
                  title="Enregistrer"
                  className="p-1 hover:bg-white/10 rounded text-slate-300 hover:text-emerald-400 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  title="Supprimer"
                  className="p-1 hover:bg-white/10 rounded text-slate-300 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Zone de texte avec propagation stopppée */}
            <textarea
              value={item.content}
              onChange={(e) => handleContentChange(item.id, e.target.value)}
              onBlur={() => handleSaveItem(item)}
              onMouseDown={(e) => e.stopPropagation()} // CORRECTION 1 : Empêche le drag lors de l'édition
              placeholder="Écris ton idée ici..."
              className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-400 resize-none outline-none min-h-[90px] leading-relaxed cursor-text"
            />
          </div>
        ))}
      </div>
    </div>
  );
}