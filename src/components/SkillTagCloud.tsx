type Level = 'expert' | 'proficient' | 'familiar';

interface Skill {
  name: string;
  level: Level;
}

const skills: Skill[] = [
  { name: 'Python',        level: 'expert' },
  { name: 'JavaScript',    level: 'expert' },
  { name: 'HTML / CSS',    level: 'expert' },
  { name: 'C#',            level: 'expert' },
  { name: 'Java',          level: 'proficient' },
  { name: 'C++',           level: 'proficient' },
  { name: 'React Native',  level: 'proficient' },
  { name: 'Flutter',       level: 'proficient' },
  { name: 'Unity',         level: 'proficient' },
  { name: 'Unreal Engine', level: 'proficient' },
  { name: 'Blender',       level: 'proficient' },
  { name: 'AWS',           level: 'familiar' },
  { name: 'Azure',         level: 'familiar' },
  { name: 'MySQL',         level: 'familiar' },
  { name: 'OpenCV',        level: 'familiar' },
  { name: 'Android Studio',level: 'familiar' },
];

const DOT: Record<Level, string> = {
  expert:     '#c0392b',
  proficient: '#9b59b6',
  familiar:   '#4a4e54',
};

const LABELS: Record<Level, string> = {
  expert:     'Expert',
  proficient: 'Proficient',
  familiar:   'Familiar',
};

export default function SkillTagCloud() {
  return (
    <div className="mb-4">
      <div className="d-flex flex-wrap gap-2 mb-3">
        {skills.map(({ name, level }) => (
          <span
            key={name}
            className="d-inline-flex align-items-center gap-2"
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--bs-border-radius)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg-secondary)',
              fontSize: 13,
              color: 'var(--color-text-primary)',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: DOT[level],
                flexShrink: 0,
                display: 'inline-block',
              }}
            />
            {name}
          </span>
        ))}
      </div>
      <div
        className="d-flex gap-4 pt-2"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        {(Object.keys(DOT) as Level[]).map((level) => (
          <span
            key={level}
            className="d-flex align-items-center gap-2"
            style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: DOT[level],
                display: 'inline-block',
              }}
            />
            {LABELS[level]}
          </span>
        ))}
      </div>
    </div>
  );
}
