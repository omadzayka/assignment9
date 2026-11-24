export const GENRES = ['fiction', 'non-fiction', 'science', 'history', 'fantasy', 'other'];
export const BOOK_FIELDS = ['title', 'author', 'year', 'genre', 'read', 'rating'];

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

export function parseId(text) {
  if (!/^[1-9]\d*$/.test(text)) return null;
  const n = Number(text);
  return Number.isSafeInteger(n) ? n : null;
}

// Validates a COMPLETE book. Returns { value } or { error }.
export function validateBook(input) {
  if (!isObject(input)) return { error: 'Request body must be a JSON object' };
  const errors = [];
  const currentYear = new Date().getFullYear();

  const title = typeof input.title === 'string' ? input.title.trim() : '';
  if (title.length < 1 || title.length > 100) errors.push('title must be a string of 1 to 100 characters');

  const author = typeof input.author === 'string' ? input.author.trim() : '';
  if (author.length < 1 || author.length > 100) errors.push('author must be a string of 1 to 100 characters');

  const { year } = input;
  if (!Number.isInteger(year) || year < 1000 || year > currentYear) {
    errors.push(`year must be an integer between 1000 and ${currentYear}`);
  }
