import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getBookById } from '../api/googleBooks.js';
import { useWishlist } from '../context/WishlistContext.jsx';
import BookCover from '../components/BookCover.jsx';

export default function BookDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const [book, setBook] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setBook(null);
    setError('');
    getBookById(id)
      .then((result) => !cancelled && setBook(result))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return (
      <section>
        <button className="btn btn-link" onClick={() => navigate(-1)}>← Back</button>
        <p className="status error" role="alert">{error}</p>
      </section>
    );
  }

  if (!book) return <p className="status">Loading book details…</p>;

  const saved = isInWishlist(book.id);

  return (
    <section>
      <button className="btn btn-link" onClick={() => navigate(-1)}>← Back to results</button>

      <div className="details">
        <BookCover src={book.image} title={book.title} large />

        <div className="details-body">
          <h1>{book.title}</h1>
          {book.subtitle && <p className="details-subtitle">{book.subtitle}</p>}
          <p className="book-author">by {book.authors.join(', ')}</p>

          <dl className="details-list">
            <dt>Publisher</dt>
            <dd>{book.publisher}</dd>
            <dt>Published</dt>
            <dd>{book.publishedDate}</dd>
            <dt>Pages</dt>
            <dd>{book.pageCount || 'Unknown'}</dd>
            <dt>Category</dt>
            <dd>{book.categories.join(', ') || 'Not listed'}</dd>
          </dl>

          <div className="book-card-actions">
            <a className="btn btn-outline" href={book.infoLink} target="_blank" rel="noopener noreferrer">
              More Info on {book.source}
            </a>
            {saved ? (
              <button className="btn btn-danger" onClick={() => removeFromWishlist(book.id)}>
                Remove from Wish List
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => addToWishlist(book)}>
                Add to Wish List
              </button>
            )}
          </div>

          <h2>Description</h2>
          <p className="details-description">{book.description}</p>
        </div>
      </div>
    </section>
  );
}
