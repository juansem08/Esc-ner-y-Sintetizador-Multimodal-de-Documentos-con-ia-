import { GoogleGenAI, Type, Schema } from '@google/genai';
import { AnalysisOptions, DocumentAnalysisResult, DocumentCategory } from '../types/gemini.types';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

/**
 * Plantillas especializadas por tipo de documento
 */
export const CATEGORY_PROMPTS: Record<DocumentCategory, string> = {
  general: `Eres un asistente experto en digitalización y análisis documental ("DocuSynth").
Analiza la siguiente imagen de documento escaneado y extrae con precisión:
1. resumen_ejecutivo: Lista de viñetas con los puntos más relevantes.
2. entidades_clave: Campos clave encontrados (importes, fechas, remitentes, destinatarios, números de factura, IDs, etc.).
3. contexto_documento: Una síntesis comprensiva y detallada de todo el documento que sirva como base de conocimiento para responder preguntas futuras del usuario sobre él.`,
  invoice: `Eres un asistente experto en procesamiento de facturas y documentos contables ("DocuSynth").
Analiza con máxima precisión financiera:
1. resumen_ejecutivo: Resumen del emisor, receptor, concepto de compra y método de pago.
2. entidades_clave: Extrae subtotal, impuestos (IVA/TAX), total general, RFC/NIF, número de factura y fecha de emisión.
3. contexto_documento: Detalle completo de conceptos facturados, términos comerciales y datos fiscales.`,
  contract: `Eres un asistente legal y analista de contratos ("DocuSynth").
Analiza con rigor jurídico:
1. resumen_ejecutivo: Puntos críticos de acuerdo, partes firmantes y vigencia.
2. entidades_clave: Fechas de inicio/término, montos acordados, cláusulas de penalización, jurisdicción y personas firmantes.
3. contexto_documento: Resumen detallado de derechos, obligaciones, causales de rescisión y confidencialidad.`,
  receipt: `Eres un asistente de digitalización de tickets y recibos de compra ("DocuSynth").
1. resumen_ejecutivo: Establecimiento, fecha y resumen de productos adquiridos.
2. entidades_clave: Total pagado, divisa, método de pago, propina/impuestos si aplica y número de transacción.
3. contexto_documento: Listado completo de artículos y políticas de devolución.`,
  id_card: `Eres un asistente de verificación documental y credenciales oficiales ("DocuSynth").
1. resumen_ejecutivo: Tipo de identificación, emisor oficial y titular.
2. entidades_clave: Nombre completo, número de documento/ID, fecha de nacimiento, fecha de vencimiento y nacionalidad.
3. contexto_documento: Datos de verificación, autoridad emisora y restricciones.`,
};

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
  optionsOrPrompt?: AnalysisOptions | string,
  legacyApiKey?: string
): Promise<DocumentAnalysisResult> {
  const options: AnalysisOptions =
    typeof optionsOrPrompt === 'string'
      ? { customPrompt: optionsOrPrompt, apiKey: legacyApiKey }
      : optionsOrPrompt || {};

  const apiKey = options.apiKey || legacyApiKey;
  const ai = getGenAIClient(apiKey);

  const selectedCategory = options.category || 'general';
  const effectivePrompt =
    options.customPrompt || CATEGORY_PROMPTS[selectedCategory] || CATEGORY_PROMPTS.general;
  const effectiveTemperature = options.temperature ?? 0.2;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: effectivePrompt },
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
        temperature: effectiveTemperature,
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

