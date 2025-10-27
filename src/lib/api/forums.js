export async function updateForum({ user_id, user_profession, user_description, photo }) {
  const response = await fetch(`http://127.0.0.1:8000/forums/${user_id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      user_profession, 
      user_description, 
      photo 
    }),
  });
  return response;
}

export async function getUserForum({ user_id }) {
  const response = await fetch(`http://127.0.0.1:8000/forums/${user_id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return response;
}