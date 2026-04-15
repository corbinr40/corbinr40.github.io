import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  ogImage?: string;
}

function setMetaTag(content: string, nameOrProp: string, isProperty?: boolean) {
  const attr = isProperty ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${nameOrProp}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, nameOrProp);
    document.head.appendChild(el);
  }
  el.content = content;
}

export default function SEO({ title, description, ogImage }: SEOProps) {
  useEffect(() => {
    const fullTitle = `${title} | corbinr40`;
    document.title = fullTitle;

    const desc = description || '';
    const image = ogImage || '/assets/icon256.png';
    const url = `https://corbinr40.github.io${window.location.pathname}`;

    if (desc) {
      setMetaTag(desc, 'description');
    }

    setMetaTag(fullTitle, 'og:title', true);
    if (desc) setMetaTag(desc, 'og:description', true);
    setMetaTag('website', 'og:type', true);
    setMetaTag(url, 'og:url', true);
    setMetaTag(
      image.startsWith('http') ? image : `https://corbinr40.github.io${image}`,
      'og:image',
      true,
    );

    setMetaTag('summary', 'twitter:card');
    setMetaTag(fullTitle, 'twitter:title');
    if (desc) setMetaTag(desc, 'twitter:description');
  }, [title, description, ogImage]);

  return null;
}
