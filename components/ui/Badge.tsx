import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';

type BadgeVariant = 'PLATINUM' | 'GOLD' | 'SILVER' | 'BASIC';

const badgeConfig: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  PLATINUM: { bg: 'rgba(0,212,255,0.12)', text: colors.ionCyan,      border: colors.ionCyan },
  GOLD:     { bg: 'rgba(255,183,64,0.12)', text: '#FFB740',           border: '#FFB740' },
  SILVER:   { bg: 'rgba(192,200,216,0.12)', text: '#C0C8D8',          border: '#C0C8D8' },
  BASIC:    { bg: 'rgba(136,153,187,0.12)', text: colors.textMuted,   border: colors.textMuted },
};

export function Badge({ variant }: { variant: BadgeVariant }) {
  const cfg = badgeConfig[variant];
  return (
    <View style={[styles.container, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      <Text style={[styles.text, { color: cfg.text }]}>{variant} VERIFIED</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.monoSm,
    fontFamily: 'Manrope_700Bold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
});
