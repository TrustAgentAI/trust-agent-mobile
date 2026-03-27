import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import * as Haptics from 'expo-haptics';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ label, onPress, variant = 'primary', size = 'md', loading, disabled, style }: ButtonProps) {
  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const isDisabled = disabled || loading;

  const containerStyle = [
    styles.base,
    styles[variant],
    styles[size],
    isDisabled && styles.disabled,
    style,
  ];

  return (
    <TouchableOpacity style={containerStyle} onPress={handlePress} disabled={isDisabled} activeOpacity={0.75}>
      {loading
        ? <ActivityIndicator color={variant === 'primary' ? colors.white : colors.electricBlue} size="small" />
        : <Text style={[styles.label, styles[`label_${variant}` as keyof typeof styles], styles[`label_${size}` as keyof typeof styles]]}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: colors.electricBlue },
  secondary: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.electricBlue },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.error },
  disabled: { opacity: 0.4 },
  sm: { paddingVertical: 8, paddingHorizontal: 16 },
  md: { paddingVertical: 12, paddingHorizontal: 24 },
  lg: { paddingVertical: 16, paddingHorizontal: 32 },
  label: { ...typography.body, fontFamily: 'Manrope_600SemiBold' },
  label_primary: { color: colors.white },
  label_secondary: { color: colors.electricBlue },
  label_ghost: { color: colors.textMuted },
  label_danger: { color: colors.white },
  label_sm: { fontSize: 13 },
  label_md: { fontSize: 15 },
  label_lg: { fontSize: 17 },
});
