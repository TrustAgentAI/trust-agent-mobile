import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import type { AgentMessage } from '../../hooks/useLiveKit';

export function ChatBubble({ message }: { message: AgentMessage }) {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      {!isUser && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>TA</Text>
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAgent]}>
        <Text style={[styles.text, isUser && styles.textUser]}>{message.content}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12, paddingHorizontal: 16 },
  rowUser: { justifyContent: 'flex-end' },
  avatar: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.navy2,
    borderWidth: 1, borderColor: colors.electricBlue,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 8, flexShrink: 0,
  },
  avatarText: { ...typography.monoSm, color: colors.ionCyan, fontSize: 9, fontFamily: 'Manrope_700Bold' },
  bubble: {
    maxWidth: '78%' as any, padding: 12, borderRadius: 16,
  },
  bubbleUser: {
    backgroundColor: colors.electricBlue,
    borderBottomRightRadius: 4,
  },
  bubbleAgent: {
    backgroundColor: colors.navy2,
    borderWidth: 1, borderColor: 'rgba(30,111,255,0.3)',
    borderBottomLeftRadius: 4,
  },
  text: { ...typography.body, color: colors.white, lineHeight: 22 },
  textUser: { color: colors.white },
});
