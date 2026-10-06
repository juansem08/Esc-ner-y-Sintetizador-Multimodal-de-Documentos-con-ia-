import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

interface ExecutiveSummaryCardProps {
  bullets: string[];
  onRescan: () => void;
}

export const ExecutiveSummaryCard: React.FC<ExecutiveSummaryCardProps> = ({
  bullets,
  onRescan,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionTitleWithIcon}>
          <Text style={styles.sectionIcon}>📄</Text>
          <Text style={styles.sectionHeadingText}>RESUMEN EJECUTIVO</Text>
        </View>
        <TouchableOpacity onPress={onRescan}>
          <Text style={styles.sectionLinkText}>Re-escanear</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardContainer}>
        {bullets.map((punto, index) => {
          const parts = punto.split(':');
          const hasTitle = parts.length > 1;
          const itemTitle = hasTitle ? parts[0] + ':' : '';
          const itemDesc = hasTitle ? parts.slice(1).join(':') : punto;

          return (
            <View
              key={`summary-bullet-${index}`}
              style={[
                styles.summaryBulletRow,
                index !== bullets.length - 1 && styles.summaryBorderBottom,
              ]}
            >
              <View style={styles.bulletCheckCircle}>
                <Text style={styles.bulletCheckMark}>✓</Text>
              </View>
              <View style={styles.bulletTextContainer}>
                <Text style={styles.bulletBodyText}>
                  {hasTitle && <Text style={styles.bulletTitleBold}>{itemTitle} </Text>}
                  {itemDesc.trim()}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
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
  sectionLinkText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryBulletRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    alignItems: 'flex-start',
  },
  summaryBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  bulletCheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  bulletCheckMark: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: 'bold',
  },
  bulletTextContainer: {
    flex: 1,
  },
  bulletBodyText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#334155',
  },
  bulletTitleBold: {
    fontWeight: '700',
    color: '#0F172A',
  },
});
