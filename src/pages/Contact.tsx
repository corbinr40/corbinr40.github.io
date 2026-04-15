import SEO from '../components/SEO';

export default function Contact() {
  return (
    <>
      <SEO title="Contact" description="Get in touch with Corbin Richardson." />

      <div className="container px-4 py-5">
        <h1 className="display-5 fw-bold mb-3">Get in Touch</h1>
        <p className="lead text-body-secondary mb-5">
          Have a question, want to collaborate, or just want to say hello? Feel
          free to reach out through any of the channels below.
        </p>

        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
          <div className="col">
            <div className="card h-100 text-center">
              <div className="card-body d-flex flex-column align-items-center justify-content-center py-4">
                <i className="bi bi-envelope display-4 text-primary mb-3" />
                <h5 className="card-title">Email</h5>
                <a
                  href="mailto:corbinr40@live.com"
                  className="btn btn-primary mt-2"
                >
                  <i className="bi bi-envelope me-2" />
                  Send Email
                </a>
              </div>
            </div>
          </div>

          <div className="col">
            <div className="card h-100 text-center">
              <div className="card-body d-flex flex-column align-items-center justify-content-center py-4">
                <i className="bi bi-linkedin display-4 text-primary mb-3" />
                <h5 className="card-title">LinkedIn</h5>
                <a
                  href="https://www.linkedin.com/in/CorbinRichardson"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-primary mt-2"
                >
                  <i className="bi bi-linkedin me-2" />
                  Connect
                </a>
              </div>
            </div>
          </div>

          <div className="col">
            <div className="card h-100 text-center">
              <div className="card-body d-flex flex-column align-items-center justify-content-center py-4">
                <i className="bi bi-github display-4 text-primary mb-3" />
                <h5 className="card-title">GitHub</h5>
                <a
                  href="https://www.github.com/corbinr40"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-primary mt-2"
                >
                  <i className="bi bi-github me-2" />
                  Follow
                </a>
              </div>
            </div>
          </div>

          <div className="col">
            <div className="card h-100 text-center">
              <div className="card-body d-flex flex-column align-items-center justify-content-center py-4">
                <i className="bi bi-twitter display-4 text-primary mb-3" />
                <h5 className="card-title">Twitter</h5>
                <a
                  href="https://www.twitter.com/corbinr40"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-primary mt-2"
                >
                  <i className="bi bi-twitter me-2" />
                  Follow
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
