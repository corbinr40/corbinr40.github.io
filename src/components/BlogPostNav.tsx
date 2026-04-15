import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { blogEntries } from '../content';

interface BlogPostNavProps {
  currentSlug: string;
}

export default function BlogPostNav({ currentSlug }: BlogPostNavProps) {
  const { prev, next } = useMemo(() => {
    const sorted = blogEntries
      .filter((e) => e.frontmatter.visible !== false)
      .slice()
      .sort((a, b) => {
        const dateA = a.frontmatter.date ?? '';
        const dateB = b.frontmatter.date ?? '';
        return dateB.localeCompare(dateA);
      });

    const idx = sorted.findIndex((e) => e.slug === currentSlug);
    if (idx === -1) return { prev: null, next: null };

    return {
      prev: idx > 0 ? sorted[idx - 1] : null,
      next: idx < sorted.length - 1 ? sorted[idx + 1] : null,
    };
  }, [currentSlug]);

  if (!prev && !next) return null;

  return (
    <nav className="container px-4 py-4">
      <hr />
      <div className="d-flex justify-content-between">
        <div>
          {prev && (
            <Link to={`/blog/${prev.slug}`} className="text-decoration-none">
              <i className="bi bi-arrow-left me-1" />
              {prev.frontmatter.title}
            </Link>
          )}
        </div>
        <div>
          {next && (
            <Link to={`/blog/${next.slug}`} className="text-decoration-none">
              {next.frontmatter.title}
              <i className="bi bi-arrow-right ms-1" />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
