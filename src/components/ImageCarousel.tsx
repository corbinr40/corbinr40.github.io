import { useEffect, useRef } from "react";
import { Carousel } from "bootstrap";

interface CarouselImage {
  src: string;
  alt: string;
  title?: string;
  caption?: string;
}

interface ImageCarouselProps {
  id: string;
  images: CarouselImage[];
}

export default function ImageCarousel({ id, images }: ImageCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let instance: Carousel | undefined;
    if (carouselRef.current) {
      instance = new Carousel(carouselRef.current, { ride: "carousel" });
    }
    return () => {
      instance?.dispose();
    };
  }, []);

  return (
    <div id={id} className="carousel slide my-4" ref={carouselRef}>
      <div className="carousel-indicators">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            data-bs-target={`#${id}`}
            data-bs-slide-to={i}
            className={i === 0 ? "active" : undefined}
            aria-current={i === 0 ? "true" : undefined}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      <div className="carousel-inner">
        {images.map((img, i) => (
          <div key={i} className={`carousel-item${i === 0 ? " active" : ""}`}>
            <img
              src={img.src}
              alt={img.alt}
              className="d-block w-100 img-fluid border rounded-3 mb-4"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
            {(img.title || img.caption) && (
              <div className="carousel-caption d-none d-md-block">
                {img.title && <h5>{img.title}</h5>}
                {img.caption && <p>{img.caption}</p>}
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target={`#${id}`}
        data-bs-slide="prev"
      >
        <span className="carousel-control-prev-icon" aria-hidden="true" />
        <span className="visually-hidden">Previous</span>
      </button>
      <button
        className="carousel-control-next"
        type="button"
        data-bs-target={`#${id}`}
        data-bs-slide="next"
      >
        <span className="carousel-control-next-icon" aria-hidden="true" />
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
}
