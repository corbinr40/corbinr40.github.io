interface CodeBlockProps {
  language: string;
  code: string;
}

export default function CodeBlock({ language, code }: CodeBlockProps) {
  return (
    <div className="position-relative">
      <span
        className="badge bg-secondary position-absolute"
        style={{ top: '0.5rem', right: '0.5rem' }}
      >
        {language}
      </span>
      <pre
        className="border rounded bg-dark text-light p-3 mb-0"
        style={{ overflowX: 'auto' }}
      >
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
}
