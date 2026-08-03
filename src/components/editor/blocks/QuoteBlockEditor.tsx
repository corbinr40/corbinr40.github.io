import type { QuoteBlockData } from '../../../types/editor';

interface QuoteBlockEditorProps {
  data: QuoteBlockData;
  onChange: (updates: Partial<QuoteBlockData>) => void;
}

export default function QuoteBlockEditor({ data, onChange }: QuoteBlockEditorProps) {
  return (
    <div className="d-flex flex-column gap-2">
      <div>
        <label className="form-label small fw-bold mb-1">Quote</label>
        <textarea
          className="form-control form-control-sm"
          rows={4}
          value={data.quoteText}
          onChange={(e) => onChange({ quoteText: e.target.value })}
          placeholder="Enter the quote text..."
        />
      </div>

      <div>
        <label className="form-label small fw-bold mb-1">Attribution</label>
        <input
          type="text"
          className="form-control form-control-sm"
          value={data.attribution}
          onChange={(e) => onChange({ attribution: e.target.value })}
          placeholder="Who said this?"
        />
      </div>
    </div>
  );
}
