export async function getCourses(limit = 5) {
  const tokenFromStorage = typeof window !== "undefined"
    ? localStorage.getItem("access_token")
    : null;

  const headers = {
    Accept: "application/json",
  };

  if (tokenFromStorage) {
    headers.Authorization = `Bearer ${tokenFromStorage}`;
  }

  try {
    const url = limit
      ? `${process.env.NEXT_PUBLIC_API_URL}/courses/?limit=${limit}`
      : `${process.env.NEXT_PUBLIC_API_URL}/courses/`;

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      console.error("Error fetching courses:", response.statusText);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
}

export async function getPublicCourses(limit = 100) {
  const url = limit
    ? `${process.env.NEXT_PUBLIC_API_URL}/courses/public?limit=${limit}`
    : `${process.env.NEXT_PUBLIC_API_URL}/courses/public`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return response;
}

export async function getCourseById({ course_id }) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${course_id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return response;
}

export async function getCoursesByUserId({ user_id }) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/user/${user_id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return response;
}

export async function createCourse({ user_id }) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id }),
  });
  return response;
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
  is_public
}) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${user_id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        title,
        photo,
        description,
        modality,
        max_registration_date,
        initial_date,
        final_date,
        max_quotas,
        is_public
    }),
  });
  return response;
}

export async function deleteCourse({ course_id }) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${course_id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  return response;
}

export async function likeCourse(user_id, course_id) {
  const tokenFromStorage = typeof window !== "undefined"
    ? localStorage.getItem("access_token")
    : null;

  const headers = {
    Accept: "application/json",
  };

  if (tokenFromStorage) {
    headers.Authorization = `Bearer ${tokenFromStorage}`;
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/courses/user/${user_id}/likes/${course_id}`,
      {
        method: "POST",
        headers,
      }
    );

    if (!response.ok) {
      console.error("Error liking course:", response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error liking course:", error);
    return null;
  }
}

export async function unlikeCourse(user_id, course_id) {
  const tokenFromStorage = typeof window !== "undefined"
    ? localStorage.getItem("access_token")
    : null;

  const headers = {
    Accept: "application/json",
  };

  if (tokenFromStorage) {
    headers.Authorization = `Bearer ${tokenFromStorage}`;
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/courses/user/${user_id}/likes/${course_id}`,
      {
        method: "DELETE",
        headers,
      }
    );

    if (!response.ok) {
      console.error("Error unliking course:", response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error unliking course:", error);
    return null;
  }
}