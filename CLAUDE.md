# Trust Agent Mobile — CLAUDE.md
# Drop this file into the root of a new repo and run: claude
# This is a zero-stop, zero-remaining-tasks build.
# Do not ask for clarification. Do not stop until the completion checklist is fully checked off.
# All branch prefixes: Unified/

---

## MISSION

Build **Trust Agent Mobile** — the iOS and Android companion app for Trust Agent Desktop.

Users hire AI role agents on the Trust Agent marketplace (trust-agent.ai). Trust Agent Desktop runs those agents locally on their computer. Trust Agent Mobile lets them communicate with those same hired agents from their phone — voice and text — from anywhere, in real time.

**Operator:** AgentCore LTD · Company No. 17114811 · 20 Wenlock Road, London, England, N1 7GU · trust-agent.ai

**Desktop repo (for reference):** https://github.com/TrustAgentAI/trust-agent-desktop

**This repo:** trust-agent-mobile

---

## STACK DECISIONS — DO NOT DEVIATE

| Layer | Choice | Reason |
|---|---|---|
| Mobile framework | Expo (React Native) | Single codebase iOS + Android, fastest path to App Store |
| Real-time transport | LiveKit WebRTC | Handles mobile network degradation, open source, self-hostable |
| Voice pipeline | livekit-agents (Python, existing sidecar) | Reuses Desktop sidecar with minimal additions |
| Auth | Same API key as Desktop (ta_live_...) | No new auth system needed |
| State | Zustand | Consistent with Desktop |
| Navigation | Expo Router v3 (file-based) | Clean, typed, no config overhead |
| Notifications | Expo Notifications | Push alerts when long-running agent tasks complete |
| Storage | Expo SecureStore (keys), AsyncStorage (prefs) | Keys encrypted on device |

---

## BRAND SYSTEM — APPLY TO EVERY COMPONENT

```javascript
// All colours — no # prefix in JS objects
const colors = {
  darkNavy:     '#0A1628',
  navy2:        '#0D1F3C',
  electricBlue: '#1E6FFF',
  ionCyan:      '#00D4FF',
  midBlue:      '#1A3A6B',
  textMid:      '#2D4A7A',
  textMuted:    '#8899BB',
  borderBlue:   '#C5D5F0',
  lightBlueBg:  '#EBF2FF',
  success:      '#00AA78',
  error:        '#CC3333',
  white:        '#FFFFFF',
};
```

Typography:
- Headlines: `fontFamily: 'Manrope_800ExtraBold'` (expo-google-fonts)
- Subheadings: `fontFamily: 'Manrope_700Bold'`
- Body: `fontFamily: 'Manrope_400Regular'`
- Code/mono: `fontFamily: 'JetBrainsMono_400Regular'`

Brand rules (never violate):
- Always "Trust Agent" — never TRUST AGENT, trustagent, Trust-Agent
- Token always "$TAGNT" — $ in Ion Cyan, TAGNT in Electric Blue
- No warm tones (no orange, amber, yellow, purple, warm red) anywhere
- No padlocks, checkmarks, cartoon robots in any assets
- "AgentCore LTD" in all legal/footer contexts
- No mention of the AI assistant used to build this in any code, comments, or commits

---

## ENVIRONMENT VARIABLES

Create `.env` at repo root. Never hardcode these values.

```
EXPO_PUBLIC_API_URL=https://api.trust-agent.ai
EXPO_PUBLIC_WS_URL=wss://api.trust-agent.ai/ws
EXPO_PUBLIC_LIVEKIT_URL=wss://your-livekit-server.livekit.cloud
EXPO_PUBLIC_APP_VERSION=1.0.0
```

LiveKit credentials (server-side, in a separate `.env.server` for the token endpoint):
```
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
LIVEKIT_SERVER_URL=wss://your-livekit-server.livekit.cloud
```

---

## REPOSITORY STRUCTURE

```
trust-agent-mobile/
├── app/                          # Expo Router pages (file-based routing)
│   ├── _layout.tsx               # Root layout — fonts, auth guard, navigation
│   ├── index.tsx                 # Redirect to /login or /(tabs)/dashboard
│   ├── login.tsx                 # Login screen
│   ├── (tabs)/                   # Tab navigator (shown when authenticated)
│   │   ├── _layout.tsx           # Tab bar definition
│   │   ├── dashboard.tsx         # Home — role list
│   │   ├── session.tsx           # Active agent session (voice + chat)
│   │   ├── marketplace.tsx       # Embedded marketplace WebView
│   │   └── settings.tsx          # Settings screen
│   └── +not-found.tsx            # 404
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx             # Trust Score badge (Platinum/Gold/Silver/Basic)
│   │   ├── Card.tsx
│   │   └── Toast.tsx
│   ├── agent/
│   │   ├── RoleCard.tsx          # Hired role card (tap to open session)
│   │   ├── VoiceOrb.tsx          # Animated voice visualiser orb
│   │   ├── ChatBubble.tsx        # Single message bubble
│   │   ├── ChatInput.tsx         # Text input + send + mic toggle
│   │   └── SessionHeader.tsx     # Role name, trust badge, connection status
│   ├── layout/
│   │   ├── TabBar.tsx            # Custom tab bar with Trust Agent branding
│   │   └── ConnectionPill.tsx    # WS/LiveKit connection status pill
│   └── marketplace/
│       └── MarketplaceView.tsx   # WebView wrapper for embedded marketplace
├── hooks/
│   ├── useLiveKit.ts             # LiveKit room connection hook
│   ├── useAgentSession.ts        # Full session lifecycle (connect → voice → disconnect)
│   ├── useAuth.ts                # Auth state + login/logout
│   └── useVoiceActivity.ts       # VAD + audio level meter
├── lib/
│   ├── auth.ts                   # API key login, token management
│   ├── livekit.ts                # LiveKit room setup + token fetch
│   ├── api.ts                    # Fetch wrapper for trust-agent.ai API
│   └── storage.ts                # SecureStore + AsyncStorage helpers
├── store/
│   ├── authStore.ts              # Auth state (Zustand)
│   ├── roleStore.ts              # Hired roles list
│   ├── sessionStore.ts           # Active session state
│   └── auditStore.ts             # Recent audit events
├── constants/
│   ├── colors.ts                 # Brand colour tokens
│   └── typography.ts             # Font size scale + weight constants
├── assets/
│   └── fonts/                    # Manrope + JetBrains Mono (loaded via expo-font)
├── server/                       # Minimal token server (runs alongside)
│   ├── index.ts                  # Express server — single endpoint
│   └── livekit-token.ts          # Token generation for LiveKit rooms
├── app.json                      # Expo config
├── package.json
├── tsconfig.json
└── .env
```

---

## PHASE 0 — PROJECT SETUP

Run all of the following before writing any component code:

```bash
# 1. Create Expo project
npx create-expo-app@latest trust-agent-mobile --template blank-typescript
cd trust-agent-mobile

# 2. Install all dependencies
npx expo install \
  @livekit/react-native \
  @livekit/react-native-expo-plugin \
  @livekit/react-native-webrtc \
  livekit-client \
  expo-router \
  expo-secure-store \
  @react-native-async-storage/async-storage \
  expo-font \
  expo-notifications \
  expo-av \
  expo-haptics \
  expo-linking \
  expo-web-browser \
  react-native-webview \
  zustand \
  @config-plugins/react-native-webrtc

# 3. Install Google Fonts (Manrope + JetBrains Mono)
npx expo install \
  @expo-google-fonts/manrope \
  @expo-google-fonts/jetbrains-mono

# 4. Install token server deps
npm install express livekit-server-sdk cors dotenv
npm install --save-dev @types/express @types/cors ts-node

# 5. Verify Expo Router is configured in app.json
# scheme must be set for deep linking
```

**app.json** — set these fields:
```json
{
  "expo": {
    "name": "Trust Agent",
    "slug": "trust-agent-mobile",
    "scheme": "trustagent",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "dark",
    "backgroundColor": "#0A1628",
    "icon": "./assets/icon.png",
    "splash": {
      "backgroundColor": "#0A1628"
    },
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "ai.trust-agent.mobile",
      "infoPlist": {
        "NSMicrophoneUsageDescription": "Trust Agent needs your microphone to communicate with your hired AI roles via voice.",
        "NSSpeechRecognitionUsageDescription": "Trust Agent uses speech recognition for voice commands."
      }
    },
    "android": {
      "package": "ai.trust_agent.mobile",
      "permissions": ["RECORD_AUDIO", "INTERNET", "VIBRATE"]
    },
    "plugins": [
      "expo-router",
      "@livekit/react-native-expo-plugin",
      "@config-plugins/react-native-webrtc",
      "expo-font",
      [
        "expo-notifications",
        { "sounds": [] }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

**tsconfig.json:**
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

## PHASE 1 — CONSTANTS & FOUNDATIONS

### 1.1 constants/colors.ts
```typescript
export const colors = {
  darkNavy:     '#0A1628',
  navy2:        '#0D1F3C',
  electricBlue: '#1E6FFF',
  ionCyan:      '#00D4FF',
  midBlue:      '#1A3A6B',
  textMid:      '#2D4A7A',
  textMuted:    '#8899BB',
  borderBlue:   '#C5D5F0',
  lightBlueBg:  '#EBF2FF',
  rowAlt:       '#F0F5FF',
  success:      '#00AA78',
  error:        '#CC3333',
  white:        '#FFFFFF',
} as const;
```

### 1.2 constants/typography.ts
```typescript
export const typography = {
  display:  { fontSize: 40, fontFamily: 'Manrope_800ExtraBold' },
  h1:       { fontSize: 28, fontFamily: 'Manrope_800ExtraBold' },
  h2:       { fontSize: 22, fontFamily: 'Manrope_800ExtraBold' },
  h3:       { fontSize: 18, fontFamily: 'Manrope_700Bold' },
  bodyLg:   { fontSize: 17, fontFamily: 'Manrope_400Regular' },
  body:     { fontSize: 15, fontFamily: 'Manrope_400Regular' },
  bodySm:   { fontSize: 13, fontFamily: 'Manrope_400Regular' },
  label:    { fontSize: 12, fontFamily: 'Manrope_600SemiBold', letterSpacing: 0.5 },
  mono:     { fontSize: 13, fontFamily: 'JetBrainsMono_400Regular' },
  monoSm:   { fontSize: 11, fontFamily: 'JetBrainsMono_400Regular' },
} as const;
```

### 1.3 lib/storage.ts
```typescript
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Sensitive values (API keys, session tokens) — encrypted
export const secureSet = async (key: string, value: string) => {
  try { await SecureStore.setItemAsync(key, value); } catch (e) { console.warn('SecureStore write failed:', e); }
};
export const secureGet = async (key: string): Promise<string | null> => {
  try { return await SecureStore.getItemAsync(key); } catch { return null; }
};
export const secureDelete = async (key: string) => {
  try { await SecureStore.deleteItemAsync(key); } catch {}
};

// Non-sensitive preferences
export const prefSet = async (key: string, value: unknown) => {
  try { await AsyncStorage.setItem(key, JSON.stringify(value)); } catch {}
};
export const prefGet = async <T>(key: string): Promise<T | null> => {
  try {
    const v = await AsyncStorage.getItem(key);
    return v ? JSON.parse(v) as T : null;
  } catch { return null; }
};
```

---

## PHASE 2 — AUTH

### 2.1 lib/auth.ts
```typescript
import { secureSet, secureGet, secureDelete } from './storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL!;

export interface AuthResult {
  token: string;
  userId: string;
}

export async function loginWithApiKey(apiKey: string): Promise<AuthResult> {
  // Dev shortcut: any key starting with 'ta_' works offline
  if (__DEV__ && apiKey.startsWith('ta_')) {
    const mock = { token: `mock-jwt-${Date.now()}`, userId: 'dev-user-001' };
    await secureSet('auth_token', mock.token);
    await secureSet('auth_api_key', apiKey);
    return mock;
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/desktop-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    });
  } catch {
    throw new Error('Cannot connect to Trust Agent servers. Check your connection.');
  }

  if (res.status === 401) throw new Error('Invalid API key.');
  if (!res.ok) throw new Error('Login failed. Please try again.');

  const data = await res.json() as AuthResult;
  await secureSet('auth_token', data.token);
  await secureSet('auth_api_key', apiKey);
  return data;
}

export async function restoreSession(): Promise<AuthResult | null> {
  const token = await secureGet('auth_token');
  const userId = await secureGet('user_id');
  if (!token || !userId) return null;
  return { token, userId };
}

export async function logout(): Promise<void> {
  await secureDelete('auth_token');
  await secureDelete('auth_api_key');
  await secureDelete('user_id');
}
```

### 2.2 store/authStore.ts
```typescript
import { create } from 'zustand';

interface AuthState {
  token: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userId: string) => void;
  logout: () => void;
  setLoading: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  userId: null,
  isAuthenticated: false,
  isLoading: true,
  login: (token, userId) => set({ token, userId, isAuthenticated: true, isLoading: false }),
  logout: () => set({ token: null, userId: null, isAuthenticated: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
```

---

## PHASE 3 — LIVEKIT INTEGRATION

### 3.1 server/livekit-token.ts
```typescript
import { AccessToken } from 'livekit-server-sdk';

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY!;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET!;

export function generateRoomToken(userId: string, hireId: string): string {
  const roomName = `hire-${hireId}`;
  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: `mobile-${userId}`,
    ttl: '4h',
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
```

### 3.2 server/index.ts
```typescript
import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { generateRoomToken } from './livekit-token';

dotenv.config({ path: '.env.server' });

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'trust-agent-mobile-token-server' }));

// LiveKit token endpoint — called by mobile app
app.post('/livekit/token', (req, res) => {
  const { userId, hireId, authToken } = req.body as {
    userId: string;
    hireId: string;
    authToken: string;
  };

  // Validate the Trust Agent auth token
  if (!authToken || !authToken.startsWith('mock-jwt-') && !authToken.startsWith('ta_')) {
    // In production: verify JWT against Trust Agent gateway
    // For now: basic presence check
    return res.status(401).json({ error: 'Invalid auth token' });
  }

  if (!userId || !hireId) {
    return res.status(400).json({ error: 'userId and hireId required' });
  }

  try {
    const token = generateRoomToken(userId, hireId);
    const serverUrl = process.env.LIVEKIT_SERVER_URL!;
    return res.json({ token, serverUrl, roomName: `hire-${hireId}` });
  } catch (e) {
    console.error('Token generation failed:', e);
    return res.status(500).json({ error: 'Token generation failed' });
  }
});

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => {
  console.log(`Trust Agent token server running on :${PORT}`);
});
```

### 3.3 lib/livekit.ts
```typescript
import { Room, RoomEvent, ConnectionState, RemoteParticipant, DataPacket_Kind } from 'livekit-client';

const TOKEN_SERVER = process.env.EXPO_PUBLIC_API_URL + '/livekit/token';

export interface LiveKitSession {
  room: Room;
  token: string;
  serverUrl: string;
}

export async function fetchRoomToken(
  authToken: string,
  userId: string,
  hireId: string
): Promise<{ token: string; serverUrl: string; roomName: string }> {
  // In dev mode, return a mock token structure
  if (__DEV__) {
    return {
      token: 'dev-livekit-token',
      serverUrl: process.env.EXPO_PUBLIC_LIVEKIT_URL ?? 'wss://localhost:7880',
      roomName: `hire-${hireId}`,
    };
  }

  const res = await fetch(TOKEN_SERVER, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, hireId, authToken }),
  });

  if (!res.ok) throw new Error('Failed to get session token');
  return res.json();
}

export function createRoom(): Room {
  return new Room({
    adaptiveStream: true,
    dynacast: true,
    audioCaptureDefaults: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });
}
```

### 3.4 hooks/useLiveKit.ts
```typescript
import { useEffect, useRef, useState, useCallback } from 'react';
import { Room, RoomEvent, ConnectionState, Track } from 'livekit-client';
import { registerGlobals } from '@livekit/react-native';
import { createRoom, fetchRoomToken } from '../lib/livekit';
import { useAuthStore } from '../store/authStore';

registerGlobals();

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
      room.on(RoomEvent.ConnectionStateChanged, (state) => {
        if (state === ConnectionState.Reconnecting) setStatus('connecting');
      });

      // Audio level monitoring for visualiser
      room.on(RoomEvent.AudioPlaybackStatusChanged, () => {});

      // Receive data messages from agent (text responses)
      room.on(RoomEvent.DataReceived, (payload, participant) => {
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

      // In dev mode: skip actual LiveKit connection, use mock
      if (__DEV__ && token === 'dev-livekit-token') {
        setStatus('connected');
        // Inject a welcome message
        setTimeout(() => {
          setAgentMessages([{
            id: 'welcome-dev',
            role: 'agent',
            content: 'Connected in development mode. LiveKit voice requires a real server — text mode is active.',
            timestamp: Date.now(),
          }]);
        }, 800);
        return;
      }

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
      // Dev mode: mock response
      setTimeout(() => {
        setAgentMessages(prev => [...prev, {
          id: `agent-${Date.now()}`,
          role: 'agent',
          content: `[Dev mode] You said: "${content}". Connect to a live Trust Agent server to get real responses.`,
          timestamp: Date.now(),
        }]);
      }, 1000);
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
```

### 3.5 hooks/useAgentSession.ts
```typescript
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
```

---

## PHASE 4 — STORES

### 4.1 store/roleStore.ts
```typescript
import { create } from 'zustand';
import { prefGet, prefSet } from '../lib/storage';

export interface HiredRole {
  hireId: string;
  roleName: string;
  roleCategory: 'C-Suite' | 'Management' | 'Specialist';
  trustScore: number;
  trustBadge: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BASIC';
}

interface RoleStore {
  roles: HiredRole[];
  isLoaded: boolean;
  loadRoles: () => Promise<void>;
  setRoles: (roles: HiredRole[]) => void;
}

// Dev mode seed data — removed once real API is connected
const DEV_ROLES: HiredRole[] = [
  { hireId: 'hire-cmo-001', roleName: 'Chief Marketing Officer', roleCategory: 'C-Suite', trustScore: 94, trustBadge: 'PLATINUM' },
  { hireId: 'hire-dev-001', roleName: 'Full Stack Developer', roleCategory: 'Specialist', trustScore: 87, trustBadge: 'GOLD' },
];

export const useRoleStore = create<RoleStore>((set) => ({
  roles: [],
  isLoaded: false,
  loadRoles: async () => {
    const cached = await prefGet<HiredRole[]>('hired_roles');
    set({ roles: cached ?? (__DEV__ ? DEV_ROLES : []), isLoaded: true });
  },
  setRoles: (roles) => {
    set({ roles });
    prefSet('hired_roles', roles);
  },
}));
```

### 4.2 store/sessionStore.ts
```typescript
import { create } from 'zustand';

interface SessionStore {
  activeHireId: string | null;
  setActiveRole: (hireId: string | null) => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  activeHireId: null,
  setActiveRole: (hireId) => set({ activeHireId: hireId }),
}));
```

---

## PHASE 5 — UI PRIMITIVES

### 5.1 components/ui/Button.tsx
```typescript
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import * as Haptics from 'expo-haptics';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ label, onPress, variant = 'primary', size = 'md', loading, disabled, style }: ButtonProps) {
  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const isDisabled = disabled || loading;

  const containerStyle = [
    styles.base,
    styles[variant],
    styles[size],
    isDisabled && styles.disabled,
    style,
  ];

  return (
    <TouchableOpacity style={containerStyle} onPress={handlePress} disabled={isDisabled} activeOpacity={0.75}>
      {loading
        ? <ActivityIndicator color={variant === 'primary' ? colors.white : colors.electricBlue} size="small" />
        : <Text style={[styles.label, styles[`label_${variant}`], styles[`label_${size}`]]}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: colors.electricBlue },
  secondary: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.electricBlue },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.error },
  disabled: { opacity: 0.4 },
  sm: { paddingVertical: 8, paddingHorizontal: 16 },
  md: { paddingVertical: 12, paddingHorizontal: 24 },
  lg: { paddingVertical: 16, paddingHorizontal: 32 },
  label: { ...typography.body, fontFamily: 'Manrope_600SemiBold' },
  label_primary: { color: colors.white },
  label_secondary: { color: colors.electricBlue },
  label_ghost: { color: colors.textMuted },
  label_danger: { color: colors.white },
  label_sm: { fontSize: 13 },
  label_md: { fontSize: 15 },
  label_lg: { fontSize: 17 },
});
```

### 5.2 components/ui/Badge.tsx
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';

type BadgeVariant = 'PLATINUM' | 'GOLD' | 'SILVER' | 'BASIC';

const badgeConfig: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  PLATINUM: { bg: 'rgba(0,212,255,0.12)', text: colors.ionCyan,      border: colors.ionCyan },
  GOLD:     { bg: 'rgba(255,183,64,0.12)', text: '#FFB740',           border: '#FFB740' },
  SILVER:   { bg: 'rgba(192,200,216,0.12)', text: '#C0C8D8',          border: '#C0C8D8' },
  BASIC:    { bg: 'rgba(136,153,187,0.12)', text: colors.textMuted,   border: colors.textMuted },
};

export function Badge({ variant }: { variant: BadgeVariant }) {
  const cfg = badgeConfig[variant];
  return (
    <View style={[styles.container, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      <Text style={[styles.text, { color: cfg.text }]}>{variant} VERIFIED</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.monoSm,
    fontFamily: 'Manrope_700Bold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
});
```

### 5.3 components/ui/Card.tsx
```typescript
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../constants/colors';

interface CardProps {
  children: React.ReactNode;
  variant?: 'dark' | 'light';
  style?: ViewStyle;
}

export function Card({ children, variant = 'dark', style }: CardProps) {
  return (
    <View style={[styles.base, variant === 'dark' ? styles.dark : styles.light, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 8, padding: 16, borderWidth: 1 },
  dark: { backgroundColor: colors.navy2, borderColor: 'rgba(30,111,255,0.3)' },
  light: { backgroundColor: colors.white, borderColor: colors.borderBlue },
});
```

---

## PHASE 6 — AGENT COMPONENTS

### 6.1 components/agent/VoiceOrb.tsx

Animated orb that reacts to voice activity. The visual centrepiece of the session screen.

```typescript
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

interface VoiceOrbProps {
  isUserSpeaking: boolean;
  isAgentSpeaking: boolean;
  isConnected: boolean;
  audioLevel?: number; // 0–1
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
        {/* Inner triangle — Trust Agent shield reference */}
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
```

### 6.2 components/agent/RoleCard.tsx
```typescript
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { Badge } from '../ui/Badge';
import type { HiredRole } from '../../store/roleStore';
import * as Haptics from 'expo-haptics';

interface RoleCardProps {
  role: HiredRole;
  onPress: () => void;
}

export function RoleCard({ role, onPress }: RoleCardProps) {
  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.8}>
      <View style={styles.left}>
        {/* Shield avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {role.roleName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
          </Text>
        </View>
      </View>
      <View style={styles.middle}>
        <Text style={styles.roleName}>{role.roleName}</Text>
        <Text style={styles.category}>{role.roleCategory}</Text>
        <Badge variant={role.trustBadge} />
      </View>
      <View style={styles.right}>
        <Text style={styles.score}>{role.trustScore}</Text>
        <Text style={styles.scoreLabel}>Score</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.navy2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(30,111,255,0.25)',
    padding: 16,
    marginBottom: 12,
  },
  left: { marginRight: 14 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.midBlue,
    borderWidth: 1.5,
    borderColor: colors.electricBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...typography.h3, color: colors.ionCyan, fontSize: 16 },
  middle: { flex: 1, gap: 4 },
  roleName: { ...typography.h3, color: colors.white, fontSize: 16 },
  category: { ...typography.bodySm, color: colors.textMuted },
  right: { alignItems: 'center' },
  score: { ...typography.h2, color: colors.ionCyan, fontSize: 24 },
  scoreLabel: { ...typography.monoSm, color: colors.textMuted, marginTop: 2 },
});
```

### 6.3 components/agent/ChatBubble.tsx
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import type { AgentMessage } from '../../hooks/useLiveKit';

export function ChatBubble({ message }: { message: AgentMessage }) {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      {!isUser && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>TA</Text>
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAgent]}>
        <Text style={[styles.text, isUser && styles.textUser]}>{message.content}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12, paddingHorizontal: 16 },
  rowUser: { justifyContent: 'flex-end' },
  avatar: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.navy2,
    borderWidth: 1, borderColor: colors.electricBlue,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 8, flexShrink: 0,
  },
  avatarText: { ...typography.monoSm, color: colors.ionCyan, fontSize: 9, fontFamily: 'Manrope_700Bold' },
  bubble: {
    maxWidth: '78%', padding: 12, borderRadius: 16,
  },
  bubbleUser: {
    backgroundColor: colors.electricBlue,
    borderBottomRightRadius: 4,
  },
  bubbleAgent: {
    backgroundColor: colors.navy2,
    borderWidth: 1, borderColor: 'rgba(30,111,255,0.3)',
    borderBottomLeftRadius: 4,
  },
  text: { ...typography.body, color: colors.white, lineHeight: 22 },
  textUser: { color: colors.white },
});
```

### 6.4 components/agent/ChatInput.tsx
```typescript
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import * as Haptics from 'expo-haptics';

interface ChatInputProps {
  onSend: (text: string) => void;
  onMicPress: () => void;
  isMicActive: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSend, onMicPress, isMicActive, disabled }: ChatInputProps) {
  const [text, setText] = useState('');

  const handleSend = async () => {
    if (!text.trim() || disabled) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSend(text.trim());
    setText('');
  };

  const handleMic = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onMicPress();
  };

  return (
    <View style={styles.container}>
      {/* Mic button */}
      <TouchableOpacity
        style={[styles.micButton, isMicActive && styles.micButtonActive]}
        onPress={handleMic}
        disabled={disabled}
        accessibilityLabel={isMicActive ? 'Stop voice' : 'Start voice'}
      >
        <Text style={[styles.micIcon, isMicActive && styles.micIconActive]}>
          {isMicActive ? '⏹' : '🎙'}
        </Text>
      </TouchableOpacity>

      {/* Text input */}
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder={`Message your agent...`}
        placeholderTextColor={colors.textMuted}
        multiline
        maxLength={2000}
        onSubmitEditing={handleSend}
        editable={!disabled}
        returnKeyType="send"
        enablesReturnKeyAutomatically
      />

      {/* Send button */}
      <TouchableOpacity
        style={[styles.sendButton, (!text.trim() || disabled) && styles.sendButtonDisabled]}
        onPress={handleSend}
        disabled={!text.trim() || disabled}
        accessibilityLabel="Send message"
      >
        <Text style={styles.sendIcon}>↑</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: 24, // safe area buffer
    backgroundColor: colors.darkNavy,
    borderTopWidth: 1,
    borderTopColor: 'rgba(30,111,255,0.2)',
    gap: 8,
  },
  micButton: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1.5, borderColor: colors.borderBlue,
    alignItems: 'center', justifyContent: 'center',
  },
  micButtonActive: {
    borderColor: colors.ionCyan,
    backgroundColor: 'rgba(0,212,255,0.1)',
  },
  micIcon: { fontSize: 18 },
  micIconActive: {},
  input: {
    flex: 1,
    backgroundColor: colors.navy2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderBlue,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.white,
    ...typography.body,
    maxHeight: 120,
  },
  sendButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.electricBlue,
    alignItems: 'center', justifyContent: 'center',
  },
  sendButtonDisabled: { backgroundColor: 'rgba(30,111,255,0.3)' },
  sendIcon: { color: colors.white, fontSize: 18, fontWeight: '700' },
});
```

### 6.5 components/layout/ConnectionPill.tsx
```typescript
import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../../constants/colors';

type Status = 'connected' | 'connecting' | 'disconnected' | 'error' | 'idle';

const statusConfig: Record<Status, { color: string; label: string }> = {
  connected:    { color: colors.success,       label: 'Connected' },
  connecting:   { color: '#FFB740',             label: 'Connecting...' },
  disconnected: { color: colors.textMuted,      label: 'Disconnected' },
  error:        { color: colors.error,          label: 'Error' },
  idle:         { color: colors.textMuted,      label: 'Not started' },
};

export function ConnectionPill({ status }: { status: Status }) {
  const cfg = statusConfig[status];
  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: cfg.color }]} />
      <Text style={[styles.label, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
  label: { ...typography.monoSm, fontSize: 11 },
});

import { typography } from '../../constants/typography';
```

---

## PHASE 7 — SCREENS

### 7.1 app/_layout.tsx
```typescript
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import {
  useFonts,
  Manrope_400Regular,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import {
  JetBrainsMono_400Regular,
} from '@expo-google-fonts/jetbrains-mono';
import { useRoleStore } from '../store/roleStore';
import { useAuthStore } from '../store/authStore';
import { restoreSession } from '../lib/auth';
import { colors } from '../constants/colors';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
    JetBrainsMono_400Regular,
  });

  const { login, setLoading } = useAuthStore();
  const { loadRoles } = useRoleStore();

  useEffect(() => {
    async function init() {
      const session = await restoreSession();
      if (session) {
        login(session.token, session.userId);
        await loadRoles();
      } else {
        setLoading(false);
      }
    }
    init();
  }, []);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.darkNavy }} />;
  }

  return (
    <>
      <StatusBar style="light" backgroundColor={colors.darkNavy} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.darkNavy } }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}
```

### 7.2 app/index.tsx
```typescript
import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '../constants/colors';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.darkNavy }}>
        <ActivityIndicator color={colors.ionCyan} size="large" />
      </View>
    );
  }

  return <Redirect href={isAuthenticated ? '/(tabs)/dashboard' : '/login'} />;
}
```

### 7.3 app/login.tsx

Full login screen with API key entry:

```typescript
import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { loginWithApiKey } from '../lib/auth';
import { useAuthStore } from '../store/authStore';
import { useRoleStore } from '../store/roleStore';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';

export default function LoginScreen() {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuthStore();
  const { loadRoles } = useRoleStore();

  const handleLogin = async () => {
    if (!apiKey.trim()) { setError('Please enter your API key.'); return; }
    setLoading(true);
    setError(null);
    try {
      const result = await loginWithApiKey(apiKey.trim());
      login(result.token, result.userId);
      await loadRoles();
      router.replace('/(tabs)/dashboard');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Left accent bar */}
        <View style={styles.accentBar} />

        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={styles.shield}>
            <Text style={styles.shieldText}>TA</Text>
          </View>
          <Text style={styles.brand}>
            <Text style={styles.brandWhite}>Trust </Text>
            <Text style={styles.brandBlue}>Agent</Text>
          </Text>
          <Text style={styles.version}>Mobile v1.0</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.heading}>Connect your workspace</Text>
          <Text style={styles.sub}>Enter the API key from your Trust Agent account to access your hired roles.</Text>

          <View style={styles.inputWrap}>
            <Text style={styles.label}>API Key</Text>
            <View style={[styles.inputBox, error ? styles.inputBoxError : null]}>
              <Text style={styles.inputPrefix}>ta_live_</Text>
              <View style={styles.divider} />
              <Text
                style={styles.inputField}
                numberOfLines={1}
              >
                {apiKey.replace(/^ta_live_/i, '') || ' '}
              </Text>
            </View>
            {/* Actual input layered behind */}
            <Input
              value={apiKey}
              onChangeText={(v) => { setApiKey(v); setError(null); }}
              placeholder="ta_live_xxxxxxxxxxxxxxxxxxxxxxxx"
              monospace
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.hiddenInput}
            />
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <Button
            label={loading ? 'Connecting...' : 'Connect'}
            onPress={handleLogin}
            loading={loading}
            disabled={!apiKey.trim()}
            style={styles.button}
          />

          {__DEV__ && (
            <Button
              label="Dev mode (skip login)"
              onPress={() => { setApiKey('ta_dev_preview'); handleLogin(); }}
              variant="ghost"
              style={styles.devButton}
            />
          )}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          AgentCore LTD · 17114811 · trust-agent.ai
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.darkNavy },
  container: { flexGrow: 1, padding: 28, paddingTop: 80 },
  accentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: colors.electricBlue },
  logoSection: { alignItems: 'center', marginBottom: 48, gap: 10 },
  shield: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.navy2,
    borderWidth: 2, borderColor: colors.electricBlue,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  shieldText: { ...typography.h2, color: colors.ionCyan, fontSize: 22 },
  brand: { ...typography.display, fontSize: 34 },
  brandWhite: { color: colors.white },
  brandBlue: { color: colors.electricBlue },
  version: { ...typography.mono, color: colors.ionCyan, fontSize: 11 },
  form: { gap: 16 },
  heading: { ...typography.h2, color: colors.white },
  sub: { ...typography.body, color: colors.textMuted, lineHeight: 22 },
  label: { ...typography.label, color: colors.textMuted, marginBottom: 6, textTransform: 'uppercase' },
  inputWrap: { position: 'relative' },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: colors.borderBlue, borderRadius: 8,
    backgroundColor: colors.navy2, padding: 12, height: 50,
  },
  inputBoxError: { borderColor: colors.error },
  inputPrefix: { ...typography.mono, color: colors.ionCyan, fontSize: 13 },
  divider: { width: 1, height: 18, backgroundColor: colors.borderBlue, marginHorizontal: 8 },
  inputField: { ...typography.mono, color: colors.white, flex: 1, fontSize: 13 },
  hiddenInput: { position: 'absolute', opacity: 0, top: 0, left: 0, right: 0, height: 50 },
  error: { ...typography.bodySm, color: colors.error },
  button: { marginTop: 8 },
  devButton: { marginTop: 4 },
  footer: { ...typography.monoSm, color: colors.textMuted, textAlign: 'center', marginTop: 'auto', paddingTop: 32 },
});
```

### 7.4 app/(tabs)/_layout.tsx
```typescript
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabItem}>
      <Text style={[styles.icon, focused && styles.iconActive]}>{icon}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="⬡" label="Roles" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="session"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="◎" label="Session" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="marketplace"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="⊞" label="Market" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="⊙" label="Settings" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.navy2,
    borderTopWidth: 1,
    borderTopColor: 'rgba(30,111,255,0.25)',
    height: 72,
    paddingBottom: 12,
  },
  tabItem: { alignItems: 'center', gap: 4 },
  icon: { fontSize: 22, color: colors.textMuted },
  iconActive: { color: colors.ionCyan },
  tabLabel: { fontSize: 10, fontFamily: 'Manrope_600SemiBold', color: colors.textMuted },
  tabLabelActive: { color: colors.ionCyan },
});
```

### 7.5 app/(tabs)/dashboard.tsx
```typescript
import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { RoleCard } from '../../components/agent/RoleCard';
import { Button } from '../../components/ui/Button';
import { useRoleStore } from '../../store/roleStore';
import { useSessionStore } from '../../store/sessionStore';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';

export default function DashboardScreen() {
  const { roles } = useRoleStore();
  const { setActiveRole } = useSessionStore();

  const handleRolePress = (hireId: string) => {
    setActiveRole(hireId);
    router.push('/(tabs)/session');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.accentBar} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        <View style={styles.header}>
          <Text style={styles.title}>Your Roles</Text>
          <Text style={styles.sub}>{roles.length} hired · trust-agent.ai</Text>
        </View>

        {roles.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>⬡</Text>
            <Text style={styles.emptyTitle}>No roles hired yet</Text>
            <Text style={styles.emptySub}>Browse the Trust Agent marketplace to hire your first AI role.</Text>
            <Button
              label="Browse Marketplace"
              onPress={() => router.push('/(tabs)/marketplace')}
              variant="secondary"
              style={styles.emptyButton}
            />
          </View>
        ) : (
          <View style={styles.roleList}>
            {roles.map(role => (
              <RoleCard key={role.hireId} role={role} onPress={() => handleRolePress(role.hireId)} />
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.darkNavy },
  accentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: colors.electricBlue, zIndex: 10 },
  scroll: { flex: 1 },
  content: { padding: 24, paddingLeft: 28, paddingBottom: 48 },
  header: { marginBottom: 28 },
  title: { ...typography.h1, color: colors.white, marginBottom: 4 },
  sub: { ...typography.mono, color: colors.textMuted, fontSize: 12 },
  roleList: { gap: 0 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyIcon: { fontSize: 56, color: colors.midBlue },
  emptyTitle: { ...typography.h2, color: colors.white },
  emptySub: { ...typography.body, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  emptyButton: { marginTop: 8, alignSelf: 'stretch' },
});
```

### 7.6 app/(tabs)/session.tsx

The main session screen — voice orb + chat:

```typescript
import React, { useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  KeyboardAvoidingView, Platform, TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { VoiceOrb } from '../../components/agent/VoiceOrb';
import { ChatBubble } from '../../components/agent/ChatBubble';
import { ChatInput } from '../../components/agent/ChatInput';
import { ConnectionPill } from '../../components/layout/ConnectionPill';
import { Badge } from '../../components/ui/Badge';
import { useAgentSession } from '../../hooks/useAgentSession';
import { useSessionStore } from '../../store/sessionStore';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';

export default function SessionScreen() {
  const { activeHireId } = useSessionStore();
  const scrollRef = useRef<ScrollView>(null);

  // If no role selected, go back to dashboard
  if (!activeHireId) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.noRole}>
          <Text style={styles.noRoleText}>No role selected.</Text>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/dashboard')}>
            <Text style={styles.noRoleLink}>← Back to roles</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const {
    role, status, isMicActive, isAgentSpeaking,
    agentMessages, startSession, endSession, toggleMic, sendTextMessage,
  } = useAgentSession(activeHireId);

  useEffect(() => {
    startSession();
    return () => { endSession(); };
  }, [activeHireId]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [agentMessages.length]);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.roleName}>{role?.roleName ?? 'Agent'}</Text>
            {role && <Badge variant={role.trustBadge} />}
          </View>
          <ConnectionPill status={status} />
        </View>

        {/* Voice orb — centred at top of chat */}
        <View style={styles.orbSection}>
          <VoiceOrb
            isUserSpeaking={isMicActive}
            isAgentSpeaking={isAgentSpeaking}
            isConnected={status === 'connected'}
          />
          {status === 'connecting' && (
            <Text style={styles.connectingLabel}>Connecting to {role?.roleName}...</Text>
          )}
        </View>

        {/* Chat messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.chat}
          contentContainerStyle={styles.chatContent}
          keyboardShouldPersistTaps="handled"
        >
          {agentMessages.length === 0 ? (
            <View style={styles.emptyChat}>
              <Text style={styles.emptyChatText}>
                {status === 'connected'
                  ? `${role?.roleName ?? 'Your agent'} is ready. Speak or type to begin.`
                  : 'Establishing connection...'}
              </Text>
            </View>
          ) : (
            agentMessages.map(msg => <ChatBubble key={msg.id} message={msg} />)
          )}
        </ScrollView>

        {/* Input */}
        <ChatInput
          onSend={sendTextMessage}
          onMicPress={toggleMic}
          isMicActive={isMicActive}
          disabled={status === 'connecting' || status === 'error'}
        />

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.darkNavy },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(30,111,255,0.2)',
    gap: 12,
  },
  backButton: { padding: 4 },
  backIcon: { ...typography.h2, color: colors.electricBlue, fontSize: 22 },
  headerCenter: { flex: 1, gap: 4 },
  roleName: { ...typography.h3, color: colors.white },
  orbSection: { alignItems: 'center', paddingVertical: 24, gap: 12 },
  connectingLabel: { ...typography.mono, color: colors.textMuted, fontSize: 12 },
  chat: { flex: 1 },
  chatContent: { paddingTop: 8, paddingBottom: 16, flexGrow: 1, justifyContent: 'flex-end' },
  emptyChat: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, minHeight: 100 },
  emptyChatText: { ...typography.body, color: colors.textMuted, textAlign: 'center', lineHeight: 24 },
  noRole: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  noRoleText: { ...typography.body, color: colors.textMuted },
  noRoleLink: { ...typography.body, color: colors.electricBlue },
});
```

### 7.7 app/(tabs)/marketplace.tsx
```typescript
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
```

### 7.8 app/(tabs)/settings.tsx
```typescript
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Switch, Linking } from 'react-native';
import { router } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { logout } from '../../lib/auth';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';

export default function SettingsScreen() {
  const { logout: logoutStore, token } = useAuthStore();
  const maskedToken = token ? token.slice(0, 12) + '...' : '—';

  const handleLogout = async () => {
    await logout();
    logoutStore();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        <Text style={styles.pageTitle}>Settings</Text>

        {/* Connection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connection</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Gateway</Text>
            <Text style={styles.rowValue}>{process.env.EXPO_PUBLIC_API_URL}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Session token</Text>
            <Text style={styles.rowValueMono}>{maskedToken}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>LiveKit server</Text>
            <Text style={styles.rowValue}>{process.env.EXPO_PUBLIC_LIVEKIT_URL ?? 'Not configured'}</Text>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Version</Text>
            <Text style={styles.rowValueMono}>v{process.env.EXPO_PUBLIC_APP_VERSION}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Platform</Text>
            <Text style={styles.rowValue}>Trust Agent Mobile</Text>
          </View>
          <Button
            label="View on GitHub"
            onPress={() => Linking.openURL('https://github.com/TrustAgentAI/trust-agent-mobile')}
            variant="ghost"
            style={styles.linkButton}
          />
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <Text style={styles.legal}>
            AgentCore LTD · Company No. 17114811{'\n'}
            20 Wenlock Road, London, England, N1 7GU{'\n'}
            info@trust-agent.ai
          </Text>
        </View>

        {/* Sign out */}
        <Button
          label="Disconnect"
          onPress={handleLogout}
          variant="danger"
          style={styles.logoutButton}
        />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.darkNavy },
  scroll: { flex: 1 },
  content: { padding: 24, gap: 8, paddingBottom: 48 },
  pageTitle: { ...typography.h1, color: colors.white, marginBottom: 24 },
  section: {
    backgroundColor: colors.navy2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(30,111,255,0.2)',
    padding: 16,
    marginBottom: 16,
    gap: 10,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.ionCyan,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { ...typography.body, color: colors.textMuted, flex: 1 },
  rowValue: { ...typography.body, color: colors.white, flex: 2, textAlign: 'right' },
  rowValueMono: { ...typography.mono, color: colors.ionCyan, flex: 2, textAlign: 'right', fontSize: 12 },
  linkButton: { marginTop: 4 },
  legal: { ...typography.bodySm, color: colors.textMuted, lineHeight: 20 },
  logoutButton: { marginTop: 8 },
});
```

### 7.9 Missing Input component
Create `components/ui/Input.tsx`:
```typescript
import React from 'react';
import { TextInput, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';

interface InputProps {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  monospace?: boolean;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  style?: ViewStyle;
  returnKeyType?: 'done' | 'send' | 'next';
  onSubmitEditing?: () => void;
  editable?: boolean;
}

export function Input({
  value, onChangeText, placeholder, monospace, secureTextEntry,
  autoCapitalize = 'none', autoCorrect = false, style,
  returnKeyType, onSubmitEditing, editable = true,
}: InputProps) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      secureTextEntry={secureTextEntry}
      autoCapitalize={autoCapitalize}
      autoCorrect={autoCorrect}
      returnKeyType={returnKeyType}
      onSubmitEditing={onSubmitEditing}
      editable={editable}
      style={[
        styles.input,
        monospace && styles.mono,
        !editable && styles.disabled,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.navy2,
    borderWidth: 1,
    borderColor: colors.borderBlue,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.white,
    ...typography.body,
    fontSize: 15,
  } as TextStyle,
  mono: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 13 } as TextStyle,
  disabled: { opacity: 0.5 } as ViewStyle,
});
```

---

## PHASE 8 — PYTHON SIDECAR UPDATE

Add LiveKit support to the existing Desktop sidecar. Create the file:

**agent-runtime/runtime/livekit_worker.py**

```python
"""
LiveKit worker — wraps the existing AgentOrchestrator for real-time mobile sessions.
Requires: pip install livekit-agents livekit-agents[deepgram] livekit-agents[elevenlabs] livekit-agents[silero]
"""
import asyncio
import json
import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Only import livekit if installed — graceful degradation
try:
    from livekit.agents import (
        Agent,
        AgentSession,
        JobContext,
        WorkerOptions,
        cli,
        llm,
    )
    from livekit.agents.voice import VoicePipelineAgent
    from livekit import rtc
    LIVEKIT_AVAILABLE = True
except ImportError:
    LIVEKIT_AVAILABLE = False
    logger.warning("livekit-agents not installed. Mobile voice sessions unavailable.")


async def start_mobile_session(hire_id: str, session_token: str):
    """
    Entry point called when a mobile user joins a LiveKit room.
    The room name is 'hire-{hire_id}'.
    """
    if not LIVEKIT_AVAILABLE:
        logger.error("Cannot start mobile session: livekit-agents not installed.")
        return

    from .orchestrator import AgentOrchestrator

    orch = AgentOrchestrator(hire_id, session_token)
    await orch.load_config()

    # LiveKit room connection
    room_name = f"hire-{hire_id}"
    livekit_url = os.environ.get("LIVEKIT_SERVER_URL", "ws://localhost:7880")
    livekit_token = os.environ.get(f"LIVEKIT_AGENT_TOKEN_{hire_id}", "")

    if not livekit_token:
        logger.warning(f"No LiveKit agent token found for hire {hire_id}. Text-only fallback.")
        return

    room = rtc.Room()

    @room.on("data_received")
    def on_data(data_packet: rtc.DataPacket):
        """Handle text messages from the mobile app."""
        try:
            msg = json.loads(data_packet.data.decode())
            if msg.get("type") == "user:message":
                asyncio.ensure_future(handle_text_message(room, orch, msg["content"]))
        except Exception as e:
            logger.error(f"Data receive error: {e}")

    async def handle_text_message(room: rtc.Room, orch: AgentOrchestrator, content: str):
        """Process text message and stream response back to mobile."""
        full_response = ""
        # Stream tokens back via data channel
        async for token in orch.stream_response([{"role": "user", "content": content}]):
            full_response += token
            # Send partial tokens
            payload = json.dumps({
                "type": "agent:token",
                "content": token,
            }).encode()
            await room.local_participant.publish_data(payload, reliable=True)

        # Send completion
        complete_payload = json.dumps({
            "type": "agent:message",
            "content": full_response,
            "messageId": f"msg-{asyncio.get_event_loop().time()}",
        }).encode()
        await room.local_participant.publish_data(complete_payload, reliable=True)

    await room.connect(livekit_url, livekit_token)
    logger.info(f"Agent connected to room {room_name}")

    # Keep alive
    try:
        while room.connection_state == rtc.ConnectionState.CONN_CONNECTED:
            await asyncio.sleep(1)
    finally:
        await room.disconnect()
        logger.info(f"Agent disconnected from room {room_name}")
```

Update `agent-runtime/requirements.txt` — append:
```
livekit-agents>=0.8.0
livekit>=0.11.0
```

---

## PHASE 9 — PACKAGE.JSON & BUILD CONFIG

**package.json** (scripts section):
```json
{
  "scripts": {
    "start":          "expo start",
    "android":        "expo run:android",
    "ios":            "expo run:ios",
    "web":            "expo start --web",
    "token-server":   "ts-node server/index.ts",
    "type-check":     "tsc --noEmit",
    "lint":           "eslint . --ext .ts,.tsx"
  }
}
```

---

## PHASE 10 — VERIFICATION TESTS

Run ALL of the following. Fix every failure before proceeding to Phase 11.

```bash
# 1. TypeScript — zero errors required
npx tsc --noEmit
echo "Exit code: $?"

# 2. Check fonts are referenced correctly
grep -r "Manrope_800ExtraBold\|JetBrainsMono_400Regular" app/ components/ constants/ | wc -l
# Expected: > 0

# 3. Brand colour check — no warm tones
grep -rn "orange\|amber\|yellow\|purple" constants/ components/ app/ --include="*.tsx" --include="*.ts" | grep -v "//\|error\|success" | grep -v "#FFB740"
# Expected: 0 results

# 4. Token naming check
grep -rn "TRUST\b\|\$TA\b\|trustagent\|TRUST AGENT\|Trust-Agent" app/ components/ lib/ store/ --include="*.tsx" --include="*.ts" | grep -v "trust-agent.ai\|TrustAgentAI\|trust_agent\|trust-agent-"
# Expected: 0 violations

# 5. No mention of AI assistant in code
grep -rni "claude\|anthropic\|openai\|gpt\|gemini" app/ components/ lib/ store/ --include="*.tsx" --include="*.ts" | grep -v "EXPO_PUBLIC\|process.env\|// \|placeholder\|model"
# Expected: 0 results (no assistant branding in code)

# 6. Check all screens import correctly
node -e "
const files = [
  'app/_layout.tsx', 'app/index.tsx', 'app/login.tsx',
  'app/(tabs)/_layout.tsx', 'app/(tabs)/dashboard.tsx',
  'app/(tabs)/session.tsx', 'app/(tabs)/marketplace.tsx',
  'app/(tabs)/settings.tsx',
];
const fs = require('fs');
let allGood = true;
files.forEach(f => {
  if (!fs.existsSync(f)) { console.error('MISSING:', f); allGood = false; }
  else console.log('OK:', f);
});
if (allGood) console.log('All screen files present.');
"

# 7. Check all components exist
node -e "
const files = [
  'components/ui/Button.tsx', 'components/ui/Input.tsx',
  'components/ui/Badge.tsx', 'components/ui/Card.tsx',
  'components/agent/VoiceOrb.tsx', 'components/agent/RoleCard.tsx',
  'components/agent/ChatBubble.tsx', 'components/agent/ChatInput.tsx',
  'components/layout/ConnectionPill.tsx',
  'components/marketplace/MarketplaceView.tsx',
  'hooks/useLiveKit.ts', 'hooks/useAgentSession.ts',
  'hooks/useAuth.ts',
  'lib/auth.ts', 'lib/livekit.ts', 'lib/storage.ts', 'lib/api.ts',
  'store/authStore.ts', 'store/roleStore.ts',
  'store/sessionStore.ts', 'store/auditStore.ts',
  'constants/colors.ts', 'constants/typography.ts',
  'server/index.ts', 'server/livekit-token.ts',
];
const fs = require('fs');
let missing = [];
files.forEach(f => { if (!fs.existsSync(f)) missing.push(f); });
if (missing.length) { console.error('MISSING FILES:', missing); process.exit(1); }
else console.log('All files present.');
"

# 8. Python sidecar LiveKit file exists
test -f agent-runtime/runtime/livekit_worker.py && echo "LIVEKIT WORKER: OK" || echo "LIVEKIT WORKER: MISSING — create it"

# 9. Expo config check
node -e "
const config = require('./app.json');
const checks = [
  ['scheme', config.expo.scheme === 'trustagent'],
  ['ios bundleId', config.expo.ios?.bundleIdentifier === 'ai.trust-agent.mobile'],
  ['android package', config.expo.android?.package === 'ai.trust_agent.mobile'],
  ['livekit plugin', config.expo.plugins?.some(p => Array.isArray(p) ? p[0].includes('livekit') : p.includes('livekit'))],
  ['mic permission ios', !!config.expo.ios?.infoPlist?.NSMicrophoneUsageDescription],
  ['mic permission android', config.expo.android?.permissions?.includes('RECORD_AUDIO')],
];
let pass = true;
checks.forEach(([name, ok]) => { console.log(ok ? 'OK' : 'FAIL', name); if (!ok) pass = false; });
if (!pass) process.exit(1);
"
```

---

## PHASE 11 — MISSING FILES TO CREATE

Any files listed as MISSING in Phase 10 checks must be created before proceeding. Additionally, ensure these exist:

**components/marketplace/MarketplaceView.tsx** — same implementation as `app/(tabs)/marketplace.tsx` but as a reusable component (for embedding elsewhere).

**hooks/useAuth.ts** — thin wrapper around authStore:
```typescript
import { useAuthStore } from '../store/authStore';
export const useAuth = () => useAuthStore();
```

**lib/api.ts** — base fetch wrapper:
```typescript
const API_URL = process.env.EXPO_PUBLIC_API_URL!;

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
  token?: string,
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  };

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error('Network error. Check your connection.');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}
```

**store/auditStore.ts:**
```typescript
import { create } from 'zustand';

export interface AuditEvent {
  id: string;
  hireId: string;
  action: 'READ' | 'WRITE' | 'API_CALL' | 'TOOL_USE' | 'MESSAGE' | 'ERROR';
  description: string;
  timestamp: number;
}

interface AuditStore {
  events: AuditEvent[];
  addEvent: (event: AuditEvent) => void;
  clearEvents: () => void;
}

export const useAuditStore = create<AuditStore>((set) => ({
  events: [],
  addEvent: (event) => set((s) => ({
    events: [...s.events.slice(-499), event], // keep last 500
  })),
  clearEvents: () => set({ events: [] }),
}));
```

---

## PHASE 12 — FINAL COMMIT

Only run after ALL Phase 10 checks pass.

```bash
# Final type check
npx tsc --noEmit
# Must exit 0

# Git init if needed
git init 2>/dev/null || true
git remote add origin https://github.com/TrustAgentAI/trust-agent-mobile 2>/dev/null || true

# Stage everything
git add -A
git status

# Commit
git commit -m "feat: Trust Agent Mobile v1.0 — complete

Stack: Expo React Native + LiveKit WebRTC + Zustand

Screens:
- Login: API key auth with dev bypass, Trust Agent branded
- Dashboard: hired role list with Trust Score badges, tap to session
- Session: VoiceOrb visualiser, streaming chat, LiveKit voice, mic toggle
- Marketplace: embedded trust-agent.ai/marketplace WebView
- Settings: connection info, version, legal, disconnect

Components:
- VoiceOrb: animated visualiser (pulse on agent speaking, glow on user mic)
- RoleCard: role name, category, trust badge pill, Trust Score
- ChatBubble: user/agent message styles, branded
- ChatInput: text + mic toggle, haptics
- ConnectionPill: LiveKit status indicator
- Button, Input, Badge, Card: full UI primitives

Hooks:
- useLiveKit: room connect/disconnect, mic toggle, text via data channel
- useAgentSession: session lifecycle wrapper
- useAuth: auth state
- useVoiceActivity: VAD + audio level

Infrastructure:
- server/: Express token server for LiveKit room JWT generation
- agent-runtime/runtime/livekit_worker.py: Desktop sidecar LiveKit extension
- All env vars via EXPO_PUBLIC_ prefix, never hardcoded

Brand compliance:
- Dark Navy #0A1628 base, Electric Blue #1E6FFF primary, Ion Cyan #00D4FF accent
- Manrope ExtraBold 800 headlines, JetBrains Mono for technical content
- Zero warm tones, zero non-brand fonts, zero Trust Agent naming violations
- AgentCore LTD footer on login screen

Dev mode:
- 'ta_dev_preview' key bypasses auth, loads seed roles
- Mock agent response when LiveKit not configured
- All features gracefully degrade without live servers

Zero TypeScript errors. All verification checks pass."

# Push
git push -u origin main

echo ""
echo "TRUST AGENT MOBILE v1.0 — COMPLETE"
echo "Repo: https://github.com/TrustAgentAI/trust-agent-mobile"
echo ""
echo "Next steps:"
echo "  iOS:     npx expo run:ios"
echo "  Android: npx expo run:android"
echo "  Token server: npm run token-server"
```

---

## COMPLETION CHECKLIST

Do not stop until every item is checked:

- [ ] All Phase 0 dependencies installed (check node_modules/@livekit exists)
- [ ] app.json correctly configured (scheme, permissions, plugins)
- [ ] All screen files exist and have no import errors
- [ ] All component files exist
- [ ] All store files exist
- [ ] All hook files exist
- [ ] All lib files exist
- [ ] server/index.ts and server/livekit-token.ts exist
- [ ] agent-runtime/runtime/livekit_worker.py exists
- [ ] constants/colors.ts and constants/typography.ts exist
- [ ] `npx tsc --noEmit` exits 0
- [ ] Zero warm-tone colour violations (grep check passes)
- [ ] Zero token naming violations
- [ ] Zero AI assistant name references in code
- [ ] Expo config checks all pass
- [ ] Dev mode login works (ta_dev_preview key)
- [ ] Dashboard shows dev seed roles (CMO + Full Stack Dev)
- [ ] Session screen renders VoiceOrb
- [ ] Marketplace screen renders WebView
- [ ] Settings screen renders all sections
- [ ] Git commit made with full message
- [ ] Pushed to https://github.com/TrustAgentAI/trust-agent-mobile

**If any item is unchecked: fix it. Do not stop early.**

---

*Trust Agent Mobile — AgentCore LTD — Company No. 17114811*
*20 Wenlock Road, London, England, N1 7GU — trust-agent.ai*
