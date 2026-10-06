import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { DocumentCameraModal } from '../components/DocumentCameraModal';
import { ProcessedDocument } from '../types/scanner.types';
import { DocumentAnalysisResult } from '../types/gemini.types';
import { analyzeDocumentWithGemini } from '../services/geminiService';
import { useDocumentChat } from '../hooks/useDocumentChat';

// Componentes modulares del Sistema de Diseño Stitch
import { StatusHeroCard } from '../components/results/StatusHeroCard';
import { ExecutiveSummaryCard } from '../components/results/ExecutiveSummaryCard';
import { ExtractedDataGrid } from '../components/results/ExtractedDataGrid';
import { ErrorBanner } from '../components/results/ErrorBanner';
import { FloatingChatBar } from '../components/chat/FloatingChatBar';
import { DocumentChatDrawer } from '../components/chat/DocumentChatDrawer';

import { validateDocumentPayload } from '../utils/documentValidator';

export const DocuSynthScreen: React.FC = () => {
  // ==========================================
  // ESTADO Y LÓGICA DE NEGOCIO (INMUTABLE)
  // ==========================================
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DocumentAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [lastCapturedDoc, setLastCapturedDoc] = useState<ProcessedDocument | null>(null);
  const [questionInput, setQuestionInput] = useState('');
  const [isChatExpanded, setIsChatExpanded] = useState(false);

  // Hook reactivo de Chat contextualizado con el documento
  const {
    messages,
    isReplying,
    chatError,
    sendQuestion,
    clearChat,
  } = useDocumentChat(analysisResult?.contexto_documento || null);

  // Invocación a Gemini multimodal conservando flujo original
  const handleCaptureCompleted = async (doc: ProcessedDocument) => {
    setIsCameraVisible(false);
    setAnalyzing(true);
    setAnalysisError(null);
    setLastCapturedDoc(doc);
    try {
      const validation = validateDocumentPayload(doc);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Documento no válido.');
      }

      const result = await analyzeDocumentWithGemini(doc.base64);
      setAnalysisResult(result);
    } catch (err: any) {
      console.error('Error al analizar con Gemini:', err);
      setAnalysisError(
        err?.message || 'No se pudo completar el análisis del documento con Gemini.'
      );
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
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ========================================================
            HEADER PRINCIPAL - STITCH MOBILE UI
           ======================================================== */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerCircleBtn}
            onPress={() => setIsCameraVisible(true)}
          >
            <Text style={styles.headerIconText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.headerCenterInfo}>
            <View style={styles.headerPillBadge}>
              <Text style={styles.headerPillText}>DOCUSYNTH AI • OCR MULTIMODAL</Text>
            </View>
            <Text style={styles.headerDocumentTitle} numberOfLines={1}>
              {analysisResult ? 'Documento Sintetizado' : 'Escáner Inteligente'}
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.headerCircleBtn, styles.headerActionBtnActive]}
              onPress={() => setIsCameraVisible(true)}
            >
              <Text style={styles.headerActionIcon}>📷</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerCircleBtn}>
              <Text style={styles.headerActionIcon}>↗</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ========================================================
            CONTENIDO SCROLLABLE (PANEL DE RESULTADOS)
           ======================================================== */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Banner de procesamiento en curso */}
          {analyzing && (
            <View style={styles.analyzingCard}>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text style={styles.analyzingTitle}>Sintetizando Documento con Gemini</Text>
              <Text style={styles.analyzingSubtitle}>
                Extrayendo entidades clave, cláusulas y generando contexto neuronal...
              </Text>
            </View>
          )}

          {/* Banner de error si falla el análisis */}
          {analysisError && !analyzing && (
            <ErrorBanner
              message={analysisError}
              onRetry={
                lastCapturedDoc
                  ? () => handleCaptureCompleted(lastCapturedDoc)
                  : () => setIsCameraVisible(true)
              }
              onDismiss={() => setAnalysisError(null)}
            />
          )}

          {/* Estado inicial sin documento */}
          {!analysisResult && !analyzing && (
            <View style={styles.emptyStateCard}>
              <View style={styles.emptyIconCircle}>
                <Text style={styles.emptyIconEmoji}>📄</Text>
              </View>
              <Text style={styles.emptyStateTitle}>Ningún documento escaneado</Text>
              <Text style={styles.emptyStateDesc}>
                Alinea y captura una fotografía de un contrato, factura o recibo para generar la síntesis automática con Gemini 1.5 Flash.
              </Text>
              <TouchableOpacity
                style={styles.primaryScanBtn}
                onPress={() => setIsCameraVisible(true)}
              >
                <Text style={styles.primaryScanBtnText}>⚡ Iniciar Escáner OCR</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ========================================================
              FASE 02: PANEL DE RESULTADOS CONECTADO A ESTADO REAL
             ======================================================== */}
          {analysisResult && !analyzing && (
            <>
              {/* Card Azul Degradado: Análisis Inteligente Completado */}
              <StatusHeroCard
                summaryCount={analysisResult.resumen_ejecutivo.length}
                entityCount={analysisResult.entidades_clave.length}
              />

              {/* SECCIÓN 1: RESUMEN EJECUTIVO (Conectado a analysisResult.resumen_ejecutivo) */}
              <ExecutiveSummaryCard
                bullets={analysisResult.resumen_ejecutivo}
                onRescan={() => setIsCameraVisible(true)}
              />

              {/* SECCIÓN 2: DATOS EXTRAÍDOS (Conectado a analysisResult.entidades_clave) */}
              <ExtractedDataGrid entities={analysisResult.entidades_clave} />
            </>
          )}
        </ScrollView>

        {/* ========================================================
            BARRA DE DISPARO DEL CHAT FLOTANTE (STITCH FASE 02)
           ======================================================== */}
        {analysisResult && !analyzing && (
          <FloatingChatBar onPress={() => setIsChatExpanded(true)} />
        )}

        {/* ========================================================
            FASE 03: MODAL / DRAWER DE CHAT CON DOCUMENTO COMPLETA
           ======================================================== */}
        <DocumentChatDrawer
          visible={isChatExpanded}
          messages={messages}
          isReplying={isReplying}
          chatError={chatError}
          questionInput={questionInput}
          entityCount={analysisResult?.entidades_clave.length || 0}
          onClose={() => setIsChatExpanded(false)}
          onClearChat={clearChat}
          onChangeQuestionInput={setQuestionInput}
          onSendQuestion={handleSendQuestion}
        />

        {/* Modal nativo de cámara (Fase 01) */}
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
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
  },
  headerCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerIconText: {
    fontSize: 24,
    color: '#0F172A',
    fontWeight: '300',
    lineHeight: 28,
  },
  headerCenterInfo: {
    alignItems: 'center',
  },
  headerPillBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 4,
  },
  headerPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
    letterSpacing: 0.5,
  },
  headerDocumentTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerActionBtnActive: {
    backgroundColor: '#2563EB',
    borderColor: '#1D4ED8',
  },
  headerActionIcon: {
    fontSize: 15,
    color: '#0F172A',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100,
  },
  analyzingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  analyzingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
  },
  analyzingSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  emptyStateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginTop: 40,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIconEmoji: {
    fontSize: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptyStateDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  primaryScanBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  primaryScanBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
