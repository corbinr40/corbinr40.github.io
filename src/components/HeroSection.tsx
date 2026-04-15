interface HeroSectionProps {
  title: string;
  subtitle?: string;
  paragraphs: string[];
  avatarSrc?: string;
  imageSrc?: string;
  imageAlt?: string;
}

export default function HeroSection({
  title,
  subtitle,
  paragraphs,
  avatarSrc,
  imageSrc,
  imageAlt,
}: HeroSectionProps) {
  return (
    <section className="hero-section">
      {avatarSrc && (
        <div className="hero-section__avatar-col">
          <img
            src={avatarSrc}
            alt="Avatar"
            className="hero-section__avatar"
            width={160}
            height={160}
          />
        </div>
      )}

      <div className="hero-section__text-col">
        <h1 className="hero-section__title">{title}</h1>
        {subtitle && (
          <p className="hero-section__subtitle">{subtitle}</p>
        )}
        <div className="hero-section__body">
          {paragraphs.map((text, i) => (
            <p key={i}>{text}</p>
          ))}
        </div>
      </div>

      {imageSrc && (
        <div className="hero-image-container mt-4">
          <img
            src={imageSrc}
            alt={imageAlt ?? ''}
            className="img-fluid border rounded-3 shadow-lg"
            loading="lazy"
          />
        </div>
      )}
    </section>
  );
}
