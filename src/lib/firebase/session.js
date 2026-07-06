import { signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

export async function getFirebaseSessionStatus() {
  if (typeof window === 'undefined' || !auth?.currentUser) {
    return { valid: false, reason: 'no-user' };
  }

  try {
    const result = await auth.currentUser.getIdTokenResult(true);
    const expiresAt = new Date(result.expirationTime).getTime();
    const isExpired = Number.isNaN(expiresAt) || expiresAt <= Date.now() + 30_000;

    return {
      valid: !isExpired,
      reason: isExpired ? 'expired' : 'valid',
    };
  } catch {
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
