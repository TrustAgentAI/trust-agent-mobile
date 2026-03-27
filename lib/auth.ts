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
