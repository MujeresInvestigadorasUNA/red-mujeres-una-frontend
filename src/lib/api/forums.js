export async function createForumn({ user_id, user_proffesion, user_description }) {
  const response = await fetch("http://127.0.0.1:8000/forums", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id, user_proffesion, user_description }),
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