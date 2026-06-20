import { apiFetch } from './client';

export function getAuthorsData(item) {
  if (Array.isArray(item?.authors) && item.authors.length > 0) {
    return item.authors.map((a) => ({
      id: a.id ?? a.user_id,
      name: `${a.first_name || a.name || ''} ${a.last_name || ''}`.trim(),
    })).filter((a) => a.name);
  }
  return [];
}

export function getAuthorDisplay(item) {
  const authors = getAuthorsData(item);
  if (authors.length > 0) return authors.map((a) => a.name).join(', ');
  if (item?.user_first_name || item?.user_last_name) {
    return `${item.user_first_name || ''} ${item.user_last_name || ''}`.trim();
  }
  return item?.author || item?.user_name || 'Investigadora';
}

export async function getResearch(limit = 5, viewerUserId = null) {
  try {
    let url = limit ? `/research/?limit=${limit}` : '/research/';
    if (viewerUserId) url += `${url.includes('?') ? '&' : '?'}viewer_user_id=${viewerUserId}`;

    const response = await apiFetch(url, { method: 'GET', headers: { Accept: 'application/json' } });
    if (!response.ok) {
      console.error('Error fetching research:', response.statusText);
      return [];
    }

    const data = await response.json();
    return data.map((item) => ({ ...item, description: item.description || '' }));
  } catch (error) {
    console.error('Error fetching research:', error);
    return [];
  }
}

export async function getResearchByUserId(user_id, viewerUserId = null) {
  try {
    let url = `/research/user/${user_id}`;
    if (viewerUserId) url += `?viewer_user_id=${viewerUserId}`;
    const response = await apiFetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      console.error('Error fetching research by user:', response.statusText);
      return [];
    }

    const data = await response.json();
    return data.map((item) => ({ ...item, description: item.description || '' }));
  } catch (error) {
    console.error('Error fetching research by user:', error);
    return [];
  }
}

export async function getResearchById(research_id) {
  try {
    const response = await apiFetch(`/research/${research_id}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      console.error('Error fetching research by id:', response.statusText);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching research by id:', error);
    return null;
  }
}

export async function getRecommendationGraph({ user_id, limit = 15, min_score = 0.0 }) {
  try {
    const params = new URLSearchParams();
    if (limit != null) params.set('limit', String(limit));
    if (min_score != null) params.set('min_score', String(min_score));

    const response = await apiFetch(
      `/research/user/${user_id}/recommendation-graph?${params.toString()}`,
      { method: 'GET', headers: { Accept: 'application/json' } }
    );
    if (!response.ok) {
      console.error('Error fetching recommendation graph:', response.statusText);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching recommendation graph:', error);
    return null;
  }
}

export async function updateResearch({ research_id, title, description }) {
  return apiFetch(`/research/${research_id}`, {
    method: 'PUT',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description }),
  });
}

export async function createResearch({ user_id, title, description, document, author_ids = [] }) {
  const formData = new FormData();
  formData.append('user_id', String(user_id));
  formData.append('title', title);
  if (description?.trim()) formData.append('description', description.trim());
  formData.append('document', document);
  if (author_ids?.length > 0) {
    author_ids.forEach((id) => formData.append('author_ids', String(id)));
  }

  return apiFetch('/research/', {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: formData,
  });
}

export async function getResearchAuthors(research_id) {
  try {
    const response = await apiFetch(`/research/${research_id}/authors`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      console.error('Error fetching research authors:', response.statusText);
      return [];
    }
    const data = await response.json();
    const list = Array.isArray(data) ? data : Array.isArray(data?.authors) ? data.authors : [];
    return list.map((a) => ({ ...a, id: a.id ?? a.user_id }));
  } catch (error) {
    console.error('Error fetching research authors:', error);
    return [];
  }
}

export async function addResearchAuthors(research_id, user_ids) {
  return apiFetch(`/research/${research_id}/authors`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_ids }),
  });
}

export async function removeResearchAuthors(research_id, user_ids) {
  return apiFetch(`/research/${research_id}/authors`, {
    method: 'DELETE',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_ids }),
  });
}

export async function likeResearch(user_id, research_id) {
  try {
    const response = await apiFetch(
      `/research/user/${user_id}/likes/${research_id}`,
      { method: 'POST', headers: { Accept: 'application/json' } }
    );
    if (!response.ok) {
      console.error('Error liking research:', response.statusText);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error liking research:', error);
    return null;
  }
}

export async function unlikeResearch(user_id, research_id) {
  try {
    const response = await apiFetch(
      `/research/user/${user_id}/likes/${research_id}`,
      { method: 'DELETE', headers: { Accept: 'application/json' } }
    );
    if (!response.ok) {
      console.error('Error unliking research:', response.statusText);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error unliking research:', error);
    return null;
  }
}

export async function registerResearchVisit(user_id, research_id) {
  try {
    const response = await apiFetch(
      `/research/user/${user_id}/visits/${research_id}`,
      { method: 'POST', headers: { Accept: 'application/json' } }
    );
    if (!response.ok) {
      console.error('Error registering research visit:', response.statusText);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error registering research visit:', error);
    return null;
  }
}

export async function getResearchPdfUrl(research_id) {
  try {
    const response = await apiFetch(`/research/${research_id}/pdf-url`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      console.error('Error fetching research PDF url:', response.statusText);
      return null;
    }

    const data = await response.json();
    if (typeof data === 'string') return { inlineUrl: data, downloadUrl: null, expiresAt: null };

    const inlineUrl = data?.inline_url || data?.inlineUrl || data?.url || data?.pdf_url || data?.research_link || null;
    const downloadUrl = data?.download_url || data?.downloadUrl || null;
    if (!inlineUrl && !downloadUrl) return null;

    return {
      inlineUrl,
      downloadUrl: downloadUrl || inlineUrl,
      expiresAt: data?.expires_at || data?.expiresAt || null,
    };
  } catch (error) {
    console.error('Error fetching research PDF url:', error);
    return null;
  }
}

export async function getEmbeddingMap({ dim = 2, top_k = 3, min_score = 0.6 } = {}) {
  try {
    const params = new URLSearchParams();
    params.set('dim', String(dim));
    params.set('top_k', String(top_k));
    params.set('min_score', String(min_score));

    const response = await apiFetch(`/research/embedding-map?${params.toString()}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      console.error('Error fetching embedding map:', response.statusText);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching embedding map:', error);
    return null;
  }
}

export async function getRelatedResearch(research_id, limit = 4, viewer_user_id = null) {
  try {
    const params = new URLSearchParams({ limit });
    if (viewer_user_id) params.set('viewer_user_id', viewer_user_id);

    const response = await apiFetch(`/research/${research_id}/related?${params}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      console.error('Error fetching related research:', response.statusText);
      return [];
    }

    const data = await response.json();
    return data.map((item) => ({ ...item, description: item.description || '' }));
  } catch (error) {
    console.error('Error fetching related research:', error);
    return [];
  }
}

export async function getRecommendedResearch(user_id, limit = 4) {
  try {
    const response = await apiFetch(
      `/research/user/${user_id}/related-from-interactions?limit=${limit}`,
      { method: 'GET', headers: { Accept: 'application/json' } }
    );
    if (!response.ok) {
      console.error('Error fetching recommended research:', response.statusText);
      return [];
    }

    const data = await response.json();
    return data.map((item) => ({ ...item, description: item.description || '' }));
  } catch (error) {
    console.error('Error fetching recommended research:', error);
    return [];
  }
}
