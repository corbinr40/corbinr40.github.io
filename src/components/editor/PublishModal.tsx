import type { PublishResult } from '../../hooks/useGitHubApi';

interface PublishModalProps {
  show: boolean;
  onClose: () => void;
  onPublish: () => Promise<void>;
  publishing: boolean;
  result: PublishResult | null;
}

export default function PublishModal({
  show,
  onClose,
  onPublish,
  publishing,
  result,
}: PublishModalProps) {
  if (!show) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
      onClick={onClose}
    >
      <div
        className="bg-body rounded shadow p-4 text-center"
        style={{ width: '100%', maxWidth: 400 }}
        onClick={(e) => e.stopPropagation()}
      >
        {publishing && (
          <>
            <div
              className="spinner-border text-primary mb-3"
              role="status"
              style={{ width: '3rem', height: '3rem' }}
            />
            <p className="mb-0 fw-semibold">Publishing to GitHub...</p>
          </>
        )}

        {!publishing && result?.success && (
          <>
            <i
              className="bi bi-check-circle-fill text-success d-block mb-2"
              style={{ fontSize: '3rem' }}
            />
            <p className="fw-semibold mb-2">Published!</p>
            {result.commitUrl && (
              <a
                href={result.commitUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline-primary mb-3"
              >
                <i className="bi bi-box-arrow-up-right me-1" />
                View Commit
              </a>
            )}
            <div>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </>
        )}

        {!publishing && result && !result.success && (
          <>
            <i
              className="bi bi-x-circle-fill text-danger d-block mb-2"
              style={{ fontSize: '3rem' }}
            />
            <p className="fw-semibold mb-1">Publish Failed</p>
            <p className="text-danger small mb-3">{result.error}</p>
            <div className="d-flex justify-content-center gap-2">
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={onPublish}
              >
                Try Again
              </button>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
