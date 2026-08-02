const authKey = 'vaultx.auth';

export interface StoredAuth {
  accessToken: string;
}

// Reload ke baad access token persist rakhne ke liye small storage helper.
export function getStoredAuth(): StoredAuth | null {
  const raw = localStorage.getItem(authKey);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

export function setStoredAuth(payload: StoredAuth | null): void {
  // Null milne par saved auth ko clear kar dete hain.
  if (!payload) {
    localStorage.removeItem(authKey);
    return;
  }

  localStorage.setItem(authKey, JSON.stringify(payload));
}
