const BASE_URL = import.meta.env.VITE_API_URL;

// Shared helper: sets Content-Type only with a body, checks response.ok,
// turns the server's { error } into an Error, and handles 204.
async function request(path, { method = 'GET', body, signal } = {}) {
  const options = { method, signal };
  if (body !== undefined) {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(body);
  }
  const response = await fetch(`${BASE_URL}${path}`, options);

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      if (data && data.error) message = data.error;
    } catch {
      // body was not JSON; keep the generic message
    }
    throw new Error(message);
  }

if (response.status === 204) return null;
  return response.json();
}

export function listBooks(filters, signal) {
  const params = new URLSearchParams(); // handles encoding safely
  for (const [key, value] of Object.entries(filters)) {
    if (value !== '' && value != null) params.set(key, value);
  }
  const qs = params.toString();
  return request(`/api/books${qs ? `?${qs}` : ''}`, { signal });
}

export const getStats = (signal) => request('/api/stats', { signal });
export const createBook = (book) => request('/api/books', { method: 'POST', body: book });
export const replaceBook = (id, book) => request(`/api/books/${id}`, { method: 'PUT', body: book });
export const patchBook = (id, changes) => request(`/api/books/${id}`, { method: 'PATCH', body: changes });
export const deleteBook = (id) => request(`/api/books/${id}`, { method: 'DELETE' });