import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { Badge } from '../ui/Badge';
import type { HiredRole } from '../../store/roleStore';
import * as Haptics from 'expo-haptics';

interface RoleCardProps {
  role: HiredRole;
  onPress: () => void;
}

export function RoleCard({ role, onPress }: RoleCardProps) {
  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.8}>
      <View style={styles.left}>
        {/* Shield avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {role.roleName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
          </Text>
        </View>
      </View>
      <View style={styles.middle}>
        <Text style={styles.roleName}>{role.roleName}</Text>
        <Text style={styles.category}>{role.roleCategory}</Text>
        <Badge variant={role.trustBadge} />
      </View>
      <View style={styles.right}>
        <Text style={styles.score}>{role.trustScore}</Text>
        <Text style={styles.scoreLabel}>Score</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.navy2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(30,111,255,0.25)',
    padding: 16,
    marginBottom: 12,
  },
  left: { marginRight: 14 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.midBlue,
    borderWidth: 1.5,
    borderColor: colors.electricBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...typography.h3, color: colors.ionCyan, fontSize: 16 },
  middle: { flex: 1, gap: 4 },
  roleName: { ...typography.h3, color: colors.white, fontSize: 16 },
  category: { ...typography.bodySm, color: colors.textMuted },
  right: { alignItems: 'center' },
  score: { ...typography.h2, color: colors.ionCyan, fontSize: 24 },
  scoreLabel: { ...typography.monoSm, color: colors.textMuted, marginTop: 2 },
});
