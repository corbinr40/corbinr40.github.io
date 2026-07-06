import { useEffect, useState, useRef, useCallback } from 'react';

interface TocEntry {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [entries, setEntries] = useState<TocEntry[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);

  const buildEntries = useCallback(() => {
    const headings = document.querySelectorAll(
      '.section-wrapper h2, .section-wrapper h3'
    );
    const items: TocEntry[] = [];
    headings.forEach((el, i) => {
      if (!el.id) {
        el.id =
          el.textContent
            ?.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') ?? `heading-${i}`;
      }
      items.push({
        id: el.id,
        text: el.textContent ?? '',
        level: el.tagName === 'H2' ? 2 : 3,
      });
    });
    return items;
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const items = buildEntries();
      setEntries(items);

      if (items.length < 2) return;

      observerRef.current?.disconnect();

      const observer = new IntersectionObserver(
        (observedEntries) => {
          const visible = observedEntries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          if (visible.length > 0) {
            setActiveId(visible[0].target.id);
          }
        },
        { rootMargin: '0px 0px -60% 0px', threshold: 0.1 }
      );

      items.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });

      observerRef.current = observer;
    });

    return () => {
      cancelAnimationFrame(frame);
      observerRef.current?.disconnect();
    };
  }, [buildEntries]);

  if (entries.length < 2) return null;

  return (
    <nav className="toc" aria-label="Table of contents">
      <h6 className="toc__heading">On this page</h6>
      <ul className="toc__list">
        {entries.map((e) => (
          <li
            key={e.id}
            className={`toc__item${e.level === 3 ? ' toc__item--nested' : ''}${
              activeId === e.id ? ' toc__item--active' : ''
            }`}
          >
            <a href={`#${e.id}`} className="toc__link">
              {e.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
