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
const { genre } = input;
  if (!GENRES.includes(genre)) errors.push(`genre must be one of: ${GENRES.join(', ')}`);

  const read = input.read === undefined ? false : input.read;
  if (typeof read !== 'boolean') errors.push('read must be a boolean');

  const rating = input.rating === undefined ? null : input.rating;
  if (rating !== null) {
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) errors.push('rating must be an integer from 1 to 5, or null');
    else if (read !== true) errors.push('rating is allowed only when read is true');
  }

  if (errors.length > 0) return { error: errors.join('; ') };
  return { value: { title, author, year, genre, read, rating } };
}

// Keeps only known book fields (ignores id and unknown fields).
export function pickFields(input) {
  const out = {};
  if (!isObject(input)) return out;
  for (const key of BOOK_FIELDS) if (key in input) out[key] = input[key];
  return out;
}

export function parseQuery(query) {
  for (const key of ['genre', 'read', 'q', 'sort', 'order', 'limit', 'page']) {
    if (Array.isArray(query[key])) return { error: `Query parameter "${key}" must not be repeated` };
  }
  const out = { sort: 'id', order: 'asc', limit: 50, page: 1 };

  if (query.genre !== undefined) {
    if (!GENRES.includes(query.genre)) return { error: `genre must be one of: ${GENRES.join(', ')}` };
    out.genre = query.genre;
  }
  if (query.read !== undefined) {
    if (query.read !== 'true' && query.read !== 'false') return { error: 'read must be "true" or "false"' };
    out.read = query.read === 'true';
  }
  if (query.q !== undefined) out.q = query.q.trim().toLowerCase();
  if (query.sort !== undefined) {
    if (!['title', 'author', 'year', 'rating'].includes(query.sort)) return { error: 'sort must be one of: title, author, year, rating' };
    out.sort = query.sort;
  }
  if (query.order !== undefined) {
    if (!['asc', 'desc'].includes(query.order)) return { error: 'order must be "asc" or "desc"' };
    out.order = query.order;
  } 
    
