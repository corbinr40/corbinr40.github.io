import type { Frontmatter, ProjectFrontmatter, BlogFrontmatter } from '../../types/editor';
import { slugify } from '../../types/editor';
import ImageUpload from './ImageUpload';

interface FrontmatterFormProps {
  frontmatter: Frontmatter;
  onChange: (updates: Partial<Frontmatter>) => void;
  onImageUpload: (path: string, file: File) => void;
  slug: string;
}

const CATEGORIES = [
  { value: 'programs', label: 'Programs' },
  { value: 'games', label: 'Games' },
  { value: '3dprojects', label: '3D Projects' },
  { value: 'demos', label: 'Demos' },
];

const STATUSES = [
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'coming-soon', label: 'Coming Soon' },
];

const DEV_TYPES = ['personal', 'university', 'industry', 'jam'] as const;

export default function FrontmatterForm({ frontmatter, onChange, onImageUpload, slug }: FrontmatterFormProps) {
  const isProject = frontmatter.contentType === 'project';
  const isBlog = frontmatter.contentType === 'blog';
  const proj = frontmatter as ProjectFrontmatter;
  const blog = frontmatter as BlogFrontmatter;

  function handleTitleChange(title: string) {
    onChange({ title, slug: slugify(title) } as Partial<Frontmatter>);
  }

  function handleSkillsChange(value: string) {
    const skills = value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    onChange({ skills } as Partial<Frontmatter>);
  }

  function handleDevTypeToggle(devType: string) {
    const current = proj.devTypes ?? [];
    const next = current.includes(devType)
      ? current.filter((d) => d !== devType)
      : [...current, devType];
    onChange({ devTypes: next } as Partial<Frontmatter>);
  }

  return (
    <div className="mb-3">
      <h6 className="fw-bold border-bottom pb-2 mb-3">Frontmatter</h6>

      {/* Title */}
      <div className="mb-2">
        <label className="form-label small fw-bold mb-1">Title</label>
        <input
          type="text"
          className="form-control form-control-sm"
          value={frontmatter.title}
          onChange={(e) => handleTitleChange(e.target.value)}
        />
      </div>

      {/* Slug (read-only, auto-generated) */}
      <div className="mb-2">
        <label className="form-label small fw-bold mb-1">Slug</label>
        <input
          type="text"
          className="form-control form-control-sm"
          value={frontmatter.slug}
          readOnly
          tabIndex={-1}
        />
      </div>

      {/* Description */}
      <div className="mb-2">
        <label className="form-label small fw-bold mb-1">Description</label>
        <textarea
          className="form-control form-control-sm"
          rows={3}
          value={frontmatter.description}
          onChange={(e) => onChange({ description: e.target.value } as Partial<Frontmatter>)}
        />
      </div>

      {/* Skills / Tags */}
      <div className="mb-2">
        <label className="form-label small fw-bold mb-1">
          {isProject ? 'Skills' : 'Tags'} <span className="fw-normal text-body-secondary">(comma-separated)</span>
        </label>
        <input
          type="text"
          className="form-control form-control-sm"
          value={frontmatter.skills.join(', ')}
          onChange={(e) => handleSkillsChange(e.target.value)}
        />
      </div>

      {/* Card Image */}
      <div className="mb-2">
        <ImageUpload
          value={frontmatter.cardImage}
          onChange={(path) => onChange({ cardImage: path } as Partial<Frontmatter>)}
          onFileUpload={onImageUpload}
          slug={slug}
          label="Card Image"
          placeholder="/assets/images/card.png"
        />
      </div>

      {/* Visible */}
      <div className="form-check mb-3">
        <input
          className="form-check-input"
          type="checkbox"
          id="fm-visible"
          checked={frontmatter.visible}
          onChange={(e) => onChange({ visible: e.target.checked } as Partial<Frontmatter>)}
        />
        <label className="form-check-label small" htmlFor="fm-visible">
          Visible
        </label>
      </div>

      {/* === Blog-only fields === */}
      {isBlog && (
        <>
          <h6 className="fw-bold border-bottom pb-2 mb-3">Blog Fields</h6>

          {/* Date */}
          <div className="mb-2">
            <label className="form-label small fw-bold mb-1">Date</label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={blog.date}
              onChange={(e) => onChange({ date: e.target.value } as Partial<Frontmatter>)}
            />
          </div>

          {/* Tags */}
          <div className="mb-2">
            <label className="form-label small fw-bold mb-1">
              Tags <span className="fw-normal text-body-secondary">(comma-separated)</span>
            </label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={blog.tags.join(', ')}
              onChange={(e) => {
                const tags = e.target.value
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean);
                onChange({ tags } as Partial<Frontmatter>);
              }}
            />
          </div>
        </>
      )}

      {/* === Project-only fields === */}
      {isProject && (
        <>
          <h6 className="fw-bold border-bottom pb-2 mb-3">Project Fields</h6>

          {/* Category */}
          <div className="mb-2">
            <label className="form-label small fw-bold mb-1">Category</label>
            <select
              className="form-select form-select-sm"
              value={proj.category}
              onChange={(e) => onChange({ category: e.target.value } as Partial<Frontmatter>)}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="mb-2">
            <label className="form-label small fw-bold mb-1">Status</label>
            <select
              className="form-select form-select-sm"
              value={proj.status}
              onChange={(e) => onChange({ status: e.target.value } as Partial<Frontmatter>)}
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dev Types */}
          <div className="mb-2">
            <label className="form-label small fw-bold mb-1 d-block">Dev Types</label>
            {DEV_TYPES.map((dt) => (
              <div className="form-check form-check-inline" key={dt}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`devtype-${dt}`}
                  checked={proj.devTypes.includes(dt)}
                  onChange={() => handleDevTypeToggle(dt)}
                />
                <label className="form-check-label small" htmlFor={`devtype-${dt}`}>
                  {dt.charAt(0).toUpperCase() + dt.slice(1)}
                </label>
              </div>
            ))}
          </div>

          {/* Type */}
          <div className="mb-2">
            <label className="form-label small fw-bold mb-1">Type</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={proj.type}
              onChange={(e) => onChange({ type: e.target.value } as Partial<Frontmatter>)}
            />
          </div>

          {/* Duration */}
          <div className="mb-2">
            <label className="form-label small fw-bold mb-1">Duration</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={proj.duration}
              onChange={(e) => onChange({ duration: e.target.value } as Partial<Frontmatter>)}
            />
          </div>

          {/* Software */}
          <div className="mb-2">
            <label className="form-label small fw-bold mb-1">Software</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={proj.software}
              onChange={(e) => onChange({ software: e.target.value } as Partial<Frontmatter>)}
            />
          </div>

          {/* Languages */}
          <div className="mb-2">
            <label className="form-label small fw-bold mb-1">Languages</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={proj.languages}
              onChange={(e) => onChange({ languages: e.target.value } as Partial<Frontmatter>)}
            />
          </div>

          {/* Available On */}
          <div className="mb-2">
            <label className="form-label small fw-bold mb-1">Available On - Label</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={proj.availableOnText}
              onChange={(e) =>
                onChange({ availableOnText: e.target.value } as Partial<Frontmatter>)
              }
            />
          </div>
          <div className="mb-2">
            <label className="form-label small fw-bold mb-1">Available On - URL</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={proj.availableOnHref}
              onChange={(e) =>
                onChange({ availableOnHref: e.target.value } as Partial<Frontmatter>)
              }
            />
          </div>
        </>
      )}
    </div>
  );
}
