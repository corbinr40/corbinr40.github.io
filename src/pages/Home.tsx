import SEO from '../components/SEO';
import HeroSection from '../components/HeroSection';
import SkillCard from '../components/SkillCard';
import ProjectSection from '../components/ProjectSection';
import { projects, skillsets } from '../content';
import type { Project } from '../content';
import SkillTagCloud from '../components/SkillTagCloud';

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
  "I'm a freelance software engineer available for UK-based and remote contracts. I build full-stack web applications, cloud-connected systems, and custom automation tools, working independently across the full development lifecycle, from backend architecture to polished frontend delivery.",
  "My primary stack is Python and React/TypeScript, with hands-on production experience on AWS and Azure. First Class MEng Computer Science graduate, Leeds Beckett University, 2023.",
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
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.4)',
              color: '#22c55e',
              borderRadius: '999px',
              padding: '4px 14px',
              fontSize: '0.8rem',
              fontWeight: 500,
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                display: 'inline-block',
              }}
            />
            Available for contracts
          </span>
        </div>

        <HeroSection
          avatarSrc="/assets/icon256.png"
          title="Hey, I'm Corbin"
          subtitle="Freelance Software Engineer · Python · React/TypeScript · AWS"
          paragraphs={heroParagraphs}
        />

        {/* CTA Buttons */}
        <div className="mt-4 d-flex gap-3 flex-wrap">
          <a href="/contact" className="btn btn-primary">
            Get in touch →
          </a>
          <a href="#programs" className="btn btn-outline-secondary">
            View my work ↓
          </a>
        </div>
      </div>

      <hr className="section-divider" />

      {/* Skill Set */}
      <div className="container px-4 py-5">
        <h2 className="pb-2 border-bottom">Skill Set</h2>
        <SkillTagCloud />
        <div className="row row-cols-1 row-cols-md-2 g-4 py-3">
          {skillsets.map((s) => (
            <div className="col" key={s.title}>
              <SkillCard title={s.title} skills={s.skills} />
            </div>
          ))}
        </div>
      </div>

      <hr className="section-divider" />

      {/* Programs — sticky sidebar on the left */}
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

      <hr className="section-divider" />

      {/* Games — sticky sidebar on the right */}
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
  );
}
