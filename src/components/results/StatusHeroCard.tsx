import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

interface StatusHeroCardProps {
  summaryCount: number;
  entityCount: number;
}

export const StatusHeroCard: React.FC<StatusHeroCardProps> = ({
  summaryCount,
  entityCount,
}) => {
  return (
    <View style={styles.heroStatusCard}>
      <View style={styles.heroBadgeRow}>
        <View style={styles.heroBadgeLeft}>
          <Text style={styles.heroBadgeIcon}>⚡</Text>
          <Text style={styles.heroBadgeText}>Escaneo-OCR Multimodal 99.4%</Text>
        </View>
        <View style={styles.heroBadgeRight}>
          <Text style={styles.heroBadgeRightText}>Listo</Text>
        </View>
      </View>

      <Text style={styles.heroCardTitle}>Análisis Inteligente Completado</Text>
      <Text style={styles.heroCardSubtitle}>
        {summaryCount} cláusulas clave y {entityCount} entidades detectadas
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  heroStatusCard: {
    backgroundColor: '#2563EB',
    borderRadius: 20,
    padding: 20,
    marginVertical: 12,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroBadgeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  heroBadgeIcon: {
    fontSize: 12,
    marginRight: 6,
    color: '#FFFFFF',
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  heroBadgeRight: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heroBadgeRightText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '700',
  },
  heroCardTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  heroCardSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    lineHeight: 18,
  },
});
