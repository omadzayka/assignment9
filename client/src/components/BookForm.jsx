import { useState } from 'react';

const GENRES = ['fiction', 'non-fiction', 'science', 'history', 'fantasy', 'other'];
const EMPTY = { title: '', author: '', year: '', genre: 'fiction', read: false, rating: '' };

// Used for both adding (initial = null) and editing (initial = book).
export default function BookForm({ initial, onSubmit, onCancel }) {
  const [values, setValues] = useState(
    initial ? { ...initial, rating: initial.rating ?? '' } : EMPTY
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  const set = (name, value) => setValues((v) => ({ ...v, [name]: value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await onSubmit({
        title: values.title,
        author: values.author,
        year: values.year === '' ? undefined : Number(values.year),
        genre: values.genre,
        read: values.read,
        rating: values.read && values.rating !== '' ? Number(values.rating) : null,
      });
      if (!initial) setValues(EMPTY);
    } catch (err) {
      setError(err.message); // the server's message, shown as-is
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h3>{initial ? `Edit “${initial.title}”` : 'Add a book'}</h3>
      <div className="row">
        <label>Title<input value={values.title} onChange={(e) => set('title', e.target.value)} /></label>
        <label>Author<input value={values.author} onChange={(e) => set('author', e.target.value)} /></label>
        <label>Year<input type="number" value={values.year} onChange={(e) => set('year', e.target.value)} /></label>
        <label>Genre
          <select value={values.genre} onChange={(e) => set('genre', e.target.value)}>
            {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </label>
        <label>Read
          <input type="checkbox" checked={values.read}
            onChange={(e) => setValues((v) => ({ ...v, read: e.target.checked, rating: e.target.checked ? v.rating : '' }))} />
        </label>
        <label>Rating
          <select value={values.rating} disabled={!values.read} onChange={(e) => set('rating', e.target.value)}>
            <option value="">none</option>
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      <div className="row">
        <button type="submit" disabled={pending}>{pending ? 'Saving…' : initial ? 'Save changes' : 'Add book'}</button>
        {onCancel && <button type="button" onClick={onCancel} disabled={pending}>Cancel</button>}
      </div>
    </form>
  );
}