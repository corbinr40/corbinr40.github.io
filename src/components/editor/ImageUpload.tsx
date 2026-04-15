import { useState, useRef, useCallback, useEffect } from 'react';
import { optimizeImage } from './imageOptimizer';

interface ImageUploadProps {
  value: string;
  onChange: (path: string) => void;
  onFileUpload: (path: string, file: File) => void;
  slug: string;
  label?: string;
  placeholder?: string;
}

export default function ImageUpload({
  value,
  onChange,
  onFileUpload,
  slug,
  label = 'Image',
  placeholder = '/assets/images/...',
}: ImageUploadProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up blob URL on unmount
  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) return;
      const optimized = await optimizeImage(file);
      const effectiveSlug = slug || 'untitled';
      const path = `/assets/pageAssets/${effectiveSlug}/${optimized.name}`;

      // Revoke old blob URL
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      const newBlobUrl = URL.createObjectURL(optimized);
      setBlobUrl(newBlobUrl);

      onFileUpload(path, optimized);
      onChange(path);
    },
    [slug, blobUrl, onFileUpload, onChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      // Reset so same file can be re-selected
      e.target.value = '';
    },
    [handleFile],
  );

  const handleClear = useCallback(() => {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlobUrl(null);
    onChange('');
  }, [blobUrl, onChange]);

  const previewSrc = blobUrl || (value && !value.startsWith('/assets/pageAssets/') ? value : null) || blobUrl;
  const hasImage = !!value;

  return (
    <div>
      <label className="form-label small fw-bold mb-1">{label}</label>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        style={{
          border: `2px dashed ${isDragging ? 'var(--bs-primary)' : 'var(--bs-border-color)'}`,
          borderRadius: '0.375rem',
          padding: '0.5rem',
          minHeight: hasImage && previewSrc ? 'auto' : '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backgroundColor: isDragging ? 'rgba(var(--bs-primary-rgb), 0.05)' : 'var(--bs-tertiary-bg)',
          transition: 'border-color 0.15s, background-color 0.15s',
          gap: '0.5rem',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="d-none"
          onChange={handleFileInput}
        />

        {previewSrc ? (
          <img
            src={previewSrc}
            alt="Preview"
            style={{
              maxHeight: '80px',
              maxWidth: '120px',
              objectFit: 'contain',
              borderRadius: '0.25rem',
            }}
          />
        ) : (
          <span className="text-body-secondary small">
            <i className="bi bi-cloud-arrow-up me-1" />
            Drop image or click to upload
          </span>
        )}
      </div>

      {/* URL input + clear button */}
      <div className="d-flex gap-1 mt-1">
        <input
          type="text"
          className="form-control form-control-sm"
          value={value}
          onChange={(e) => {
            // Manual URL entry clears blob preview
            if (blobUrl) {
              URL.revokeObjectURL(blobUrl);
              setBlobUrl(null);
            }
            onChange(e.target.value);
          }}
          placeholder={placeholder}
        />
        {hasImage && (
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            title="Clear image"
          >
            <i className="bi bi-x" />
          </button>
        )}
      </div>
    </div>
  );
}
