export default function ({ stats, error }) {
   if (error) return <div className="stats error">Stats: {error}</div>;
  if (!stats) return <div className="stats">Loading statistics…</div>;
  return (
    <div className="stats">
      <strong>{stats.total}</strong> books · <strong>{stats.read}</strong> read · <strong>{stats.unread}</strong> unread ·
      average rating: <strong>{stats.averageRating === null ? '–' : stats.averageRating.toFixed(2)}</strong>
      <div className="muted">
        {Object.entries(stats.byGenre).map(([g, n]) => `${g}: ${n}`).join(' · ')}
      </div>
    </div>
  );
}