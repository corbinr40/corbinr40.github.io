import { useState } from 'react';
import type { BlockData } from '../../types/editor';

interface BlockPickerProps {
  onAdd: (data: BlockData) => void;
}

interface BlockOption {
  label: string;
  icon: string;
  factory: () => BlockData;
}

const BLOCK_OPTIONS: BlockOption[] = [
  {
    label: 'Hero Section',
    icon: 'bi-card-heading',
    factory: (): BlockData => ({
      type: 'hero',
      title: '',
      paragraphs: [''],
      imageSrc: '',
      imageAlt: '',
    }),
  },
  {
    label: 'Overview Table',
    icon: 'bi-table',
    factory: (): BlockData => ({
      type: 'overview',
      enabled: true,
    }),
  },
  {
    label: 'Feature Section',
    icon: 'bi-layout-text-window-reverse',
    factory: (): BlockData => ({
      type: 'feature',
      title: '',
      imageSrc: '',
      imageAlt: '',
      imageCaption: '',
      contentHtml: '',
    }),
  },
  {
    label: 'Image Carousel',
    icon: 'bi-images',
    factory: (): BlockData => ({
      type: 'carousel',
      carouselId: `carousel-${Date.now()}`,
      images: [],
    }),
  },
  {
    label: 'Image + Paragraph (Left)',
    icon: 'bi-layout-text-sidebar',
    factory: (): BlockData => ({
      type: 'imageParagraph',
      side: 'left',
      imageSrc: '',
      imageAlt: '',
      imageCaption: '',
      contentHtml: '',
    }),
  },
  {
    label: 'Image + Paragraph (Right)',
    icon: 'bi-layout-text-sidebar-reverse',
    factory: (): BlockData => ({
      type: 'imageParagraph',
      side: 'right',
      imageSrc: '',
      imageAlt: '',
      imageCaption: '',
      contentHtml: '',
    }),
  },
  {
    label: 'Code Block',
    icon: 'bi-code-square',
    factory: (): BlockData => ({
      type: 'codeBlock',
      language: 'javascript',
      code: '',
    }),
  },
  {
    label: 'Video Embed',
    icon: 'bi-play-circle',
    factory: (): BlockData => ({
      type: 'videoEmbed',
      url: '',
    }),
  },
  {
    label: 'Callout Box',
    icon: 'bi-megaphone',
    factory: (): BlockData => ({
      type: 'callout',
      calloutType: 'info',
      contentHtml: '',
    }),
  },
  {
    label: 'Quote Block',
    icon: 'bi-chat-quote',
    factory: (): BlockData => ({
      type: 'quote',
      quoteText: '',
      attribution: '',
    }),
  },
];

export default function BlockPicker({ onAdd }: BlockPickerProps) {
  const [open, setOpen] = useState(false);

  function handleAdd(factory: () => BlockData) {
    onAdd(factory());
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm w-100"
        onClick={() => setOpen(true)}
      >
        <i className="bi bi-plus-lg me-1" />
        Add Block
      </button>
    );
  }

  return (
    <div className="border rounded p-2">
      <div className="row g-2">
        {BLOCK_OPTIONS.map((opt) => (
          <div className="col-6" key={opt.label}>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm w-100 d-flex align-items-center gap-2"
              onClick={() => handleAdd(opt.factory)}
            >
              <i className={`bi ${opt.icon}`} />
              {opt.label}
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="btn btn-link btn-sm text-body-secondary mt-2 p-0"
        onClick={() => setOpen(false)}
      >
        Cancel
      </button>
    </div>
  );
}
