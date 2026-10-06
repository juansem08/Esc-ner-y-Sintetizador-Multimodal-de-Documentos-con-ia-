import { useState, useRef, useEffect, useCallback } from 'react';
import { DocumentChatSession } from '../services/chatService';
import { ChatMessage } from '../types/gemini.types';

export function useDocumentChat(documentContext: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isReplying, setIsReplying] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const sessionRef = useRef<DocumentChatSession | null>(null);

  // Inicializa o reinicia la sesión cuando cambia el contexto del documento
  useEffect(() => {
    if (documentContext && documentContext.trim().length > 0) {
      try {
        sessionRef.current = new DocumentChatSession(documentContext);
        setMessages([]);
        setChatError(null);
      } catch (err: any) {
        setChatError(err?.message || 'Error al inicializar la sesión de chat.');
      }
    } else {
      sessionRef.current = null;
      setMessages([]);
    }
  }, [documentContext]);

  const sendQuestion = useCallback(
    async (question: string): Promise<ChatMessage | null> => {
      const cleanQuestion = question.trim();
      if (!cleanQuestion) return null;

      if (!sessionRef.current) {
        setChatError('No hay un documento activo como contexto para el chat.');
        return null;
      }

      setIsReplying(true);
      setChatError(null);

      // Agregar mensaje del usuario inmediatamente a la UI
      const optimisticUserMsg: ChatMessage = {
        id: `user_${Date.now()}`,
        role: 'user',
        content: cleanQuestion,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, optimisticUserMsg]);

      try {
        const responseMessage = await sessionRef.current.sendMessage(cleanQuestion);
        setMessages((prev) => {
          // Aseguramos que la lista se sincronice con el historial real de la sesión
          return sessionRef.current?.getHistory() || [...prev, responseMessage];
        });
        return responseMessage;
      } catch (err: any) {
        const msg = err?.message || 'Error al obtener respuesta de Gemini.';
        setChatError(msg);
        return null;
      } finally {
        setIsReplying(false);
      }
    },
    []
  );

  const clearChat = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.resetHistory();
    }
    setMessages([]);
    setChatError(null);
  }, []);

  return {
    messages,
    isReplying,
    chatError,
    sendQuestion,
    clearChat,
    hasContext: Boolean(documentContext && sessionRef.current),
  };
}
