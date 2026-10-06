import { useState, useRef, useCallback } from 'react';
import { CameraView } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { ProcessedDocument } from '../types/scanner.types';

export function useDocumentScanner() {
  const cameraRef = useRef<CameraView>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDocument, setLastDocument] = useState<ProcessedDocument | null>(null);

  /**
   * Captura la fotografía, la comprime con expo-image-manipulator
   * y obtiene la codificación Base64 vía expo-file-system.
   */
  const captureAndProcessDocument = useCallback(async (): Promise<ProcessedDocument | null> => {
    if (!cameraRef.current) {
      setError('Cámara no inicializada.');
      return null;
    }

    try {
      setIsProcessing(true);
      setError(null);

      // 1. Capturar imagen desde la cámara
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        skipProcessing: false,
      });

      if (!photo?.uri) {
        throw new Error('No se pudo obtener el URI de la fotografía capturada.');
      }

      // 2. Optimización y compresión mediante expo-image-manipulator
      // Redimensionamos manteniendo relación de aspecto a un ancho óptimo (ej. 1600px) y comprimimos a 0.75
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 1600 } }],
        {
          compress: 0.75,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      // 3. Conversión a Base64 con expo-file-system
      const base64Data = await FileSystem.readAsStringAsync(manipulatedImage.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const processed: ProcessedDocument = {
        uri: manipulatedImage.uri,
        base64: base64Data,
        width: manipulatedImage.width,
        height: manipulatedImage.height,
      };

      setLastDocument(processed);
      return processed;
    } catch (err: any) {
      const errorMsg = err?.message || 'Error procesando la captura del documento.';
      setError(errorMsg);
      console.error('[DocuSynth][useDocumentScanner]', err);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const resetScanner = useCallback(() => {
    setLastDocument(null);
    setError(null);
    setIsProcessing(false);
  }, []);

  return {
    cameraRef,
    isProcessing,
    error,
    lastDocument,
    captureAndProcessDocument,
    resetScanner,
  };
}
