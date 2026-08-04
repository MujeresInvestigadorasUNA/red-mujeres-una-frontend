import { signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

export async function getFirebaseSessionStatus() {
  if (typeof window === 'undefined' || !auth?.currentUser) {
    return { valid: false, reason: 'no-user' };
  }

  try {
    const result = await auth.currentUser.getIdTokenResult(true);
    const expiresAt = new Date(result.expirationTime).getTime();
    const now = Date.now();
    const isExpired = Number.isNaN(expiresAt) || expiresAt <= now + 30_000;

    // Diagnostic logging to help debug intermittent session expiry
    if (!result || !result.expirationTime) {
      console.warn('[getFirebaseSessionStatus] missing expirationTime', { result });
    } else {
      console.debug('[getFirebaseSessionStatus] token expiry', {
        expirationTime: result.expirationTime,
        expiresAt,
        now,
        msUntilExpiry: expiresAt - now,
        isExpired,
      });
    }

    return {
      valid: !isExpired,
      reason: isExpired ? 'expired' : 'valid',
    };
  } catch {
    // Log the error to help identify transient network or auth issues
    console.error('[getFirebaseSessionStatus] failed to refresh token');
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
