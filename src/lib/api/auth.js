import { apiFetch } from './client';

export async function loginUser({ email, password }) {
  return apiFetch('/users/login', {
    method: 'POST',
    skipAuth: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export async function checkUserExists({ email }) {
  const params = new URLSearchParams({ email }).toString();
  return apiFetch(`/users/exists?${params}`, {
    method: 'GET',
    skipAuth: true,
    headers: { Accept: 'application/json' },
  });
}

export async function getUserInfo({ user_id }) {
  return apiFetch(`/users/${user_id}/`, {
    method: 'GET',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function registerUser({ email, password, first_name, last_name, user_type_id, firebase_id_token }) {
  const formData = new FormData();
  formData.append('email', email);
  formData.append('password', password);
  formData.append('first_name', first_name);
  formData.append('last_name', last_name);
  formData.append('user_type_id', String(user_type_id));

  const response = await apiFetch('/users/register', {
    method: 'POST',
    mode: 'cors',
    skipAuth: true,
    headers: {
      Accept: 'application/json',
      ...(firebase_id_token ? { Authorization: `Bearer ${firebase_id_token}` } : {}),
    },
    body: formData,
  });

  const responseText = await response.text();
  return new Response(responseText, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

export async function updateUser({
  id,
  first_name,
  last_name,
  user_profession,
  user_description,
  is_public,
  email,
  password,
}) {
  return apiFetch(`/users/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      first_name,
      last_name,
      user_profession,
      user_description,
      is_public,
      email,
      password,
    }),
  });
}

export async function uploadProfilePicture({ id, file }) {
  const formData = new FormData();
  formData.append('photo', file);

  return apiFetch(`/users/${id}/profile-picture`, {
    method: 'POST',
    body: formData,
  });
}

export async function getProfilePictureUrl({ user_id, expires_minutes = 60 }) {
  return apiFetch(`/users/${user_id}/profile-picture-url?expires_minutes=${expires_minutes}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
}

export async function cleanupIncompleteFirebaseUser({ email }) {
  return apiFetch('/users/cleanup-firebase', {
    method: 'POST',
    skipAuth: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
}
