import { Room, RoomEvent, ConnectionState, RemoteParticipant, DataPacket_Kind } from 'livekit-client';

const TOKEN_SERVER_URL =
  process.env.EXPO_PUBLIC_LIVEKIT_TOKEN_SERVER_URL ??
  process.env.EXPO_PUBLIC_API_URL ??
  'https://api.trust-agent.ai';

export interface LiveKitSession {
  room: Room;
  token: string;
  serverUrl: string;
}

// Fetch a LiveKit token from the local token server
export async function fetchToken(
  roomName: string,
  participantName: string
): Promise<{ token: string }> {
  const res = await fetch(`${TOKEN_SERVER_URL}/livekit-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      roomName,
      participantName,
      apiKey: 'mobile-client',
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error ?? `Token fetch failed with status ${res.status}`);
  }

  return res.json();
}

// Legacy alias used by hooks/useLiveKit.ts
export async function fetchRoomToken(
  authToken: string,
  userId: string,
  hireId: string
): Promise<{ token: string; serverUrl: string; roomName: string }> {
  const LIVEKIT_URL = process.env.EXPO_PUBLIC_LIVEKIT_URL ?? 'wss://agent.livekit.cloud';

  const res = await fetch(`${TOKEN_SERVER_URL}/livekit-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      roomName: `hire-${hireId}`,
      participantName: `mobile-${userId}`,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error ?? `Token fetch failed with status ${res.status}`);
  }

  const data = await res.json();
  return {
    token: data.token,
    serverUrl: data.serverUrl ?? LIVEKIT_URL,
    roomName: data.roomName ?? `hire-${hireId}`,
  };
}

// Create a Room object configured for audio-only communication
export function createRoom(): Room {
  return new Room({
    adaptiveStream: true,
    dynacast: true,
    audioCaptureDefaults: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
    videoCaptureDefaults: undefined,
  });
}

// Connect to a LiveKit room with audio only (no video)
export async function connectToRoom(
  room: Room,
  token: string,
  serverUrl: string
): Promise<Room> {
  room.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
    console.log(`LiveKit connection state: ${state}`);

    if (state === ConnectionState.Disconnected) {
      setTimeout(async () => {
        try {
          if (room.state === ConnectionState.Disconnected) {
            console.log('Attempting auto-reconnect...');
            await room.connect(serverUrl, token);
          }
        } catch (e) {
          console.warn('Auto-reconnect failed:', e);
        }
      }, 3000);
    }
  });

  room.on(RoomEvent.Reconnecting, () => {
    console.log('LiveKit reconnecting...');
  });

  room.on(RoomEvent.Reconnected, () => {
    console.log('LiveKit reconnected');
  });

  await room.connect(serverUrl, token, {
    autoSubscribe: true,
  });

  // Audio only - no video
  await room.localParticipant.setMicrophoneEnabled(true);
  await room.localParticipant.setCameraEnabled(false);

  return room;
}

// Disconnect from a room cleanly
export async function disconnectFromRoom(room: Room): Promise<void> {
  try {
    await room.localParticipant.setMicrophoneEnabled(false);
    await room.disconnect();
  } catch (e) {
    console.warn('Error during room disconnect:', e);
  }
}
