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

export async function registerResearchVisit(user_id, research_id) {
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
      `${process.env.NEXT_PUBLIC_API_URL}/research/user/${user_id}/visits/${research_id}`,
      {
        method: "POST",
        headers,
      }
    );

    if (!response.ok) {
      console.error("Error registering research visit:", response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error registering research visit:", error);
    return null;
  }
}

export async function getResearchPdfUrl(research_id) {
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
      `${process.env.NEXT_PUBLIC_API_URL}/research/${research_id}/pdf-url`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      console.error("Error fetching research PDF url:", response.statusText);
      return null;
    }

    const data = await response.json();

    if (typeof data === "string") {
      return { inlineUrl: data, downloadUrl: null, expiresAt: null };
    }

    const inlineUrl = data?.inline_url || data?.inlineUrl || data?.url || data?.pdf_url || data?.research_link || null;
    const downloadUrl = data?.download_url || data?.downloadUrl || null;

    if (!inlineUrl && !downloadUrl) {
      return null;
    }

    return {
      inlineUrl,
      downloadUrl: downloadUrl || inlineUrl,
      expiresAt: data?.expires_at || data?.expiresAt || null,
    };
  } catch (error) {
    console.error("Error fetching research PDF url:", error);
    return null;
  }
}

export async function getEmbeddingMap({ dim = 2, top_k = 3, min_score = 0.6 } = {}) {
  const tokenFromStorage = typeof window !== "undefined"
    ? localStorage.getItem("access_token")
    : null;

  const headers = { Accept: "application/json" };
  if (tokenFromStorage) {
    headers.Authorization = `Bearer ${tokenFromStorage}`;
  }

  try {
    const params = new URLSearchParams();
    params.set("dim", String(dim));
    params.set("top_k", String(top_k));
    params.set("min_score", String(min_score));

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/research/embedding-map?${params.toString()}`,
      { method: "GET", headers }
    );

    if (!response.ok) {
      console.error("Error fetching embedding map:", response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching embedding map:", error);
    return null;
  }
}

export async function getRelatedResearch(research_id, limit = 4, viewer_user_id = null) {
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
    const params = new URLSearchParams({ limit });
    if (viewer_user_id) params.set("viewer_user_id", viewer_user_id);
    const url = `${process.env.NEXT_PUBLIC_API_URL}/research/${research_id}/related?${params}`;

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