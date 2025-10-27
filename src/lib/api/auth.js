export async function loginUser({ email, password }) {
  const response = await fetch("http://127.0.0.1:8000/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return response;
}

export async function registerUser({ name, last_name, email, password, user_type_id }) {
  const response = await fetch("http://127.0.0.1:8000/users/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      name, 
      last_name, 
      email, 
      password, 
      user_type_id 
    }),
  });
  return response;
}