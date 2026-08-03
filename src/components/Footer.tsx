import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <div className="container">
      <footer className="py-3 my-4 border-top">
        <div className="row align-items-center">
          <div className="col-md-4 mb-3 mb-md-0">
            <span className="fw-semibold">corbinr40</span>
            <br />
            <small className="text-body-secondary">
              &copy; {new Date().getFullYear()} Corbin Richardson
            </small>
          </div>

          <div className="col-md-4 d-flex justify-content-center mb-3 mb-md-0">
            <Link to="/">
              <img
                src="/assets/icon256.png"
                alt="corbinr40 logo"
                className="footer-logo"
                width="40"
                height="40"
              />
            </Link>
          </div>

          <ul className="nav col-md-4 justify-content-end list-unstyled">
            <li className="ms-3">
              <Link to="/#programs" className="text-body-secondary">
                Programs
              </Link>
            </li>
            <li className="ms-3">
              <Link to="/blog" className="text-body-secondary">
                Blog
              </Link>
            </li>
            <li className="ms-3">
              <Link to="/privacy" className="text-body-secondary">
                Privacy Policy
              </Link>
            </li>
            <li className="ms-3">
              <Link to="/contact" className="text-body-secondary">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div className="row mt-3">
          <div className="col text-center">
            <a
              href="https://www.linkedin.com/in/CorbinRichardson"
              target="_blank"
              rel="noopener noreferrer"
              className="text-body-secondary me-3"
              aria-label="LinkedIn"
            >
              <i className="bi bi-linkedin" />
            </a>
            <a
              href="https://www.instagram.com/corbinr40_art"
              target="_blank"
              rel="noopener noreferrer"
              className="text-body-secondary me-3"
              aria-label="Instagram"
            >
              <i className="bi bi-instagram" />
            </a>
            <a
              href="https://www.github.com/corbinr40"
              target="_blank"
              rel="noopener noreferrer"
              className="text-body-secondary"
              aria-label="GitHub"
            >
              <i className="bi bi-github" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
