import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        horizontalRule: false,
        blockquote: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
    ],
    content,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
  });

  // Sync external content changes (e.g. loading drafts)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  if (!editor) return null;

  const btnClass = (active: boolean) =>
    active
      ? 'btn btn-sm'
      : 'btn btn-sm btn-outline-secondary';

  const activeStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-text-primary)',
    color: 'var(--color-bg-primary)',
    borderColor: 'var(--color-btn-border)',
  };

  const btnStyle = (active: boolean): React.CSSProperties | undefined =>
    active ? activeStyle : undefined;

  return (
    <div className="border rounded">
      {/* Toolbar */}
      <div className="d-flex flex-wrap gap-1 p-2 border-bottom bg-body-secondary">
        <button
          type="button"
          className={btnClass(editor.isActive('bold'))}
          style={btnStyle(editor.isActive('bold'))}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <i className="bi bi-type-bold" />
        </button>
        <button
          type="button"
          className={btnClass(editor.isActive('italic'))}
          style={btnStyle(editor.isActive('italic'))}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <i className="bi bi-type-italic" />
        </button>
        <button
          type="button"
          className={btnClass(editor.isActive('underline'))}
          style={btnStyle(editor.isActive('underline'))}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline"
        >
          <i className="bi bi-type-underline" />
        </button>
        <button
          type="button"
          className={btnClass(editor.isActive('code'))}
          style={btnStyle(editor.isActive('code'))}
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="Inline Code"
        >
          <i className="bi bi-code" />
        </button>

        <div className="vr mx-1" />

        <button
          type="button"
          className={btnClass(editor.isActive('bulletList'))}
          style={btnStyle(editor.isActive('bulletList'))}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >
          <i className="bi bi-list-ul" />
        </button>
        <button
          type="button"
          className={btnClass(editor.isActive('orderedList'))}
          style={btnStyle(editor.isActive('orderedList'))}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Ordered List"
        >
          <i className="bi bi-list-ol" />
        </button>

        <div className="vr mx-1" />

        <button
          type="button"
          className={btnClass(editor.isActive('link'))}
          style={btnStyle(editor.isActive('link'))}
          onClick={() => {
            if (editor.isActive('link')) {
              editor.chain().focus().unsetLink().run();
            } else {
              const url = window.prompt('Enter URL:');
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }
          }}
          title="Link"
        >
          <i className="bi bi-link-45deg" />
        </button>
      </div>

      {/* Editor area */}
      <div style={{ minHeight: 120 }} className="p-2">
        <EditorContent editor={editor} placeholder={placeholder} />
      </div>
    </div>
  );
}
