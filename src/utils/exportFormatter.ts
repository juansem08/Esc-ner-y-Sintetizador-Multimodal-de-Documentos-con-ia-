import { DocumentAnalysisResult } from '../types/gemini.types';

export interface FormattedExport {
  markdown: string;
  plainText: string;
}

/**
 * Formatea el resultado del análisis a formato Markdown y Texto Plano
 * estructurado para ser compartido o exportado.
 */
export function formatDocumentForExport(result: DocumentAnalysisResult): FormattedExport {
  const dateStr = new Date().toISOString().split('T')[0];

  const summaryMarkdown = result.resumen_ejecutivo
    .map((bullet) => `- ${bullet}`)
    .join('\n');

  const summaryPlain = result.resumen_ejecutivo
    .map((bullet) => `• ${bullet}`)
    .join('\n');

  const entitiesMarkdown = result.entidades_clave
    .map((entity) => `| **${entity.campo}** | ${entity.valor} |`)
    .join('\n');

  const entitiesPlain = result.entidades_clave
    .map((entity) => `- ${entity.campo}: ${entity.valor}`)
    .join('\n');

  const markdown = `# Síntesis Documental - DocuSynth AI\n*Fecha: ${dateStr}*\n\n## Resumen Ejecutivo\n${summaryMarkdown}\n\n## Entidades Clave\n| Campo | Valor |\n| :--- | :--- |\n${entitiesMarkdown}\n\n---\n*Procesado mediante DocuSynth con Gemini 1.5 Flash.*`;

  const plainText = `SÍNTESIS DOCUMENTAL - DOCUSYNTH AI\nFecha: ${dateStr}\n\n[RESUMEN EJECUTIVO]\n${summaryPlain}\n\n[ENTIDADES CLAVE]\n${entitiesPlain}\n\n---\nProcesado mediante DocuSynth con Gemini 1.5 Flash.`;

  return {
    markdown,
    plainText,
  };
}
