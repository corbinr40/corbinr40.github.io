import { useEffect, useRef } from 'react';
import { Tooltip } from 'bootstrap';
import { SketchfabIcon, ItchIoIcon } from './icons';

interface SocialLink {
  label: string;
  url: string;
  icon: React.ReactNode;
}

const socialLinks: SocialLink[] = [
  {
    label: '@corbinr40',
    url: 'https://www.twitter.com/corbinr40',
    icon: <i className="bi bi-twitter" />,
  },
  {
    label: 'in/CorbinRichardson',
    url: 'https://www.linkedin.com/in/CorbinRichardson',
    icon: <i className="bi bi-linkedin" />,
  },
  {
    label: '@corbinr40_art',
    url: 'https://www.instagram.com/corbinr40_art',
    icon: <i className="bi bi-instagram" />,
  },
  {
    label: 'corbinr40',
    url: 'https://www.sketchfab.com/corbinr40',
    icon: SketchfabIcon,
  },
  {
    label: 'corbinr40.itch.io',
    url: 'https://corbinr40.itch.io',
    icon: ItchIoIcon,
  },
  {
    label: '/corbinr40',
    url: 'https://www.github.com/corbinr40',
    icon: <i className="bi bi-github" />,
  },
];

export default function SocialButtons() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tooltips: Tooltip[] = [];
    if (containerRef.current) {
      const triggers = containerRef.current.querySelectorAll('[data-bs-toggle="tooltip"]');
      triggers.forEach((el) => {
        tooltips.push(new Tooltip(el));
      });
    }
    return () => {
      tooltips.forEach((t) => t.dispose());
    };
  }, []);

  return (
    <div ref={containerRef} className="d-flex gap-2">
      {socialLinks.map((link) => (
        <button
          key={link.url}
          type="button"
          className="btn btn-outline-primary rounded-circle p-2 lh-1"
          title={link.label}
          data-bs-toggle="tooltip"
          data-bs-placement="bottom"
          onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
        >
          {link.icon}
        </button>
      ))}
    </div>
  );
}
