import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../constants/colors';

interface CardProps {
  children: React.ReactNode;
  variant?: 'dark' | 'light';
  style?: ViewStyle;
}

export function Card({ children, variant = 'dark', style }: CardProps) {
  return (
    <View style={[styles.base, variant === 'dark' ? styles.dark : styles.light, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 8, padding: 16, borderWidth: 1 },
  dark: { backgroundColor: colors.navy2, borderColor: 'rgba(30,111,255,0.3)' },
  light: { backgroundColor: colors.white, borderColor: colors.borderBlue },
});
