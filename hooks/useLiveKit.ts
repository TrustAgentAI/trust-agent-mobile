import { useEffect, useRef, useState, useCallback } from 'react';
import { Room, RoomEvent, ConnectionState, Track } from 'livekit-client';
import { createRoom, fetchRoomToken } from '../lib/livekit';
import { useAuthStore } from '../store/authStore';

type SessionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

interface UseLiveKitReturn {
  status: SessionStatus;
  isMicActive: boolean;
  isAgentSpeaking: boolean;
  audioLevel: number;
  connect: (hireId: string) => Promise<void>;
  disconnect: () => Promise<void>;
  toggleMic: () => Promise<void>;
  sendTextMessage: (content: string) => void;
  agentMessages: AgentMessage[];
}

export interface AgentMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: number;
}

export function useLiveKit(): UseLiveKitReturn {
  const { token: authToken, userId } = useAuthStore();
  const roomRef = useRef<Room | null>(null);
  const [status, setStatus] = useState<SessionStatus>('idle');
  const [isMicActive, setIsMicActive] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([]);

  const connect = useCallback(async (hireId: string) => {
    if (!authToken || !userId) return;
    setStatus('connecting');

    try {
      const { token, serverUrl } = await fetchRoomToken(authToken, userId, hireId);
      const room = createRoom();
      roomRef.current = room;

      // Room event handlers
      room.on(RoomEvent.Connected, () => setStatus('connected'));
      room.on(RoomEvent.Disconnected, () => {
        setStatus('disconnected');
        setIsMicActive(false);
      });
      room.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
        if (state === ConnectionState.Reconnecting) setStatus('connecting');
      });

      // Audio level monitoring for visualiser
      room.on(RoomEvent.AudioPlaybackStatusChanged, () => {});

      // Receive data messages from agent (text responses)
      room.on(RoomEvent.DataReceived, (payload: Uint8Array, participant: any) => {
        try {
          const text = new TextDecoder().decode(payload);
          const msg = JSON.parse(text) as { type: string; content: string; messageId: string };
          if (msg.type === 'agent:message') {
            setAgentMessages(prev => [...prev, {
              id: msg.messageId ?? `agent-${Date.now()}`,
              role: 'agent',
              content: msg.content,
              timestamp: Date.now(),
            }]);
          }
          if (msg.type === 'agent:speaking_start') setIsAgentSpeaking(true);
          if (msg.type === 'agent:speaking_end') setIsAgentSpeaking(false);
        } catch {}
      });

      await room.connect(serverUrl, token);
    } catch (e) {
      console.error('LiveKit connect error:', e);
      setStatus('error');
    }
  }, [authToken, userId]);

  const disconnect = useCallback(async () => {
    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
    }
    setStatus('idle');
    setIsMicActive(false);
    setIsAgentSpeaking(false);
  }, []);

  const toggleMic = useCallback(async () => {
    const room = roomRef.current;
    if (!room || status !== 'connected') return;

    if (isMicActive) {
      await room.localParticipant.setMicrophoneEnabled(false);
      setIsMicActive(false);
    } else {
      await room.localParticipant.setMicrophoneEnabled(true);
      setIsMicActive(true);
    }
  }, [isMicActive, status]);

  const sendTextMessage = useCallback((content: string) => {
    const room = roomRef.current;

    // Optimistically add user message
    const userMsg: AgentMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    setAgentMessages(prev => [...prev, userMsg]);

    if (!room || status !== 'connected') {
      console.warn('Cannot send message: not connected to LiveKit room');
      return;
    }

    const payload = new TextEncoder().encode(JSON.stringify({
      type: 'user:message',
      content,
    }));
    room.localParticipant.publishData(payload, { reliable: true });
  }, [status]);

  useEffect(() => {
    return () => {
      roomRef.current?.disconnect();
    };
  }, []);

  return { status, isMicActive, isAgentSpeaking, audioLevel, connect, disconnect, toggleMic, sendTextMessage, agentMessages };
}
