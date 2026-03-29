import React, { useState } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, TouchableOpacity, Linking,
} from 'react-native';
import { router } from 'expo-router';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { loginWithEmail } from '../lib/auth';
import { useAuthStore } from '../store/authStore';
import { useRoleStore } from '../store/roleStore';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, setSession } = useAuthStore();
  const { loadRoles } = useRoleStore();

  const handleLogin = async () => {
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (!password.trim()) { setError('Please enter your password.'); return; }
    setLoading(true);
    setError(null);
    try {
      const result = await loginWithEmail(email.trim(), password);
      if (result.refreshToken) {
        setSession(result.token, result.refreshToken, result.user);
      } else {
        login(result.token, result.userId, result.user);
      }
      await loadRoles();
      router.replace('/(tabs)/dashboard');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // Google Sign-In will be wired with expo-auth-session or @react-native-google-signin
    // For now, show a placeholder message
    setError('Google sign-in is coming soon. Please use email and password.');
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={styles.shield}>
            <Text style={styles.shieldText}>TA</Text>
          </View>
          <Text style={styles.brand}>
            <Text style={styles.brandWhite}>Trust </Text>
            <Text style={styles.brandBlue}>Agent</Text>
          </Text>
          <Text style={styles.tagline}>Your AI team, always on</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.heading}>Sign in</Text>
          <Text style={styles.sub}>Use the same account as trust-agent.ai</Text>

          {/* Email field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <Input
              value={email}
              onChangeText={(v) => { setEmail(v); setError(null); }}
              placeholder="you@example.com"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          {/* Password field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <Input
              value={password}
              onChangeText={(v) => { setPassword(v); setError(null); }}
              placeholder="Your password"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <Button
            label={loading ? 'Signing in...' : 'Sign in'}
            onPress={handleLogin}
            loading={loading}
            disabled={!email.trim() || !password.trim()}
            style={styles.button}
          />

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google sign-in */}
          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn} activeOpacity={0.8}>
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleLabel}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Sign up link */}
          <TouchableOpacity
            style={styles.signupRow}
            onPress={() => Linking.openURL('https://app.trust-agent.ai/signup')}
          >
            <Text style={styles.signupText}>
              Don't have an account? <Text style={styles.signupLink}>Sign up free</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          AgentCore LTD - Company No. 17114811
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.darkNavy },
  container: { flexGrow: 1, padding: 28, paddingTop: 80 },
  logoSection: { alignItems: 'center', marginBottom: 48, gap: 8 },
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
  tagline: { ...typography.body, color: colors.textMuted, fontSize: 14 },
  form: { gap: 16 },
  heading: { ...typography.h2, color: colors.white },
  sub: { ...typography.body, color: colors.textMuted, lineHeight: 22, marginBottom: 4 },
  fieldGroup: { gap: 6 },
  label: { ...typography.label, color: colors.textMuted, textTransform: 'uppercase' },
  error: { ...typography.bodySm, color: colors.error },
  button: { marginTop: 4 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(30,111,255,0.2)' },
  dividerText: { ...typography.bodySm, color: colors.textMuted, marginHorizontal: 16 },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.navy2,
    borderWidth: 1,
    borderColor: 'rgba(30,111,255,0.3)',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 10,
  },
  googleIcon: { fontSize: 18, fontFamily: 'Manrope_700Bold', color: colors.white },
  googleLabel: { ...typography.body, color: colors.white, fontFamily: 'Manrope_600SemiBold' },
  signupRow: { alignItems: 'center', marginTop: 8 },
  signupText: { ...typography.body, color: colors.textMuted },
  signupLink: { color: colors.electricBlue },
  footer: { ...typography.monoSm, color: colors.textMuted, textAlign: 'center', marginTop: 'auto', paddingTop: 32 },
});
