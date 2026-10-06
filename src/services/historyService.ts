import { SavedDocumentRecord } from '../types/history.types';
import { DocumentAnalysisResult } from '../types/gemini.types';
import { ProcessedDocument } from '../types/scanner.types';

class DocumentHistoryService {
  private records: SavedDocumentRecord[] = [];
  private readonly MAX_RECORDS = 20;

  addRecord(
    analysis: DocumentAnalysisResult,
    doc: ProcessedDocument,
    customTitle?: string
  ): SavedDocumentRecord {
    const candidateTitle = analysis.entidades_clave.find((e) => {
      const lower = e.campo.toLowerCase();
      return (
        lower.includes('folio') ||
        lower.includes('factura') ||
        lower.includes('emisor') ||
        lower.includes('empresa') ||
        lower.includes('titulo')
      );
    })?.valor;

    const finalTitle = customTitle || candidateTitle || `Escaneo #${this.records.length + 1}`;

    const newRecord: SavedDocumentRecord = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      title: finalTitle,
      analysis,
      documentMeta: {
        width: doc.width,
        height: doc.height,
        uri: doc.uri,
      },
    };

    this.records.unshift(newRecord);

    if (this.records.length > this.MAX_RECORDS) {
      this.records = this.records.slice(0, this.MAX_RECORDS);
    }

    return newRecord;
  }

  getRecords(): SavedDocumentRecord[] {
    return [...this.records];
  }

  getRecordById(id: string): SavedDocumentRecord | undefined {
    return this.records.find((r) => r.id === id);
  }

  clearHistory(): void {
    this.records = [];
  }
}

export const documentHistoryService = new DocumentHistoryService();
