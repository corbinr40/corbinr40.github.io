import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(false);
    // Small delay to allow the fade-out, then fade-in
    const timer = requestAnimationFrame(() => {
      setFadeIn(true);
    });
    return () => cancelAnimationFrame(timer);
  }, [location.pathname]);

  return (
    <div className={`page-transition ${fadeIn ? 'page-transition--visible' : ''}`}>
      {children}
    </div>
  );
}
