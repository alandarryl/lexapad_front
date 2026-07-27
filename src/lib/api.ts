import { 
  Note, 
  CreateNoteDto, 
  UpdateNoteDto, 
  Board, 
  AnalysisResult,
  CanvasItem,
  UpsertCanvasItemDto
} from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5278/api';

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur API (${response.status}): ${errorText || response.statusText}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    console.error(`[API Error] Sur la route ${endpoint} :`, error);
    throw error;
  }
}

export const api = {
  // --- NOTES ---
  getNotes: () => fetcher<Note[]>('/notes'),
  getNoteById: (id: string) => fetcher<Note>(`/notes/${id}`),
  createNote: (data: CreateNoteDto) => 
    fetcher<Note>('/notes', { method: 'POST', body: JSON.stringify(data) }),
  updateNote: (id: string, data: UpdateNoteDto) => 
    fetcher<Note>(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteNote: (id: string) => 
    fetcher<void>(`/notes/${id}`, { method: 'DELETE' }),

  // --- IA GROQ ANALYSIS ---
  analyzeText: (content: string, context = 'note') => 
    fetcher<AnalysisResult>('/analysis/check', { 
      method: 'POST', 
      body: JSON.stringify({ content, context }) 
    }),

  // --- BOARDS (CANVAS) ---
  getBoards: async (): Promise<Board[]> => {
    try {
      return await fetcher<Board[]>('/boards');
    } catch (error) {
      console.warn("Impossible de joindre le backend, retour de la liste vide :", error);
      return [];
    }
  },

  getBoardById: async (id: string): Promise<Board | null> => {
    try {
      return await fetcher<Board>(`/boards/${id}`);
    } catch (error) {
      console.warn(`Impossible de récupérer le board ${id} :`, error);
      return null;
    }
  },

  createBoard: async (title: string): Promise<Board> => {
    return fetcher<Board>('/boards', {
      method: 'POST',
      body: JSON.stringify({
        title: title,
        backgroundColor: '#F9FAFB'
      }),
    });
  },

  upsertCanvasItem: (boardId: string, item: UpsertCanvasItemDto) =>
    fetcher<CanvasItem>(`/boards/${boardId}/items`, {
      method: 'POST',
      body: JSON.stringify(item),
    }),

  deleteCanvasItem: (itemId: string) =>
    fetcher<void>(`/boards/items/${itemId}`, { method: 'DELETE' }),
};