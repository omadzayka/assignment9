import express from 'express';
import cors from 'cors';
import * as store from './booksStore.js';
import { parseId, parseQuery, validateBook, pickFields } from './validate.js';

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

const bad = (res, message) => res.status(400).json({ error: message });
const conflict = (res, dup) =>
  res.status(409).json({ error: `A book with this title and author already exists (id ${dup.id})` });

function compare(a, b, sort, dir) {
  let c;
  if (sort === 'title' || sort === 'author') {
    c = a[sort].localeCompare(b[sort], undefined, { sensitivity: 'base' }) * dir;
  } else if (sort === 'year') {
    c = (a.year - b.year) * dir;
  } else if (sort === 'rating') {
    if (a.rating === null && b.rating === null) c = 0;
    else if (a.rating === null) return 1; // unrated always last
    else if (b.rating === null) return -1;
    else c = (a.rating - b.rating) * dir;
  } else {
    c = (a.id - b.id) * dir;
  }
  return c || a.id - b.id;
}

app.get('/api/books', async (req, res) => {
  const parsed = parseQuery(req.query);
  if (parsed.error) return bad(res, parsed.error);
  const o = parsed.value;

  let list = await store.getAll();
  if (o.genre) list = list.filter((b) => b.genre === o.genre);
  if (o.read !== undefined) list = list.filter((b) => b.read === o.read);
  if (o.q) list = list.filter((b) => b.title.toLowerCase().includes(o.q) || b.author.toLowerCase().includes(o.q));

  const dir = o.order === 'desc' ? -1 : 1;
  const sorted = [...list].sort((a, b) => compare(a, b, o.sort, dir));
  const start = (o.page - 1) * o.limit;
  res.json(sorted.slice(start, start + o.limit));
});

app.get('/api/stats', async (req, res) => {
  const books = await store.getAll();
  const rated = books.filter((b) => b.rating !== null);
  const byGenre = {};
  for (const b of books) byGenre[b.genre] = (byGenre[b.genre] || 0) + 1;
  const readCount = books.filter((b) => b.read).length;
  res.json({
    total: books.length,
    read: readCount,
    unread: books.length - readCount,
    averageRating: rated.length ? rated.reduce((s, b) => s + b.rating, 0) / rated.length : null,
    byGenre,
  });
});

app.get('/api/books/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return bad(res, 'id must be a positive integer');
  const book = await store.getById(id);
  if (!book) return res.status(404).json({ error: `Book ${id} not found` });
  res.json(book);
});

app.post('/api/books', async (req, res) => {
  const result = validateBook(pickFields(req.body));
  if (result.error) return bad(res, result.error);
  const dup = await store.findDuplicate(result.value.title, result.value.author);
  if (dup) return conflict(res, dup);
  const book = await store.create(result.value);
  res.status(201).location(`/api/books/${book.id}`).json(book);
});

app.put('/api/books/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return bad(res, 'id must be a positive integer');
  const result = validateBook(pickFields(req.body));
  if (result.error) return bad(res, result.error);
  if (!(await store.getById(id))) return res.status(404).json({ error: `Book ${id} not found` });
  const dup = await store.findDuplicate(result.value.title, result.value.author, id);
  if (dup) return conflict(res, dup);
  res.json(await store.replace(id, result.value));
});

app.patch('/api/books/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return bad(res, 'id must be a positive integer');
  if (req.body === undefined || req.body === null || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return bad(res, 'Request body must be a JSON object');
  }
  const existing = await store.getById(id);
  if (!existing) return res.status(404).json({ error: `Book ${id} not found` });
  const { id: _ignored, ...current } = existing;
  const result = validateBook({ ...current, ...pickFields(req.body) });
  if (result.error) return bad(res, result.error);
  const dup = await store.findDuplicate(result.value.title, result.value.author, id);
  if (dup) return conflict(res, dup);
  res.json(await store.replace(id, result.value));
});

app.delete('/api/books/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return bad(res, 'id must be a positive integer');
  const removed = await store.remove(id);
  if (!removed) return res.status(404).json({ error: `Book ${id} not found` });
  res.status(204).end();
});

// Deliberate crash to prove the error handler works (documented in README).
app.get('/api/crash', async () => {
  await store.getAll();
  throw new Error('Deliberate crash');
});

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// Error-handling middleware: must have four parameters.
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON in request body' });
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT} (CORS origin: ${CLIENT_ORIGIN})`));
