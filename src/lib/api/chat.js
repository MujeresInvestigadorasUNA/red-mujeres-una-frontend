import { apiFetch } from './client';

export async function askResearchAI({ question, user_id, history = [] }) {
  const cleanHistory = history
    .filter((m) => m.role && m.content)
    .map(({ role, content }) => ({ role, content }))
    .slice(-10);

  return apiFetch('/research/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question,
      ...(user_id ? { user_id } : {}),
      ...(cleanHistory.length > 0 ? { history: cleanHistory } : {}),
    }),
  });
}
