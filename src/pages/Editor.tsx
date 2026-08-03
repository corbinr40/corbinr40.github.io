import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type {
  EditorState,
  EditorAction,
  Block,
  Frontmatter,
} from '../types/editor';
import {
  createDefaultProjectFrontmatter,
  createDefaultBlogFrontmatter,
  generateBlockId,
} from '../types/editor';
import EditorHeader from '../components/editor/EditorHeader';
import FrontmatterForm from '../components/editor/FrontmatterForm';
import BlockBuilder from '../components/editor/BlockBuilder';
import PreviewPanel from '../components/editor/PreviewPanel';
import DraftManager from '../components/editor/DraftManager';
import GitHubSettingsModal from '../components/editor/GitHubSettingsModal';
import LoadFromRepoModal from '../components/editor/LoadFromRepoModal';
import PublishModal from '../components/editor/PublishModal';
import ToastContainer from '../components/editor/Toast';
import { generateMdx } from '../components/editor/mdxGenerator';
import { parseMdx } from '../components/editor/mdxParser';
import { exportAsZip } from '../components/editor/zipExporter';
import useUndoReducer from '../hooks/useUndoReducer';
import useToast from '../hooks/useToast';
import useDrafts from '../hooks/useDrafts';
import useGitHubApi from '../hooks/useGitHubApi';
import type { PublishResult } from '../hooks/useGitHubApi';
import type { BlockData } from '../types/editor';

function validateState(state: EditorState): string[] {
  const errors: string[] = [];
  if (!state.frontmatter.title.trim()) errors.push('Title is required');
  if (!state.frontmatter.slug.trim()) errors.push('Slug is required');
  if (!state.frontmatter.description.trim()) errors.push('Description is required');
  if (state.blocks.length === 0) errors.push('At least one content block is required');
  return errors;
}

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_FRONTMATTER':
      return {
        ...state,
        frontmatter: { ...state.frontmatter, ...action.payload } as Frontmatter,
      };

    case 'SET_CONTENT_TYPE': {
      const newFm =
        action.payload === 'project'
          ? createDefaultProjectFrontmatter()
          : createDefaultBlogFrontmatter();
      // Preserve shared fields
      newFm.title = state.frontmatter.title;
      newFm.slug = state.frontmatter.slug;
      newFm.description = state.frontmatter.description;
      newFm.skills = [...state.frontmatter.skills];
      newFm.cardImage = state.frontmatter.cardImage;
      newFm.visible = state.frontmatter.visible;
      return { ...state, frontmatter: newFm };
    }

    case 'ADD_BLOCK': {
      const newBlock: Block = {
        id: generateBlockId(),
        data: action.payload,
        collapsed: false,
      };
      return { ...state, blocks: [...state.blocks, newBlock] };
    }

    case 'UPDATE_BLOCK':
      return {
        ...state,
        blocks: state.blocks.map((b) =>
          b.id === action.payload.id
            ? { ...b, data: { ...b.data, ...action.payload.data } as Block['data'] }
            : b,
        ),
      };

    case 'REMOVE_BLOCK':
      return {
        ...state,
        blocks: state.blocks.filter((b) => b.id !== action.payload),
      };

    case 'REORDER_BLOCKS':
      return { ...state, blocks: action.payload };

    case 'TOGGLE_COLLAPSE':
      return {
        ...state,
        blocks: state.blocks.map((b) =>
          b.id === action.payload ? { ...b, collapsed: !b.collapsed } : b,
        ),
      };

    case 'DUPLICATE_BLOCK': {
      const idx = state.blocks.findIndex((b) => b.id === action.payload);
      if (idx === -1) return state;
      const original = state.blocks[idx];
      const duplicate: Block = {
        id: generateBlockId(),
        data: JSON.parse(JSON.stringify(original.data)),
        collapsed: false,
      };
      const newBlocks = [...state.blocks];
      newBlocks.splice(idx + 1, 0, duplicate);
      return { ...state, blocks: newBlocks };
    }

    case 'LOAD_STATE':
      return action.payload;

    default:
      return state;
  }
}

const initialState: EditorState = {
  frontmatter: createDefaultProjectFrontmatter(),
  blocks: [],
};

export default function Editor() {
  const [state, rawDispatch, { canUndo, canRedo }] = useUndoReducer(editorReducer, initialState);
  const [isDirty, setIsDirty] = useState(false);
  const [isWide, setIsWide] = useState(window.innerWidth >= 1200);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [showDrafts, setShowDrafts] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [showLoadFromRepo, setShowLoadFromRepo] = useState(false);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<Map<string, File>>(new Map());
  const { saveDraft } = useDrafts();
  const github = useGitHubApi();
  const { toasts, addToast, dismissToast } = useToast();
  const stateRef = useRef(state);
  stateRef.current = state;

  // Wrap dispatch to track dirty state
  const dispatch = useCallback(
    (action: Parameters<typeof rawDispatch>[0]) => {
      rawDispatch(action);
      const skipDirty = action.type === 'LOAD_STATE' || action.type === 'TOGGLE_COLLAPSE';
      if (action.type === 'LOAD_STATE') {
        setIsDirty(false);
      } else if (!skipDirty) {
        setIsDirty(true);
      }
    },
    [rawDispatch],
  );

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  // Track viewport width
  useEffect(() => {
    function handleResize() {
      setIsWide(window.innerWidth >= 1200);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Add noindex meta tag
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  // Undo/Redo keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: 'UNDO' });
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === 'y' || (e.key === 'z' && e.shiftKey))
      ) {
        e.preventDefault();
        dispatch({ type: 'REDO' });
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);

  const handleUndo = useCallback(() => dispatch({ type: 'UNDO' }), [dispatch]);
  const handleRedo = useCallback(() => dispatch({ type: 'REDO' }), [dispatch]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const s = stateRef.current;
      if (s.frontmatter.title || s.blocks.length > 0) {
        saveDraft(s, currentDraftId ?? undefined).then((id) => {
          setCurrentDraftId(id);
          setIsDirty(false);
          addToast('Draft auto-saved', 'info');
        });
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [currentDraftId, saveDraft, addToast]);

  const handleLoadDraft = useCallback(
    (draftState: EditorState) => {
      dispatch({ type: 'LOAD_STATE', payload: draftState });
      setShowDrafts(false);
    },
    [],
  );

  const handleDuplicateBlock = useCallback(
    (id: string) => {
      dispatch({ type: 'DUPLICATE_BLOCK', payload: id });
    },
    [],
  );

  const handleNew = useCallback(() => {
    if (!window.confirm('Discard current content?')) return;
    dispatch({ type: 'LOAD_STATE', payload: initialState });
    setCurrentDraftId(null);
  }, []);

  const handleContentTypeChange = useCallback(
    (type: 'project' | 'blog') => {
      dispatch({ type: 'SET_CONTENT_TYPE', payload: type });
    },
    [],
  );

  const handleDownloadMdx = useCallback(() => {
    const errors = validateState(state);
    if (errors.length > 0) {
      errors.forEach((err) => addToast(err, 'error'));
      return;
    }
    const mdx = generateMdx(state);
    const blob = new Blob([mdx], { type: 'text/mdx;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const filename = `${state.frontmatter.slug || 'untitled'}.mdx`;
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [state, addToast]);

  const handleExportZip = useCallback(() => {
    const errors = validateState(state);
    if (errors.length > 0) {
      errors.forEach((err) => addToast(err, 'error'));
      return;
    }
    const mdx = generateMdx(state);
    const slug = state.frontmatter.slug || 'untitled';
    exportAsZip(mdx, slug, state.frontmatter.contentType, imageFiles);
  }, [state, imageFiles, addToast]);

  const handleImportMdx = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.mdx';
    input.style.display = 'none';
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const content = reader.result as string;
          const parsed = parseMdx(content);
          dispatch({ type: 'LOAD_STATE', payload: parsed });
          setCurrentDraftId(null);
          addToast(`Imported "${parsed.frontmatter.title || file.name}" successfully`, 'success');
        } catch (err) {
          addToast(`Failed to import: ${err instanceof Error ? err.message : String(err)}`, 'error');
        }
      };
      reader.onerror = () => {
        addToast('Failed to read the selected file', 'error');
      };
      reader.readAsText(file);
    });
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }, [dispatch, addToast]);

  const handleLoadFromRepo = useCallback(
    (mdxContent: string, filename: string) => {
      try {
        const parsed = parseMdx(mdxContent);
        dispatch({ type: 'LOAD_STATE', payload: parsed });
        setCurrentDraftId(null);
        setShowLoadFromRepo(false);
        addToast(`Loaded "${parsed.frontmatter.title || filename}" successfully`, 'success');
      } catch (err) {
        addToast(
          `Failed to parse: ${err instanceof Error ? err.message : String(err)}`,
          'error',
        );
      }
    },
    [dispatch, addToast],
  );

  const handlePublish = useCallback(async () => {
    const errors = validateState(state);
    if (errors.length > 0) {
      errors.forEach((err) => addToast(err, 'error'));
      return;
    }
    setPublishResult(null);
    setShowPublish(true);
    const mdx = generateMdx(state);
    const slug = state.frontmatter.slug || 'untitled';
    const result = await github.publish(mdx, slug, state.frontmatter.contentType, imageFiles);
    setPublishResult(result);
  }, [state, github, imageFiles, addToast]);

  const handleFrontmatterChange = useCallback(
    (updates: Partial<Frontmatter>) => {
      dispatch({ type: 'SET_FRONTMATTER', payload: updates });
    },
    [],
  );

  const handleAddBlock = useCallback(
    (data: BlockData) => {
      dispatch({ type: 'ADD_BLOCK', payload: data });
    },
    [],
  );

  const handleRemoveBlock = useCallback(
    (id: string) => {
      dispatch({ type: 'REMOVE_BLOCK', payload: id });
    },
    [],
  );

  const handleToggleCollapse = useCallback(
    (id: string) => {
      dispatch({ type: 'TOGGLE_COLLAPSE', payload: id });
    },
    [],
  );

  const handleUpdateBlock = useCallback(
    (id: string, data: Partial<BlockData>) => {
      dispatch({ type: 'UPDATE_BLOCK', payload: { id, data } });
    },
    [],
  );

  const handleReorderBlocks = useCallback(
    (blocks: Block[]) => {
      dispatch({ type: 'REORDER_BLOCKS', payload: blocks });
    },
    [],
  );

  const handleImageUpload = useCallback((path: string, file: File) => {
    setImageFiles((prev) => {
      const next = new Map(prev);
      next.set(path, file);
      return next;
    });
  }, []);

  const slug = useMemo(() => state.frontmatter.slug || 'untitled', [state.frontmatter.slug]);

  const editorPanel = (
    <div>
      <FrontmatterForm
        frontmatter={state.frontmatter}
        onChange={handleFrontmatterChange}
        onImageUpload={handleImageUpload}
        slug={slug}
      />
      <BlockBuilder
        blocks={state.blocks}
        onAdd={handleAddBlock}
        onRemove={handleRemoveBlock}
        onUpdate={handleUpdateBlock}
        onToggleCollapse={handleToggleCollapse}
        onReorder={handleReorderBlocks}
        onDuplicate={handleDuplicateBlock}
        imageFiles={imageFiles}
        onImageUpload={handleImageUpload}
        slug={slug}
      />
    </div>
  );

  const previewPanel = (
    <div>
      <PreviewPanel state={state} />
    </div>
  );

  return (
    <div className="container-fluid px-4 py-3">
      <EditorHeader
        contentType={state.frontmatter.contentType}
        onContentTypeChange={handleContentTypeChange}
        onDownloadMdx={handleDownloadMdx}
        onShowDrafts={() => setShowDrafts(true)}
        onImportMdx={handleImportMdx}
        onExportZip={handleExportZip}
        onPublish={handlePublish}
        onShowSettings={() => setShowSettings(true)}
        onLoadFromRepo={() => setShowLoadFromRepo(true)}
        hasGitHubToken={github.hasToken}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onNew={handleNew}
      />

      <DraftManager
        show={showDrafts}
        onClose={() => setShowDrafts(false)}
        onLoadDraft={handleLoadDraft}
        currentState={state}
      />

      <GitHubSettingsModal
        show={showSettings}
        onClose={() => setShowSettings(false)}
        settings={github.settings}
        onUpdateSettings={github.updateSettings}
      />

      <LoadFromRepoModal
        show={showLoadFromRepo}
        onClose={() => setShowLoadFromRepo(false)}
        onLoad={handleLoadFromRepo}
        settings={github.settings}
      />

      <PublishModal
        show={showPublish}
        onClose={() => {
          setShowPublish(false);
          setPublishResult(null);
        }}
        onPublish={handlePublish}
        publishing={github.publishing}
        result={publishResult}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {isWide ? (
        /* Side-by-side layout */
        <div className="row g-3">
          <div className="col-6">{editorPanel}</div>
          <div className="col-6">{previewPanel}</div>
        </div>
      ) : (
        /* Tabbed layout */
        <>
          <ul className="nav nav-tabs mb-3" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'edit' ? 'active' : ''}`}
                onClick={() => setActiveTab('edit')}
                type="button"
                role="tab"
              >
                Edit
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'preview' ? 'active' : ''}`}
                onClick={() => setActiveTab('preview')}
                type="button"
                role="tab"
              >
                Preview
              </button>
            </li>
          </ul>
          {activeTab === 'edit' ? editorPanel : previewPanel}
        </>
      )}
    </div>
  );
}
