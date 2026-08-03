import type { CarouselBlockData, CarouselImage } from '../../../types/editor';
import ImageUpload from '../ImageUpload';

interface CarouselBlockProps {
  data: CarouselBlockData;
  onChange: (updates: Partial<CarouselBlockData>) => void;
  onImageUpload: (path: string, file: File) => void;
  slug: string;
}

export default function CarouselBlock({ data, onChange, onImageUpload, slug }: CarouselBlockProps) {
  const updateImage = (index: number, updates: Partial<CarouselImage>) => {
    const images = data.images.map((img, i) =>
      i === index ? { ...img, ...updates } : img,
    );
    onChange({ images });
  };

  const addImage = () => {
    onChange({
      images: [...data.images, { src: '', alt: '', title: '', caption: '' }],
    });
  };

  const removeImage = (index: number) => {
    onChange({ images: data.images.filter((_, i) => i !== index) });
  };

  return (
    <div className="d-flex flex-column gap-2">
      <div>
        <label className="form-label small fw-bold mb-1">Carousel ID</label>
        <input
          type="text"
          className="form-control form-control-sm"
          value={data.carouselId}
          onChange={(e) => onChange({ carouselId: e.target.value })}
          placeholder="unique-carousel-id"
        />
      </div>

      <label className="form-label small fw-bold mb-0">Images</label>
      {data.images.map((img, i) => (
        <div key={i} className="border rounded p-2">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="small fw-bold text-body-secondary">Image {i + 1}</span>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={() => removeImage(i)}
              title="Remove image"
            >
              <i className="bi bi-dash" />
            </button>
          </div>
          <div className="d-flex flex-column gap-1">
            <ImageUpload
              value={img.src}
              onChange={(path) => updateImage(i, { src: path })}
              onFileUpload={onImageUpload}
              slug={slug}
              label={`Image ${i + 1} Source`}
              placeholder="Image source"
            />
            <input
              type="text"
              className="form-control form-control-sm"
              value={img.alt}
              onChange={(e) => updateImage(i, { alt: e.target.value })}
              placeholder="Alt text"
            />
            <input
              type="text"
              className="form-control form-control-sm"
              value={img.title}
              onChange={(e) => updateImage(i, { title: e.target.value })}
              placeholder="Title"
            />
            <input
              type="text"
              className="form-control form-control-sm"
              value={img.caption}
              onChange={(e) => updateImage(i, { caption: e.target.value })}
              placeholder="Caption"
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        className="btn btn-sm btn-outline-secondary"
        onClick={addImage}
      >
        <i className="bi bi-plus me-1" />
        Add Image
      </button>
    </div>
  );
}
