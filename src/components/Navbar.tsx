import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Tooltip } from 'bootstrap';
import ThemeToggle from './ThemeToggle';
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

const ARC_SPAN = 180; // degrees of arc the icons cover
const ARC_START = -ARC_SPAN / 2;

export default function Navbar() {
  const ringRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const tooltips: Tooltip[] = [];
    if (ringRef.current) {
      const triggers =
        ringRef.current.querySelectorAll('[data-bs-toggle="tooltip"]');
      triggers.forEach((el) => tooltips.push(new Tooltip(el)));
    }
    return () => tooltips.forEach((t) => t.dispose());
  }, []);

  const totalArcItems = socialLinks.length + 1; // +1 for theme toggle
  const arcStep = ARC_SPAN / (totalArcItems - 1);

  return (
    <div className="navbar-arc">
      <div className="navbar-arc__ring" ref={ringRef}>
        <Link to="/" className="navbar-arc__logo">
          <img src="/assets/icon256.png" alt="corbinr40 logo" />
        </Link>

        {socialLinks.map((link, i) => (
          <button
            key={link.url}
            type="button"
            className="navbar-arc__social btn btn-outline-primary rounded-circle"
            style={
              { '--arc-angle': `${ARC_START + i * arcStep}deg` } as React.CSSProperties
            }
            title={link.label}
            data-bs-toggle="tooltip"
            data-bs-placement="bottom"
            onClick={() =>
              window.open(link.url, '_blank', 'noopener,noreferrer')
            }
          >
            {link.icon}
          </button>
        ))}

        <ThemeToggle
          className="navbar-arc__social btn btn-outline-primary rounded-circle"
          style={
            { '--arc-angle': `${ARC_START + socialLinks.length * arcStep}deg` } as React.CSSProperties
          }
        />
      </div>

      {/* Hamburger toggle — visible only on small screens */}
      <button
        type="button"
        className="navbar-arc__hamburger"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="Toggle navigation"
        aria-expanded={menuOpen}
        aria-controls="navbar-menu"
      >
        <i className={`bi ${menuOpen ? 'bi-x-lg' : 'bi-list'}`} />
      </button>

      <nav id="navbar-menu" className={`navbar-arc__nav ${menuOpen ? 'navbar-arc__nav--open' : ''}`}>
        <Link to="/" className="navbar-arc__link" aria-current={location.pathname === '/' ? 'page' : undefined}>
          corbinr40
        </Link>
        <Link to="/#programs" className="navbar-arc__link">
          Programs
        </Link>
        <Link to="/blog" className="navbar-arc__link" aria-current={location.pathname === '/blog' ? 'page' : undefined}>
          Blog
        </Link>
        <Link to="/contact" className="navbar-arc__link" aria-current={location.pathname === '/contact' ? 'page' : undefined}>
          Contact
        </Link>
      </nav>
    </div>
  );
}
