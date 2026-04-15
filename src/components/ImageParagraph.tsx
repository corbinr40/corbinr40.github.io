interface ImageParagraphProps {
  imageSrc: string;
  imageAlt: string;
  imageCaption?: string;
  side: 'left' | 'right';
  children: React.ReactNode;
}

export default function ImageParagraph({
  imageSrc,
  imageAlt,
  imageCaption,
  side,
  children,
}: ImageParagraphProps) {
  const imageOrder = side === 'left' ? 'order-md-1' : 'order-md-2';
  const textOrder = side === 'left' ? 'order-md-2' : 'order-md-1';

  return (
    <div className="row align-items-center g-4">
      <div className={`col-md-5 ${imageOrder}`}>
        <figure className="mb-0">
          <img src={imageSrc} alt={imageAlt} className="img-fluid rounded" />
          {imageCaption && (
            <figcaption className="figure-caption mt-2">{imageCaption}</figcaption>
          )}
        </figure>
      </div>
      <div className={`col-md-7 ${textOrder}`}>{children}</div>
    </div>
  );
}
