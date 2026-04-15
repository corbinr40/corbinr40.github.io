import { useState, useRef, useEffect } from 'react';

interface EditorHeaderProps {
  contentType: 'project' | 'blog';
  onContentTypeChange: (type: 'project' | 'blog') => void;
  onDownloadMdx: () => void;
  onShowDrafts: () => void;
  onImportMdx: () => void;
  onExportZip: () => void;
  onPublish: () => void;
  onShowSettings: () => void;
  onLoadFromRepo: () => void;
  hasGitHubToken: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onNew: () => void;
}

export default function EditorHeader({
  contentType,
  onContentTypeChange,
  onDownloadMdx,
  onShowDrafts,
  onImportMdx,
  onExportZip,
  onPublish,
  onShowSettings,
  onLoadFromRepo,
  hasGitHubToken,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onNew,
}: EditorHeaderProps) {
  const [exportOpen, setExportOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!exportOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setExportOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [exportOpen]);

  return (
    <div className="d-flex align-items-center justify-content-between mb-3">
      <h4 className="mb-0">Content Editor</h4>

      <div className="d-flex align-items-center gap-2">
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={onNew}
          title="New document"
        >
          <i className="bi bi-file-earmark-plus me-1" />
          New
        </button>

        <div className="btn-group btn-group-sm" role="group" aria-label="Undo/Redo">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            <i className="bi bi-arrow-counterclockwise" />
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z)"
          >
            <i className="bi bi-arrow-clockwise" />
          </button>
        </div>

        <div className="btn-group btn-group-sm" role="group" aria-label="Content type">
          <button
            type="button"
            className={`btn ${contentType === 'project' ? '' : 'btn-outline-secondary'}`}
            style={contentType === 'project' ? { backgroundColor: 'var(--color-text-primary)', color: 'var(--color-bg-primary)', borderColor: 'var(--color-btn-border)' } : undefined}
            onClick={() => onContentTypeChange('project')}
          >
            Project
          </button>
          <button
            type="button"
            className={`btn ${contentType === 'blog' ? '' : 'btn-outline-secondary'}`}
            style={contentType === 'blog' ? { backgroundColor: 'var(--color-text-primary)', color: 'var(--color-bg-primary)', borderColor: 'var(--color-btn-border)' } : undefined}
            onClick={() => onContentTypeChange('blog')}
          >
            Blog
          </button>
        </div>

        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={onShowDrafts}
        >
          <i className="bi bi-journal-text me-1" />
          Drafts
        </button>

        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={onImportMdx}
          title="Import an existing .mdx file"
        >
          <i className="bi bi-file-earmark-arrow-up me-1" />
          Import
        </button>

        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={onLoadFromRepo}
          disabled={!hasGitHubToken}
          title={hasGitHubToken ? 'Load from GitHub repo' : 'Configure GitHub token in settings first'}
        >
          <i className="bi bi-cloud-download me-1" />
          Load from Repo
        </button>

        {/* Export dropdown */}
        <div className="dropdown" ref={dropdownRef}>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm dropdown-toggle"
            onClick={() => setExportOpen(!exportOpen)}
            aria-expanded={exportOpen}
          >
            <i className="bi bi-download me-1" />
            Export
          </button>
          <ul
            className={`dropdown-menu dropdown-menu-end${exportOpen ? ' show' : ''}`}
          >
            <li>
              <button
                className="dropdown-item"
                type="button"
                onClick={() => {
                  setExportOpen(false);
                  onDownloadMdx();
                }}
              >
                <i className="bi bi-file-earmark-code me-2" />
                Download MDX
              </button>
            </li>
            <li>
              <button
                className="dropdown-item"
                type="button"
                onClick={() => {
                  setExportOpen(false);
                  onExportZip();
                }}
              >
                <i className="bi bi-file-earmark-zip me-2" />
                Download ZIP
              </button>
            </li>
          </ul>
        </div>

        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={onPublish}
          disabled={!hasGitHubToken}
          title={hasGitHubToken ? 'Publish to GitHub' : 'Configure GitHub token in settings first'}
        >
          <i className="bi bi-cloud-upload me-1" />
          Publish
        </button>

        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={onShowSettings}
          title="GitHub Settings"
        >
          <i className="bi bi-gear" />
        </button>
      </div>
    </div>
  );
}
