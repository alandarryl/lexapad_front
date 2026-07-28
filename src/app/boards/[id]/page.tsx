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

  // Ref pour conserver l'état des items à jour dans les écouteurs d'événements globaux
  const itemsRef = useRef<CanvasItem[]>([]);
  itemsRef.current = items;

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const draggingIdRef = useRef<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const colors = ['#1e293b', '#312e81', '#064e3b', '#701a75', '#713f12'];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    async function loadBoard() {
      try {
        const data = await api.getBoardById(boardId);
        if (data) {
          setBoard(data);
          setItems(data.items || []);
        }
      } catch (err: any) {
        console.error('Erreur chargement tableau :', err);
        if (err?.response?.status === 401 || err?.status === 401) {
          localStorage.removeItem('token');
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    }

    if (boardId) loadBoard();
  }, [boardId, router]);

  // --- GESTION DU DRAG & DROP PROPRE ---
  useEffect(() => {
    if (!draggingId) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();

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
      const activeId = draggingIdRef.current;
      
      // Réinitialisation de l'état de drag
      setDraggingId(null);
      draggingIdRef.current = null;

      // Sauvegarde propre basée sur la Ref mise à jour si l'item n'est pas temporaire
      if (activeId) {
        const itemToSave = itemsRef.current.find((i) => i.id === activeId);
        if (itemToSave && !itemToSave.id.startsWith('temp-')) {
          handleSaveItem(itemToSave);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingId, dragOffset]);

  // Initialisation du drag
  const handleMouseDown = (e: React.MouseEvent, item: CanvasItem) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scrollLeft = canvasRef.current.scrollLeft;
    const scrollTop = canvasRef.current.scrollTop;

    setDraggingId(item.id);
    draggingIdRef.current = item.id; // Sync immédiat de la ref

    setDragOffset({
      x: e.clientX - rect.left + scrollLeft - item.positionX,
      y: e.clientY - rect.top + scrollTop - item.positionY,
    });
  };

  // --- AJOUT D'UN ITEM ---
  const handleAddItem = async () => {
    const tempId = `temp-${Date.now()}`;

    const newItem: CanvasItem = {
      id: tempId,
      canvasBoardId: boardId,
      type: 'postit',
      content: 'Nouvelle carte...',
      positionX: 100 + items.length * 20,
      positionY: 100 + items.length * 20,
      color: colors[items.length % colors.length],
      width: 220,
      height: 140,
    };

    setItems((prev) => [...prev, newItem]);

    try {
      const saved = await api.createCanvasItem(boardId, {
        type: 'postit',
        content: newItem.content,
        positionX: newItem.positionX,
        positionY: newItem.positionY,
        color: newItem.color,
        width: newItem.width,
        height: newItem.height,
      });

      if (saved?.id) {
        // Préserve la position au cas où la carte aurait été déplacée pendant sa création
        setItems((prev) =>
          prev.map((item) =>
            item.id === tempId
              ? {
                  ...saved,
                  positionX: item.positionX,
                  positionY: item.positionY,
                }
              : item
          )
        );
      }
    } catch (err) {
      console.error('Erreur ajout carte :', err);
      setItems((prev) => prev.filter((item) => item.id !== tempId));
      alert("Impossible d'ajouter la carte.");
    }
  };

  const handleContentChange = (id: string, content: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, content } : item))
    );
  };

  // --- SAUVEGARDE / MISE À JOUR (PUT) ---
  const handleSaveItem = async (item: CanvasItem) => {
    if (!item.id || item.id.startsWith('temp-')) {
      return;
    }

    try {
      await api.updateCanvasItem(item.id, {
        id: item.id,
        canvasBoardId: boardId,
        type: item.type || 'postit',
        content: item.content || '',
        positionX: Math.round(item.positionX),
        positionY: Math.round(item.positionY),
        color: item.color || '#1e293b',
        width: Math.round(item.width || 220),
        height: Math.round(item.height || 140),
        zIndex: item.zIndex || 1,
      });
    } catch (err) {
      console.error('Erreur sauvegarde carte :', err);
    }
  };

  // --- SUPPRESSION (DELETE) ---
  const handleDeleteItem = async (itemId: string) => {
    if (itemId.startsWith('temp-')) {
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      return;
    }

    const previousItems = [...items];
    setItems((prev) => prev.filter((i) => i.id !== itemId));

    try {
      await api.deleteCanvasItem(itemId);
    } catch (err: any) {
      console.error('Erreur suppression carte :', err);
      const status = err?.response?.status || err?.status;
      if (status !== 404) {
        setItems(previousItems);
        alert('Impossible de supprimer la carte sur le serveur.');
      }
    }
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

            <textarea
              value={item.content}
              onChange={(e) => handleContentChange(item.id, e.target.value)}
              onBlur={() => handleSaveItem(item)}
              onMouseDown={(e) => e.stopPropagation()}
              placeholder="Écris ton idée ici..."
              className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-400 resize-none outline-none min-h-[90px] leading-relaxed cursor-text"
            />
          </div>
        ))}
      </div>
    </div>
  );
}