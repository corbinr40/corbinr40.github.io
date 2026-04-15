import type { HeroBlockData } from '../../../types/editor';
import ImageUpload from '../ImageUpload';

interface HeroBlockProps {
  data: HeroBlockData;
  onChange: (updates: Partial<HeroBlockData>) => void;
  onImageUpload: (path: string, file: File) => void;
  slug: string;
}

export default function HeroBlock({ data, onChange, onImageUpload, slug }: HeroBlockProps) {
  const updateParagraph = (index: number, value: string) => {
    const paragraphs = [...data.paragraphs];
    paragraphs[index] = value;
    onChange({ paragraphs });
  };

  const addParagraph = () => {
    onChange({ paragraphs: [...data.paragraphs, ''] });
  };

  const removeParagraph = (index: number) => {
    onChange({ paragraphs: data.paragraphs.filter((_, i) => i !== index) });
  };

  return (
    <div className="d-flex flex-column gap-2">
      <div>
        <label className="form-label small fw-bold mb-1">Title</label>
        <input
          type="text"
          className="form-control form-control-sm"
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </div>

      <div>
        <label className="form-label small fw-bold mb-1">Paragraphs</label>
        {data.paragraphs.map((p, i) => (
          <div key={i} className="d-flex gap-1 mb-1">
            <textarea
              className="form-control form-control-sm"
              rows={2}
              value={p}
              onChange={(e) => updateParagraph(i, e.target.value)}
            />
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={() => removeParagraph(i)}
              title="Remove paragraph"
            >
              <i className="bi bi-dash" />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={addParagraph}
        >
          <i className="bi bi-plus me-1" />
          Add Paragraph
        </button>
      </div>

      <ImageUpload
        value={data.imageSrc}
        onChange={(path) => onChange({ imageSrc: path })}
        onFileUpload={onImageUpload}
        slug={slug}
        label="Image Source"
      />

      <div>
        <label className="form-label small fw-bold mb-1">Image Alt Text</label>
        <input
          type="text"
          className="form-control form-control-sm"
          value={data.imageAlt}
          onChange={(e) => onChange({ imageAlt: e.target.value })}
        />
      </div>
    </div>
  );
}
