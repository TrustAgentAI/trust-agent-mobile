import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';

type ToastVariant = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  message: string;
  variant: ToastVariant;
}

const variantConfig: Record<ToastVariant, { bg: string; border: string; text: string }> = {
  success: { bg: 'rgba(0,170,120,0.15)', border: colors.success, text: colors.success },
  error:   { bg: 'rgba(204,51,51,0.15)',  border: colors.error,   text: colors.error },
  info:    { bg: 'rgba(30,111,255,0.15)', border: colors.electricBlue, text: colors.electricBlue },
};

// Singleton toast manager
let toastListener: ((toast: ToastMessage) => void) | null = null;

export function showToast(message: string, variant: ToastVariant = 'info') {
  const toast: ToastMessage = {
    id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    message,
    variant,
  };
  toastListener?.(toast);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const slideAnim = useRef(new Animated.Value(100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 100, duration: 250, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => setToast(null));
  }, [slideAnim, opacityAnim]);

  const handleToast = useCallback((t: ToastMessage) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setToast(t);
    slideAnim.setValue(100);
    opacityAnim.setValue(0);

    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 15, stiffness: 150 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    timeoutRef.current = setTimeout(dismiss, 3000);
  }, [slideAnim, opacityAnim, dismiss]);

  useEffect(() => {
    toastListener = handleToast;
    return () => {
      toastListener = null;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [handleToast]);

  return (
    <View style={styles.wrapper}>
      {children}
      {toast && (
        <Animated.View
          style={[
            styles.toast,
            {
              backgroundColor: variantConfig[toast.variant].bg,
              borderColor: variantConfig[toast.variant].border,
              transform: [{ translateY: slideAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <Text style={[styles.message, { color: variantConfig[toast.variant].text }]}>
            {toast.message}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  toast: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    zIndex: 9999,
  },
  message: {
    ...typography.body,
    fontFamily: 'Manrope_600SemiBold',
    textAlign: 'center',
  },
});
