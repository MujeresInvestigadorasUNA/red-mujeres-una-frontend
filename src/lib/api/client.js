import { auth } from '@/lib/firebase/client';
import { getFirebaseSessionStatus, signOutFirebaseSession } from '@/lib/firebase/session';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function getFirebaseToken() {
  const user = auth?.currentUser;
  if (!user) return null;
  return await user.getIdToken();
}

/**
 * Wrapper centralizado de fetch que:
 * - Inyecta automáticamente el Firebase ID token
 * - Dispara el evento 'auth:expired' en cualquier respuesta 401/403
 *
 * @param {string} path  - Ruta relativa (ej: '/research/') o URL completa
 * @param {object} options - Mismas opciones que fetch, más:
 *   - skipAuth {boolean} - Si true, no inyecta el token ni dispara auth:expired
 */
export async function apiFetch(path, { skipAuth = false, ...options } = {}) {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  const headers = { ...options.headers };

  if (!skipAuth && !headers.Authorization && typeof window !== 'undefined') {
    const token = await getFirebaseToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (!skipAuth && (response.status === 401 || response.status === 403)) {
    if (typeof window !== 'undefined') {
      const session = await getFirebaseSessionStatus();
      if (!session.valid) {
        await signOutFirebaseSession();
        window.dispatchEvent(new Event('auth:expired'));
      }
    }
  }

  return response;
}
