import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { loginWithApiKey } from '../lib/auth';
import { useAuthStore } from '../store/authStore';
import { useRoleStore } from '../store/roleStore';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';

export default function LoginScreen() {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuthStore();
  const { loadRoles } = useRoleStore();

  const handleLogin = async () => {
    if (!apiKey.trim()) { setError('Please enter your API key.'); return; }
    setLoading(true);
    setError(null);
    try {
      const result = await loginWithApiKey(apiKey.trim());
      login(result.token, result.userId);
      await loadRoles();
      router.replace('/(tabs)/dashboard');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Left accent bar */}
        <View style={styles.accentBar} />

        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={styles.shield}>
            <Text style={styles.shieldText}>TA</Text>
          </View>
          <Text style={styles.brand}>
            <Text style={styles.brandWhite}>Trust </Text>
            <Text style={styles.brandBlue}>Agent</Text>
          </Text>
          <Text style={styles.version}>Mobile v1.0</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.heading}>Connect your workspace</Text>
          <Text style={styles.sub}>Enter the API key from your Trust Agent account to access your hired roles.</Text>

          <View style={styles.inputWrap}>
            <Text style={styles.label}>API Key</Text>
            <View style={[styles.inputBox, error ? styles.inputBoxError : null]}>
              <Text style={styles.inputPrefix}>ta_live_</Text>
              <View style={styles.divider} />
              <Text
                style={styles.inputField}
                numberOfLines={1}
              >
                {apiKey.replace(/^ta_live_/i, '') || ' '}
              </Text>
            </View>
            {/* Actual input layered behind */}
            <Input
              value={apiKey}
              onChangeText={(v) => { setApiKey(v); setError(null); }}
              placeholder="ta_live_xxxxxxxxxxxxxxxxxxxxxxxx"
              monospace
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.hiddenInput}
            />
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <Button
            label={loading ? 'Connecting...' : 'Connect'}
            onPress={handleLogin}
            loading={loading}
            disabled={!apiKey.trim()}
            style={styles.button}
          />

          {__DEV__ && (
            <Button
              label="Dev mode (skip login)"
              onPress={() => { setApiKey('ta_dev_preview'); handleLogin(); }}
              variant="ghost"
              style={styles.devButton}
            />
          )}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          AgentCore LTD, Company No. 17114811
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.darkNavy },
  container: { flexGrow: 1, padding: 28, paddingTop: 80 },
  accentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: colors.electricBlue },
  logoSection: { alignItems: 'center', marginBottom: 48, gap: 10 },
  shield: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.navy2,
    borderWidth: 2, borderColor: colors.electricBlue,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  shieldText: { ...typography.h2, color: colors.ionCyan, fontSize: 22 },
  brand: { ...typography.display, fontSize: 34 },
  brandWhite: { color: colors.white },
  brandBlue: { color: colors.electricBlue },
  version: { ...typography.mono, color: colors.ionCyan, fontSize: 11 },
  form: { gap: 16 },
  heading: { ...typography.h2, color: colors.white },
  sub: { ...typography.body, color: colors.textMuted, lineHeight: 22 },
  label: { ...typography.label, color: colors.textMuted, marginBottom: 6, textTransform: 'uppercase' },
  inputWrap: { position: 'relative' },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: colors.borderBlue, borderRadius: 8,
    backgroundColor: colors.navy2, padding: 12, height: 50,
  },
  inputBoxError: { borderColor: colors.error },
  inputPrefix: { ...typography.mono, color: colors.ionCyan, fontSize: 13 },
  divider: { width: 1, height: 18, backgroundColor: colors.borderBlue, marginHorizontal: 8 },
  inputField: { ...typography.mono, color: colors.white, flex: 1, fontSize: 13 },
  hiddenInput: { position: 'absolute', opacity: 0, top: 0, left: 0, right: 0, height: 50 },
  error: { ...typography.bodySm, color: colors.error },
  button: { marginTop: 8 },
  devButton: { marginTop: 4 },
  footer: { ...typography.monoSm, color: colors.textMuted, textAlign: 'center', marginTop: 'auto', paddingTop: 32 },
});
