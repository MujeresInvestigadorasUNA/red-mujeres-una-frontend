export async function loginUser({ email, password }) {
  const response = await fetch("http://127.0.0.1:8000/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return response;
}

export async function getUserInfo({ user_id }) {
  const response = await fetch(`http://127.0.0.1:8000/users/${user_id}/`, {
    method: "GET",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
  });
  return response;
}

export async function registerUser({ first_name, last_name, email, password, user_type_id }) {
  const response = await fetch("http://127.0.0.1:8000/users/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      first_name, 
      last_name, 
      email, 
      password, 
      user_type_id 
    }),
  });
  return response;
}

export async function updateUser({ id, first_name, last_name, profession, email, password, user_type_id}) {
  const response = await fetch(`http://127.0.0.1:8000/users/${id}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      first_name, 
      last_name, 
      profession, 
      email, 
      password,
      user_type_id
    }),
  });
  return response;
}