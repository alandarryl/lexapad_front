import { 
  Note, 
  CreateNoteDto, 
  UpdateNoteDto, 
  Board, 
  AnalysisResult,
  CanvasItem,
  UpsertCanvasItemDto,
  PromptRequest,
  PromptResponse,
  GradeEssayRequest,
  EssayGradeResponse,
  LoginDto,
  RegisterDto,
  AuthResponse
} from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5278/api';

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // 🔑 Récupération du Token JWT dans le localStorage (côté client uniquement)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Si le token est expiré ou invalide, déconnexion automatique
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = response.statusText;
      try {
        const parsed = JSON.parse(errorText);
        errorMessage = parsed.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
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
  // --- AUTHENTIFICATION ---
  login: (data: LoginDto) => 
    fetcher<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    
  register: (data: RegisterDto) => 
    fetcher<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

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

  // --- CANVAS (Ajusté aux routes /api/canvas du Backend) ---
  getBoards: async (): Promise<Board[]> => {
    try {
      return await fetcher<Board[]>('/canvas/boards');
    } catch (error) {
      console.warn("Impossible de joindre le backend, retour de la liste vide :", error);
      return [];
    }
  },

  getBoardById: async (id: string): Promise<Board | null> => {
    try {
      return await fetcher<Board>(`/canvas/boards/${id}`);
    } catch (error) {
      console.warn(`Impossible de récupérer le board ${id} :`, error);
      return null;
    }
  },

  createBoard: async (title: string): Promise<Board> => {
    return fetcher<Board>('/canvas/boards', {
      method: 'POST',
      body: JSON.stringify({
        title: title,
      }),
    });
  },

  upsertCanvasItem: (boardId: string, item: UpsertCanvasItemDto) =>
    fetcher<CanvasItem>(`/canvas/boards/${boardId}/items`, {
      method: 'POST',
      body: JSON.stringify(item),
    }),

  deleteCanvasItem: (itemId: string) =>
    fetcher<void>(`/canvas/items/${itemId}`, { method: 'DELETE' }),

  // --- ESSAYS (DISSERTATIONS) ---
  generateEssayPrompt: (data: PromptRequest) =>
    fetcher<PromptResponse>('/essays/generate-prompt', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  gradeEssay: (data: GradeEssayRequest) =>
    fetcher<EssayGradeResponse>('/essays/grade', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};