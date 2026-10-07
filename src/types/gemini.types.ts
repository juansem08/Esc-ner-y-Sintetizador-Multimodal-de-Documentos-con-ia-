export interface EntidadClave {
  campo: string;
  valor: string;
}

export interface DocumentAnalysisResult {
  resumen_ejecutivo: string[];
  entidades_clave: EntidadClave[];
  contexto_documento: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export type DocumentCategory = 'general' | 'invoice' | 'contract' | 'receipt' | 'id_card';

export interface AnalysisOptions {
  category?: DocumentCategory;
  customPrompt?: string;
  apiKey?: string;
  temperature?: number;
}
