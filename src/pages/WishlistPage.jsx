import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext.jsx';
import BookCover from '../components/BookCover.jsx';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();

  return (
    <section>
      <h1>Wish List</h1>
      <p className="page-intro">Books our members want to read next. Saved in this browser.</p>

      {wishlist.length === 0 ? (
        <div className="empty">
          <p>Your wish list is empty.</p>
          <Link to="/" className="btn btn-primary">Search for books</Link>
        </div>
      ) : (
        <div className="wishlist">
          {wishlist.map((book) => (
            <article key={book.id} className="wish-item">
              <Link to={`/book/${book.id}`}>
                <BookCover src={book.image} title={book.title} />
              </Link>
              <div className="wish-body">
                <h3 className="book-title">
                  <Link to={`/book/${book.id}`}>{book.title}</Link>
                </h3>
                <p className="book-author">{book.authors.join(', ')}</p>
                <div className="book-card-actions">
                  <a className="btn btn-outline" href={book.infoLink} target="_blank" rel="noopener noreferrer">
                    More Info
                  </a>
                  <button className="btn btn-danger" onClick={() => removeFromWishlist(book.id)}>
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
