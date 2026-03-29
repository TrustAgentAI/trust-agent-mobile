import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  Linking, TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { logout } from '../../lib/auth';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';

const APP_VERSION = '1.0.0';

function SettingsRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function SettingsLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.linkRow} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.linkLabel}>{label}</Text>
      <Text style={styles.linkArrow}>{'>'}</Text>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { logout: logoutStore, user } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    logoutStore();
    router.replace('/login');
  };

  const planLabel = {
    free: 'Free',
    pro: 'Pro',
    enterprise: 'Enterprise',
  }[user?.plan ?? 'free'];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        <Text style={styles.pageTitle}>Settings</Text>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingsRow label="Name" value={user?.name || '-'} />
          <SettingsRow label="Email" value={user?.email || '-'} />
          <SettingsRow label="Plan" value={planLabel} />
        </View>

        {/* Subscription */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          <SettingsRow label="Current plan" value={planLabel} />
          <SettingsLink
            label="Manage subscription"
            onPress={() => Linking.openURL('https://app.trust-agent.ai/settings/billing')}
          />
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <SettingsRow label="Language" value="English" />
          <SettingsRow label="Voice input" value="Enabled" />
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <SettingsRow label="App version" value={`v${APP_VERSION}`} />
          <SettingsRow label="Platform" value="Trust Agent Mobile" />
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <SettingsLink
            label="Privacy Policy"
            onPress={() => Linking.openURL('https://trust-agent.ai/privacy')}
          />
          <SettingsLink
            label="Terms of Service"
            onPress={() => Linking.openURL('https://trust-agent.ai/terms')}
          />
          <Text style={styles.legal}>
            AgentCore LTD - Company No. 17114811{'\n'}
            20 Wenlock Road, London, England, N1 7GU
          </Text>
        </View>

        {/* Sign out */}
        <Button
          label="Sign out"
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

  // Section
  section: {
    backgroundColor: colors.navy2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(30,111,255,0.2)',
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.ionCyan,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },

  // Row
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: { ...typography.body, color: colors.textMuted, flex: 1 },
  rowValue: { ...typography.body, color: colors.white, flex: 2, textAlign: 'right' },

  // Link row
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  linkLabel: { ...typography.body, color: colors.electricBlue },
  linkArrow: { fontSize: 16, color: colors.electricBlue, fontFamily: 'Manrope_600SemiBold' },

  // Legal
  legal: { ...typography.bodySm, color: colors.textMuted, lineHeight: 20, marginTop: 4 },

  // Logout
  logoutButton: { marginTop: 8 },
});
