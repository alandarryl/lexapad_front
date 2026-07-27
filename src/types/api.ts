// Model correspondant à tes endpoints /api/notes
export interface Note {
  id: string;
  title: string;
  content: string;
  fontName: string;
  fontSize: number;
  letterSpacing: number;
  lineHeight: number;
  createAt: string;
  updateAt: string;
  userId: string;
}

export type CreateNoteDto = Omit<Note, 'id' | 'createAt' | 'updateAt'>;
export type UpdateNoteDto = Partial<CreateNoteDto>;

// Model correspondant à tes endpoints /api/boards (Canvas)
export interface Board {
  id: string;
  title: string;
  createAt?: string;
  updateAt?: string;
}

// Model pour la réponse de l'IA Groq (/api/analysis/check)
export interface AnalysisResponse {
  correctedText: string;
  vocabularySuggestions: string[];
  clarityScore?: number;
  feedback?: string;
}

// Requête d'analyse envoyée au backend
export interface AnalysisRequest {
  content: string;
  context?: string;
}

// Réponse renvoyée par /api/analysis/check
export interface AnalysisResult {
  correctedText: string;
  vocabularySuggestions: string[];
  grammarFeedback: string[];
  structuralAdvice: string;
  clarityScore: number;
}


// Représente un post-it / carte sur le canvas
export interface CanvasItem {
  id: string;
  boardId: string;
  content: string;
  positionX: number;
  positionY: number;
  width?: number;
  height?: number;
  color?: string; // ex: '#1e293b', '#312e81', etc.
  createdAt?: string;
}

// Représente un tableau complet avec ses items
export interface Board {
  id: string;
  title: string;
  userId?: string;
  createdAt: string;
  items?: CanvasItem[];
}

// DTO pour ajouter/mettre à jour une carte
export interface UpsertCanvasItemDto {
  id?: string;
  content: string;
  positionX: number;
  positionY: number;
  width?: number;
  height?: number;
  color?: string;
}
