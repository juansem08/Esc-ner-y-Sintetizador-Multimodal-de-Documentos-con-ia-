import { DocumentAnalysisResult } from './gemini.types';

export interface SavedDocumentRecord {
  id: string;
  timestamp: number;
  title: string;
  analysis: DocumentAnalysisResult;
  documentMeta: {
    width: number;
    height: number;
    uri?: string;
  };
}
