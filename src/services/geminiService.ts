import { GoogleGenAI, Type, Schema } from '@google/genai';
import { DocumentAnalysisResult } from '../types/gemini.types';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

/**
 * Cliente singleton para Google GenAI
 */
const getGenAIClient = (customApiKey?: string): GoogleGenAI => {
  const key = customApiKey || API_KEY;
  if (!key) {
    throw new Error(
      'Gemini API Key no configurada. Define EXPO_PUBLIC_GEMINI_API_KEY en tu .env o pásala al inicializar.'
    );
  }
  return new GoogleGenAI({ apiKey: key });
};

/**
 * Esquema estructurado para forzar la respuesta JSON estricta
 */
const documentAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    resumen_ejecutivo: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: 'Puntos clave resumidos del documento.',
    },
    entidades_clave: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          campo: {
            type: Type.STRING,
            description: 'Nombre del campo (ej. Total, Fecha, Emisor, RFC, etc.)',
          },
          valor: {
            type: Type.STRING,
            description: 'Valor extraído del documento',
          },
        },
        required: ['campo', 'valor'],
      },
      description: 'Lista de pares clave-valor extraídos del documento.',
    },
    contexto_documento: {
      type: Type.STRING,
      description:
        'Descripción detallada y contextual de todo el contenido del documento para usar como directiva en chats posteriores.',
    },
  },
  required: ['resumen_ejecutivo', 'entidades_clave', 'contexto_documento'],
};

/**
 * Analiza un documento en base64 usando gemini-1.5-flash y retorna datos estructurados.
 */
export async function analyzeDocumentWithGemini(
  base64Image: string,
  customPrompt?: string,
  apiKey?: string
): Promise<DocumentAnalysisResult> {
  const ai = getGenAIClient(apiKey);

  const defaultPrompt = `Eres un asistente experto en digitalización y análisis documental ("DocuSynth").
Analiza la siguiente imagen de documento escaneado y extrae con precisión:
1. resumen_ejecutivo: Lista de viñetas con los puntos más relevantes.
2. entidades_clave: Campos clave encontrados (importes, fechas, remitentes, destinatarios, números de factura, IDs, etc.).
3. contexto_documento: Una síntesis comprensiva y detallada de todo el documento que sirva como base de conocimiento para responder preguntas futuras del usuario sobre él.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: customPrompt || defaultPrompt },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: documentAnalysisSchema,
        temperature: 0.2, // Baja temperatura para mayor fidelidad en extracción de datos
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Gemini no retornó contenido en la respuesta.');
    }

    const parsedData: DocumentAnalysisResult = JSON.parse(responseText);
    return parsedData;
  } catch (error: any) {
    console.error('[DocuSynth][geminiService] Error analizando documento:', error);
    throw new Error(
      error?.message || 'Error desconocido al analizar el documento con Gemini.'
    );
  }
}
