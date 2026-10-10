import React, { useState, useEffect } from 'react';
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
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useDocumentScanner } from '../hooks/useDocumentScanner';
import { useDocumentChat } from '../hooks/useDocumentChat';
import { analyzeDocumentWithGemini } from '../services/geminiService';
import { documentHistoryService } from '../services/historyService';
import { validateDocumentPayload } from '../utils/documentValidator';
import { StitchTheme } from '../theme/stitchTheme';
import { ProcessedDocument } from '../types/scanner.types';
import { DocumentAnalysisResult } from '../types/gemini.types';

// Componentes modulares del Sistema de Diseño Stitch
import { StatusHeroCard } from '../components/results/StatusHeroCard';
import { ExecutiveSummaryCard } from '../components/results/ExecutiveSummaryCard';
import { ExtractedDataGrid } from '../components/results/ExtractedDataGrid';
import { ErrorBanner } from '../components/results/ErrorBanner';
import { FloatingChatBar } from '../components/chat/FloatingChatBar';
import { DocumentChatDrawer } from '../components/chat/DocumentChatDrawer';

// ==========================================
// DATOS PREESTABLECIDOS PARA DEMOS DE STITCH
// ==========================================
const DEMO_DOCUMENTS: Record<
  'contrato' | 'factura' | 'pagare',
  { title: string; result: DocumentAnalysisResult; dummyDoc: ProcessedDocument }
> = {
  contrato: {
    title: 'Contrato de Arrendamiento',
    result: {
      resumen_ejecutivo: [
        'Contrato de arrendamiento residencial con vigencia establecida de 12 meses.',
        'Partes firmantes: Inmobiliaria Metropolitana S.A. (Arrendador) y Juan Sebastián Morales (Arrendatario).',
        'Canon mensual fijado en $1,450.00 USD pagadero durante los primeros 5 días hábiles de cada mes.',
        'Depósito en garantía de $1,450.00 USD entregado a la firma del presente acuerdo.',
        'Cláusula de penalización por mora del 3% mensual sobre saldo insoluto.',
      ],
      entidades_clave: [
        { campo: 'Tipo de Documento', valor: 'Contrato de Arrendamiento' },
        { campo: 'Arrendador', valor: 'Inmobiliaria Metropolitana S.A.' },
        { campo: 'Arrendatario', valor: 'Juan Sebastián Morales' },
        { campo: 'Canon Mensual', valor: '$1,450.00 USD' },
        { campo: 'Depósito Garantía', valor: '$1,450.00 USD' },
        { campo: 'Vigencia', valor: '01/Nov/2026 al 31/Oct/2027' },
        { campo: 'Ubicación Inmueble', valor: 'Av. Las Palmas 450, Depto 802' },
        { campo: 'Jurisdicción Legal', valor: 'Tribunales de la Ciudad' },
      ],
      contexto_documento:
        'Contrato de arrendamiento entre Inmobiliaria Metropolitana S.A. y Juan Sebastián Morales para el inmueble en Av. Las Palmas 450, Depto 802. Canon mensual $1,450.00 USD, depósito $1,450.00 USD, vigencia 1 año (Nov 2026 - Oct 2027). Penalización por retraso 3% mensual.',
    },
    dummyDoc: {
      uri: 'demo://contrato_arrendamiento',
      base64: 'demo_base64_payload',
      width: 1200,
      height: 1600,
    },
  },
  factura: {
    title: 'Factura Telecom Cloud',
    result: {
      resumen_ejecutivo: [
        'Factura electrónica fiscal por servicios de infraestructura Cloud y ancho de banda dedicado.',
        'Emisor: Telecom Solutions Corp (RFC: TEL980312-AB1).',
        'Receptor: TechVentures Lab Inc.',
        'Monto total liquidado: $1,200.00 USD con desglose de impuestos aplicables.',
        'Condiciones de pago: 30 días netos mediante transferencia electrónica SWIFT.',
      ],
      entidades_clave: [
        { campo: 'Emisor', valor: 'Telecom Solutions Corp' },
        { campo: 'Receptor', valor: 'TechVentures Lab Inc' },
        { campo: 'Número Factura', valor: 'INV-2026-9842' },
        { campo: 'Fecha Emisión', valor: '08/Octubre/2026' },
        { campo: 'Subtotal Neto', valor: '$1,034.48 USD' },
        { campo: 'IVA / TAX (16%)', valor: '$165.52 USD' },
        { campo: 'Total General', valor: '$1,200.00 USD' },
        { campo: 'Estado Pago', valor: 'Pendiente (30 días netos)' },
      ],
      contexto_documento:
        'Factura comercial INV-2026-9842 emitida el 8 de octubre de 2026 por Telecom Solutions Corp a TechVentures Lab Inc. Servicios correspondientes a licencias de servidor cloud y bandwidth del mes. Subtotal $1,034.48 USD más IVA $165.52 USD para un total de $1,200.00 USD.',
    },
    dummyDoc: {
      uri: 'demo://factura_compra',
      base64: 'demo_base64_payload',
      width: 1200,
      height: 1600,
    },
  },
  pagare: {
    title: 'Ticket Oficial de Compra',
    result: {
      resumen_ejecutivo: [
        'Comprobante simplificado de compra emitido por tienda Apple Store.',
        'Artículos: Teclado Magic Keyboard y Adaptador USB-C de audio.',
        'Pago procesado con tarjeta de débito VISA terminada en 4412.',
        'Garantía de cambio y devolución vigente por 14 días naturales.',
      ],
      entidades_clave: [
        { campo: 'Establecimiento', valor: 'Apple Store Flagship' },
        { campo: 'N° Transacción', valor: 'TXN-77821-APL' },
        { campo: 'Fecha y Hora', valor: '09/Oct/2026 - 15:42' },
        { campo: 'Artículos', valor: '2 unidades' },
        { campo: 'Subtotal', valor: '$149.00 USD' },
        { campo: 'Impuestos Locales', valor: '$11.92 USD' },
        { campo: 'Total Pagado', valor: '$160.92 USD' },
        { campo: 'Método de Pago', valor: 'Tarjeta Débito VISA (*4412)' },
      ],
      contexto_documento:
        'Recibo de compra minorista en Apple Store Flagship por adquisición de Magic Keyboard ($129.00) y Adaptador USB-C ($20.00). Total pagado $160.92 USD. Política de garantía de 14 días con comprobante.',
    },
    dummyDoc: {
      uri: 'demo://ticket_compra',
      base64: 'demo_base64_payload',
      width: 1200,
      height: 1600,
    },
  },
};

export const DocuSynthScreen: React.FC = () => {
  // ==========================================
  // ESTADOS DE ENRUTAMIENTO (STITCH NAVIGATION)
  // ==========================================
  const [pantallaActiva, setPantallaActiva] = useState<'home' | 'escaner'>('home');

  // ==========================================
  // ESTADOS Y LÓGICA DE NEGOCIO (INMUTABLE)
  // ==========================================
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DocumentAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [lastCapturedDoc, setLastCapturedDoc] = useState<ProcessedDocument | null>(null);
  const [questionInput, setQuestionInput] = useState('');
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Estados de control de cámara
  const [permission, requestPermission] = useCameraPermissions();
  const [flashMode, setFlashMode] = useState<'off' | 'on'>('off');
  const [autoDetect, setAutoDetect] = useState(true);

  // Hook del Scanner de Documentos existente
  const {
    cameraRef,
    isProcessing: isScanning,
    error: scannerError,
    captureAndProcessDocument,
  } = useDocumentScanner();

  // Hook reactivo de Chat contextualizado con el documento
  const {
    messages,
    isReplying,
    chatError,
    sendQuestion,
    clearChat,
  } = useDocumentChat(analysisResult?.contexto_documento || null);

  // Helper para mensajes Toast de Stitch
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Invocación a Gemini multimodal conservando la lógica original
  const handleCaptureCompleted = async (doc: ProcessedDocument) => {
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
      documentHistoryService.addRecord(result, doc);
      showToast('¡Documento sintetizado con éxito!');
    } catch (err: any) {
      console.error('Error al analizar con Gemini:', err);
      setAnalysisError(
        err?.message || 'No se pudo completar el análisis del documento con Gemini.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  // Disparador del botón de captura de la cámara
  const handleShutterCapture = async () => {
    try {
      const doc = await captureAndProcessDocument();
      if (doc) {
        setPantallaActiva('home');
        await handleCaptureCompleted(doc);
      }
    } catch (err: any) {
      console.error('Error al capturar foto:', err);
      showToast('Error al capturar la imagen');
    }
  };

  // Carga instantánea de demostración
  const handleLoadDemo = (tipo: 'contrato' | 'factura' | 'pagare') => {
    const demo = DEMO_DOCUMENTS[tipo];
    setAnalysisError(null);
    setAnalyzing(false);
    setAnalysisResult(demo.result);
    setLastCapturedDoc(demo.dummyDoc);
    documentHistoryService.addRecord(demo.result, demo.dummyDoc);
    setPantallaActiva('home');
    showToast(`Demo "${demo.title}" cargada`);
  };

  const handleSendQuestion = async () => {
    if (!questionInput.trim() || isReplying) return;
    const q = questionInput;
    setQuestionInput('');
    await sendQuestion(q);
  };

  // ========================================================
  // RENDER: PANTALLA DE ESCÁNER (CÁMARA ACTIVA EXPO)
  // ========================================================
  if (pantallaActiva === 'escaner') {
    // 1. Estado de carga de permisos
    if (!permission) {
      return (
        <SafeAreaView style={styles.cameraCenterContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#000000" />
          <ActivityIndicator size="large" color="#00F2FE" />
          <Text style={styles.cameraPermissionLoadingText}>Inicializando sensor óptico...</Text>
        </SafeAreaView>
      );
    }

    // 2. Estado de permiso no otorgado
    if (!permission.granted) {
      return (
        <SafeAreaView style={styles.cameraCenterContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#000000" />
          <View style={styles.permissionCard}>
            <View style={styles.permissionIconCircle}>
              <Text style={{ fontSize: 32 }}>📷</Text>
            </View>
            <Text style={styles.permissionTitle}>Permiso de Cámara Requerido</Text>
            <Text style={styles.permissionSubtitle}>
              DocuSynth AI requiere acceso al lente para encuadrar y escanear tus documentos con Gemini 1.5 Flash.
            </Text>
            <TouchableOpacity style={styles.permissionPrimaryBtn} onPress={requestPermission}>
              <Text style={styles.permissionPrimaryBtnText}>Habilitar Cámara</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.permissionSecondaryBtn}
              onPress={() => setPantallaActiva('home')}
            >
              <Text style={styles.permissionSecondaryBtnText}>Volver al Inicio</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    // 3. Cámara en vivo con overlay y controles de Stitch
    return (
      <View style={styles.cameraRootContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={flashMode === 'on'}
        >
          <SafeAreaView style={styles.cameraOverlay}>
            {/* Header del Escáner */}
            <View style={styles.cameraHeader}>
              <TouchableOpacity
                style={styles.cameraHeaderCircleBtn}
                onPress={() => setPantallaActiva('home')}
              >
                <Text style={styles.cameraHeaderBackIcon}>‹</Text>
              </TouchableOpacity>

              <View style={styles.cameraHeaderCenter}>
                <Text style={styles.cameraHeaderTitle}>Escaneando Documento</Text>
                <View style={styles.cameraDetectPill}>
                  <View style={styles.cameraDotPing} />
                  <Text style={styles.cameraDetectText}>Auto-Detección Activa</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.cameraHeaderCircleBtn,
                  flashMode === 'on' && styles.cameraHeaderCircleBtnActive,
                ]}
                onPress={() => setFlashMode(flashMode === 'off' ? 'on' : 'off')}
              >
                <Text style={styles.cameraHeaderActionIcon}>{flashMode === 'on' ? '⚡' : '💡'}</Text>
              </TouchableOpacity>
            </View>

            {/* Subtítulo Guía Flotante */}
            <View style={styles.cameraGuidePill}>
              <Text style={styles.cameraGuidePillText}>Alinea el documento dentro del cuadro</Text>
            </View>

            {/* Viewfinder con Esquinas Neón Cyan y Crosshair de Stitch */}
            <View style={styles.viewfinderCenterArea}>
              <View style={styles.viewfinderBox}>
                {/* 4 Esquinas Neón Cyan */}
                <View style={[styles.cornerBracket, styles.bracketTopLeft]} />
                <View style={[styles.cornerBracket, styles.bracketTopRight]} />
                <View style={[styles.cornerBracket, styles.bracketBottomLeft]} />
                <View style={[styles.cornerBracket, styles.bracketBottomRight]} />

                {/* Central Crosshair */}
                <View style={styles.crosshairCenter}>
                  <View style={styles.crosshairH} />
                  <View style={styles.crosshairV} />
                </View>

                {/* Chips de Metadatos en Vivo */}
                <View style={styles.liveMetaChipLeft}>
                  <Text style={styles.liveMetaText}>A4 • CONTRATO</Text>
                </View>
                <View style={styles.liveMetaChipRight}>
                  <Text style={[styles.liveMetaText, { color: '#10B981' }]}>99.4% OCR</Text>
                </View>
              </View>

              {scannerError && (
                <View style={styles.scannerErrorBadge}>
                  <Text style={styles.scannerErrorText}>{scannerError}</Text>
                </View>
              )}
            </View>

            {/* Panel Inferior de Disparo de Stitch */}
            <View style={styles.cameraBottomDock}>
              {isScanning && (
                <View style={styles.processingIndicatorPill}>
                  <ActivityIndicator color="#00F2FE" size="small" style={{ marginRight: 8 }} />
                  <Text style={styles.processingIndicatorText}>Optimizando imagen...</Text>
                </View>
              )}

              <View style={styles.cameraDockActions}>
                {/* Botón Cerrar */}
                <TouchableOpacity
                  style={styles.cameraDockSecondaryBtn}
                  onPress={() => setPantallaActiva('home')}
                >
                  <Text style={styles.cameraDockSecondaryIcon}>✕</Text>
                  <Text style={styles.cameraDockSecondaryLabel}>Cerrar</Text>
                </TouchableOpacity>

                {/* Botón Disparador Grande de Stitch */}
                <TouchableOpacity
                  style={styles.shutterOuterRing}
                  onPress={handleShutterCapture}
                  disabled={isScanning}
                >
                  <View style={styles.shutterMiddleRing}>
                    {isScanning ? (
                      <ActivityIndicator color="#2563EB" size="large" />
                    ) : (
                      <View style={styles.shutterInnerDisc}>
                        <View style={styles.shutterCenterDot} />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>

                {/* Botón Alternar Flash */}
                <TouchableOpacity
                  style={styles.cameraDockSecondaryBtn}
                  onPress={() => setFlashMode(flashMode === 'off' ? 'on' : 'off')}
                >
                  <Text
                    style={[
                      styles.cameraDockSecondaryIcon,
                      flashMode === 'on' && { color: '#F59E0B' },
                    ]}
                  >
                    ⚡
                  </Text>
                  <Text
                    style={[
                      styles.cameraDockSecondaryLabel,
                      flashMode === 'on' && { color: '#F59E0B' },
                    ]}
                  >
                    {flashMode === 'on' ? 'Flash On' : 'Flash Off'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.cameraDockModeText}>Modo Documento Inteligente</Text>
            </View>
          </SafeAreaView>
        </CameraView>
      </View>
    );
  }

  // ========================================================
  // RENDER: PANTALLA DASHBOARD PRINCIPAL (HOME)
  // ========================================================
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ========================================================
            TOAST INTERACTIVO DE STITCH
           ======================================================== */}
        {toastMessage && (
          <View style={styles.toastContainer}>
            <Text style={styles.toastDot}>●</Text>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        )}

        {/* ========================================================
            HEADER PRINCIPAL - STITCH DASHBOARD
           ======================================================== */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.brandRow}>
              <Text style={styles.brandTitle}>DocuSynth</Text>
              <Text style={styles.brandAIBadge}>AI</Text>
            </View>
            <View style={styles.geminiBadge}>
              <View style={styles.geminiPulseDot} />
              <Text style={styles.geminiBadgeText}>GEMINI 1.5 FLASH</Text>
            </View>
          </View>

          <View style={styles.headerRightActions}>
            <TouchableOpacity
              style={styles.headerCircleBtn}
              onPress={() =>
                showToast(
                  `Historial: ${documentHistoryService.getRecords().length} docs guardados`
                )
              }
            >
              <Text style={styles.headerBtnIcon}>🕒</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.headerCircleBtn,
                analysisResult ? styles.headerActiveBtn : null,
              ]}
              onPress={() => setPantallaActiva('escaner')}
            >
              <Text style={styles.headerBtnIcon}>📷</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ========================================================
            CONTENIDO SCROLLABLE (DASHBOARD O RESULTADOS)
           ======================================================== */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* BANNER DE PROCESAMIENTO / ANALIZANDO */}
          {analyzing && (
            <View style={styles.analyzingCard}>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text style={styles.analyzingTitle}>Espera un momento... analizando</Text>
              <Text style={styles.analyzingSubtitle}>
                Sintetizando documento con Gemini 1.5 Flash. Extrayendo entidades clave, cláusulas y generando contexto neuronal...
              </Text>
            </View>
          )}

          {/* BANNER DE ERROR */}
          {analysisError && !analyzing && (
            <ErrorBanner
              message={analysisError}
              onRetry={
                lastCapturedDoc
                  ? () => handleCaptureCompleted(lastCapturedDoc)
                  : () => setPantallaActiva('escaner')
              }
              onDismiss={() => setAnalysisError(null)}
            />
          )}

          {/* ========================================================
              VISTA 1: DASHBOARD DE INICIO DE STITCH (SIN RESULTADOS)
             ======================================================== */}
          {!analysisResult && !analyzing && (
            <>
              {/* Tarjeta Central de Escaneo Dinámico (Stitch Home) */}
              <View style={styles.scanHeroCard}>
                {/* Glow decorativo de fondo */}
                <View style={styles.heroGlowTop} />
                <View style={styles.heroGlowBottom} />

                {/* Ilustración de Documento Abstracto con IA */}
                <View style={styles.docIllustrationWrapper}>
                  {/* Outer Orbit */}
                  <View style={styles.docOrbitRing}>
                    <View style={styles.docOrbitDot} />
                  </View>

                  {/* Badges Flotantes de IA */}
                  <View style={styles.floatBadgeTop}>
                    <Text style={styles.floatBadgeTopText}>✨ OCR 99.4%</Text>
                  </View>
                  <View style={styles.floatBadgeBottom}>
                    <Text style={styles.floatBadgeBottomText}>📚 Multi-Doc</Text>
                  </View>

                  {/* Documento Estilizado */}
                  <View style={styles.mockupDocument}>
                    {/* Esquinas Cyan */}
                    <View style={[styles.mockBracket, styles.mockTopLeft]} />
                    <View style={[styles.mockBracket, styles.mockTopRight]} />
                    <View style={[styles.mockBracket, styles.mockBottomLeft]} />
                    <View style={[styles.mockBracket, styles.mockBottomRight]} />

                    {/* Láser de Escaneo */}
                    <View style={styles.laserScanLine} />

                    {/* Líneas de Texto Simuladas */}
                    <View style={styles.mockLinesWrapper}>
                      <View style={styles.mockLineHeader} />
                      <View style={styles.mockLineFull} />
                      <View style={styles.mockLineMedium} />
                      <View style={styles.mockLineAccent} />
                    </View>

                    {/* Indicador de Cláusulas Extraídas */}
                    <View style={styles.mockClauseTag}>
                      <Text style={styles.mockClauseTagText}>#CLÁUSULAS</Text>
                      <Text style={styles.mockClauseCheck}>✓</Text>
                    </View>
                  </View>
                </View>

                {/* Textos y Acciones */}
                <Text style={styles.heroCardTitle}>Listo para Escanear</Text>
                <Text style={styles.heroCardDesc}>
                  Captura contratos, facturas o recibos para generar síntesis automáticas al instante.
                </Text>

                {/* Botón Principal: Iniciar Escáner OCR */}
                <TouchableOpacity
                  style={styles.heroPrimaryBtn}
                  onPress={() => setPantallaActiva('escaner')}
                >
                  <Text style={styles.heroPrimaryBtnIcon}>📷</Text>
                  <Text style={styles.heroPrimaryBtnText}>Iniciar Escáner OCR</Text>
                  <Text style={styles.heroPrimaryBtnSparkle}>✨</Text>
                </TouchableOpacity>

                {/* Botón Secundario: Probar Demo Rápido */}
                <TouchableOpacity
                  style={styles.heroSecondaryBtn}
                  onPress={() => handleLoadDemo('contrato')}
                >
                  <Text style={styles.heroSecondaryBtnIcon}>📑</Text>
                  <Text style={styles.heroSecondaryBtnText}>Probar con Demo</Text>
                </TouchableOpacity>
              </View>

              {/* Sección: Escaneos Recientes y Demos */}
              <View style={styles.recentSection}>
                <View style={styles.recentHeaderRow}>
                  <Text style={styles.recentSectionTitle}>ESCANEOS RECIENTES Y DEMOS</Text>
                  <TouchableOpacity onPress={() => showToast('Cargando registros...')}>
                    <Text style={styles.recentViewAll}>Ver todo</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.recentCardsRow}
                >
                  {/* Card Demo 1: Contrato Arriendo */}
                  <TouchableOpacity
                    style={styles.recentCard}
                    onPress={() => handleLoadDemo('contrato')}
                  >
                    <View style={styles.recentCardTop}>
                      <View style={[styles.recentIconBox, { backgroundColor: '#EFF6FF' }]}>
                        <Text style={{ fontSize: 18 }}>📄</Text>
                      </View>
                      <View style={styles.recentCardMeta}>
                        <Text style={styles.recentCardTitle} numberOfLines={1}>
                          Contrato Arriendo
                        </Text>
                        <Text style={styles.recentCardSubtitle}>PDF • 1.4 MB</Text>
                      </View>
                    </View>
                    <View style={styles.recentCardBottom}>
                      <View style={styles.badgeSuccess}>
                        <Text style={styles.badgeSuccessText}>OCR OK</Text>
                      </View>
                      <Text style={styles.recentCardTime}>Hace 12 min</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Card Demo 2: Factura Compra */}
                  <TouchableOpacity
                    style={styles.recentCard}
                    onPress={() => handleLoadDemo('factura')}
                  >
                    <View style={styles.recentCardTop}>
                      <View style={[styles.recentIconBox, { backgroundColor: '#FAF5FF' }]}>
                        <Text style={{ fontSize: 18 }}>🧾</Text>
                      </View>
                      <View style={styles.recentCardMeta}>
                        <Text style={styles.recentCardTitle} numberOfLines={1}>
                          Factura Compra
                        </Text>
                        <Text style={styles.recentCardSubtitle}>$1,200 USD</Text>
                      </View>
                    </View>
                    <View style={styles.recentCardBottom}>
                      <View style={styles.badgePurple}>
                        <Text style={styles.badgePurpleText}>SINTETIZADO</Text>
                      </View>
                      <Text style={styles.recentCardTime}>Ayer, 18:42</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Card Demo 3: Pagaré / Ticket */}
                  <TouchableOpacity
                    style={[styles.recentCard, styles.recentCardDotted]}
                    onPress={() => handleLoadDemo('pagare')}
                  >
                    <View style={styles.recentCardTop}>
                      <View style={[styles.recentIconBox, { backgroundColor: '#2563EB' }]}>
                        <Text style={{ fontSize: 18, color: '#FFFFFF' }}>🏷️</Text>
                      </View>
                      <View style={styles.recentCardMeta}>
                        <Text style={styles.recentCardTitle} numberOfLines={1}>
                          Ticket Oficial
                        </Text>
                        <Text style={styles.recentCardSubtitle}>Probar con Demo</Text>
                      </View>
                    </View>
                    <View style={styles.recentCardBottom}>
                      <Text style={styles.recentCardActionLink}>Cargar modelo →</Text>
                    </View>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </>
          )}

          {/* ========================================================
              VISTA 2: PANEL DE RESULTADOS CONECTADO A GEMINI
             ======================================================== */}
          {analysisResult && !analyzing && (
            <>
              {/* Barra de Retorno y Nuevo Escaneo */}
              <View style={styles.resultsNavRow}>
                <TouchableOpacity
                  style={styles.resultsBackBtn}
                  onPress={() => {
                    setAnalysisResult(null);
                    showToast('Regresando al Dashboard');
                  }}
                >
                  <Text style={styles.resultsBackIcon}>‹</Text>
                  <Text style={styles.resultsBackText}>Dashboard</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resultsNewScanBtn}
                  onPress={() => setPantallaActiva('escaner')}
                >
                  <Text style={styles.resultsNewScanIcon}>📷</Text>
                  <Text style={styles.resultsNewScanText}>Escanear Nuevo</Text>
                </TouchableOpacity>
              </View>

              {/* Card Hero Azul Degradado */}
              <StatusHeroCard
                summaryCount={analysisResult.resumen_ejecutivo.length}
                entityCount={analysisResult.entidades_clave.length}
              />

              {/* SECCIÓN 1: RESUMEN EJECUTIVO */}
              <ExecutiveSummaryCard
                bullets={analysisResult.resumen_ejecutivo}
                onRescan={() => setPantallaActiva('escaner')}
              />

              {/* SECCIÓN 2: DATOS EXTRAÍDOS CON BUSCADOR Y FILTROS */}
              <ExtractedDataGrid entities={analysisResult.entidades_clave} />
            </>
          )}
        </ScrollView>

        {/* ========================================================
            BARRA DE DISPARO DEL CHAT FLOTANTE (SI HAY RESULTADO)
           ======================================================== */}
        {analysisResult && !analyzing && (
          <FloatingChatBar onPress={() => setIsChatExpanded(true)} />
        )}

        {/* ========================================================
            BARRA DE NAVEGACIÓN INFERIOR DE STITCH
           ======================================================== */}
        <View style={styles.bottomNav}>
          {/* Tab 1: Inicio */}
          <TouchableOpacity
            style={styles.bottomNavTab}
            onPress={() => {
              setAnalysisResult(null);
              setPantallaActiva('home');
            }}
          >
            <Text style={[styles.bottomNavIcon, !analysisResult && styles.bottomNavIconActive]}>
              🏠
            </Text>
            <Text style={[styles.bottomNavLabel, !analysisResult && styles.bottomNavLabelActive]}>
              Inicio
            </Text>
          </TouchableOpacity>

          {/* Tab 2: Escanear (Botón Prominente Central) */}
          <TouchableOpacity
            style={styles.bottomNavCenterBtn}
            onPress={() => setPantallaActiva('escaner')}
          >
            <View style={styles.bottomNavCenterCircle}>
              <Text style={styles.bottomNavCenterIcon}>⚡</Text>
            </View>
            <Text style={styles.bottomNavLabelCenter}>Escanear</Text>
          </TouchableOpacity>

          {/* Tab 3: Historial */}
          <TouchableOpacity
            style={styles.bottomNavTab}
            onPress={() =>
              showToast(
                `Historial: ${documentHistoryService.getRecords().length} documentos registrados`
              )
            }
          >
            <Text style={styles.bottomNavIcon}>📁</Text>
            <Text style={styles.bottomNavLabel}>Historial</Text>
          </TouchableOpacity>

          {/* Tab 4: Chat IA */}
          <TouchableOpacity
            style={styles.bottomNavTab}
            onPress={() => {
              if (analysisResult) {
                setIsChatExpanded(true);
              } else {
                showToast('Escanea un documento para iniciar el chat.');
              }
            }}
          >
            <Text style={styles.bottomNavIcon}>✨</Text>
            <Text style={styles.bottomNavLabel}>Chat IA</Text>
          </TouchableOpacity>
        </View>

        {/* ========================================================
            DRAWER / MODAL DEL CHAT CONTEXTUAL
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ==========================================
// ESTILOS VISUALES STITCH MOBILE DESIGN
// ==========================================
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  // Toast flotante
  toastContainer: {
    position: 'absolute',
    top: 54,
    alignSelf: 'center',
    zIndex: 999,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  toastDot: {
    color: '#00F2FE',
    fontSize: 10,
    marginRight: 6,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  // Header Stitch
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: '#F8FAFC',
  },
  headerLeft: {
    flexDirection: 'column',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  brandAIBadge: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2563EB',
    marginLeft: 3,
  },
  geminiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignSelf: 'flex-start',
  },
  geminiPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
    marginRight: 5,
  },
  geminiBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.6,
  },
  headerRightActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  headerActiveBtn: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  headerBtnIcon: {
    fontSize: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 110,
  },
  // Banner de Procesamiento
  analyzingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 26,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#2563EB',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  analyzingTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 14,
  },
  analyzingSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  // Dynamic Scanning Hero Card (Stitch Home)
  scanHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 3,
  },
  heroGlowTop: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  heroGlowBottom: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(99, 102, 241, 0.07)',
  },
  docIllustrationWrapper: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 4,
  },
  docOrbitRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: 'rgba(191, 219, 254, 0.8)',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  docOrbitDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
    marginTop: -4,
  },
  floatBadgeTop: {
    position: 'absolute',
    top: 4,
    right: 2,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E7FF',
    elevation: 3,
    zIndex: 10,
  },
  floatBadgeTopText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4338CA',
  },
  floatBadgeBottom: {
    position: 'absolute',
    bottom: 4,
    left: 2,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3E8FF',
    elevation: 3,
    zIndex: 10,
  },
  floatBadgeBottomText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7E22CE',
  },
  mockupDocument: {
    width: 90,
    height: 116,
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 8,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#334155',
    position: 'relative',
    elevation: 6,
  },
  mockBracket: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderColor: '#00F2FE',
  },
  mockTopLeft: {
    top: 4,
    left: 4,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  mockTopRight: {
    top: 4,
    right: 4,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  mockBottomLeft: {
    bottom: 4,
    left: 4,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  mockBottomRight: {
    bottom: 4,
    right: 4,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  laserScanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 42,
    height: 2,
    backgroundColor: '#00F2FE',
    shadowColor: '#00F2FE',
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  mockLinesWrapper: {
    gap: 4,
    marginTop: 6,
  },
  mockLineHeader: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#38BDF8',
  },
  mockLineFull: {
    width: '100%',
    height: 3,
    borderRadius: 2,
    backgroundColor: '#334155',
  },
  mockLineMedium: {
    width: '80%',
    height: 3,
    borderRadius: 2,
    backgroundColor: '#334155',
  },
  mockLineAccent: {
    width: 44,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#818CF8',
  },
  mockClauseTag: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mockClauseTagText: {
    fontSize: 7,
    color: '#94A3B8',
    fontWeight: '700',
  },
  mockClauseCheck: {
    fontSize: 7,
    color: '#34D399',
    fontWeight: '900',
  },
  heroCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 10,
  },
  heroCardDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
    paddingHorizontal: 8,
  },
  heroPrimaryBtn: {
    width: '100%',
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  heroPrimaryBtnIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  heroPrimaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  heroPrimaryBtnSparkle: {
    fontSize: 14,
    marginLeft: 6,
  },
  heroSecondaryBtn: {
    width: '100%',
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  heroSecondaryBtnIcon: {
    fontSize: 15,
    marginRight: 6,
  },
  heroSecondaryBtnText: {
    color: '#334155',
    fontWeight: '700',
    fontSize: 13,
  },
  // Sección de Recientes y Demos
  recentSection: {
    marginTop: 22,
  },
  recentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recentSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  recentViewAll: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  recentCardsRow: {
    gap: 10,
    paddingRight: 10,
  },
  recentCard: {
    width: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    justifyContent: 'space-between',
  },
  recentCardDotted: {
    borderStyle: 'dashed',
    borderColor: '#93C5FD',
    backgroundColor: '#F8FAFC',
  },
  recentCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recentIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentCardMeta: {
    flex: 1,
  },
  recentCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  recentCardSubtitle: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  recentCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  badgeSuccess: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeSuccessText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
  },
  badgePurple: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgePurpleText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#7E22CE',
  },
  recentCardTime: {
    fontSize: 9,
    color: '#94A3B8',
  },
  recentCardActionLink: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
  },
  // Barra de Retorno y Nuevo Escaneo en Resultados
  resultsNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultsBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  resultsBackIcon: {
    fontSize: 18,
    color: '#334155',
    marginRight: 4,
  },
  resultsBackText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  resultsNewScanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#2563EB',
  },
  resultsNewScanIcon: {
    fontSize: 12,
    marginRight: 4,
    color: '#FFFFFF',
  },
  resultsNewScanText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Bottom Navigation Bar
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    elevation: 8,
  },
  bottomNavTab: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
  },
  bottomNavIcon: {
    fontSize: 18,
    color: '#64748B',
  },
  bottomNavIconActive: {
    color: '#2563EB',
  },
  bottomNavLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  bottomNavLabelActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  bottomNavCenterBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    top: -14,
  },
  bottomNavCenterCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  bottomNavCenterIcon: {
    fontSize: 22,
    color: '#FFFFFF',
  },
  bottomNavLabelCenter: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 2,
  },
  // ==========================================
  // ESTILOS DE LA PANTALLA DE CÁMARA (ESCANER)
  // ==========================================
  cameraRootContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraCenterContainer: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  cameraPermissionLoadingText: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
  },
  permissionCard: {
    backgroundColor: '#0F172A',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    width: '100%',
    maxWidth: 360,
  },
  permissionIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  permissionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  permissionSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionPrimaryBtn: {
    width: '100%',
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  permissionPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  permissionSecondaryBtn: {
    paddingVertical: 10,
  },
  permissionSecondaryBtnText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  cameraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  cameraHeaderCircleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraHeaderCircleBtnActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#D97706',
  },
  cameraHeaderBackIcon: {
    color: '#FFFFFF',
    fontSize: 26,
    lineHeight: 28,
    fontWeight: '300',
  },
  cameraHeaderActionIcon: {
    fontSize: 18,
  },
  cameraHeaderCenter: {
    alignItems: 'center',
  },
  cameraHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  cameraDetectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  cameraDotPing: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00F2FE',
    marginRight: 6,
  },
  cameraDetectText: {
    color: '#00F2FE',
    fontSize: 10,
    fontWeight: '700',
  },
  cameraGuidePill: {
    alignSelf: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 6,
  },
  cameraGuidePillText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '600',
  },
  viewfinderCenterArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  viewfinderBox: {
    width: '85%',
    height: 380,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(0, 242, 254, 0.4)',
    position: 'relative',
    backgroundColor: 'rgba(15, 23, 42, 0.1)',
  },
  cornerBracket: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#00F2FE',
  },
  bracketTopLeft: {
    top: -3,
    left: -3,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  bracketTopRight: {
    top: -3,
    right: -3,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  bracketBottomLeft: {
    bottom: -3,
    left: -3,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  bracketBottomRight: {
    bottom: -3,
    right: -3,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  crosshairCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 24,
    height: 24,
    marginTop: -12,
    marginLeft: -12,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5,
  },
  crosshairH: {
    width: 24,
    height: 1.5,
    backgroundColor: '#00F2FE',
  },
  crosshairV: {
    position: 'absolute',
    height: 24,
    width: 1.5,
    backgroundColor: '#00F2FE',
  },
  liveMetaChipLeft: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.3)',
  },
  liveMetaChipRight: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  liveMetaText: {
    color: '#00F2FE',
    fontSize: 9,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  scannerErrorBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 12,
  },
  scannerErrorText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  cameraBottomDock: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  processingIndicatorPill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.4)',
    marginBottom: 12,
  },
  processingIndicatorText: {
    color: '#00F2FE',
    fontSize: 12,
    fontWeight: '600',
  },
  cameraDockActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  cameraDockSecondaryBtn: {
    alignItems: 'center',
    width: 60,
  },
  cameraDockSecondaryIcon: {
    fontSize: 20,
    color: '#94A3B8',
  },
  cameraDockSecondaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 4,
  },
  shutterOuterRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterMiddleRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: '#2563EB',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInnerDisc: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterCenterDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  cameraDockModeText: {
    color: '#64748B',
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 12,
  },
});
