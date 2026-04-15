import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type {
  Block,
  BlockData,
  HeroBlockData,
  OverviewBlockData,
  FeatureBlockData,
  CarouselBlockData,
  ImageParagraphBlockData,
  CodeBlockData,
  VideoEmbedBlockData,
  CalloutBlockData,
  QuoteBlockData,
} from '../../types/editor';
import BlockPicker from './BlockPicker';
import HeroBlock from './blocks/HeroBlock';
import OverviewBlock from './blocks/OverviewBlock';
import FeatureBlock from './blocks/FeatureBlock';
import CarouselBlock from './blocks/CarouselBlock';
import ImageParaBlock from './blocks/ImageParaBlock';
import CodeBlockEditor from './blocks/CodeBlockEditor';
import VideoBlockEditor from './blocks/VideoBlockEditor';
import CalloutBlockEditor from './blocks/CalloutBlockEditor';
import QuoteBlockEditor from './blocks/QuoteBlockEditor';

interface BlockBuilderProps {
  blocks: Block[];
  onAdd: (data: BlockData) => void;
  onRemove: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  onUpdate: (id: string, data: Partial<BlockData>) => void;
  onReorder: (blocks: Block[]) => void;
  onDuplicate: (id: string) => void;
  imageFiles: Map<string, File>;
  onImageUpload: (path: string, file: File) => void;
  slug: string;
}

const TYPE_LABELS: Record<string, string> = {
  hero: 'Hero Section',
  overview: 'Overview Table',
  feature: 'Feature Section',
  carousel: 'Image Carousel',
  imageParagraph: 'Image + Paragraph',
  codeBlock: 'Code Block',
  videoEmbed: 'Video Embed',
  callout: 'Callout Box',
  quote: 'Quote',
};

function BlockEditor({
  block,
  onUpdate,
  onImageUpload,
  slug,
}: {
  block: Block;
  onUpdate: (id: string, data: Partial<BlockData>) => void;
  onImageUpload: (path: string, file: File) => void;
  slug: string;
}) {
  const handleChange = (updates: Partial<BlockData>) => {
    onUpdate(block.id, updates);
  };

  switch (block.data.type) {
    case 'hero':
      return <HeroBlock data={block.data as HeroBlockData} onChange={handleChange} onImageUpload={onImageUpload} slug={slug} />;
    case 'overview':
      return <OverviewBlock data={block.data as OverviewBlockData} onChange={handleChange} />;
    case 'feature':
      return <FeatureBlock data={block.data as FeatureBlockData} onChange={handleChange} />;
    case 'carousel':
      return <CarouselBlock data={block.data as CarouselBlockData} onChange={handleChange} onImageUpload={onImageUpload} slug={slug} />;
    case 'imageParagraph':
      return <ImageParaBlock data={block.data as ImageParagraphBlockData} onChange={handleChange} onImageUpload={onImageUpload} slug={slug} />;
    case 'codeBlock':
      return <CodeBlockEditor data={block.data as CodeBlockData} onChange={handleChange} />;
    case 'videoEmbed':
      return <VideoBlockEditor data={block.data as VideoEmbedBlockData} onChange={handleChange} />;
    case 'callout':
      return <CalloutBlockEditor data={block.data as CalloutBlockData} onChange={handleChange} />;
    case 'quote':
      return <QuoteBlockEditor data={block.data as QuoteBlockData} onChange={handleChange} />;
    default:
      return null;
  }
}

function SortableBlock({
  block,
  onToggleCollapse,
  onRemove,
  onDuplicate,
  onUpdate,
  onImageUpload,
  slug,
}: {
  block: Block;
  onToggleCollapse: (id: string) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onUpdate: (id: string, data: Partial<BlockData>) => void;
  onImageUpload: (path: string, file: File) => void;
  slug: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: block.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="border rounded mb-2">
      <div className="d-flex align-items-center p-2 bg-body-secondary rounded-top">
        {/* Drag handle */}
        <button
          type="button"
          className="btn btn-sm p-0 me-2 text-body-secondary"
          style={{ cursor: 'grab', lineHeight: 1 }}
          {...attributes}
          {...listeners}
        >
          <i className="bi bi-grip-vertical" />
        </button>

        {/* Type label */}
        <span className="small fw-bold flex-grow-1">
          {TYPE_LABELS[block.data.type] ?? block.data.type}
        </span>

        {/* Duplicate */}
        <button
          type="button"
          className="btn btn-sm p-0 me-2 text-body-secondary"
          onClick={() => onDuplicate(block.id)}
          title="Duplicate block"
        >
          <i className="bi bi-copy" />
        </button>

        {/* Collapse toggle */}
        <button
          type="button"
          className="btn btn-sm p-0 me-2 text-body-secondary"
          onClick={() => onToggleCollapse(block.id)}
          title={block.collapsed ? 'Expand' : 'Collapse'}
        >
          <i className={`bi ${block.collapsed ? 'bi-chevron-down' : 'bi-chevron-up'}`} />
        </button>

        {/* Delete */}
        <button
          type="button"
          className="btn btn-sm p-0 text-danger"
          onClick={() => onRemove(block.id)}
          title="Remove block"
        >
          <i className="bi bi-trash" />
        </button>
      </div>

      {!block.collapsed && (
        <div className="p-2">
          <BlockEditor block={block} onUpdate={onUpdate} onImageUpload={onImageUpload} slug={slug} />
        </div>
      )}
    </div>
  );
}

export default function BlockBuilder({
  blocks,
  onAdd,
  onRemove,
  onUpdate,
  onToggleCollapse,
  onReorder,
  onDuplicate,
  onImageUpload,
  slug,
}: BlockBuilderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      onReorder(arrayMove(blocks, oldIndex, newIndex));
    }
  }

  return (
    <div>
      <h6 className="fw-bold border-bottom pb-2 mb-3">Blocks</h6>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          {blocks.map((block) => (
            <SortableBlock
              key={block.id}
              block={block}
              onToggleCollapse={onToggleCollapse}
              onRemove={onRemove}
              onDuplicate={onDuplicate}
              onUpdate={onUpdate}
              onImageUpload={onImageUpload}
              slug={slug}
            />
          ))}
        </SortableContext>
      </DndContext>

      <BlockPicker onAdd={onAdd} />
    </div>
  );
}
