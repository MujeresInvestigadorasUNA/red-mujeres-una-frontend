import { apiFetch } from './client';

export async function getCourses(limit = 5) {
  try {
    const url = limit ? `/courses/?limit=${limit}` : '/courses/';
    const response = await apiFetch(url, { method: 'GET', headers: { Accept: 'application/json' } });
    if (!response.ok) {
      console.error('Error fetching courses:', response.statusText);
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
}

export async function getPublicCourses(limit = 100) {
  const url = limit ? `/courses/public?limit=${limit}` : '/courses/public';
  return apiFetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
}

export async function getCourseById({ course_id }) {
  return apiFetch(`/courses/${course_id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function getCoursesByUserId({ user_id }) {
  return apiFetch(`/courses/user/${user_id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function createCourse({ user_id }) {
  return apiFetch('/courses/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id }),
  });
}

export async function updateCourse({
  user_id,
  title,
  photo,
  description,
  modality,
  max_registration_date,
  initial_date,
  final_date,
  max_quotas,
  is_public,
}) {
  return apiFetch(`/courses/${user_id}`, {
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
      max_quotas,
      is_public,
    }),
  });
}

export async function deleteCourse({ course_id }) {
  return apiFetch(`/courses/${course_id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function likeCourse(user_id, course_id) {
  try {
    const response = await apiFetch(`/courses/user/${user_id}/likes/${course_id}`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      console.error('Error liking course:', response.statusText);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error liking course:', error);
    return null;
  }
}

export async function unlikeCourse(user_id, course_id) {
  try {
    const response = await apiFetch(`/courses/user/${user_id}/likes/${course_id}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      console.error('Error unliking course:', response.statusText);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error unliking course:', error);
    return null;
  }
}
