import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar.jsx';
import SearchPage from './pages/SearchPage.jsx';
import BookDetailsPage from './pages/BookDetailsPage.jsx';
import ClubReadsPage from './pages/ClubReadsPage.jsx';
import WishlistPage from './pages/WishlistPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <>
      <NavBar />
      <main className="container">
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/book/:id" element={<BookDetailsPage />} />
          <Route path="/club-reads" element={<ClubReadsPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <footer className="footer">
        <p>Book Finder &middot; Book data from the Google Books API and Open Library</p>
      </footer>
    </>
  );
}
