# Trust Agent Mobile

iOS and Android companion app for Trust Agent Desktop. Communicate with your hired AI role agents via voice and text from anywhere.

**Operator:** AgentCore LTD - Company No. 17114811

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` with your API and LiveKit URLs.

4. Start the Expo dev server:
   ```bash
   npx expo start
   ```

5. (Optional) Start the LiveKit token server:
   ```bash
   cp .env.example .env.server
   # Edit .env.server with LiveKit credentials
   npm run server
   ```

## Dev Mode

In development, use any API key starting with `ta_` to bypass auth. LiveKit voice requires a real server - text mode works in dev.

## Stack

- Expo (React Native) with Expo Router v3
- LiveKit WebRTC for real-time voice
- Zustand for state management
- Manrope + JetBrains Mono typography
