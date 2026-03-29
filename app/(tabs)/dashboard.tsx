import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { RoleCard } from '../../components/agent/RoleCard';
import { Button } from '../../components/ui/Button';
import { useRoleStore } from '../../store/roleStore';
import { useAuthStore } from '../../store/authStore';
import { useSessionStore } from '../../store/sessionStore';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';

export default function DashboardScreen() {
  const { roles } = useRoleStore();
  const { user } = useAuthStore();
  const { setActiveRole } = useSessionStore();

  const handleRolePress = (hireId: string) => {
    setActiveRole(hireId);
    router.push('/(tabs)/session');
  };

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>Welcome back, {firstName}</Text>
          <Text style={styles.greetingSub}>
            {roles.length > 0
              ? `You have ${roles.length} role${roles.length === 1 ? '' : 's'} ready`
              : 'Get started by hiring your first AI role'}
          </Text>
        </View>

        {/* Quick actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push('/(tabs)/marketplace')}
            activeOpacity={0.8}
          >
            <Text style={styles.quickActionIcon}>+</Text>
            <Text style={styles.quickActionLabel}>Browse{'\n'}Roles</Text>
          </TouchableOpacity>

          {roles.length > 0 && (
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => {
                setActiveRole(roles[0].hireId);
                router.push('/(tabs)/session');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.quickActionIcon}>{'>'}</Text>
              <Text style={styles.quickActionLabel}>Start{'\n'}Session</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Role list */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Roles</Text>
          {roles.length > 0 && (
            <Text style={styles.sectionCount}>{roles.length}</Text>
          )}
        </View>

        {roles.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <Text style={styles.emptyIcon}>+</Text>
            </View>
            <Text style={styles.emptyTitle}>No roles hired yet</Text>
            <Text style={styles.emptySub}>
              Browse the marketplace to find AI roles for your team - from marketing to engineering.
            </Text>
            <Button
              label="Browse Marketplace"
              onPress={() => router.push('/(tabs)/marketplace')}
              variant="primary"
              style={styles.emptyButton}
            />
          </View>
        ) : (
          <View style={styles.roleList}>
            {roles.map(role => (
              <RoleCard key={role.hireId} role={role} onPress={() => handleRolePress(role.hireId)} />
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.darkNavy },
  scroll: { flex: 1 },
  content: { padding: 24, paddingBottom: 48 },

  // Greeting
  greeting: { marginBottom: 24 },
  greetingText: { ...typography.h1, color: colors.white, marginBottom: 4 },
  greetingSub: { ...typography.body, color: colors.textMuted },

  // Quick actions
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.navy2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(30,111,255,0.25)',
    padding: 16,
    gap: 12,
  },
  quickActionIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.electricBlue,
    color: colors.white,
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 40,
    fontFamily: 'Manrope_700Bold',
    overflow: 'hidden',
  },
  quickActionLabel: { ...typography.bodySm, color: colors.white, fontFamily: 'Manrope_600SemiBold' },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { ...typography.h3, color: colors.white },
  sectionCount: {
    ...typography.label,
    color: colors.ionCyan,
    backgroundColor: 'rgba(0,212,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },

  // Role list
  roleList: { gap: 0 },

  // Empty state
  empty: { alignItems: 'center', paddingTop: 40, gap: 12 },
  emptyIconWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.navy2,
    borderWidth: 1.5,
    borderColor: 'rgba(30,111,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyIcon: { fontSize: 28, color: colors.electricBlue, fontFamily: 'Manrope_700Bold' },
  emptyTitle: { ...typography.h2, color: colors.white },
  emptySub: { ...typography.body, color: colors.textMuted, textAlign: 'center', lineHeight: 22, paddingHorizontal: 16 },
  emptyButton: { marginTop: 8, alignSelf: 'stretch' },
});
