import { useState } from 'react';
import SEO from '../components/SEO';
import FilterBar from '../components/FilterBar';
import ProjectCard from '../components/ProjectCard';
import { projects } from '../content';
import type { Project } from '../content';

const devTypeFilters = [
  { label: 'All', value: 'all' },
  { label: 'External Links', value: 'extLink' },
  { label: 'Personal Projects', value: 'personal' },
  { label: 'Industry Projects', value: 'industry' },
  { label: 'Game Jam', value: 'jam' },
];

const projectTypeFilters = [
  { label: 'Programs', value: 'programs' },
  { label: 'Games', value: 'games' },
  { label: '3D Projects', value: '3dprojects' },
];

const skillsetFilters = [
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
  { label: 'JavaScript', value: 'js' },
  { label: 'Python', value: 'python' },
  { label: 'Selenium', value: 'selenium' },
  { label: 'React', value: 'react' },
  { label: 'TypeScript', value: 'ts' },
  { label: 'Unity', value: 'unity' },
  { label: 'C#', value: 'csharp' },
  { label: 'Unreal Engine', value: 'ue' },
  { label: 'Blender', value: 'blender' },
  { label: 'Substance', value: 'substance' },
];

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

function matchesFilter(project: Project, filter: string): boolean {
  if (filter === 'all') return true;
  if (project.devTypes.includes(filter as Project['devTypes'][number]))
    return true;
  if (project.category === filter) return true;
  if (project.skills.includes(filter)) return true;
  return false;
}

export default function Search() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = projects.filter((p) => {
    if (!p.visible) return false;
    if (!matchesFilter(p, activeFilter)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <>
      <SEO title="Projects" />

      <div className="container px-4 py-5">
        <div className="mb-4">
          <div className="input-group">
            <span className="input-group-text"><i className="bi bi-search" /></span>
            <input
              type="text"
              className="form-control"
              placeholder="Search projects by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="btn btn-outline-secondary" onClick={() => setSearchQuery('')}>
                <i className="bi bi-x-lg" />
              </button>
            )}
          </div>
        </div>

        <FilterBar
          title="Development Type"
          filters={devTypeFilters}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
        <FilterBar
          title="Project Type"
          filters={projectTypeFilters}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
        <FilterBar
          title="Skillset"
          filters={skillsetFilters}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        <div className="row row-cols-1 row-cols-lg-3 g-4 py-3">
          {filtered.map((p) => (
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

        {filtered.length === 0 && (
          <div className="text-center py-5">
            <i className="bi bi-search display-4 text-body-secondary" />
            <p className="mt-3 text-body-secondary">No projects match the current filter.</p>
            <button className="btn btn-outline-secondary" onClick={() => setActiveFilter('all')}>
              Clear Filter
            </button>
          </div>
        )}
      </div>
    </>
  );
}
