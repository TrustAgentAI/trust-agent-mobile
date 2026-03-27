import { useState, useCallback } from 'react';
import { useLiveKit } from './useLiveKit';
import { useRoleStore } from '../store/roleStore';

export function useAgentSession(hireId: string) {
  const livekit = useLiveKit();
  const { roles } = useRoleStore();
  const role = roles.find(r => r.hireId === hireId);

  const startSession = useCallback(async () => {
    await livekit.connect(hireId);
  }, [hireId, livekit]);

  const endSession = useCallback(async () => {
    await livekit.disconnect();
  }, [livekit]);

  return {
    role,
    ...livekit,
    startSession,
    endSession,
  };
}
