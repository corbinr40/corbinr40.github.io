import type { CalloutBlockData } from '../../../types/editor';
import RichTextEditor from '../RichTextEditor';

interface CalloutBlockEditorProps {
  data: CalloutBlockData;
  onChange: (updates: Partial<CalloutBlockData>) => void;
}

const CALLOUT_TYPES: { value: CalloutBlockData['calloutType']; label: string }[] = [
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Warning' },
  { value: 'tip', label: 'Tip' },
  { value: 'note', label: 'Note' },
];

export default function CalloutBlockEditor({ data, onChange }: CalloutBlockEditorProps) {
  return (
    <div className="d-flex flex-column gap-2">
      <div>
        <label className="form-label small fw-bold mb-1">Callout Type</label>
        <select
          className="form-select form-select-sm"
          value={data.calloutType}
          onChange={(e) =>
            onChange({ calloutType: e.target.value as CalloutBlockData['calloutType'] })
          }
        >
          {CALLOUT_TYPES.map((ct) => (
            <option key={ct.value} value={ct.value}>
              {ct.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="form-label small fw-bold mb-1">Content</label>
        <RichTextEditor
          content={data.contentHtml}
          onChange={(html) => onChange({ contentHtml: html })}
          placeholder="Write callout content..."
        />
      </div>
    </div>
  );
}
