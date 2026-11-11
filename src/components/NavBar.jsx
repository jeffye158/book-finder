import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext.jsx';

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const { wishlist } = useWishlist();
  const close = () => setOpen(false);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand" onClick={close}>
          📚 Book Finder
        </Link>

        {/* Hamburger button: only visible on phones (see media queries in App.css) */}
        <button
          className="menu-button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>

        <nav className={open ? 'nav-links open' : 'nav-links'}>
          <NavLink to="/" end onClick={close}>Search</NavLink>
          <NavLink to="/club-reads" onClick={close}>Club Reading List</NavLink>
          <NavLink to="/wishlist" onClick={close}>
            Wish List <span className="badge">{wishlist.length}</span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
