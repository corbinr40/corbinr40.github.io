import { useState } from 'react';
import type { GitHubSettings } from '../../hooks/useGitHubApi';

interface GitHubSettingsModalProps {
  show: boolean;
  onClose: () => void;
  settings: GitHubSettings;
  onUpdateSettings: (updates: Partial<GitHubSettings>) => void;
}

export default function GitHubSettingsModal({
  show,
  onClose,
  settings,
  onUpdateSettings,
}: GitHubSettingsModalProps) {
  const [showToken, setShowToken] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  if (!show) return null;

  async function handleTestConnection() {
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch(
        `https://api.github.com/repos/${settings.owner}/${settings.repo}`,
        {
          headers: {
            Authorization: `Bearer ${settings.token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        },
      );

      if (res.status === 200) {
        const data = await res.json();
        setTestResult({
          ok: true,
          message: `Connected to ${data.full_name}`,
        });
      } else if (res.status === 401) {
        setTestResult({ ok: false, message: 'Invalid token.' });
      } else if (res.status === 404) {
        setTestResult({
          ok: false,
          message: 'Repository not found. Check owner/repo.',
        });
      } else {
        setTestResult({
          ok: false,
          message: `Unexpected response: ${res.status}`,
        });
      }
    } catch (err) {
      setTestResult({
        ok: false,
        message: `Network error: ${err instanceof Error ? err.message : String(err)}`,
      });
    } finally {
      setTesting(false);
    }
  }

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
      onClick={onClose}
    >
      <div
        className="bg-body rounded shadow p-4"
        style={{ width: '100%', maxWidth: 480 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">GitHub Settings</h5>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={onClose}
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold" htmlFor="gh-token">
            Personal Access Token
          </label>
          <div className="input-group input-group-sm">
            <input
              id="gh-token"
              type={showToken ? 'text' : 'password'}
              className="form-control"
              value={settings.token}
              onChange={(e) => onUpdateSettings({ token: e.target.value })}
              placeholder="ghp_..."
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowToken(!showToken)}
              title={showToken ? 'Hide token' : 'Show token'}
            >
              <i className={`bi ${showToken ? 'bi-eye-slash' : 'bi-eye'}`} />
            </button>
          </div>
          <div className="form-text">
            Needs <code>contents: write</code> permission on the repo.
          </div>
        </div>

        <div className="row g-2 mb-3">
          <div className="col-5">
            <label className="form-label fw-semibold" htmlFor="gh-owner">
              Owner
            </label>
            <input
              id="gh-owner"
              type="text"
              className="form-control form-control-sm"
              value={settings.owner}
              onChange={(e) => onUpdateSettings({ owner: e.target.value })}
            />
          </div>
          <div className="col-5">
            <label className="form-label fw-semibold" htmlFor="gh-repo">
              Repository
            </label>
            <input
              id="gh-repo"
              type="text"
              className="form-control form-control-sm"
              value={settings.repo}
              onChange={(e) => onUpdateSettings({ repo: e.target.value })}
            />
          </div>
          <div className="col-2">
            <label className="form-label fw-semibold" htmlFor="gh-branch">
              Branch
            </label>
            <input
              id="gh-branch"
              type="text"
              className="form-control form-control-sm"
              value={settings.branch}
              onChange={(e) => onUpdateSettings({ branch: e.target.value })}
            />
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={handleTestConnection}
            disabled={testing || !settings.token}
          >
            {testing ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-1"
                  role="status"
                />
                Testing...
              </>
            ) : (
              <>
                <i className="bi bi-plug me-1" />
                Test Connection
              </>
            )}
          </button>

          {testResult && (
            <span
              className={`small ${testResult.ok ? 'text-success' : 'text-danger'}`}
            >
              <i
                className={`bi ${testResult.ok ? 'bi-check-circle' : 'bi-x-circle'} me-1`}
              />
              {testResult.message}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
