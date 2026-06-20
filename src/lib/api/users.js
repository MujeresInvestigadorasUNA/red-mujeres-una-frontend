import { apiFetch } from './client';

export async function listUsers() {
  return apiFetch('/users/', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function getUser(user_id) {
  return apiFetch(`/users/${user_id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function updateUser(user_id, userData) {
  return apiFetch(`/users/${user_id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
}

export async function deleteUser(user_id) {
  return apiFetch(`/users/${user_id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function updateUserType(user_id, user_type_id) {
  return apiFetch(`/users/${user_id}/user-type`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_type_id }),
  });
}
