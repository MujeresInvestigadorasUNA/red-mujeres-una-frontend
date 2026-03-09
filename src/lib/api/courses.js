export async function getCourses() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return response;
}

export async function getPublicCourses() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/public`, {
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