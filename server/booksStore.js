// All data access goes through this module. Functions are async (simulated slow source)
// and never mutate the existing array or objects: they replace them with new copies.
let books = [
  { id: 1, title: 'Dune', author: 'Frank Herbert', year: 1965, genre: 'fiction', read: true, rating: 5 },
  { id: 2, title: 'The Hobbit', author: 'J.R.R. Tolkien', year: 1937, genre: 'fantasy', read: true, rating: 4 },
  { id: 3, title: 'A Brief History of Time', author: 'Stephen Hawking', year: 1988, genre: 'science', read: true, rating: 4 },
  { id: 4, title: 'Sapiens', author: 'Yuval Noah Harari', year: 2011, genre: 'history', read: false, rating: null },
  { id: 5, title: 'The Name of the Wind', author: 'Patrick Rothfuss', year: 2007, genre: 'fantasy', read: true, rating: 5 },
  { id: 6, title: 'Educated', author: 'Tara Westover', year: 2018, genre: 'non-fiction', read: false, rating: null },
  { id: 7, title: 'Cosmos', author: 'Carl Sagan', year: 1980, genre: 'science', read: false, rating: null },
];
let nextId = 8;

const slow = () => new Promise((resolve) => setTimeout(resolve, 20));
const same = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();

export async function getAll() {
  await slow();
  return books.map((b) => ({ ...b }));
}

export async function getById(id) {
  await slow();
  const found = books.find((b) => b.id === id);
  return found ? { ...found } : null;
}

export async function findDuplicate(title, author, excludeId = null) {
  await slow();
  const found = books.find((b) => b.id !== excludeId && same(b.title, title) && same(b.author, author));
  return found ? { ...found } : null;
}

export async function create(data) {
  await slow();
  const book = { ...data, id: nextId++ };
  books = [...books, book];
  return { ...book };
}

export async function replace(id, data) {
  await slow();
  if (!books.some((b) => b.id === id)) return null;
  const book = { ...data, id };
  books = books.map((b) => (b.id === id ? book : b));
  return { ...book };
}

export async function remove(id) {
  await slow();
  if (!books.some((b) => b.id === id)) return false;
  books = books.filter((b) => b.id !== id);
  return true;
}