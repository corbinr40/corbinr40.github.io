import { useState } from 'react';

interface ShareButtonsProps {
  title: string;
  url: string;
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="d-flex gap-2 align-items-center">
      <span className="small text-body-secondary me-2">Share:</span>
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm"
        onClick={() => window.open(twitterUrl, '_blank', 'noopener,noreferrer')}
        aria-label="Share on Twitter"
      >
        <i className="bi bi-twitter" />
      </button>
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm"
        onClick={() => window.open(linkedinUrl, '_blank', 'noopener,noreferrer')}
        aria-label="Share on LinkedIn"
      >
        <i className="bi bi-linkedin" />
      </button>
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm"
        onClick={handleCopy}
        aria-label="Copy link"
      >
        <i className="bi bi-link-45deg" /> {copied ? 'Copied!' : ''}
      </button>
    </div>
  );
}
