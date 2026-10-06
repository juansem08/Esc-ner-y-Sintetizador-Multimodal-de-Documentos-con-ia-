import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

interface FloatingChatBarProps {
  onPress: () => void;
}

export const FloatingChatBar: React.FC<FloatingChatBarProps> = ({ onPress }) => {
  return (
    <View style={styles.floatingChatBarWrapper}>
      <TouchableOpacity
        style={styles.floatingChatBar}
        activeOpacity={0.9}
        onPress={onPress}
      >
        <Text style={styles.micIcon}>🎙️</Text>
        <Text style={styles.floatingChatPlaceholder}>
          Haz una pregunta sobre el documento...
        </Text>
        <View style={styles.sendIconCircle}>
          <Text style={styles.sendIconArrow}>↑</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingChatBarWrapper: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
  },
  floatingChatBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  micIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  floatingChatPlaceholder: {
    flex: 1,
    color: '#64748B',
    fontSize: 13,
  },
  sendIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIconArrow: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 18,
  },
});
