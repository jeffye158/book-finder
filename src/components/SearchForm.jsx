import { useState } from 'react';
import { isValidIsbn } from '../api/googleBooks.js';

// The search form: a dropdown for the search type and a text field.
// It checks the input before calling onSearch(query, type).
export default function SearchForm({ initialQuery = '', initialType = 'title', onSearch }) {
  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState(initialType);
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = query.trim();

    if (!trimmed) {
      setError('Please enter a title, author or ISBN.');
      return;
    }
    if (type === 'isbn' && !isValidIsbn(trimmed)) {
      setError('An ISBN must have 10 or 13 digits (dashes are allowed).');
      return;
    }

    setError('');
    onSearch(trimmed, type);
  };

  return (
    <form className="search-form" onSubmit={handleSubmit} noValidate>
      <label htmlFor="search-type" className="visually-hidden">Search by</label>
      <select id="search-type" value={type} onChange={(e) => setType(e.target.value)}>
        <option value="title">Title</option>
        <option value="author">Author</option>
        <option value="isbn">ISBN</option>
      </select>

      <label htmlFor="search-query" className="visually-hidden">Search text</label>
      <input
        id="search-query"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={
          type === 'isbn' ? 'e.g. 9780141187761' : type === 'author' ? 'e.g. Margaret Atwood' : 'e.g. The Hobbit'
        }
      />

      <button type="submit" className="btn btn-primary">Search</button>

      {error && <p className="form-error" role="alert">{error}</p>}
    </form>
  );
}
