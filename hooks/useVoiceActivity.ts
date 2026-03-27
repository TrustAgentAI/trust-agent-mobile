import { useEffect, useRef, useState, useCallback } from 'react';

interface UseVoiceActivityReturn {
  audioLevel: number;       // 0.0 - 1.0, smoothed audio level
  isVoiceActive: boolean;   // true when audio level exceeds threshold
  peakLevel: number;        // recent peak level for visualisation
}

const VAD_THRESHOLD = 0.15;       // minimum level to consider "voice active"
const SMOOTHING_FACTOR = 0.3;     // exponential smoothing (0 = no smoothing, 1 = no change)
const PEAK_DECAY_RATE = 0.95;     // how fast peak decays per frame
const UPDATE_INTERVAL_MS = 50;    // how often we update (20fps)

/**
 * useVoiceActivity - Audio level monitoring hook for VoiceOrb animation.
 *
 * In a real implementation with LiveKit, this would read from the
 * local audio track's audio level. For now, it provides a simulated
 * interface that can be driven by external audio level values.
 *
 * Usage:
 *   const { audioLevel, isVoiceActive, peakLevel } = useVoiceActivity();
 *   // Pass audioLevel to VoiceOrb for ring expansion
 *   // Use isVoiceActive to detect speaking state
 */
export function useVoiceActivity(externalLevel?: number): UseVoiceActivityReturn {
  const [audioLevel, setAudioLevel] = useState(0);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [peakLevel, setPeakLevel] = useState(0);

  const smoothedRef = useRef(0);
  const peakRef = useRef(0);

  // Process incoming audio level (from LiveKit or external source)
  const processLevel = useCallback((rawLevel: number) => {
    const clamped = Math.max(0, Math.min(1, rawLevel));

    // Exponential smoothing
    smoothedRef.current = smoothedRef.current * SMOOTHING_FACTOR + clamped * (1 - SMOOTHING_FACTOR);

    // Peak tracking with decay
    if (clamped > peakRef.current) {
      peakRef.current = clamped;
    } else {
      peakRef.current *= PEAK_DECAY_RATE;
    }

    setAudioLevel(smoothedRef.current);
    setIsVoiceActive(smoothedRef.current > VAD_THRESHOLD);
    setPeakLevel(peakRef.current);
  }, []);

  // If an external level is provided (e.g. from LiveKit audio track), use it
  useEffect(() => {
    if (externalLevel !== undefined) {
      processLevel(externalLevel);
    }
  }, [externalLevel, processLevel]);

  // Decay audio level when no external input is driving it
  useEffect(() => {
    if (externalLevel !== undefined) return;

    const interval = setInterval(() => {
      // When not receiving external levels, decay smoothly to zero
      if (smoothedRef.current > 0.001) {
        smoothedRef.current *= 0.9;
        peakRef.current *= PEAK_DECAY_RATE;
        setAudioLevel(smoothedRef.current);
        setPeakLevel(peakRef.current);
        setIsVoiceActive(smoothedRef.current > VAD_THRESHOLD);
      } else if (smoothedRef.current !== 0) {
        smoothedRef.current = 0;
        peakRef.current = 0;
        setAudioLevel(0);
        setPeakLevel(0);
        setIsVoiceActive(false);
      }
    }, UPDATE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [externalLevel]);

  return { audioLevel, isVoiceActive, peakLevel };
}
