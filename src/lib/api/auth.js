
export async function loginUser({ email, password }) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return response;
}

export async function getUserInfo({ user_id }) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user_id}/`, {
    method: "GET",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
  });
  return response;
}

export async function registerUser({email, password, first_name, last_name, user_type_id }) {
  const formData = new FormData();
  formData.append("email", email);
  formData.append("password", password);
  formData.append("first_name", first_name);
  formData.append("last_name", last_name);
  formData.append("user_type_id", String(user_type_id));
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/register`, {
    method: "POST",
    mode: "cors",
    headers: {
      "Accept": "application/json",
    },
    body: formData,
  });
  
  const responseText = await response.text();
  
  // Return a new response with the text we already read
  return new Response(responseText, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

export async function updateUser({ id, first_name, last_name, profession, email, password, user_type_id}) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}/`, {
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