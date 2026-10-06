# DocuSynth 📄⚡

DocuSynth es un escáner multimodal de documentos impulsado por **React Native**, **Expo**, **TypeScript** y el SDK oficial **`@google/genai`** (Gemini 1.5 Flash).

## 🚀 Características
- **Captura Inteligente**: Encuadre visual para documentos A4/Carta con `expo-camera`.
- **Pipeline de Optimización**: Redimensión y compresión con `expo-image-manipulator` y codificación Base64 eficiente con `expo-file-system`.
- **Extracción Estructurada con IA**: Respuestas garantizadas en formato JSON estructurado (`responseSchema`) con resumen ejecutivo, entidades clave y contexto documental.
- **Chat Contextual Q&A**: Asistente interactivo con memoria conversacional y directiva de sistema basada exclusivamente en el documento escaneado.

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
