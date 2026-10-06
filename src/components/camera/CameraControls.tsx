import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

interface CameraControlsProps {
  isProcessing: boolean;
  autoDetect: boolean;
  processingLabel?: string;
  onCapture: () => void;
  onToggleAutoDetect: () => void;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  isProcessing,
  autoDetect,
  processingLabel,
  onCapture,
  onToggleAutoDetect,
}) => {
  return (
    <View style={styles.container}>
      {isProcessing && (
        <View style={styles.processingPill}>
          <ActivityIndicator color="#00F2FE" size="small" style={{ marginRight: 8 }} />
          <Text style={styles.processingPillText}>
            {processingLabel || 'Digitalizando y optimizando documento...'}
          </Text>
        </View>
      )}

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.secondaryActionBtn}>
          <Text style={styles.secondaryActionIcon}>🖼️</Text>
        </TouchableOpacity>

        {/* Botón de captura central con doble aro neón */}
        <TouchableOpacity
          style={[styles.shutterOuterRing, isProcessing && styles.shutterDisabled]}
          onPress={onCapture}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#00F2FE" size="large" />
          ) : (
            <View style={styles.shutterInnerCircle} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.autoModeBtn, autoDetect && styles.autoModeBtnActive]}
          onPress={onToggleAutoDetect}
        >
          <Text style={[styles.autoModeText, autoDetect && styles.autoModeTextActive]}>
            AUTO
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  processingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.4)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  processingPillText: {
    color: '#E0F2FE',
    fontSize: 12,
    fontWeight: '600',
  },
  bottomBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 36,
    paddingHorizontal: 20,
  },
  secondaryActionBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  secondaryActionIcon: {
    fontSize: 20,
  },
  shutterOuterRing: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 4,
    borderColor: '#00F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 242, 254, 0.15)',
  },
  shutterDisabled: {
    opacity: 0.6,
  },
  shutterInnerCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#FFFFFF',
  },
  autoModeBtn: {
    width: 52,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  autoModeBtnActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.3)',
    borderColor: '#38BDF8',
  },
  autoModeText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  autoModeTextActive: {
    color: '#38BDF8',
  },
});
