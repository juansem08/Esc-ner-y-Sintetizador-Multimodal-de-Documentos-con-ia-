import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

interface ViewfinderOverlayProps {
  error?: string | null;
}

export const ViewfinderOverlay: React.FC<ViewfinderOverlayProps> = ({ error }) => {
  return (
    <View style={styles.viewfinderWrapper}>
      <View style={styles.viewfinder}>
        {/* Esquinas Neón Cyan de Stitch */}
        <View style={[styles.cornerBracket, styles.topLeftBracket]} />
        <View style={[styles.cornerBracket, styles.topRightBracket]} />
        <View style={[styles.cornerBracket, styles.bottomLeftBracket]} />
        <View style={[styles.cornerBracket, styles.bottomRightBracket]} />

        {/* Badges superiores de nitidez y estado OCR */}
        <View style={styles.viewfinderTopTags}>
          <View style={styles.tagPill}>
            <Text style={styles.tagText}>⚡ OCR ACTIVO</Text>
          </View>
          <View style={[styles.tagPill, styles.tagPillGreen]}>
            <Text style={[styles.tagText, styles.tagTextGreen]}>● 99.4% NITIDEZ</Text>
          </View>
        </View>

        {/* Líneas guía de silueta de documento */}
        <View style={styles.documentGhostLines}>
          <View style={styles.ghostLine} />
          <View style={styles.ghostLine} />
          <View style={[styles.ghostLine, { width: '60%' }]} />
        </View>
      </View>

      {/* Indicadores de alineación */}
      <View style={styles.hintContainer}>
        <Text style={styles.hintTitle}>Alinea los bordes del documento</Text>
        <View style={styles.subHintBadge}>
          <Text style={styles.subHintText}>✦ Detección automática de bordes activa</Text>
        </View>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  viewfinderWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinder: {
    width: '84%',
    aspectRatio: 0.7,
    borderRadius: 20,
    position: 'relative',
    backgroundColor: 'rgba(15, 23, 42, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.2)',
  },
  cornerBracket: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#00F2FE',
  },
  topLeftBracket: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 18,
  },
  topRightBracket: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 18,
  },
  bottomLeftBracket: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 18,
  },
  bottomRightBracket: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 18,
  },
  viewfinderTopTags: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  tagPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tagPillGreen: {
    borderColor: 'rgba(52, 211, 153, 0.4)',
  },
  tagText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tagTextGreen: {
    color: '#34D399',
  },
  documentGhostLines: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    gap: 8,
  },
  ghostLine: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 2,
    width: '100%',
  },
  hintContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  hintTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowRadius: 4,
  },
  subHintBadge: {
    marginTop: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.3)',
  },
  subHintText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '500',
  },
  errorBox: {
    marginTop: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
});
