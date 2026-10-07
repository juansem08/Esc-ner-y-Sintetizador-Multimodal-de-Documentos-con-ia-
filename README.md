# DocuSynth 📄⚡

DocuSynth es un escáner multimodal de documentos impulsado por **React Native**, **Expo**, **TypeScript** y el SDK oficial **`@google/genai`** (Gemini 1.5 Flash).

---

## 🏗️ Flujo de Arquitectura Multimodal

```text
  [ Captura de Cámara ] (expo-camera)
            │
            ▼
  [ Pipeline de Optimización ] (expo-image-manipulator: 1600px, 75% JPEG)
            │
            ▼
  [ Conversión Base64 ] (expo-file-system)
            │
            ▼
  [ Validación de Integridad ] (documentValidator: límite 10MB, payload)
            │
            ▼
  [ Gemini 1.5 Flash ] (@google/genai con responseSchema estructurado)
      ├── Resumen Ejecutivo
      ├── Entidades Clave (Campos & Valores)
      └── Contexto Documental
            │
            ▼
  [ Presentación & Q&A ]
      ├── StatusHeroCard & ExecutiveSummaryCard
      ├── ExtractedDataGrid (con filtrado y búsqueda en tiempo real)
      └── DocumentChatSession (Q&A con directiva de sistema restringida)
```

---

## 🚀 Características
- **Captura Inteligente**: Encuadre visual para documentos A4/Carta con `expo-camera`.
- **Pipeline de Optimización**: Redimensión y compresión con `expo-image-manipulator` y codificación Base64 eficiente con `expo-file-system`.
- **Validación Robusta**: Verificación de tamaño y formato con `documentValidator` antes del envío a la API.
- **Extracción Estructurada con IA**: Respuestas garantizadas en formato JSON estructurado (`responseSchema`) con resumen ejecutivo, entidades clave y contexto documental.
- **Plantillas Especializadas**: Soporte por categoría para facturas, contratos, tickets de compra, recibos y credenciales.
- **Chat Contextual Q&A**: Asistente interactivo con memoria conversacional, sugerencias rápidas de preguntas y directiva de sistema basada exclusivamente en el documento.
- **Historial en Memoria**: Registro de documentos escaneados con `historyService`.
- **Exportación Estructurada**: Formateo a Markdown y texto plano con `exportFormatter`.

---

## 📁 Estructura del Proyecto

```text
src/
├── components/
│   ├── camera/          # ViewfinderOverlay, CameraControls, CameraTopBar
│   ├── chat/            # FloatingChatBar, DocumentChatDrawer, SuggestedQuestionsBar
│   ├── results/         # StatusHeroCard, ExecutiveSummaryCard, ExtractedDataGrid, ErrorBanner
│   └── DocumentCameraModal.tsx
├── hooks/
│   ├── useDocumentScanner.ts  # Captura, compresión y codificación
│   └── useDocumentChat.ts     # Sesión y reactividad del chat
├── screens/
│   └── DocuSynthScreen.tsx    # Pantalla principal integradora
├── services/
│   ├── geminiService.ts       # Extracción con Schema estructurado y plantillas
│   ├── chatService.ts         # Q&A contextualizado (RAG in-memory)
│   └── historyService.ts      # Historial local de documentos analizados
├── theme/
│   └── stitchTheme.ts         # Tokens de diseño y paletas dinámicas
├── types/
│   ├── gemini.types.ts
│   ├── scanner.types.ts
│   ├── stitch.types.ts
│   └── history.types.ts
└── utils/
    ├── documentValidator.ts   # Validación de payload Base64 y dimensiones
    └── exportFormatter.ts     # Formateador a Markdown / texto plano
```

---

## 🛠️ Instalación y Configuración

1. Clona el repositorio e instala las dependencias:
```bash
npm install
```

2. Configura las variables de entorno:
```bash
cp .env.example .env
```
Añade tu clave `EXPO_PUBLIC_GEMINI_API_KEY`.

3. Inicia la aplicación con Expo:
```bash
npx expo start
```
