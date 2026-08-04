import { signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

export async function getFirebaseSessionStatus() {
  if (typeof window === 'undefined' || !auth?.currentUser) {
    return { valid: false, reason: 'no-user' };
  }

  try {
    const PRE_EXPIRY_BUFFER_MS = 30_000;
    const RETRY_ATTEMPTS = 3;
    const RETRY_DELAYS = [200, 500, 1000];

    // First try reading the cached token info without forcing a refresh.
    let result;
    try {
      result = await auth.currentUser.getIdTokenResult(false);
    } catch (e) {
      console.warn('[getFirebaseSessionStatus] getIdTokenResult(false) failed, will try force-refresh', e);
      result = null;
    }

    const now = Date.now();

    if (result && result.expirationTime) {
      const expiresAt = new Date(result.expirationTime).getTime();
      const msUntilExpiry = expiresAt - now;
      const isNearExpiry = Number.isNaN(expiresAt) || msUntilExpiry <= PRE_EXPIRY_BUFFER_MS;

      console.debug('[getFirebaseSessionStatus] token expiry (cached)', {
        expirationTime: result.expirationTime,
        expiresAt,
        now,
        msUntilExpiry,
        isNearExpiry,
      });

      if (!isNearExpiry) {
        return { valid: true, reason: 'valid' };
      }
      // otherwise fallthrough to force-refresh
    }

    // Need to force-refresh the token; do a few retries to tolerate transient errors.
    let lastError = null;
    for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt++) {
      try {
        const refreshed = await auth.currentUser.getIdTokenResult(true);
        const expiresAt = new Date(refreshed.expirationTime).getTime();
        const msUntilExpiry = expiresAt - now;
        const isExpired = Number.isNaN(expiresAt) || msUntilExpiry <= PRE_EXPIRY_BUFFER_MS;

        console.debug('[getFirebaseSessionStatus] token expiry (refreshed)', {
          expirationTime: refreshed.expirationTime,
          expiresAt,
          now,
          msUntilExpiry,
          isExpired,
          attempt,
        });

        return { valid: !isExpired, reason: isExpired ? 'expired' : 'valid' };
      } catch (e) {
        lastError = e;
        console.warn('[getFirebaseSessionStatus] force-refresh attempt failed', { attempt, err: e });
        const delay = RETRY_DELAYS[Math.min(attempt, RETRY_DELAYS.length - 1)];
        await new Promise((res) => setTimeout(res, delay));
      }
    }

    console.error('[getFirebaseSessionStatus] failed to refresh token after retries', lastError);
    return { valid: false, reason: 'refresh-failed' };
  } catch {
    // This outer catch should be rare; keep safe fallback
    console.error('[getFirebaseSessionStatus] unexpected error');
    return { valid: false, reason: 'refresh-failed' };
  }
}

export async function signOutFirebaseSession() {
  if (!auth) return;

  try {
    await firebaseSignOut(auth);
  } catch {
    // Ignore sign-out errors and let the UI clear the local state.
  }
}
