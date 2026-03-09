export async function updateForum({ user_id, user_profession, user_description, photo, is_public }) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forums/${user_id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      user_profession, 
      user_description, 
      photo,
      is_public
    }),
  });
  return response;
}

export async function getUserForum({ user_id }) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forums/${user_id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return response;
}

export async function getForums() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forums`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return response;
}