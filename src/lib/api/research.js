export async function getResearch() {
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/research/`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      console.error("Error fetching research:", response.statusText);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching research:", error);
    return [];
  }
}

export async function createResearch({ user_id, title, document, access_token }) {
  const tokenFromStorage = typeof window !== "undefined"
    ? localStorage.getItem("access_token")
    : null;
  const token = access_token || tokenFromStorage;

  const headers = {
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const formData = new FormData();
  formData.append("user_id", String(user_id));
  formData.append("title", title);
  formData.append("document", document);

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/research/`, {
    method: "POST",
    headers,
    body: formData,
  });

  return response;
}