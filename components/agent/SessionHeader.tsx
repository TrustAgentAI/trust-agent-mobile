import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { Badge } from '../ui/Badge';
import { ConnectionPill } from '../layout/ConnectionPill';
import type { HiredRole } from '../../store/roleStore';
import * as Haptics from 'expo-haptics';

type SessionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

interface SessionHeaderProps {
  role: HiredRole | undefined;
  status: SessionStatus;
}

export function SessionHeader({ role, status }: SessionHeaderProps) {
  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton} accessibilityLabel="Back to dashboard">
        <Text style={styles.backArrow}>{'\u2190'}</Text>
      </TouchableOpacity>

      <View style={styles.titleSection}>
        <Text style={styles.roleName} numberOfLines={1}>
          {role?.roleName ?? 'Agent Session'}
        </Text>
        {role && <Badge variant={role.trustBadge} />}
      </View>

      <View style={styles.statusSection}>
        <ConnectionPill status={status} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 8,
    backgroundColor: colors.darkNavy,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30,111,255,0.2)',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(30,111,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  backArrow: {
    color: colors.electricBlue,
    fontSize: 18,
  },
  titleSection: {
    flex: 1,
    gap: 4,
  },
  roleName: {
    ...typography.h3,
    color: colors.white,
    fontFamily: 'Manrope_700Bold',
  },
  statusSection: {
    marginLeft: 12,
  },
});
