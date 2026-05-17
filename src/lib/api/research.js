export async function getResearch(limit = 5, viewerUserId = null) {
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
    let url = limit 
      ? `${process.env.NEXT_PUBLIC_API_URL}/research/?limit=${limit}`
      : `${process.env.NEXT_PUBLIC_API_URL}/research/`;

    // Add viewer_user_id if provided
    if (viewerUserId) {
      url += `${url.includes('?') ? '&' : '?'}viewer_user_id=${viewerUserId}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      console.error("Error fetching research:", response.statusText);
      return [];
    }

    const data = await response.json();

    return data.map((item) => ({
      ...item,
      description: item.description || "",
    }));
  } catch (error) {
    console.error("Error fetching research:", error);
    return [];
  }
}

export async function getResearchByUserId(user_id) {
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/research/user/${user_id}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      console.error("Error fetching research by user:", response.statusText);
      return [];
    }

    const data = await response.json();

    return data.map((item) => ({
      ...item,
      description: item.description || "",
    }));
  } catch (error) {
    console.error("Error fetching research by user:", error);
    return [];
  }
}

export async function getResearchById(research_id) {
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/research/${research_id}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      console.error("Error fetching research by id:", response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching research by id:", error);
    return null;
  }
}

export async function getRecommendationGraph({ user_id, limit = 15, min_score = 0.0 }) {
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
    const params = new URLSearchParams();
    if (limit !== null && limit !== undefined) {
      params.set("limit", String(limit));
    }
    if (min_score !== null && min_score !== undefined) {
      params.set("min_score", String(min_score));
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/research/user/${user_id}/recommendation-graph?${params.toString()}`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      console.error("Error fetching recommendation graph:", response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching recommendation graph:", error);
    return null;
  }
}

export async function updateResearch({ research_id, title, description, access_token }) {
  const tokenFromStorage = typeof window !== "undefined"
    ? localStorage.getItem("access_token")
    : null;
  const token = access_token || tokenFromStorage;

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/research/${research_id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      title,
      description,
    }),
  });

  return response;
}

export async function createResearch({ user_id, title, description, document, access_token }) {
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
  if (description?.trim()) {
    formData.append("description", description.trim());
  }
  formData.append("document", document);

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/research/`, {
    method: "POST",
    headers,
    body: formData,
  });

  return response;
}

export async function likeResearch(user_id, research_id) {
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
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/research/user/${user_id}/likes/${research_id}`,
      {
        method: "POST",
        headers,
      }
    );

    if (!response.ok) {
      console.error("Error liking research:", response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error liking research:", error);
    return null;
  }
}

export async function unlikeResearch(user_id, research_id) {
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
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/research/user/${user_id}/likes/${research_id}`,
      {
        method: "DELETE",
        headers,
      }
    );

    if (!response.ok) {
      console.error("Error unliking research:", response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error unliking research:", error);
    return null;
  }
}

export async function getRelatedResearch(research_id, limit = 4) {
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
    const url = `${process.env.NEXT_PUBLIC_API_URL}/research/user/${research_id}/related-from-interactions?limit=${limit}`;

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      console.error("Error fetching related research:", response.statusText);
      return [];
    }

    const data = await response.json();

    return data.map((item) => ({
      ...item,
      description: item.description || "",
    }));
  } catch (error) {
    console.error("Error fetching related research:", error);
    return [];
  }
}

export async function getRecommendedResearch(user_id, limit = 4) {
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
    const url = `${process.env.NEXT_PUBLIC_API_URL}/research/user/${user_id}/related-from-interactions?limit=${limit}`;

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      console.error("Error fetching recommended research:", response.statusText);
      return [];
    }

    const data = await response.json();

    return data.map((item) => ({
      ...item,
      description: item.description || "",
    }));
  } catch (error) {
    console.error("Error fetching recommended research:", error);
    return [];
  }
}