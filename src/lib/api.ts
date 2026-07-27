import { Note, CreateNoteDto, UpdateNoteDto, Board, AnalysisRequest, AnalysisResponse } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://lexapadapi.onrender.com/api';

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Erreur API (${response.status}): ${response.statusText}`);
  }

  // Si la réponse n'a pas de contenu (ex: DELETE 204 No Content)
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
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

  // --- BOARDS (CANVAS) ---
  getBoards: () => fetcher<Board[]>('/boards'),
  createBoard: (title: string) => 
    fetcher<Board>('/boards', { method: 'POST', body: JSON.stringify({ title }) }),

  // --- IA GROQ ANALYSIS ---
  analyzeText: (payload: AnalysisRequest) => 
    fetcher<AnalysisResponse>('/analysis/check', { method: 'POST', body: JSON.stringify(payload) }),
};