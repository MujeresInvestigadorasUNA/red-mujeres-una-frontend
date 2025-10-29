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
    const response = await fetch(`http://127.0.0.1:8000/courses/${user_id}`, {
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

export async function getCourseById({ course_id }) {
  const response = await fetch(`http://127.0.0.1:8000/courses/${course_id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return response;
}

export async function getCourses() {
  const response = await fetch(`http://127.0.0.1:8000/courses`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return response;
}