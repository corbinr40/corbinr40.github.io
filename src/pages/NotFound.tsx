import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function NotFound() {
  return (
    <>
      <SEO title="Page Not Found" />
      <div className="px-4 py-5 my-5 text-center">
        <h1 className="display-1 fw-bold text-body-emphasis">404</h1>
        <div className="col-lg-6 mx-auto">
          <p className="lead mb-4">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link to="/" className="btn btn-primary btn-lg">
            Go Home
          </Link>
        </div>
      </div>
    </>
  );
}
