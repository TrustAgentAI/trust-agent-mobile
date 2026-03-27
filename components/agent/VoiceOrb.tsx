import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

interface VoiceOrbProps {
  isUserSpeaking: boolean;
  isAgentSpeaking: boolean;
  isConnected: boolean;
  audioLevel?: number; // 0-1
}

export function VoiceOrb({ isUserSpeaking, isAgentSpeaking, isConnected, audioLevel = 0 }: VoiceOrbProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Pulse when agent is speaking
  useEffect(() => {
    if (isAgentSpeaking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.12, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.95, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      Animated.spring(pulseAnim, { toValue: 1, useNativeDriver: true }).start();
    }
  }, [isAgentSpeaking]);

  // Glow on user speaking
  useEffect(() => {
    Animated.timing(glowAnim, {
      toValue: isUserSpeaking ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isUserSpeaking]);

  // Slow rotate when connected + idle
  useEffect(() => {
    if (isConnected) {
      Animated.loop(
        Animated.timing(rotateAnim, { toValue: 1, duration: 8000, useNativeDriver: true })
      ).start();
    }
  }, [isConnected]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.45] });

  const orbColor = isAgentSpeaking
    ? colors.ionCyan
    : isUserSpeaking
    ? colors.electricBlue
    : isConnected
    ? colors.electricBlue
    : colors.midBlue;

  return (
    <View style={styles.container}>
      {/* Outer glow ring */}
      <Animated.View style={[styles.glowRing, {
        borderColor: orbColor,
        opacity: glowOpacity,
        transform: [{ scale: pulseAnim }],
      }]} />

      {/* Rotating mesh ring */}
      <Animated.View style={[styles.meshRing, {
        borderColor: isConnected ? colors.electricBlue : colors.midBlue,
        transform: [{ rotate }, { scale: pulseAnim }],
      }]} />

      {/* Core orb */}
      <Animated.View style={[styles.orb, {
        backgroundColor: colors.navy2,
        borderColor: orbColor,
        transform: [{ scale: pulseAnim }],
      }]}>
        {/* Inner dot - Trust Agent shield reference */}
        <View style={[styles.innerDot, { backgroundColor: orbColor }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: 180, height: 180, alignItems: 'center', justifyContent: 'center' },
  glowRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
  },
  meshRing: {
    position: 'absolute',
    width: 148,
    height: 148,
    borderRadius: 74,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  orb: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
