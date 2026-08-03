interface FeatureSectionProps {
  title?: string;
  imageSrc?: string;
  imageAlt?: string;
  imageCaption?: string;
  children: React.ReactNode;
}

export default function FeatureSection({
  title = "Features",
  imageSrc,
  imageAlt,
  imageCaption,
  children,
}: FeatureSectionProps) {
  return (
    <section className="py-4">
      <h2 className="border-top pt-3 fw-bold">{title}</h2>

      <div className="col-lg-6 mx-auto">
        {imageSrc && (
          <figure className="text-center my-4">
            <img
              src={imageSrc}
              alt={imageAlt ?? ""}
              className="img-fluid border rounded-3 shadow-sm"
              loading="lazy"
            />
            {imageCaption && (
              <figcaption className="mt-2 text-muted">{imageCaption}</figcaption>
            )}
          </figure>
        )}
        {children}
      </div>
    </section>
  );
}
