import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { EntidadClave } from '../../types/gemini.types';
import { StitchTheme } from '../../theme/stitchTheme';

interface ExtractedDataGridProps {
  entities: EntidadClave[];
}

export const ExtractedDataGrid: React.FC<ExtractedDataGridProps> = ({ entities }) => {
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionTitleWithIcon}>
          <Text style={styles.sectionIcon}>🗂️</Text>
          <Text style={styles.sectionHeadingText}>DATOS EXTRAÍDOS</Text>
        </View>
        <Text style={styles.sectionSubCount}>{entities.length} campos validados</Text>
      </View>

      <View style={styles.entityGrid}>
        {entities.map((item, index) => {
          const styleConfig =
            StitchTheme.cardPalette[index % StitchTheme.cardPalette.length];

          return (
            <View
              key={`extracted-data-${index}`}
              style={[
                styles.entityCard,
                { backgroundColor: styleConfig.bg, borderColor: styleConfig.border },
              ]}
            >
              <View style={styles.entityCardTop}>
                <View
                  style={[styles.entityIconCircle, { backgroundColor: styleConfig.iconBg }]}
                >
                  <Text style={styles.entityIconEmoji}>
                    {styleConfig.defaultIcon}
                  </Text>
                </View>
                <View
                  style={[
                    styles.entityPillBadge,
                    { backgroundColor: styleConfig.badgeBg },
                  ]}
                >
                  <Text
                    style={[
                      styles.entityPillBadgeText,
                      { color: styleConfig.badgeText },
                    ]}
                  >
                    {styleConfig.badge}
                  </Text>
                </View>
              </View>

              <Text style={styles.entityFieldLabel} numberOfLines={1}>
                {item.campo}
              </Text>
              <Text style={styles.entityFieldValue} numberOfLines={2}>
                {item.valor}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 22,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    fontSize: 15,
    marginRight: 6,
  },
  sectionHeadingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
  },
  sectionSubCount: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  entityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  entityCard: {
    width: '48%',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
  },
  entityCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  entityIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  entityIconEmoji: {
    fontSize: 13,
  },
  entityPillBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  entityPillBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  entityFieldLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
  },
  entityFieldValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
});
