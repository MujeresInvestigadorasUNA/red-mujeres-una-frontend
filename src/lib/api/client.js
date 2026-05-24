const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Wrapper centralizado de fetch que:
 * - Inyecta automáticamente el token de autorización desde localStorage
 * - Dispara el evento 'auth:expired' en cualquier respuesta 401/403
 *   para que UserContext cierre la sesión globalmente
 *
 * @param {string} path  - Ruta relativa (ej: '/research/') o URL completa
 * @param {object} options - Mismas opciones que fetch, más:
 *   - skipAuth {boolean} - Si true, no inyecta el token ni dispara auth:expired
 *                          (útil para login y registro)
 */
export async function apiFetch(path, { skipAuth = false, ...options } = {}) {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  const headers = { ...options.headers };

  if (!skipAuth && !headers.Authorization && typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (!skipAuth && (response.status === 401 || response.status === 403)) {
    window.dispatchEvent(new Event('auth:expired'));
  }

  return response;
}
