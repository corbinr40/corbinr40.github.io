import { useState, useEffect, useCallback } from 'react';
import type { GitHubSettings } from '../../hooks/useGitHubApi';

interface RepoFile {
  name: string;
  path: string;
  download_url: string;
}

interface LoadFromRepoModalProps {
  show: boolean;
  onClose: () => void;
  onLoad: (mdxContent: string, filename: string) => void;
  settings: GitHubSettings;
}

export default function LoadFromRepoModal({
  show,
  onClose,
  onLoad,
  settings,
}: LoadFromRepoModalProps) {
  const [projectFiles, setProjectFiles] = useState<RepoFile[]>([]);
  const [blogFiles, setBlogFiles] = useState<RepoFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingFile, setLoadingFile] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    if (!settings.token) return;

    setLoading(true);
    setError(null);

    const headers: Record<string, string> = {
      Authorization: `Bearer ${settings.token}`,
      Accept: 'application/vnd.github.v3+json',
    };

    const { owner, repo, branch } = settings;

    try {
      const [projectRes, blogRes] = await Promise.allSettled([
        fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/src/content/projects?ref=${branch}`,
          { headers },
        ),
        fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/src/content/blog?ref=${branch}`,
          { headers },
        ),
      ]);

      const parseResponse = async (
        result: PromiseSettledResult<Response>,
      ): Promise<RepoFile[]> => {
        if (result.status === 'rejected') return [];
        const res = result.value;
        if (!res.ok) return [];
        const data = await res.json();
        if (!Array.isArray(data)) return [];
        return data
          .filter(
            (f: { name: string }) =>
              f.name.endsWith('.mdx') || f.name.endsWith('.md'),
          )
          .map((f: { name: string; path: string; download_url: string }) => ({
            name: f.name,
            path: f.path,
            download_url: f.download_url,
          }));
      };

      setProjectFiles(await parseResponse(projectRes));
      setBlogFiles(await parseResponse(blogRes));
    } catch (err) {
      setError(
        `Failed to fetch file list: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setLoading(false);
    }
  }, [settings]);

  useEffect(() => {
    if (show && settings.token) {
      fetchFiles();
    }
  }, [show, fetchFiles, settings.token]);

  const handleLoadFile = async (file: RepoFile) => {
    setLoadingFile(file.name);
    try {
      const res = await fetch(file.download_url);
      if (!res.ok) {
        setError(`Failed to fetch ${file.name}: ${res.statusText}`);
        return;
      }
      const content = await res.text();
      onLoad(content, file.name);
    } catch (err) {
      setError(
        `Failed to load ${file.name}: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setLoadingFile(null);
    }
  };

  if (!show) return null;

  const renderFileList = (files: RepoFile[], label: string) => {
    if (files.length === 0) return null;
    return (
      <div className="mb-3">
        <h6 className="text-body-secondary">{label}</h6>
        <div className="list-group">
          {files.map((file) => (
            <button
              key={file.path}
              type="button"
              className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
              onClick={() => handleLoadFile(file)}
              disabled={loadingFile !== null}
            >
              <span>
                <i className="bi bi-file-earmark-code me-2" />
                {file.name.replace(/\.mdx?$/, '')}
              </span>
              {loadingFile === file.name && (
                <span className="spinner-border spinner-border-sm" />
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose} />
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        onClick={onClose}
      >
        <div
          className="modal-dialog modal-dialog-scrollable"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Load from Repository</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              />
            </div>
            <div className="modal-body">
              {!settings.token ? (
                <div className="alert alert-info">
                  Configure GitHub token in Settings to load files from your
                  repo.
                </div>
              ) : loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 text-body-secondary">
                    Fetching file list...
                  </p>
                </div>
              ) : error ? (
                <div className="alert alert-danger">{error}</div>
              ) : projectFiles.length === 0 && blogFiles.length === 0 ? (
                <p className="text-body-secondary text-center py-3">
                  No MDX files found in the repository.
                </p>
              ) : (
                <>
                  {renderFileList(projectFiles, 'Projects')}
                  {renderFileList(blogFiles, 'Blog Posts')}
                </>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
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
