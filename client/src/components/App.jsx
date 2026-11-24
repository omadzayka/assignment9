import { useEffect, useState } from 'react';
import { listBooks, getStats, createBook, replaceBook, patchBook, deleteBook } from './api/books.js';
import Filters from './components/Filters.jsx';
import StatsPanel from './components/StatsPanel.jsx';
import BookForm from './components/BookForm.jsx';
import BookItem from './components/BookItem.jsx';