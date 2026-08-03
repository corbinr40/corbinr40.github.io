import { useState, useCallback } from 'react';

export interface GitHubSettings {
  token: string;
  owner: string;
  repo: string;
  branch: string;
}

export interface PublishResult {
  success: boolean;
  commitUrl?: string;
  error?: string;
}

const STORAGE_KEY = 'github-editor-settings';

const defaultSettings: GitHubSettings = {
  token: '',
  owner: 'corbinr40',
  repo: 'corbinr40.github.io',
  branch: 'main',
};

function loadSettings(): GitHubSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultSettings, ...parsed };
    }
  } catch {
    // ignore
  }
  return { ...defaultSettings };
}

function saveSettings(settings: GitHubSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // result is data:...;base64,<data> - extract just the base64 part
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export default function useGitHubApi() {
  const [settings, setSettings] = useState<GitHubSettings>(loadSettings);
  const [publishing, setPublishing] = useState(false);

  const updateSettings = useCallback((updates: Partial<GitHubSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      saveSettings(next);
      return next;
    });
  }, []);

  const hasToken = settings.token.length > 0;

  const putFile = useCallback(
    async (
      filePath: string,
      content: string,
      commitMessage: string,
      headers: Record<string, string>,
      branch: string,
    ): Promise<PublishResult> => {
      const { owner, repo } = settings;
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

      // Check if file already exists to get its SHA
      let existingSha: string | undefined;
      try {
        const checkRes = await fetch(`${apiUrl}?ref=${branch}`, { headers });
        if (checkRes.status === 200) {
          const data = await checkRes.json();
          existingSha = data.sha;
        } else if (checkRes.status === 401) {
          return { success: false, error: 'Invalid GitHub token. Check your settings.' };
        } else if (checkRes.status !== 404) {
          const errData = await checkRes.json().catch(() => null);
          return {
            success: false,
            error: `GitHub API error (${checkRes.status}): ${errData?.message || checkRes.statusText}`,
          };
        }
      } catch (err) {
        return {
          success: false,
          error: `Network error checking file: ${err instanceof Error ? err.message : String(err)}`,
        };
      }

      const body: Record<string, string> = {
        message: commitMessage,
        content,
        branch,
      };
      if (existingSha) {
        body.sha = existingSha;
      }

      const putRes = await fetch(apiUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      });

      if (putRes.status === 200 || putRes.status === 201) {
        const data = await putRes.json();
        return { success: true, commitUrl: data.commit?.html_url };
      }
      if (putRes.status === 401) {
        return { success: false, error: 'Invalid GitHub token. Check your settings.' };
      }
      if (putRes.status === 404) {
        return { success: false, error: 'Repository not found. Check owner and repo settings.' };
      }
      if (putRes.status === 422) {
        return { success: false, error: 'Conflict: the file was modified since last check. Try again.' };
      }
      const errData = await putRes.json().catch(() => null);
      return {
        success: false,
        error: `GitHub API error (${putRes.status}): ${errData?.message || putRes.statusText}`,
      };
    },
    [settings],
  );

  const publish = useCallback(
    async (
      mdxContent: string,
      slug: string,
      contentType: 'project' | 'blog',
      imageFiles?: Map<string, File>,
    ): Promise<PublishResult> => {
      const { token, branch } = settings;

      if (!token) {
        return { success: false, error: 'GitHub token is not configured.' };
      }

      if (!slug) {
        return { success: false, error: 'Slug is required to publish.' };
      }

      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      };

      setPublishing(true);

      try {
        // Publish the MDX file
        const folder = contentType === 'project' ? 'projects' : 'blog';
        const filePath = `src/content/${folder}/${slug}.mdx`;
        const mdxResult = await putFile(
          filePath,
          btoa(unescape(encodeURIComponent(mdxContent))),
          `Add/update content: ${slug}`,
          headers,
          branch,
        );

        if (!mdxResult.success) {
          return mdxResult;
        }

        // Publish uploaded images
        if (imageFiles && imageFiles.size > 0) {
          for (const [path, file] of imageFiles) {
            const base64 = await fileToBase64(file);
            const imgPath = `public${path}`;
            const imgResult = await putFile(
              imgPath,
              base64,
              `Add image: ${path}`,
              headers,
              branch,
            );
            if (!imgResult.success) {
              return {
                success: false,
                error: `MDX published, but failed to upload image ${path}: ${imgResult.error}`,
              };
            }
          }
        }

        return mdxResult;
      } catch (err) {
        return {
          success: false,
          error: `Network error: ${err instanceof Error ? err.message : String(err)}`,
        };
      } finally {
        setPublishing(false);
      }
    },
    [settings, putFile],
  );

  return { settings, updateSettings, hasToken, publishing, publish };
}
