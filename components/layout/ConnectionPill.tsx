import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';

type Status = 'connected' | 'connecting' | 'disconnected' | 'error' | 'idle';

const statusConfig: Record<Status, { color: string; label: string }> = {
  connected:    { color: colors.success,       label: 'Connected' },
  connecting:   { color: '#FFB740',             label: 'Connecting...' },
  disconnected: { color: colors.textMuted,      label: 'Disconnected' },
  error:        { color: colors.error,          label: 'Error' },
  idle:         { color: colors.textMuted,      label: 'Not started' },
};

export function ConnectionPill({ status }: { status: Status }) {
  const cfg = statusConfig[status];
  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: cfg.color }]} />
      <Text style={[styles.label, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.navy2,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
  label: { ...typography.monoSm, fontSize: 11 },
});
