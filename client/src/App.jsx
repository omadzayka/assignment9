import { useEffect, useState } from 'react';
import { listBooks, getStats, createBook, replaceBook, patchBook, deleteBook } from './api/books.js';
import Filters from './components/Filters.jsx';
import StatsPanel from './components/StatsPanel.jsx';
import BookForm from './components/BookForm.jsx';
import BookItem from './components/BookItem.jsx';

const INITIAL_FILTERS = { q: '', genre: '', read: '', sort: '', order: 'asc' };

export default function App() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0); // bump after every successful change
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);

 // List: new request whenever filters change; stale responses are ignored.
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    // order is meaningless without a sort field, but harmless; omit it when not sorting
    const params = { ...filters, order: filters.sort ? filters.order : '' };
    listBooks(params, controller.signal)
      .then((data) => { setBooks(data); setLoading(false); })
      .catch((err) => {
        if (err.name === 'AbortError') return; // superseded by a newer request
        setError(err.message);
        setLoading(false);
      });
    return () => controller.abort();
  }, [filters, reloadKey]);

  useEffect(() => {
    const controller = new AbortController();
    getStats(controller.signal)
      .then((data) => { setStats(data); setStatsError(null); })
      .catch((err) => { if (err.name !== 'AbortError') setStatsError(err.message); });
    return () => controller.abort();
  }, [reloadKey]);

  // Runs a mutation; the screen only changes after the server confirms (via reload).
  async function mutate(action) {
    setBusy(true);
    setActionError(null);
    try {
      await action();
      setReloadKey((k) => k + 1);
    } finally {
      setBusy(false);
    }
  }
 
  const handleAdd = (data) => mutate(() => createBook(data));
  const handleEdit = (data) => mutate(() => replaceBook(editing.id, data)).then(() => setEditing(null));
  // Row actions (toggle, rate, delete) have no form, so show their errors in the banner.
  const safe = (fn) => fn().catch((err) => setActionError(err.message));

  const handleToggleRead = (book) =>
    safe(() => mutate(() => patchBook(book.id, book.read ? { read: false, rating: null } : { read: true })));
  const handleRate = (book, rating) => safe(() => mutate(() => patchBook(book.id, { rating })));
  const handleDelete = (book) => {
    if (!window.confirm(`Delete “${book.title}”?`)) return;
    safe(() => mutate(() => deleteBook(book.id)));
  };

  return (
    <main>
      <h1>Reading List</h1>
      <StatsPanel stats={stats} error={statsError} />

      {editing ? (
        <BookForm key={editing.id} initial={editing} onSubmit={handleEdit} onCancel={() => setEditing(null)} />
      ) : (
        <BookForm onSubmit={handleAdd} />
      )}

      <Filters filters={filters} onChange={setFilters} />
      {actionError && <p className="error" role="alert">{actionError}</p>}

      {loading && <p>Loading books…</p>}
      {error && <p className="error" role="alert">Could not load books: {error}</p>}
      {!loading && !error && books.length === 0 && <p className="muted">No books match these filters.</p>}
      {!error && books.length > 0 && (
        <ul style={{ padding: 0 }}>
          {books.map((b) => (
            <BookItem key={b.id} book={b} busy={busy} onToggleRead={handleToggleRead}
              onRate={handleRate} onEdit={setEditing} onDelete={handleDelete} />
          ))}
        </ul>
      )}
    </main>
  );
}