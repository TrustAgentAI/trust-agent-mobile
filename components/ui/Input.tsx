import React from 'react';
import { TextInput, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';

interface InputProps {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  monospace?: boolean;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  style?: ViewStyle;
  returnKeyType?: 'done' | 'send' | 'next';
  onSubmitEditing?: () => void;
  editable?: boolean;
}

export function Input({
  value, onChangeText, placeholder, monospace, secureTextEntry,
  autoCapitalize = 'none', autoCorrect = false, style,
  returnKeyType, onSubmitEditing, editable = true,
}: InputProps) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      secureTextEntry={secureTextEntry}
      autoCapitalize={autoCapitalize}
      autoCorrect={autoCorrect}
      returnKeyType={returnKeyType}
      onSubmitEditing={onSubmitEditing}
      editable={editable}
      style={[
        styles.input,
        monospace && styles.mono,
        !editable && styles.disabled,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.navy2,
    borderWidth: 1,
    borderColor: colors.borderBlue,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.white,
    ...typography.body,
    fontSize: 15,
  } as TextStyle,
  mono: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 13 } as TextStyle,
  disabled: { opacity: 0.5 } as ViewStyle,
});
