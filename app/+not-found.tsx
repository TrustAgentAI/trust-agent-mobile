import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Link, Stack } from 'expo-router';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Text style={styles.code}>404</Text>
          <Text style={styles.title}>Page not found</Text>
          <Text style={styles.sub}>The screen you are looking for does not exist.</Text>
          <Link href="/" style={styles.link}>
            <Text style={styles.linkText}>Go to home</Text>
          </Link>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.darkNavy },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  code: { ...typography.display, color: colors.midBlue, fontSize: 72 },
  title: { ...typography.h1, color: colors.white },
  sub: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  link: { marginTop: 16 },
  linkText: { ...typography.body, color: colors.electricBlue },
});
