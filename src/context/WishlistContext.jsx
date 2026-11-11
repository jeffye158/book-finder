import { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'bookFinderWishlist';
const WishlistContext = createContext(null);

// Reads the saved wish list from localStorage. Returns [] if nothing is saved
// or if the browser blocks storage (for example, in some private windows).
function loadWishlist() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(loadWishlist);

  // Save to localStorage every time the wish list changes.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    } catch {
      // Storage is not available; the list still works until the page is closed.
    }
  }, [wishlist]);

  const isInWishlist = (id) => wishlist.some((book) => book.id === id);

  // Only the fields the Wish List page needs are saved.
  const addToWishlist = (book) => {
    if (isInWishlist(book.id)) return; // prevent duplicates
    const { id, title, authors, image, infoLink } = book;
    setWishlist((current) => [...current, { id, title, authors, image, infoLink }]);
  };

  const removeFromWishlist = (id) => {
    setWishlist((current) => current.filter((book) => book.id !== id));
  };

  return (
    <WishlistContext.Provider value={{ wishlist, isInWishlist, addToWishlist, removeFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
