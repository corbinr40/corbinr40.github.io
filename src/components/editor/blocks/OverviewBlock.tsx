import type { OverviewBlockData } from '../../../types/editor';

interface OverviewBlockProps {
  data: OverviewBlockData;
  onChange: (updates: Partial<OverviewBlockData>) => void;
}

export default function OverviewBlock({ data, onChange }: OverviewBlockProps) {
  return (
    <div>
      <div className="form-check">
        <input
          type="checkbox"
          className="form-check-input"
          id="overview-enabled"
          checked={data.enabled}
          onChange={(e) => onChange({ enabled: e.target.checked })}
        />
        <label className="form-check-label small fw-bold" htmlFor="overview-enabled">
          Show Overview Table
        </label>
      </div>
      <p className="text-body-secondary small mb-0 mt-1">
        The overview table values (status, type, duration, etc.) come from the frontmatter metadata above.
      </p>
    </div>
  );
}
