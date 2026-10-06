import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';

interface SuggestedQuestionsBarProps {
  onSelectQuestion: (question: string) => void;
  disabled?: boolean;
}

const DEFAULT_SUGGESTIONS = [
  '¿Cuál es el monto total?',
  '¿Cuáles son las fechas clave?',
  '¿Quiénes son los involucrados?',
  '¿Hay cláusulas de penalización?',
  'Resumen de obligaciones',
];

export const SuggestedQuestionsBar: React.FC<SuggestedQuestionsBarProps> = ({
  onSelectQuestion,
  disabled = false,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.headerLabel}>Sugerencias rápidas:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {DEFAULT_SUGGESTIONS.map((suggestion, index) => (
          <TouchableOpacity
            key={`sug-${index}`}
            style={[styles.chip, disabled && styles.chipDisabled]}
            disabled={disabled}
            onPress={() => onSelectQuestion(suggestion)}
          >
            <Text style={styles.chipText}>{suggestion}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    paddingHorizontal: 16,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  scrollContent: {
    paddingHorizontal: 14,
    gap: 8,
  },
  chip: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipDisabled: {
    opacity: 0.5,
  },
  chipText: {
    fontSize: 12,
    color: '#1D4ED8',
    fontWeight: '600',
  },
});
