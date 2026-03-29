import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { generateRoomToken, generateToken, validateTokenRequest } from './livekit-token';

dotenv.config({ path: '.env.server' });

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'trust-agent-mobile-token-server' });
});

// LiveKit token endpoint - generic (roomName, participantName, apiKey)
app.post('/livekit-token', async (req, res) => {
  const validation = validateTokenRequest(req.body);

  if (!validation.valid || !validation.data) {
    return res.status(400).json({ error: validation.error });
  }

  const { roomName, participantName } = validation.data;

  try {
    const token = await generateToken(roomName, participantName);
    return res.json({ token });
  } catch (e) {
    console.error('Token generation failed:', e);
    return res.status(500).json({ error: 'Token generation failed' });
  }
});

// LiveKit token endpoint - hire session (userId, hireId, authToken)
app.post('/livekit/token', async (req, res) => {
  const { userId, hireId, authToken } = req.body as {
    userId: string;
    hireId: string;
    authToken: string;
  };

  // Validate the Trust Agent auth token
  if (!authToken || !authToken.startsWith('mock-jwt-') && !authToken.startsWith('ta_')) {
    return res.status(401).json({ error: 'Invalid auth token' });
  }

  if (!userId || !hireId) {
    return res.status(400).json({ error: 'userId and hireId required' });
  }

  try {
    const token = await generateRoomToken(userId, hireId);
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
