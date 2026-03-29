import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';

export default function MarketplaceScreen() {
  const { token } = useAuthStore();
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const url = `https://app.trust-agent.ai/roles?embed=mobile&token=${encodeURIComponent(token ?? '')}`;

  const handleReload = () => {
    setHasError(false);
    setIsLoading(true);
    webViewRef.current?.reload();
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Marketplace</Text>
        <TouchableOpacity onPress={handleReload} activeOpacity={0.7}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Error state */}
      {hasError ? (
        <View style={styles.errorWrap}>
          <Text style={styles.errorIcon}>!</Text>
          <Text style={styles.errorTitle}>Could not load marketplace</Text>
          <Text style={styles.errorSub}>Check your internet connection and try again.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleReload} activeOpacity={0.8}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.webviewWrap}>
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color={colors.ionCyan} size="large" />
              <Text style={styles.loadingText}>Loading marketplace...</Text>
            </View>
          )}
          <WebView
            ref={webViewRef}
            source={{ uri: url }}
            style={styles.webview}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            onLoadStart={() => { setIsLoading(true); setHasError(false); }}
            onLoadEnd={() => setIsLoading(false)}
            onError={() => { setIsLoading(false); setHasError(true); }}
            onHttpError={() => { setIsLoading(false); setHasError(true); }}
            pullToRefreshEnabled
            startInLoadingState={false}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.darkNavy },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(30,111,255,0.2)',
  },
  title: { ...typography.h2, color: colors.white },
  refreshText: { ...typography.body, color: colors.electricBlue, fontSize: 14 },

  // WebView
  webviewWrap: { flex: 1, position: 'relative' },
  webview: { flex: 1, backgroundColor: colors.darkNavy },

  // Loading overlay
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.darkNavy,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    zIndex: 10,
  },
  loadingText: { ...typography.body, color: colors.textMuted },

  // Error state
  errorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  errorIcon: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(204,51,51,0.15)',
    color: colors.error,
    fontSize: 28,
    textAlign: 'center',
    lineHeight: 56,
    fontFamily: 'Manrope_700Bold',
    overflow: 'hidden',
    marginBottom: 4,
  },
  errorTitle: { ...typography.h3, color: colors.white },
  errorSub: { ...typography.body, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  retryButton: {
    backgroundColor: colors.electricBlue,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 28,
    marginTop: 8,
  },
  retryText: { ...typography.body, color: colors.white, fontFamily: 'Manrope_600SemiBold' },
});
