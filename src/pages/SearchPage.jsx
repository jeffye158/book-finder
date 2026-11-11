import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchForm from '../components/SearchForm.jsx';
import BookCard from '../components/BookCard.jsx';
import { searchBooks } from '../api/googleBooks.js';

// The search is kept in the URL (?q=...&type=...), so pressing "Back" from a
// Book Details page brings the user back to the same results.
export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const type = params.get('type') || 'title';

  const [books, setBooks] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query) {
      setBooks([]);
      setStatus('idle');
      return;
    }

    let cancelled = false; // ignore old results if a new search starts
    setStatus('loading');
    setError('');

    searchBooks(query, type)
      .then((results) => {
        if (!cancelled) {
          setBooks(results);
          setStatus('done');
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Something went wrong. Please check your connection and try again.');
          setStatus('error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [query, type]);

  const handleSearch = (newQuery, newType) => {
    setParams({ q: newQuery, type: newType });
  };

  return (
    <section>
      <div className="hero">
        <h1>Find your book club's next read</h1>
        <p>Search millions of books by title, author or ISBN.</p>
        <SearchForm key={query + type} initialQuery={query} initialType={type} onSearch={handleSearch} />
      </div>

      {status === 'loading' && <p className="status">Searching…</p>}
      {status === 'error' && <p className="status error" role="alert">{error}</p>}
      {status === 'done' && books.length === 0 && (
        <p className="status">No books found for "{query}". Try a different search.</p>
      )}

      {status === 'done' && books.length > 0 && (
        <>
          <p className="results-count">
            Showing {books.length} result{books.length > 1 ? 's' : ''} for "{query}" &middot; from {books[0].source}
          </p>
          <div className="results">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
