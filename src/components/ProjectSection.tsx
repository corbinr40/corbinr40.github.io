import ProjectCard from './ProjectCard';
import type { Project } from '../content';

interface ProjectSectionProps {
  id: string;
  title: string;
  description: string;
  mainLink?: { label: string; href: string; text: string };
  projects: Project[];
  stickySide: 'left' | 'right';
  buildBadges: (project: Project) => { icon: string; label: string }[];
}

export default function ProjectSection({
  id,
  title,
  description,
  mainLink,
  projects,
  stickySide,
  buildBadges,
}: ProjectSectionProps) {
  const sidebar = (
    <div className="project-section__sidebar">
      <h2 className="pb-2 border-bottom">{title}</h2>
      <p className="mt-3" style={{ color: 'var(--color-text-secondary)' }}>
        {description}
      </p>
      {mainLink && (
        <a
          href={mainLink.href}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline-secondary mt-2"
        >
          <i className="bi bi-box-arrow-up-right me-2" />
          {mainLink.text}
        </a>
      )}
    </div>
  );

  const cards = (
    <div className="project-section__cards">
      <div className="row row-cols-1 row-cols-md-2 g-4">
        {projects.map((p) => (
          <div className="col" key={p.id}>
            <ProjectCard
              title={p.title}
              description={p.description}
              image={p.image}
              href={p.href}
              externalLink={p.externalLink}
              badges={buildBadges(p)}
              status={p.status}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="container px-4 py-5" id={id}>
      <div className={`project-section project-section--${stickySide}`}>
        {sidebar}
        {cards}
      </div>
    </div>
  );
}
