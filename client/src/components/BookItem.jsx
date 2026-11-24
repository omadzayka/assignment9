export default function BookItem({ book, busy, onToggleRead, onRate, onEdit, onDelete }) {
  return (
    <li className="card" style={{ listStyle: 'none' }}>
      <strong>{book.title}</strong> — {book.author} ({book.year}) <span className="muted">[{book.genre}]</span>
      <div className="row" style={{ marginTop: '.5rem', marginBottom: 0 }}>
        <label>
          <input type="checkbox" checked={book.read} disabled={busy} onChange={() => onToggleRead(book)} /> Read
        </label>
        <select value={book.rating ?? ''} disabled={busy || !book.read} aria-label={`Rating for ${book.title}`}
          onChange={(e) => onRate(book, Number(e.target.value))}>
          <option value="" disabled>Rate…</option>
          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{'★'.repeat(n)}</option>)}
        </select>
        <button onClick={() => onEdit(book)} disabled={busy}>Edit</button>
        <button onClick={() => onDelete(book)} disabled={busy}>Delete</button>
      </div>
    </li>
  );
}
