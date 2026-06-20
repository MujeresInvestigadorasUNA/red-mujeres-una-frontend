import { apiFetch } from './client';

export async function getEvents(skip = 0, limit = 50) {
  try {
    const params = new URLSearchParams();
    if (skip) params.set('skip', String(skip));
    if (limit) params.set('limit', String(limit));
    const query = params.toString();
    const url = `/events/${query ? `?${query}` : ''}`;
    const response = await apiFetch(url, { method: 'GET', headers: { Accept: 'application/json' } });
    if (!response.ok) {
      console.error('Error fetching events:', response.statusText);
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

export async function getPublicEvents(skip = 0, limit = 50) {
  const params = new URLSearchParams();
  if (skip) params.set('skip', String(skip));
  if (limit) params.set('limit', String(limit));
  const query = params.toString();
  const url = `/events/public${query ? `?${query}` : ''}`;
  return apiFetch(url, { method: 'GET', headers: { Accept: 'application/json' } });
}

export async function getEventById(event_id) {
  return apiFetch(`/events/${event_id}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
}

export async function getEventsByUserId(user_id) {
  return apiFetch(`/events/user/${user_id}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
}

export async function createEvent(user_id) {
  return apiFetch('/events/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id }),
  });
}

export async function updateEvent(event_id, {
  title,
  photo,
  description,
  modality,
  max_registration_date,
  initial_date,
  final_date,
}) {
  return apiFetch(`/events/${event_id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title,
      photo,
      description,
      modality,
      max_registration_date,
      initial_date,
      final_date,
    }),
  });
}

export async function deleteEvent(event_id) {
  return apiFetch(`/events/${event_id}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });
}
