import type { FeatureBlockData } from '../../../types/editor';
import RichTextEditor from '../RichTextEditor';

interface FeatureBlockProps {
  data: FeatureBlockData;
  onChange: (updates: Partial<FeatureBlockData>) => void;
}

export default function FeatureBlock({ data, onChange }: FeatureBlockProps) {
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
        <label className="form-label small fw-bold mb-1">Image Source</label>
        <input
          type="text"
          className="form-control form-control-sm"
          value={data.imageSrc}
          onChange={(e) => onChange({ imageSrc: e.target.value })}
          placeholder="/assets/images/..."
        />
      </div>

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
          placeholder="Write feature content..."
        />
      </div>
    </div>
  );
}
