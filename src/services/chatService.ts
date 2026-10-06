import { GoogleGenAI } from '@google/genai';
import { ChatMessage } from '../types/gemini.types';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

/**
 * Servicio de Chat enfocado en Q&A sobre el documento escaneado.
 * Mantiene el historial en memoria y alimenta el contexto_documento como instrucción del sistema.
 */
export class DocumentChatSession {
  private ai: GoogleGenAI;
  private chatSession: any = null;
  private history: ChatMessage[] = [];
  private documentContext: string;

  constructor(documentContext: string, apiKey?: string) {
    const key = apiKey || API_KEY;
    if (!key) {
      throw new Error('Gemini API Key no configurada para la sesión de chat.');
    }
    this.ai = new GoogleGenAI({ apiKey: key });
    this.documentContext = documentContext;
    this.initializeChat();
  }

  private initializeChat() {
    const systemInstruction = `Eres "DocuSynth Assistant", un copiloto inteligente especializado en resolver dudas sobre documentos.
Toda tu información de referencia proviene exclusivamente del siguiente contexto extraído del documento:
---
${this.documentContext}
---
Instrucciones:
1. Responde de forma clara, directa y concisa en el idioma del usuario.
2. Si el usuario pregunta algo que no se encuentra o no se puede deducir del documento, indícalo cortésmente indicando que dicha información no figura en el documento analizado.
3. No inventes datos numéricos, fechas ni personas que no aparezcan en el documento.`;

    this.chatSession = this.ai.chats.create({
      model: 'gemini-1.5-flash',
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });
  }

  /**
   * Envía una pregunta a Gemini, registra el historial y retorna la respuesta generada.
   */
  async sendMessage(userQuestion: string): Promise<ChatMessage> {
    if (!this.chatSession) {
      this.initializeChat();
    }

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: userQuestion,
      timestamp: Date.now(),
    };
    this.history.push(userMessage);

    try {
      const result = await this.chatSession.sendMessage({
        message: userQuestion,
      });

      const responseText = result.text || 'Sin respuesta generada.';

      const modelMessage: ChatMessage = {
        id: `model_${Date.now()}`,
        role: 'model',
        content: responseText,
        timestamp: Date.now(),
      };
      this.history.push(modelMessage);

      return modelMessage;
    } catch (error: any) {
      console.error('[DocuSynth][chatService] Error al enviar mensaje:', error);
      throw new Error(
        error?.message || 'Error en la comunicación con el servicio de chat.'
      );
    }
  }

  /**
   * Obtiene la copia del historial de mensajes actual
   */
  getHistory(): ChatMessage[] {
    return [...this.history];
  }

  /**
   * Limpia el historial y re-inicializa la sesión conservando el contexto
   */
  resetHistory() {
    this.history = [];
    this.initializeChat();
  }
}
