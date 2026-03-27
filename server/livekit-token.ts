import { AccessToken } from 'livekit-server-sdk';

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY!;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET!;

interface TokenRequest {
  roomName: string;
  participantName: string;
  apiKey: string;
}

interface TokenResponse {
  token: string;
}

export function validateTokenRequest(body: unknown): {
  valid: boolean;
  error?: string;
  data?: TokenRequest;
} {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body is required' };
  }

  const { roomName, participantName, apiKey } = body as Record<string, unknown>;

  if (!roomName || typeof roomName !== 'string' || roomName.trim().length === 0) {
    return { valid: false, error: 'roomName is required and must be a non-empty string' };
  }

  if (!participantName || typeof participantName !== 'string' || participantName.trim().length === 0) {
    return { valid: false, error: 'participantName is required and must be a non-empty string' };
  }

  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
    return { valid: false, error: 'apiKey is required and must be a non-empty string' };
  }

  return {
    valid: true,
    data: {
      roomName: roomName.trim(),
      participantName: participantName.trim(),
      apiKey: apiKey.trim(),
    },
  };
}

export function generateToken(roomName: string, participantName: string): string {
  if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    throw new Error('LIVEKIT_API_KEY and LIVEKIT_API_SECRET must be set in environment');
  }

  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: participantName,
    ttl: '6h',
  });

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  return at.toJwt();
}

// Legacy function used by /livekit/token endpoint
export function generateRoomToken(userId: string, hireId: string): string {
  return generateToken(`hire-${hireId}`, `mobile-${userId}`);
}

export type { TokenRequest, TokenResponse };
