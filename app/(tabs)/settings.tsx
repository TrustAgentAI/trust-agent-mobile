import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Linking } from 'react-native';
import { router } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { logout } from '../../lib/auth';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';

export default function SettingsScreen() {
  const { logout: logoutStore, token } = useAuthStore();
  const maskedToken = token ? token.slice(0, 12) + '...' : '-';

  const handleLogout = async () => {
    await logout();
    logoutStore();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        <Text style={styles.pageTitle}>Settings</Text>

        {/* Connection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connection</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Gateway</Text>
            <Text style={styles.rowValue}>{process.env.EXPO_PUBLIC_API_URL}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Session token</Text>
            <Text style={styles.rowValueMono}>{maskedToken}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>LiveKit server</Text>
            <Text style={styles.rowValue}>{process.env.EXPO_PUBLIC_LIVEKIT_URL ?? 'Not configured'}</Text>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Version</Text>
            <Text style={styles.rowValueMono}>v{process.env.EXPO_PUBLIC_APP_VERSION}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Platform</Text>
            <Text style={styles.rowValue}>Trust Agent Mobile</Text>
          </View>
          <Button
            label="View on GitHub"
            onPress={() => Linking.openURL('https://github.com/TrustAgentAI/trust-agent-mobile')}
            variant="ghost"
            style={styles.linkButton}
          />
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <Text style={styles.legal}>
            AgentCore LTD - Company No. 17114811{'\n'}
            20 Wenlock Road, London, England, N1 7GU{'\n'}
            info@trust-agent.ai
          </Text>
        </View>

        {/* Sign out */}
        <Button
          label="Disconnect"
          onPress={handleLogout}
          variant="danger"
          style={styles.logoutButton}
        />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.darkNavy },
  scroll: { flex: 1 },
  content: { padding: 24, gap: 8, paddingBottom: 48 },
  pageTitle: { ...typography.h1, color: colors.white, marginBottom: 24 },
  section: {
    backgroundColor: colors.navy2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(30,111,255,0.2)',
    padding: 16,
    marginBottom: 16,
    gap: 10,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.ionCyan,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { ...typography.body, color: colors.textMuted, flex: 1 },
  rowValue: { ...typography.body, color: colors.white, flex: 2, textAlign: 'right' },
  rowValueMono: { ...typography.mono, color: colors.ionCyan, flex: 2, textAlign: 'right', fontSize: 12 },
  linkButton: { marginTop: 4 },
  legal: { ...typography.bodySm, color: colors.textMuted, lineHeight: 20 },
  logoutButton: { marginTop: 8 },
});
