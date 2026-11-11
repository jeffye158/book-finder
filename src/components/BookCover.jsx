import { useState } from 'react';

// Shows the book cover, or a plain placeholder when there is no image
// or the image fails to load.
export default function BookCover({ src, title, large = false }) {
  const [failed, setFailed] = useState(false);
  const className = large ? 'book-cover large' : 'book-cover';

  if (!src || failed) {
    return (
      <div className={`${className} placeholder`} aria-label={`No cover for ${title}`}>
        <span>No cover</span>
      </div>
    );
  }

  return <img className={className} src={src} alt={`Cover of ${title}`} onError={() => setFailed(true)} />;
}
