// === Block Types ===

export type BlockType =
  | 'hero'
  | 'overview'
  | 'feature'
  | 'carousel'
  | 'imageParagraph'
  | 'codeBlock'
  | 'videoEmbed'
  | 'callout'
  | 'quote';

export interface HeroBlockData {
  type: 'hero';
  title: string;
  paragraphs: string[];
  imageSrc: string;
  imageAlt: string;
}

export interface OverviewBlockData {
  type: 'overview';
  enabled: boolean;
}

export interface FeatureBlockData {
  type: 'feature';
  title: string;
  imageSrc: string;
  imageAlt: string;
  imageCaption: string;
  contentHtml: string;
}

export interface CarouselImage {
  src: string;
  alt: string;
  title: string;
  caption: string;
}

export interface CarouselBlockData {
  type: 'carousel';
  carouselId: string;
  images: CarouselImage[];
}

export interface ImageParagraphBlockData {
  type: 'imageParagraph';
  side: 'left' | 'right';
  imageSrc: string;
  imageAlt: string;
  imageCaption: string;
  contentHtml: string;
}

export interface CodeBlockData {
  type: 'codeBlock';
  language: string;
  code: string;
}

export interface VideoEmbedBlockData {
  type: 'videoEmbed';
  url: string;
}

export interface CalloutBlockData {
  type: 'callout';
  calloutType: 'info' | 'warning' | 'tip' | 'note';
  contentHtml: string;
}

export interface QuoteBlockData {
  type: 'quote';
  quoteText: string;
  attribution: string;
}

export type BlockData =
  | HeroBlockData
  | OverviewBlockData
  | FeatureBlockData
  | CarouselBlockData
  | ImageParagraphBlockData
  | CodeBlockData
  | VideoEmbedBlockData
  | CalloutBlockData
  | QuoteBlockData;

export interface Block {
  id: string;
  data: BlockData;
  collapsed: boolean;
}

// === Frontmatter ===

export interface ProjectFrontmatter {
  contentType: 'project';
  title: string;
  slug: string;
  description: string;
  category: string;
  devTypes: string[];
  skills: string[];
  cardImage: string;
  status: string;
  type: string;
  duration: string;
  software: string;
  languages: string;
  availableOnText: string;
  availableOnHref: string;
  visible: boolean;
}

export interface BlogFrontmatter {
  contentType: 'blog';
  title: string;
  slug: string;
  description: string;
  skills: string[];
  cardImage: string;
  visible: boolean;
  date: string;
  tags: string[];
}

export type Frontmatter = ProjectFrontmatter | BlogFrontmatter;

// === Editor State ===

export interface EditorState {
  frontmatter: Frontmatter;
  blocks: Block[];
}

// === Editor Actions ===

export type EditorAction =
  | { type: 'SET_FRONTMATTER'; payload: Partial<Frontmatter> }
  | { type: 'SET_CONTENT_TYPE'; payload: 'project' | 'blog' }
  | { type: 'ADD_BLOCK'; payload: BlockData }
  | { type: 'UPDATE_BLOCK'; payload: { id: string; data: Partial<BlockData> } }
  | { type: 'REMOVE_BLOCK'; payload: string }
  | { type: 'REORDER_BLOCKS'; payload: Block[] }
  | { type: 'TOGGLE_COLLAPSE'; payload: string }
  | { type: 'LOAD_STATE'; payload: EditorState }
  | { type: 'DUPLICATE_BLOCK'; payload: string };

// === Helpers ===

export function createDefaultProjectFrontmatter(): ProjectFrontmatter {
  return {
    contentType: 'project',
    title: '',
    slug: '',
    description: '',
    category: 'programs',
    devTypes: [],
    skills: [],
    cardImage: '',
    status: 'ongoing',
    type: '',
    duration: '',
    software: '',
    languages: '',
    availableOnText: '',
    availableOnHref: '',
    visible: true,
  };
}

export function createDefaultBlogFrontmatter(): BlogFrontmatter {
  return {
    contentType: 'blog',
    title: '',
    slug: '',
    description: '',
    skills: [],
    cardImage: '',
    visible: true,
    date: new Date().toISOString().slice(0, 10),
    tags: [],
  };
}

export function generateBlockId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
