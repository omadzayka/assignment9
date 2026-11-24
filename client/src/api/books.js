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
  