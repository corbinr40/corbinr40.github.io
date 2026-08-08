import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import HeroSection from '../components/HeroSection';
import SkillCard from '../components/SkillCard';
import ProjectSection from '../components/ProjectSection';
import { projects, skillsets } from '../content';
import type { Project } from '../content';

function buildBadges(project: Project) {
  if (project.externalLink) {
    return [{ icon: 'bi-box-arrow-up-right', label: 'External Link' }];
  }
  return [
    { icon: 'bi-geo-fill', label: project.devTypes.join(', ') },
    {
      icon: 'bi-code-square',
      label: project.languages || project.skills.join('/'),
    },
  ];
}

const heroParagraphs = [
  "I'm a software engineer based in Warwick, building full-stack web applications, cloud-connected systems, and custom automation tools. Alongside my full-time role, I take on a small number of freelance projects each year where I can own meaningful pieces of work end to end.",
  "My core stack is Python and React/TypeScript, with production experience on AWS and Azure, PostgreSQL, and MySQL. First Class MEng Computer Science graduate, Leeds Beckett University, 2023.",
];

const programsHeader = projects.find(
  (p) => p.category === 'programs' && p.externalLink && p.visible,
);
const visiblePrograms = projects.filter(
  (p) => p.category === 'programs' && p.visible && !p.externalLink,
);

const gamesHeader = projects.find(
  (p) => p.category === 'games' && p.externalLink && p.visible,
);
const visibleGames = projects.filter(
  (p) => p.category === 'games' && p.visible && !p.externalLink,
);

export default function Home() {
  return (
    <>
      <SEO title="Welcome" />

      {/* Hero */}
      <div className="container px-4 py-5">
        {/* Availability badge */}
        <div className="mb-3">
          <Link
            to="/contact"
            className="availability-badge"
            aria-label="Contact me about freelance work"
          >
            {/* <span
              className="pulse-dot"
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                display: 'inline-block',
              }}
            /> */}
            Available for freelance projects
          </Link>
        </div>

        <HeroSection
          title="Hey, I'm Corbin!"
          subtitle="Software Engineer · Python · React/TypeScript · AWS · Open to Freelance"
          paragraphs={heroParagraphs}
        />

        {/* CTA Buttons */}
        <div className="mt-4 d-flex gap-3 flex-wrap justify-content-end">
          <a href="#programs" className="btn btn-outline-secondary">
            View my work ↓
          </a>
          <a href="/contact" className="btn btn-outline-secondary">
            Get in touch →
          </a>
        </div>
      </div>

      <hr className="section-divider" />

      {/* Skill Set */}
      <div className="container px-4 py-5">
        <h2 className="pb-2 border-bottom">Skill Set</h2>
        <div className="row row-cols-1 row-cols-md-2 g-4 py-3">
          {skillsets.map((s) => (
            <div className="col" key={s.title}>
              <SkillCard title={s.title} skills={s.skills} />
            </div>
          ))}
        </div>
        <div className="skill-legend mt-3">
          <span className="skill-legend__item">
            <span style={{ color: '#c0392b', fontSize: 11 }}>★</span> Expert
          </span>
          <span className="skill-legend__item">
            <span style={{ color: '#9b59b6', fontSize: 11 }}>★</span> Proficient
          </span>
          <span className="skill-legend__item">
            <span style={{ color: '#4a4e54', fontSize: 11 }}>★</span> Familiar
          </span>
        </div>
      </div>

      <hr className="section-divider" />

      {/* Programs - sticky sidebar on the left */}
      <ProjectSection
        id="programs"
        title="Programs"
        description={programsHeader?.description ?? ''}
        mainLink={
          programsHeader?.href
            ? { label: programsHeader.title, href: programsHeader.href, text: `Visit ${programsHeader.title}` }
            : undefined
        }
        projects={visiblePrograms}
        stickySide="left"
        buildBadges={buildBadges}
      />

      {visibleGames.length > 0 && (
        <>
          <hr className="section-divider" />

          {/* Games - sticky sidebar on the right */}
          <ProjectSection
            id="games"
            title="Games"
            description={gamesHeader?.description ?? ''}
            mainLink={
              gamesHeader?.href
                ? { label: gamesHeader.title, href: gamesHeader.href, text: `Visit ${gamesHeader.title}` }
                : undefined
            }
            projects={visibleGames}
            stickySide="right"
            buildBadges={buildBadges}
          />
        </>
      )}
    </>
  );
}
