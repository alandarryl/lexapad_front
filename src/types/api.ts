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

export interface AnalysisRequest {
  content: string;
  context?: string;
}