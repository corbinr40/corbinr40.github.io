import { useRef, useState } from 'react';
import type { EditorState } from '../../types/editor';
import useDrafts, { exportDraftToJson, importDraftFromJson } from '../../hooks/useDrafts';
import type { Draft } from '../../hooks/useDrafts';

interface DraftManagerProps {
  show: boolean;
  onClose: () => void;
  onLoadDraft: (state: EditorState) => void;
  currentState: EditorState;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function DraftManager({
  show,
  onClose,
  onLoadDraft,
  currentState,
}: DraftManagerProps) {
  const { drafts, loading, saveDraft, loadDraft, deleteDraft, refreshDrafts } =
    useDrafts();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!show) return null;

  async function handleSaveCurrent() {
    setBusy(true);
    try {
      await saveDraft(currentState);
    } finally {
      setBusy(false);
    }
  }

  async function handleLoad(id: string) {
    setBusy(true);
    try {
      const state = await loadDraft(id);
      if (state) {
        onLoadDraft(state);
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    setBusy(true);
    try {
      await deleteDraft(id);
      setConfirmDeleteId(null);
    } finally {
      setBusy(false);
    }
  }

  function handleExportJson(draft: Draft) {
    const json = exportDraftToJson(draft);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${draft.title || 'draft'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const text = await file.text();
      const draft = importDraftFromJson(text);
      await saveDraft(draft.state, draft.id);
      await refreshDrafts();
    } catch (err) {
      console.error('Failed to import draft:', err);
      alert('Failed to import draft. Check the JSON file format.');
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        onClick={onClose}
        style={{ zIndex: 1050 }}
      />

      {/* Modal */}
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        style={{ zIndex: 1055 }}
      >
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-journal-text me-2" />
                Drafts
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onClose}
              />
            </div>

            <div className="modal-body">
              {/* Action bar */}
              <div className="d-flex gap-2 mb-3">
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ backgroundColor: 'var(--color-text-primary)', color: 'var(--color-bg-primary)', borderColor: 'var(--color-btn-border)' }}
                  onClick={handleSaveCurrent}
                  disabled={busy}
                >
                  <i className="bi bi-floppy me-1" />
                  Save Current
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={handleImportClick}
                  disabled={busy}
                >
                  <i className="bi bi-upload me-1" />
                  Import Draft
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="d-none"
                  onChange={handleFileChange}
                />
              </div>

              {/* Draft list */}
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border spinner-border-sm me-2" role="status" />
                  Loading drafts...
                </div>
              ) : drafts.length === 0 ? (
                <p className="text-body-secondary text-center py-4 mb-0">
                  No drafts saved yet. Use "Save Current" to save your work.
                </p>
              ) : (
                <div className="list-group">
                  {drafts.map((draft) => (
                    <div
                      key={draft.id}
                      className="list-group-item d-flex align-items-center justify-content-between"
                    >
                      <div className="me-3" style={{ minWidth: 0 }}>
                        <div className="fw-semibold text-truncate">
                          {draft.title || 'Untitled'}
                        </div>
                        <div className="small text-body-secondary">
                          <span
                            className={`badge me-1 ${
                              draft.contentType === 'project'
                                ? 'bg-primary'
                                : 'bg-success'
                            }`}
                          >
                            {draft.contentType}
                          </span>
                          {formatDate(draft.updatedAt)}
                        </div>
                      </div>
                      <div className="d-flex gap-1 flex-shrink-0">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          title="Load draft"
                          onClick={() => handleLoad(draft.id)}
                          disabled={busy}
                        >
                          <i className="bi bi-folder2-open" />
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          title="Export JSON"
                          onClick={() => handleExportJson(draft)}
                          disabled={busy}
                        >
                          <i className="bi bi-filetype-json" />
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${
                            confirmDeleteId === draft.id
                              ? 'btn-danger'
                              : 'btn-outline-danger'
                          }`}
                          title={
                            confirmDeleteId === draft.id
                              ? 'Click again to confirm'
                              : 'Delete draft'
                          }
                          onClick={() => handleDelete(draft.id)}
                          disabled={busy}
                        >
                          <i className="bi bi-trash" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
