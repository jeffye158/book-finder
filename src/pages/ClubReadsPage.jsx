import { Link } from 'react-router-dom';
import clubBooks from '../data/clubBooks.json';

// Shows the books the club has already read, newest first.
export default function ClubReadsPage() {
  const books = [...clubBooks].reverse();

  return (
    <section>
      <h1>Club Reading List</h1>
      <p className="page-intro">Books our club has already read and discussed ({books.length} so far).</p>

      <div className="club-list">
        {books.map((book) => (
          <article key={book.id} className="club-item">
            <div>
              <h3 className="book-title">{book.title}</h3>
              <p className="book-author">{book.author}</p>
            </div>
            <div className="club-meta">
              <span className="pill">{book.monthRead}</span>
              <span className="book-meta">Suggested by {book.suggestedBy}</span>
              <Link
                className="btn btn-link small"
                to={`/?q=${encodeURIComponent(book.title)}&type=title`}
              >
                Find this book
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
