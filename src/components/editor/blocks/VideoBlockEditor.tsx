import type { VideoEmbedBlockData } from '../../../types/editor';

interface VideoBlockEditorProps {
  data: VideoEmbedBlockData;
  onChange: (updates: Partial<VideoEmbedBlockData>) => void;
}

export default function VideoBlockEditor({ data, onChange }: VideoBlockEditorProps) {
  return (
    <div className="d-flex flex-column gap-2">
      <div>
        <label className="form-label small fw-bold mb-1">Video URL</label>
        <input
          type="text"
          className="form-control form-control-sm"
          value={data.url}
          onChange={(e) => onChange({ url: e.target.value })}
          placeholder="https://www.youtube.com/watch?v=..."
        />
      </div>
    </div>
  );
}
