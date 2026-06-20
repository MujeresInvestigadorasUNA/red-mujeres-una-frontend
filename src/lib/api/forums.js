import { apiFetch } from './client';

export async function getResearchers(limit = 5, search = '') {
  try {
    const params = new URLSearchParams();
    if (limit) params.set('limit', String(limit));
    if (search?.trim()) params.set('search', search.trim());
    const query = params.toString();
    const url = `/users/researchers${query ? `?${query}` : ''}`;
    const response = await apiFetch(url, { method: 'GET', headers: { Accept: 'application/json' } });
    if (!response.ok) {
      console.error('Error fetching researchers:', response.statusText);
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching researchers:', error);
    return [];
  }
}

export async function updateForum({ user_id, user_profession, user_description, photo, is_public }) {
  return apiFetch(`/forums/${user_id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_profession, user_description, photo, is_public }),
  });
}

export async function getUser({ user_id }) {
  try {
    const response = await apiFetch(`/users/${user_id}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      console.error('Error fetching user:', response.statusText);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export async function getForums() {
  return apiFetch('/forums', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
}
