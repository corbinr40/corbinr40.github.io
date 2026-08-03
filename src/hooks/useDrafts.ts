import { useState, useEffect, useRef, useCallback } from 'react';
import type { EditorState } from '../types/editor';

// === Draft Schema ===

export interface Draft {
  id: string;
  title: string;
  contentType: string;
  state: EditorState;
  updatedAt: number;
}

// === Constants ===

const DB_NAME = 'content-editor-drafts';
const DB_VERSION = 1;
const STORE_NAME = 'drafts';

// === IndexedDB Helpers ===

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function idbRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function idbTransaction(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// === Standalone Export/Import ===

export function exportDraftToJson(draft: Draft): string {
  return JSON.stringify(draft, null, 2);
}

export function importDraftFromJson(json: string): Draft {
  const parsed = JSON.parse(json);
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    typeof parsed.id !== 'string' ||
    typeof parsed.title !== 'string' ||
    typeof parsed.contentType !== 'string' ||
    typeof parsed.state !== 'object' ||
    typeof parsed.updatedAt !== 'number'
  ) {
    throw new Error('Invalid draft JSON format');
  }
  const state = parsed.state as EditorState;
  if (!state.frontmatter || !Array.isArray(state.blocks)) {
    throw new Error('Invalid editor state in draft');
  }
  return parsed as Draft;
}

// === Hook ===

export default function useDrafts() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const dbRef = useRef<IDBDatabase | null>(null);

  const getDB = useCallback(async (): Promise<IDBDatabase> => {
    if (dbRef.current) return dbRef.current;
    const db = await openDB();
    dbRef.current = db;
    return db;
  }, []);

  const refreshDrafts = useCallback(async () => {
    try {
      const db = await getDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const all: Draft[] = await idbRequest(store.getAll());
      all.sort((a, b) => b.updatedAt - a.updatedAt);
      setDrafts(all);
    } catch (err) {
      console.error('Failed to refresh drafts:', err);
    }
  }, [getDB]);

  const saveDraft = useCallback(
    async (state: EditorState, existingId?: string): Promise<string> => {
      const db = await getDB();
      const id = existingId || crypto.randomUUID();
      const draft: Draft = {
        id,
        title: state.frontmatter.title || 'Untitled',
        contentType: state.frontmatter.contentType,
        state,
        updatedAt: Date.now(),
      };
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(draft);
      await idbTransaction(tx);
      await refreshDrafts();
      return id;
    },
    [getDB, refreshDrafts],
  );

  const loadDraft = useCallback(
    async (id: string): Promise<EditorState | null> => {
      const db = await getDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const draft: Draft | undefined = await idbRequest(store.get(id));
      return draft?.state ?? null;
    },
    [getDB],
  );

  const deleteDraft = useCallback(
    async (id: string): Promise<void> => {
      const db = await getDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
      await idbTransaction(tx);
      await refreshDrafts();
    },
    [getDB, refreshDrafts],
  );

  // Load drafts on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refreshDrafts();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshDrafts]);

  // Close DB on unmount
  useEffect(() => {
    return () => {
      dbRef.current?.close();
      dbRef.current = null;
    };
  }, []);

  return { drafts, loading, saveDraft, loadDraft, deleteDraft, refreshDrafts };
}
