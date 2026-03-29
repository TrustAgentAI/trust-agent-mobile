import { useState, useCallback, useRef } from 'react';
import { useLiveKit } from './useLiveKit';
import { useRoleStore } from '../store/roleStore';
import { useAuthStore } from '../store/authStore';
import { apiFetch } from '../lib/api';

interface SessionRecord {
  sessionId: string;
  hireId: string;
  status: 'active' | 'ended';
  startedAt: string;
}

export function useAgentSession(hireId: string) {
  const livekit = useLiveKit();
  const { roles } = useRoleStore();
  const { token } = useAuthStore();
  const role = roles.find(r => r.hireId === hireId);
  const sessionRef = useRef<SessionRecord | null>(null);

  const startSession = useCallback(async () => {
    // Create a real session record via API before connecting LiveKit
    if (token) {
      try {
        const res = await apiFetch<{ data?: SessionRecord; session?: SessionRecord }>(
          '/sessions',
          {
            method: 'POST',
            body: JSON.stringify({ hireId }),
          },
          token,
        );
        sessionRef.current = res.data ?? res.session ?? (res as unknown as SessionRecord);
      } catch (err) {
        console.warn('Failed to create session via API, continuing with LiveKit:', err);
      }
    }

    // Connect to LiveKit for real-time voice/text
    await livekit.connect(hireId);
  }, [hireId, livekit, token]);

  const endSession = useCallback(async () => {
    // End the session record via API
    if (token && sessionRef.current?.sessionId) {
      try {
        await apiFetch(
          `/sessions/${sessionRef.current.sessionId}/end`,
          { method: 'POST' },
          token,
        );
      } catch (err) {
        console.warn('Failed to end session via API:', err);
      }
      sessionRef.current = null;
    }

    await livekit.disconnect();
  }, [livekit, token]);

  return {
    role,
    sessionId: sessionRef.current?.sessionId ?? null,
    ...livekit,
    startSession,
    endSession,
  };
}
