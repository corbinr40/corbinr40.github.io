import { useState, useMemo } from 'react';
import SEO from '../components/SEO';
import { blogEntries } from '../content';
import { Link } from 'react-router-dom';

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BlogList() {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const visiblePosts = useMemo(() => {
    const posts = blogEntries
      .filter((e) => e.frontmatter.visible !== false)
      .slice()
      .sort((a, b) => {
        const dateA = a.frontmatter.date ?? '';
        const dateB = b.frontmatter.date ?? '';
        return dateB.localeCompare(dateA);
      });
    return posts;
  }, []);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const post of visiblePosts) {
      const tags = post.frontmatter.tags;
      if (tags) {
        for (const tag of tags) {
          tagSet.add(tag);
        }
      }
    }
    return Array.from(tagSet).sort();
  }, [visiblePosts]);

  const filteredPosts = useMemo(() => {
    if (!activeTag) return visiblePosts;
    return visiblePosts.filter(
      (p) => p.frontmatter.tags && p.frontmatter.tags.includes(activeTag),
    );
  }, [visiblePosts, activeTag]);

  return (
    <>
      <SEO title="Blog" />
      <div className="container px-4 py-5">
        <h1 className="pb-2 border-bottom">Blog</h1>

        {/* Tag filter */}
        {allTags.length > 0 && (
          <div className="d-flex flex-wrap gap-2 mt-3 mb-4">
            <button
              type="button"
              className={`btn btn-sm ${activeTag === null ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setActiveTag(null)}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`btn btn-sm ${activeTag === tag ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {filteredPosts.length === 0 ? (
          <p className="text-muted mt-3">No posts yet. Check back soon!</p>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 py-3">
            {filteredPosts.map((entry) => (
              <div className="col" key={entry.slug}>
                <Link
                  to={`/blog/${entry.slug}`}
                  className="text-decoration-none"
                >
                  <div className="card h-100 shadow-sm">
                    {entry.frontmatter.image && (
                      <img
                        src={entry.frontmatter.image}
                        alt={entry.frontmatter.title}
                        className="card-img-top img-fluid"
                      />
                    )}
                    <div className="card-body">
                      <h5 className="card-title">{entry.frontmatter.title}</h5>
                      {entry.frontmatter.date && (
                        <p className="card-text text-muted small mb-2">
                          <i className="bi bi-calendar3 me-1" />
                          {formatDate(entry.frontmatter.date)}
                        </p>
                      )}
                      <p className="card-text text-muted">
                        {entry.frontmatter.description}
                      </p>
                      {entry.frontmatter.tags &&
                        entry.frontmatter.tags.length > 0 && (
                          <div className="d-flex flex-wrap gap-1 mt-2">
                            {entry.frontmatter.tags.map((tag) => (
                              <span
                                key={tag}
                                className="badge bg-secondary"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
