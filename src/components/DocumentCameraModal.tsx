import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useDocumentScanner } from '../hooks/useDocumentScanner';
import { ProcessedDocument } from '../types/scanner.types';
import { CameraTopBar } from './camera/CameraTopBar';
import { ViewfinderOverlay } from './camera/ViewfinderOverlay';
import { CameraControls } from './camera/CameraControls';

interface DocumentCameraModalProps {
  onCaptureCompleted: (document: ProcessedDocument) => void;
  onCancel: () => void;
}

export const DocumentCameraModal: React.FC<DocumentCameraModalProps> = ({
  onCaptureCompleted,
  onCancel,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [flashMode, setFlashMode] = useState<'off' | 'on'>('off');
  const [autoDetect, setAutoDetect] = useState(true);

  // Mantenemos intacto el hook de lógica de captura
  const {
    cameraRef,
    isProcessing,
    error,
    captureAndProcessDocument,
  } = useDocumentScanner();

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.permissionTitle}>Permiso de Cámara Requerido</Text>
        <Text style={styles.permissionSubtitle}>
          DocuSynth requiere acceso a la cámara para capturar y digitalizar el documento.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Habilitar Cámara</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelLink} onPress={onCancel}>
          <Text style={styles.cancelLinkText}>Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleCapture = async () => {
    const doc = await captureAndProcessDocument();
    if (doc) {
      onCaptureCompleted(doc);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={flashMode === 'on'}
      >
        <SafeAreaView style={styles.overlay}>
          {/* Top Bar Modular */}
          <CameraTopBar
            flashMode={flashMode}
            onToggleFlash={() => setFlashMode(flashMode === 'off' ? 'on' : 'off')}
            onClose={onCancel}
          />

          {/* Viewfinder Neón Cyan Modular */}
          <ViewfinderOverlay error={error} />

          {/* Controls Shutter Modular */}
          <CameraControls
            isProcessing={isProcessing}
            autoDetect={autoDetect}
            onCapture={handleCapture}
            onToggleAutoDetect={() => setAutoDetect(!autoDetect)}
          />
        </SafeAreaView>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#000000',
    zIndex: 999,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0A0F1D',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  permissionSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  permissionButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  cancelLink: {
    marginTop: 16,
  },
  cancelLinkText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
});
