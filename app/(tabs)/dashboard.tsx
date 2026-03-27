import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { RoleCard } from '../../components/agent/RoleCard';
import { Button } from '../../components/ui/Button';
import { useRoleStore } from '../../store/roleStore';
import { useSessionStore } from '../../store/sessionStore';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';

export default function DashboardScreen() {
  const { roles } = useRoleStore();
  const { setActiveRole } = useSessionStore();

  const handleRolePress = (hireId: string) => {
    setActiveRole(hireId);
    router.push('/(tabs)/session');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.accentBar} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        <View style={styles.header}>
          <Text style={styles.title}>Your Roles</Text>
          <Text style={styles.sub}>{roles.length} hired - trust-agent.ai</Text>
        </View>

        {roles.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>⬡</Text>
            <Text style={styles.emptyTitle}>No roles hired yet</Text>
            <Text style={styles.emptySub}>Browse the Trust Agent marketplace to hire your first AI role.</Text>
            <Button
              label="Browse Marketplace"
              onPress={() => router.push('/(tabs)/marketplace')}
              variant="secondary"
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
  accentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: colors.electricBlue, zIndex: 10 },
  scroll: { flex: 1 },
  content: { padding: 24, paddingLeft: 28, paddingBottom: 48 },
  header: { marginBottom: 28 },
  title: { ...typography.h1, color: colors.white, marginBottom: 4 },
  sub: { ...typography.mono, color: colors.textMuted, fontSize: 12 },
  roleList: { gap: 0 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyIcon: { fontSize: 56, color: colors.midBlue },
  emptyTitle: { ...typography.h2, color: colors.white },
  emptySub: { ...typography.body, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  emptyButton: { marginTop: 8, alignSelf: 'stretch' },
});
