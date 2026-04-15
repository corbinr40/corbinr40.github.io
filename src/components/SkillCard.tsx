// interface SkillCardProps {
//   title: string;
//   skills: string[];
// }

// export default function SkillCard({ title, skills }: SkillCardProps) {
//   const groups: string[][] = [];
//   for (let i = 0; i < skills.length; i += 3) {
//     groups.push(skills.slice(i, i + 3));
//   }

//   return (
//     <div className="card h-100 shadow-sm">
//       <div className="card-body">
//         <h5 className="card-title">{title}</h5>
//         <p className="card-text">
//           {groups.map((group, idx) => (
//             <span key={idx}>
//               {idx > 0 && <br />}
//               {group.join(", ")}
//             </span>
//           ))}
//         </p>
//       </div>
//     </div>
//   );
// }

interface SkillCardProps {
  title: string;
  skills: string[];
}

const ACCENTS: Record<string, string> = {
  'Languages':         '#c0392b',
  'Frameworks':        '#9b59b6',
  'Programs':          '#d35400',
  'Game Engines':      '#d35400',
  'Services':          '#2980b9',
  'Database':          '#1a7a6e',
  'Operating Systems': '#4a4e54',
  "IDE's":             '#6c757d',
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
          {skills.map((skill) => (
            <span
              key={skill}
              style={{
                fontSize: 12,
                padding: '3px 10px',
                borderRadius: 'var(--bs-border-radius)',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
