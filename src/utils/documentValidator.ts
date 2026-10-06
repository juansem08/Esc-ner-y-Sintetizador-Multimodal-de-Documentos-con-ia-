import { DocumentValidationResult, ProcessedDocument } from '../types/scanner.types';

const MAX_IMAGE_SIZE_MB = 10;

/**
 * Valida la integridad y tamaño del documento procesado antes de enviarlo a Gemini
 */
export function validateDocumentPayload(doc: ProcessedDocument): DocumentValidationResult {
  if (!doc.base64 || typeof doc.base64 !== 'string' || doc.base64.trim().length === 0) {
    return {
      isValid: false,
      error: 'La imagen codificada en Base64 está vacía o dañada.',
      approximateSizeMB: 0,
    };
  }

  // Estimación de peso en bytes según longitud Base64
  const bytes = (doc.base64.length * 3) / 4;
  const sizeMB = bytes / (1024 * 1024);

  if (sizeMB > MAX_IMAGE_SIZE_MB) {
    return {
      isValid: false,
      error: `El documento excede el límite permitido de ${MAX_IMAGE_SIZE_MB}MB (Tamaño actual: ${sizeMB.toFixed(2)}MB).`,
      approximateSizeMB: sizeMB,
    };
  }

  if (doc.width <= 0 || doc.height <= 0) {
    return {
      isValid: false,
      error: 'Dimensiones de imagen inválidas para análisis OCR.',
      approximateSizeMB: sizeMB,
    };
  }

  return {
    isValid: true,
    approximateSizeMB: Number(sizeMB.toFixed(2)),
  };
}
