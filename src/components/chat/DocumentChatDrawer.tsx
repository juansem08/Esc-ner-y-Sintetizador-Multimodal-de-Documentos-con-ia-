import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ChatMessage } from '../../types/gemini.types';
import { SuggestedQuestionsBar } from './SuggestedQuestionsBar';

interface DocumentChatDrawerProps {
  visible: boolean;
  messages: ChatMessage[];
  isReplying: boolean;
  chatError: string | null;
  questionInput: string;
  entityCount: number;
  onClose: () => void;
  onClearChat: () => void;
  onChangeQuestionInput: (text: string) => void;
  onSendQuestion: () => void;
}

export const DocumentChatDrawer: React.FC<DocumentChatDrawerProps> = ({
  visible,
  messages,
  isReplying,
  chatError,
  questionInput,
  entityCount,
  onClose,
  onClearChat,
  onChangeQuestionInput,
  onSendQuestion,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [visible, messages, isReplying]);
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.chatModalSafeArea}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
        >
          {/* Header de Chat Stitch */}
          <View style={styles.chatModalHeader}>
            <TouchableOpacity style={styles.headerCircleBtn} onPress={onClose}>
              <Text style={styles.headerIconText}>‹</Text>
            </TouchableOpacity>

            <View style={styles.chatModalCenter}>
              <View style={styles.chatOnlineRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.chatModalTitle}>Chat con Documento</Text>
              </View>
              <Text style={styles.chatModalSubtitle}>DocuSynth AI Activo</Text>
            </View>

            <TouchableOpacity style={styles.headerCircleBtn} onPress={onClearChat}>
              <Text style={styles.headerActionIcon}>🗑️</Text>
            </TouchableOpacity>
          </View>

          {/* Píldora de Contexto Documental */}
          <View style={styles.chatContextPillRow}>
            <View style={styles.chatContextPill}>
              <Text style={styles.chatContextPillText}>
                Basado en: Documento Analizado ({entityCount} entidades)
              </Text>
            </View>
          </View>

          {/* Historial de conversación con burbujas de usuario y modelo */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.chatMessagesScroll}
            contentContainerStyle={styles.chatMessagesContent}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.length === 0 ? (
              <View style={styles.emptyConversationBox}>
                <Text style={styles.emptyConversationTitle}>
                  Asistente Neuronal Listo
                </Text>
                <Text style={styles.emptyConversationDesc}>
                  Puedes preguntar por fechas de vencimiento, cláusulas de penalización, importes o datos fiscales contenidos en el documento.
                </Text>
              </View>
            ) : (
              messages.map((m) => (
                <View
                  key={m.id}
                  style={[
                    styles.messageBubbleWrapper,
                    m.role === 'user' ? styles.userBubbleAlign : styles.modelBubbleAlign,
                  ]}
                >
                  {m.role === 'model' && (
                    <View style={styles.modelAvatarBadge}>
                      <Text style={styles.modelAvatarText}>✦</Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.messageBubble,
                      m.role === 'user' ? styles.userMessageBubble : styles.modelMessageBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        m.role === 'user' ? styles.userMessageText : styles.modelMessageText,
                      ]}
                    >
                      {m.content}
                    </Text>
                  </View>
                </View>
              ))
            )}

            {isReplying && (
              <View style={styles.modelReplyingRow}>
                <View style={styles.modelAvatarBadge}>
                  <Text style={styles.modelAvatarText}>✦</Text>
                </View>
                <View style={styles.modelThinkingBubble}>
                  <ActivityIndicator size="small" color="#2563EB" />
                  <Text style={styles.modelThinkingText}>DocuSynth AI está pensando...</Text>
                </View>
              </View>
            )}

            {chatError && (
              <View style={styles.chatErrorBanner}>
                <Text style={styles.chatErrorBannerText}>{chatError}</Text>
              </View>
            )}
          </ScrollView>

          {/* Barra de preguntas sugeridas */}
          <SuggestedQuestionsBar
            disabled={isReplying}
            onSelectQuestion={(q) => onChangeQuestionInput(q)}
          />

          {/* Input activo de chat modal */}
          <View style={styles.modalInputBar}>
            <TextInput
              style={styles.modalTextInput}
              placeholder="Pregunta algo sobre el documento..."
              placeholderTextColor="#94A3B8"
              value={questionInput}
              onChangeText={onChangeQuestionInput}
              onSubmitEditing={onSendQuestion}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[
                styles.modalSendButton,
                (!questionInput.trim() || isReplying) && styles.modalSendDisabled,
              ]}
              onPress={onSendQuestion}
              disabled={!questionInput.trim() || isReplying}
            >
              <Text style={styles.modalSendIcon}>↑</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  chatModalSafeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  chatModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerIconText: {
    fontSize: 24,
    color: '#0F172A',
    fontWeight: '300',
    lineHeight: 28,
  },
  headerActionIcon: {
    fontSize: 15,
  },
  chatModalCenter: {
    alignItems: 'center',
  },
  chatOnlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  chatModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  chatModalSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  chatContextPillRow: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  chatContextPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  chatContextPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  chatMessagesScroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  chatMessagesContent: {
    paddingVertical: 12,
  },
  emptyConversationBox: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginTop: 40,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyConversationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptyConversationDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  messageBubbleWrapper: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  userBubbleAlign: {
    justifyContent: 'flex-end',
  },
  modelBubbleAlign: {
    justifyContent: 'flex-start',
  },
  modelAvatarBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  modelAvatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '82%',
  },
  userMessageBubble: {
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 4,
  },
  modelMessageBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  modelMessageText: {
    color: '#0F172A',
  },
  modelReplyingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  modelThinkingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  modelThinkingText: {
    color: '#64748B',
    fontSize: 12,
  },
  chatErrorBanner: {
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  chatErrorBannerText: {
    color: '#DC2626',
    fontSize: 12,
  },
  modalInputBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    alignItems: 'center',
  },
  modalTextInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  modalSendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  modalSendDisabled: {
    opacity: 0.4,
  },
  modalSendIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 22,
  },
});
