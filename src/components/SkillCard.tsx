import type { SkillEntry, SkillLevel } from '../content';

interface SkillCardProps {
  title: string;
  skills: SkillEntry[];
}

const ACCENTS: Record<string, string> = {
  'Languages':         '#c0392b',
  'Frameworks':        '#9b59b6',
  'Cloud & Services':  '#2980b9',
  'Databases':         '#1a7a6e',
  'Programs':          '#d35400',
  'Operating Systems': '#4a4e54',
  'IDEs & Tooling':    '#6c757d',
};

const LEVEL_COLOR: Record<SkillLevel, string> = {
  expert:     '#c0392b',
  proficient: '#9b59b6',
  familiar:   '#4a4e54',
};

export default function SkillCard({ title, skills }: SkillCardProps) {
  const accent = ACCENTS[title] ?? '#6c757d';

  return (
    <div
      className="card h-100 shadow-sm"
      style={{ borderTop: `3px solid ${accent}` }}
    >
      <div className="card-body p-3">
        <div className="d-flex align-items-center gap-2 mb-3">
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: accent,
              flexShrink: 0,
              display: 'inline-block',
            }}
          />
          <h5
            className="card-title mb-0"
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color: 'var(--color-text-secondary)',
            }}
          >
            {title}
          </h5>
        </div>
        <div className="d-flex flex-wrap gap-1">
          {skills.map(({ name, level }) => (
            <span
              key={name}
              className="d-inline-flex align-items-center gap-1"
              style={{
                fontSize: 12,
                padding: '3px 10px',
                borderRadius: 'var(--bs-border-radius)',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              {name}
              {level && (
                <span
                  style={{
                    color: LEVEL_COLOR[level],
                    fontSize: 10,
                    lineHeight: 1,
                  }}
                >
                  ★
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
