import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';

export default function MarketplaceScreen() {
  const { token } = useAuthStore();
  const url = `https://app.trust-agent.ai/marketplace?embed=mobile&token=${encodeURIComponent(token ?? '')}`;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Marketplace</Text>
        <Text style={styles.sub}>trust-agent.ai</Text>
      </View>
      <WebView
        source={{ uri: url }}
        style={styles.webview}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        onError={() => {}}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.darkNavy },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(30,111,255,0.2)',
  },
  title: { ...typography.h2, color: colors.white },
  sub: { ...typography.mono, color: colors.textMuted, fontSize: 11 },
  webview: { flex: 1, backgroundColor: colors.darkNavy },
});
