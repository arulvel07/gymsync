import { supabase } from '@/lib/supabase';
import { API_BASE_URL } from '@/lib/constants';

/**
 * Make an authenticated API request to the FastAPI backend.
 * Automatically injects the active Supabase JWT token.
 */
export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (err) {
    console.error(`apiRequest failed for ${API_BASE_URL}${endpoint}:`, err);
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      throw new Error(`Connection failed to backend (${API_BASE_URL}). Check network or adblocker.`);
    }
    throw err;
  }
}

/**
 * Make a public API request (no auth header required).
 */
export async function publicApiRequest<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }
    return (await response.json()) as T;
  } catch (err) {
    console.error(`publicApiRequest failed for ${API_BASE_URL}${endpoint}:`, err);
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      throw new Error(`Connection failed to backend (${API_BASE_URL}). Check network or adblocker.`);
    }
    throw err;
  }
}
