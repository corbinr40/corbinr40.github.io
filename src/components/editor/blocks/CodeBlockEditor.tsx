import type { CodeBlockData } from '../../../types/editor';

interface CodeBlockEditorProps {
  data: CodeBlockData;
  onChange: (updates: Partial<CodeBlockData>) => void;
}

const LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'csharp',
  'html',
  'css',
  'bash',
  'json',
  'other',
];

export default function CodeBlockEditor({ data, onChange }: CodeBlockEditorProps) {
  return (
    <div className="d-flex flex-column gap-2">
      <div>
        <label className="form-label small fw-bold mb-1">Language</label>
        <select
          className="form-select form-select-sm"
          value={data.language}
          onChange={(e) => onChange({ language: e.target.value })}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="form-label small fw-bold mb-1">Code</label>
        <textarea
          className="form-control form-control-sm"
          rows={10}
          value={data.code}
          onChange={(e) => onChange({ code: e.target.value })}
          style={{ fontFamily: 'monospace', whiteSpace: 'pre' }}
          placeholder="Paste or type code here..."
        />
      </div>
    </div>
  );
}
