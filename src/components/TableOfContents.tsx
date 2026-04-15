import { useEffect, useState } from 'react';

export default function TableOfContents() {
  const [headings, setHeadings] = useState<{ id: string; text: string }[]>([]);

  useEffect(() => {
    const h2s = document.querySelectorAll('.section-wrapper h2, .section-wrapper h3');
    const items = Array.from(h2s).map((el, i) => {
      const id = el.id || `heading-${i}`;
      el.id = id;
      return { id, text: el.textContent || '' };
    });
    setHeadings(items);
  }, []);

  if (headings.length < 2) return null;

  return (
    <nav className="mb-4 p-3 border rounded bg-body-secondary" aria-label="Table of contents">
      <h6 className="fw-bold mb-2">Contents</h6>
      <ul className="list-unstyled mb-0">
        {headings.map((h) => (
          <li key={h.id} className="mb-1">
            <a href={`#${h.id}`} className="text-body-secondary small text-decoration-none">
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
