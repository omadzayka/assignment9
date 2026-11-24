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