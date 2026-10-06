import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { DocumentCameraModal } from '../components/DocumentCameraModal';
import { ProcessedDocument } from '../types/scanner.types';
import { DocumentAnalysisResult } from '../types/gemini.types';
import { analyzeDocumentWithGemini } from '../services/geminiService';
import { useDocumentChat } from '../hooks/useDocumentChat';

export const DocuSynthScreen: React.FC = () => {
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DocumentAnalysisResult | null>(null);
  const [questionInput, setQuestionInput] = useState('');

  // Hook reactivo para el Chat contextualizado con el documento
  const {
    messages,
    isReplying,
    chatError,
    sendQuestion,
    clearChat,
  } = useDocumentChat(analysisResult?.contexto_documento || null);

  const handleCaptureCompleted = async (doc: ProcessedDocument) => {
    setIsCameraVisible(false);
    setAnalyzing(true);
    try {
      const result = await analyzeDocumentWithGemini(doc.base64);
      setAnalysisResult(result);
    } catch (err) {
      console.error('Error al analizar con Gemini:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSendQuestion = async () => {
    if (!questionInput.trim() || isReplying) return;
    const q = questionInput;
    setQuestionInput('');
    await sendQuestion(q);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brandTitle}>DocuSynth</Text>
          <Text style={styles.brandSubtitle}>Escáner Multimodal & Q&A IA</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Botón de captura o re-escaneo */}
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => setIsCameraVisible(true)}
            disabled={analyzing}
          >
            <Text style={styles.scanButtonText}>
              {analysisResult ? '📷 Escanear Otro Documento' : '📷 Escanear Documento'}
            </Text>
          </TouchableOpacity>

          {analyzing && (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#6366F1" />
              <Text style={styles.loadingText}>Gemini 1.5 Flash sintetizando documento...</Text>
            </View>
          )}

          {/* Resultado de Análisis */}
          {analysisResult && !analyzing && (
            <View style={styles.resultsContainer}>
              <Text style={styles.sectionTitle}>Resumen Ejecutivo</Text>
              {analysisResult.resumen_ejecutivo.map((punto, index) => (
                <View key={`res-${index}`} style={styles.bulletItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.bulletText}>{punto}</Text>
                </View>
              ))}

              <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Entidades Clave</Text>
              <View style={styles.chipsContainer}>
                {analysisResult.entidades_clave.map((item, index) => (
                  <View key={`ent-${index}`} style={styles.chip}>
                    <Text style={styles.chipCampo}>{item.campo}:</Text>
                    <Text style={styles.chipValor}>{item.valor}</Text>
                  </View>
                ))}
              </View>

              {/* Chat Q&A */}
              <View style={styles.chatSection}>
                <View style={styles.chatHeader}>
                  <Text style={styles.sectionTitle}>Pregúntale a DocuSynth</Text>
                  <TouchableOpacity onPress={clearChat}>
                    <Text style={styles.clearChatText}>Limpiar Chat</Text>
                  </TouchableOpacity>
                </View>

                {messages.length === 0 && (
                  <Text style={styles.emptyChatText}>
                    Haz cualquier pregunta sobre fechas, totales, cláusulas o personas mencionadas en el documento.
                  </Text>
                )}

                {messages.map((m) => (
                  <View
                    key={m.id}
                    style={[
                      styles.chatBubble,
                      m.role === 'user' ? styles.userBubble : styles.modelBubble,
                    ]}
                  >
                    <Text style={styles.bubbleRole}>
                      {m.role === 'user' ? 'Tú' : 'DocuSynth AI'}
                    </Text>
                    <Text style={styles.bubbleContent}>{m.content}</Text>
                  </View>
                ))}

                {isReplying && (
                  <View style={styles.replyingBox}>
                    <ActivityIndicator size="small" color="#818CF8" />
                    <Text style={styles.replyingText}>Pensando...</Text>
                  </View>
                )}

                {chatError && <Text style={styles.errorText}>{chatError}</Text>}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input de Chat */}
        {analysisResult && !analyzing && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Escribe tu consulta..."
              placeholderTextColor="#64748B"
              value={questionInput}
              onChangeText={setQuestionInput}
              onSubmitEditing={handleSendQuestion}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!questionInput.trim() || isReplying) && styles.sendButtonDisabled,
              ]}
              onPress={handleSendQuestion}
              disabled={!questionInput.trim() || isReplying}
            >
              <Text style={styles.sendButtonText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Modal de Cámara */}
        {isCameraVisible && (
          <DocumentCameraModal
            onCaptureCompleted={handleCaptureCompleted}
            onCancel={() => setIsCameraVisible(false)}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  scrollContent: {
    padding: 20,
  },
  scanButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  loadingBox: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#1E293B',
    borderRadius: 16,
  },
  loadingText: {
    color: '#CBD5E1',
    marginTop: 12,
    fontSize: 14,
  },
  resultsContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#F1F5F9',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingRight: 10,
  },
  bulletPoint: {
    color: '#818CF8',
    fontSize: 16,
    marginRight: 8,
  },
  bulletText: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipCampo: {
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 12,
    marginRight: 4,
  },
  chipValor: {
    color: '#38BDF8',
    fontWeight: '700',
    fontSize: 12,
  },
  chatSection: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 16,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clearChatText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyChatText: {
    color: '#64748B',
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 8,
  },
  chatBubble: {
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  userBubble: {
    backgroundColor: '#3730A3',
    alignSelf: 'flex-end',
    maxWidth: '85%',
  },
  modelBubble: {
    backgroundColor: '#0F172A',
    alignSelf: 'flex-start',
    maxWidth: '90%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  bubbleRole: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  bubbleContent: {
    color: '#F8FAFC',
    fontSize: 14,
    lineHeight: 20,
  },
  replyingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  replyingText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  errorText: {
    color: '#F87171',
    fontSize: 12,
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#0F172A',
    color: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sendButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginLeft: 10,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
