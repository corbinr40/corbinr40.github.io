import type { ImageParagraphBlockData } from '../../../types/editor';
import RichTextEditor from '../RichTextEditor';
import ImageUpload from '../ImageUpload';

interface ImageParaBlockProps {
  data: ImageParagraphBlockData;
  onChange: (updates: Partial<ImageParagraphBlockData>) => void;
  onImageUpload: (path: string, file: File) => void;
  slug: string;
}

export default function ImageParaBlock({ data, onChange, onImageUpload, slug }: ImageParaBlockProps) {
  return (
    <div className="d-flex flex-column gap-2">
      <div>
        <label className="form-label small fw-bold mb-1">Image Side</label>
        <div className="btn-group btn-group-sm w-100" role="group">
          <input
            type="radio"
            className="btn-check"
            id="side-left"
            checked={data.side === 'left'}
            onChange={() => onChange({ side: 'left' })}
          />
          <label
            className={`btn ${data.side === 'left' ? '' : 'btn-outline-secondary'}`}
            style={data.side === 'left' ? { backgroundColor: 'var(--color-text-primary)', color: 'var(--color-bg-primary)', borderColor: 'var(--color-btn-border)' } : undefined}
            htmlFor="side-left"
          >
            Left
          </label>
          <input
            type="radio"
            className="btn-check"
            id="side-right"
            checked={data.side === 'right'}
            onChange={() => onChange({ side: 'right' })}
          />
          <label
            className={`btn ${data.side === 'right' ? '' : 'btn-outline-secondary'}`}
            style={data.side === 'right' ? { backgroundColor: 'var(--color-text-primary)', color: 'var(--color-bg-primary)', borderColor: 'var(--color-btn-border)' } : undefined}
            htmlFor="side-right"
          >
            Right
          </label>
        </div>
      </div>

      <ImageUpload
        value={data.imageSrc}
        onChange={(path) => onChange({ imageSrc: path })}
        onFileUpload={onImageUpload}
        slug={slug}
        label="Image"
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

      <div>
        <label className="form-label small fw-bold mb-1">Image Caption</label>
        <input
          type="text"
          className="form-control form-control-sm"
          value={data.imageCaption}
          onChange={(e) => onChange({ imageCaption: e.target.value })}
        />
      </div>

      <div>
        <label className="form-label small fw-bold mb-1">Content</label>
        <RichTextEditor
          content={data.contentHtml}
          onChange={(html) => onChange({ contentHtml: html })}
          placeholder="Write content alongside the image..."
        />
      </div>
    </div>
  );
}
