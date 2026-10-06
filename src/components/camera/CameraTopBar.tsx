import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

interface CameraTopBarProps {
  flashMode: 'off' | 'on';
  onToggleFlash: () => void;
  onClose: () => void;
}

export const CameraTopBar: React.FC<CameraTopBarProps> = ({
  flashMode,
  onToggleFlash,
  onClose,
}) => {
  return (
    <View style={styles.topBar}>
      <TouchableOpacity style={styles.circularBtn} onPress={onClose}>
        <Text style={styles.circularBtnText}>✕</Text>
      </TouchableOpacity>

      <View style={styles.focusingBadge}>
        <View style={styles.pulsingDot} />
        <Text style={styles.focusingText}>Enfocando Documento</Text>
      </View>

      <TouchableOpacity
        style={[styles.circularBtn, flashMode === 'on' && styles.circularBtnActive]}
        onPress={onToggleFlash}
      >
        <Text style={styles.circularBtnText}>{flashMode === 'on' ? '⚡' : '💡'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  circularBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  circularBtnActive: {
    backgroundColor: '#2563EB',
  },
  circularBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  focusingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00F2FE',
    marginRight: 8,
  },
  focusingText: {
    color: '#E0F2FE',
    fontSize: 13,
    fontWeight: '600',
  },
});
