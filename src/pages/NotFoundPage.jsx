import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="empty">
      <h1>Page not found</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
      <Link to="/" className="btn btn-primary">Go to Search</Link>
    </section>
  );
}
