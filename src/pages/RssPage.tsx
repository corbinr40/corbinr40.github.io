import SEO from '../components/SEO';

const FEED_URL = 'https://corbinr40.com/rss.xml';

export default function RssPage() {
  return (
    <>
      <SEO title="RSS Feed" />
      <div className="container px-4 py-5">
        <h1 className="pb-2 border-bottom">RSS Feed</h1>
        <p className="mt-3">
          Subscribe to the blog by pointing your RSS reader at{' '}
          <a href="/rss.xml">
            <code>{FEED_URL}</code>
          </a>
          .
        </p>
        <p className="text-muted small">
          <i className="bi bi-info-circle me-1" />
          The feed updates automatically whenever a new post is published.
        </p>
      </div>
    </>
  );
}
