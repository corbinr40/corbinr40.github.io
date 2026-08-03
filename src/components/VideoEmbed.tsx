interface VideoEmbedProps {
  url: string;
}

function parseVideoUrl(url: string): { provider: 'youtube' | 'vimeo'; embedUrl: string } | null {
  // YouTube: youtube.com/watch?v=ID or youtu.be/ID
  const ytMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
  );
  if (ytMatch) {
    return {
      provider: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`,
    };
  }

  // Vimeo: vimeo.com/ID
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return {
      provider: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    };
  }

  return null;
}

export default function VideoEmbed({ url }: VideoEmbedProps) {
  const parsed = parseVideoUrl(url);

  if (!parsed) {
    return (
      <p className="text-muted">
        Unable to embed video.{' '}
        <a href={url} target="_blank" rel="noopener noreferrer">
          Open video link
        </a>
      </p>
    );
  }

  return (
    <div className="ratio ratio-16x9">
      <iframe
        src={parsed.embedUrl}
        title={`${parsed.provider} video`}
        allowFullScreen
      />
    </div>
  );
}
