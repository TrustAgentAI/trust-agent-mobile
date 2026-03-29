import { secureSet, secureGet, secureDelete } from './storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL!;

export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
  avatarUrl?: string;
}

export interface AuthResult {
  token: string;
  refreshToken: string;
  userId: string;
  user: UserProfile;
}

/** Sign in with email and password */
export async function loginWithEmail(email: string, password: string): Promise<AuthResult> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new Error('Cannot connect to Trust Agent. Check your internet connection and try again.');
  }

  if (res.status === 401) throw new Error('Incorrect email or password.');
  if (res.status === 404) throw new Error('No account found with this email. Sign up at trust-agent.ai.');
  if (!res.ok) throw new Error('Something went wrong. Please try again.');

  const raw = await res.json();
  const data = raw.data || raw;
  const result: AuthResult = {
    token: data.token,
    refreshToken: data.refreshToken || '',
    userId: data.user?.id || data.userId,
    user: {
      userId: data.user?.id || data.userId,
      email: data.user?.email || email,
      name: data.user?.name || '',
      plan: data.user?.plan || 'free',
      avatarUrl: data.user?.avatarUrl,
    },
  };
  await secureSet('auth_token', result.token);
  await secureSet('auth_refreshToken', result.refreshToken);
  await secureSet('user_id', result.userId);
  await secureSet('user_profile', JSON.stringify(result.user));
  return result;
}

/** Sign in with Google OAuth token */
export async function loginWithGoogle(idToken?: string): Promise<AuthResult> {
  // If no idToken provided, this is a placeholder for the OAuth flow
  if (!idToken) {
    throw new Error('Google sign-in requires the native Google Sign-In SDK. Coming soon.');
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
  } catch {
    throw new Error('Cannot connect to Trust Agent. Check your internet connection and try again.');
  }

  if (!res.ok) throw new Error('Google sign-in failed. Please try again.');

  const raw = await res.json();
  const data = raw.data || raw;
  const result: AuthResult = {
    token: data.token,
    refreshToken: data.refreshToken || '',
    userId: data.user?.id || data.userId,
    user: {
      userId: data.user?.id || data.userId,
      email: data.user?.email || '',
      name: data.user?.name || '',
      plan: data.user?.plan || 'free',
      avatarUrl: data.user?.avatarUrl,
    },
  };
  await secureSet('auth_token', result.token);
  await secureSet('auth_refreshToken', result.refreshToken);
  await secureSet('user_id', result.userId);
  await secureSet('user_profile', JSON.stringify(result.user));
  return result;
}

/** Refresh JWT token */
export async function refreshToken(): Promise<{ token: string; refreshToken: string }> {
  const currentRefreshToken = await secureGet('auth_refreshToken');
  if (!currentRefreshToken) {
    throw new Error('No refresh token. Please sign in again.');
  }

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: currentRefreshToken }),
  });

  if (!res.ok) throw new Error('Session expired. Please sign in again.');

  const raw = await res.json();
  const data = raw.data || raw;
  await secureSet('auth_token', data.token);
  await secureSet('auth_refreshToken', data.refreshToken);
  return { token: data.token, refreshToken: data.refreshToken };
}

export async function restoreSession(): Promise<AuthResult | null> {
  const token = await secureGet('auth_token');
  const refreshTk = await secureGet('auth_refreshToken');
  const userId = await secureGet('user_id');
  const profileStr = await secureGet('user_profile');
  if (!token || !userId) return null;

  const user: UserProfile = profileStr
    ? JSON.parse(profileStr)
    : { userId, email: '', name: '', plan: 'free' as const };

  return { token, refreshToken: refreshTk || '', userId, user };
}

export async function logout(): Promise<void> {
  await secureDelete('auth_token');
  await secureDelete('auth_refreshToken');
  await secureDelete('user_id');
  await secureDelete('user_profile');
}
