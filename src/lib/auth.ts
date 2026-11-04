/**
 * Authentication management for Attrition Predictor Pro
 * Required credentials:
 *   Username: masterclass
 *   Password: agentic26
 */

const AUTH_STORAGE_KEY = 'attrition_auth_session_v1';

export interface UserSession {
  username: string;
  signedInAt: string;
}

export function getSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}

export interface AuthResult {
  success: boolean;
  errorMessage?: string;
}

export function authenticate(usernameInput: string, passwordInput: string): AuthResult {
  const username = usernameInput.trim();
  const password = passwordInput.trim();

  if (!username && !password) {
    return {
      success: false,
      errorMessage: 'Please enter your username and password.',
    };
  }

  if (!username) {
    return {
      success: false,
      errorMessage: 'Please enter your username.',
    };
  }

  if (!password) {
    return {
      success: false,
      errorMessage: 'Please enter your password.',
    };
  }

  // Exact credentials required by user
  if (username === 'masterclass' && password === 'agentic26') {
    const session: UserSession = {
      username: 'masterclass',
      signedInAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    } catch {
      // ignore
    }
    window.dispatchEvent(new Event('app_auth_changed'));
    return { success: true };
  }

  return {
    success: false,
    errorMessage: 'Incorrect username or password. Please verify your credentials and try again.',
  };
}

export function signOut(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event('app_auth_changed'));
}
