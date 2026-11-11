import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext.jsx';
import BookCover from './BookCover.jsx';

// One search result: cover, main details, and three actions.
export default function BookCard({ book }) {
  const { isInWishlist, addToWishlist } = useWishlist();
  const saved = isInWishlist(book.id);

  return (
    <article className="book-card">
      <Link to={`/book/${book.id}`} className="cover-link">
        <BookCover src={book.image} title={book.title} />
      </Link>

      <div className="book-card-body">
        <h3 className="book-title">
          <Link to={`/book/${book.id}`}>{book.title}</Link>
        </h3>
        <p className="book-author">{book.authors.join(', ')}</p>
        <p className="book-meta">
          {book.publisher} &middot; {book.publishedDate}
          {book.pageCount ? ` · ${book.pageCount} pages` : ''}
        </p>
        {book.categories.length > 0 && <p className="book-category">{book.categories[0]}</p>}
        <p className="book-description">{book.description}</p>
      </div>

      <div className="book-card-actions">
        <a className="btn btn-outline" href={book.infoLink} target="_blank" rel="noopener noreferrer">
          More Info
        </a>
        <button className="btn btn-primary" onClick={() => addToWishlist(book)} disabled={saved}>
          {saved ? '✓ In Wish List' : 'Add to Wish List'}
        </button>
      </div>
    </article>
  );
}
