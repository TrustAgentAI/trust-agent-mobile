import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import * as Haptics from 'expo-haptics';

interface ChatInputProps {
  onSend: (text: string) => void;
  onMicPress: () => void;
  isMicActive: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSend, onMicPress, isMicActive, disabled }: ChatInputProps) {
  const [text, setText] = useState('');

  const handleSend = async () => {
    if (!text.trim() || disabled) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSend(text.trim());
    setText('');
  };

  const handleMic = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onMicPress();
  };

  return (
    <View style={styles.container}>
      {/* Mic button */}
      <TouchableOpacity
        style={[styles.micButton, isMicActive && styles.micButtonActive]}
        onPress={handleMic}
        disabled={disabled}
        accessibilityLabel={isMicActive ? 'Stop voice' : 'Start voice'}
      >
        <Text style={[styles.micIcon, isMicActive && styles.micIconActive]}>
          {isMicActive ? '||' : 'M'}
        </Text>
      </TouchableOpacity>

      {/* Text input */}
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Message your agent..."
        placeholderTextColor={colors.textMuted}
        multiline
        maxLength={2000}
        onSubmitEditing={handleSend}
        editable={!disabled}
        returnKeyType="send"
        enablesReturnKeyAutomatically
      />

      {/* Send button */}
      <TouchableOpacity
        style={[styles.sendButton, (!text.trim() || disabled) && styles.sendButtonDisabled]}
        onPress={handleSend}
        disabled={!text.trim() || disabled}
      >
        <Text style={styles.sendIcon}>{'>'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(30,111,255,0.2)',
    backgroundColor: colors.darkNavy,
    gap: 8,
  },
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.navy2,
    borderWidth: 1,
    borderColor: colors.midBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButtonActive: {
    borderColor: colors.ionCyan,
    backgroundColor: 'rgba(0,212,255,0.1)',
  },
  micIcon: {
    ...typography.mono,
    color: colors.textMuted,
    fontSize: 14,
  },
  micIconActive: {
    color: colors.ionCyan,
  },
  input: {
    flex: 1,
    backgroundColor: colors.navy2,
    borderWidth: 1,
    borderColor: 'rgba(30,111,255,0.25)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.white,
    ...typography.body,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.electricBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: { opacity: 0.3 },
  sendIcon: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
});
