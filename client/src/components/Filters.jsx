const GENRES = ['fiction', 'non-fiction', 'science', 'history', 'fantasy', 'other'];

export default function Filters({ filters, onChange }) {
  const set = (name) => (e) => onChange({ ...filters, [name]: e.target.value });

  return (
    <div className="row">
      <input type="search" placeholder="Search title or author" value={filters.q} onChange={set('q')} />
      <select value={filters.genre} onChange={set('genre')} aria-label="Genre">
        <option value="">All genres</option>
        {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
      </select>
      <select value={filters.read} onChange={set('read')} aria-label="Read status">
        <option value="">Read and unread</option>
        <option value="true">Read</option>
        <option value="false">Unread</option>
      </select>
      <select value={filters.sort} onChange={set('sort')} aria-label="Sort by">
        <option value="">Sort: default</option>
        <option value="title">Title</option>
        <option value="author">Author</option>
        <option value="year">Year</option>
        <option value="rating">Rating</option>
      </select>
      <select value={filters.order} onChange={set('order')} aria-label="Direction">
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
    </div>
  );
}