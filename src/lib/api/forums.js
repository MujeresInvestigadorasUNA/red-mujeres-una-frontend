export async function getResearchers(limit = 5) {
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
      ? `${process.env.NEXT_PUBLIC_API_URL}/users/researchers?limit=${limit}`
      : `${process.env.NEXT_PUBLIC_API_URL}/users/researchers`;

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      console.error("Error fetching researchers:", response.statusText);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching researchers:", error);
    return [];
  }
}

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

export async function getUser({ user_id }) {
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user_id}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      console.error("Error fetching user:", response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export async function getForums() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forums`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return response;
}