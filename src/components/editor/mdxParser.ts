import type {
  EditorState,
  Block,
  BlockData,
  Frontmatter,
  ProjectFrontmatter,
  BlogFrontmatter,
  CarouselImage,
} from '../../types/editor';
import {
  generateBlockId,
  createDefaultProjectFrontmatter,
  createDefaultBlogFrontmatter,
} from '../../types/editor';

// ---------------------------------------------------------------------------
// YAML-like frontmatter parsing (not a full YAML parser — handles the
// subset produced by mdxGenerator.ts)
// ---------------------------------------------------------------------------

function parseFrontmatter(yamlBlock: string): Frontmatter {
  const lines = yamlBlock.split('\n');

  // First pass: build a simple key-value map, collecting arrays and nested
  // objects as we go.
  const raw: Record<string, unknown> = {};
  let currentKey: string | null = null;
  let currentArray: string[] | null = null;
  let currentObject: Record<string, string> | null = null;

  for (const line of lines) {
    const trimmed = line.trimEnd();

    // Array item (indented "- value")
    const arrayItemMatch = trimmed.match(/^\s{2}- (.+)$/);
    if (arrayItemMatch && currentKey) {
      if (!currentArray) currentArray = [];
      currentArray.push(unquote(arrayItemMatch[1].trim()));
      continue;
    }

    // Nested object property (indented "key: value")
    const nestedMatch = trimmed.match(/^\s{2}(\w+):\s*(.+)$/);
    if (nestedMatch && currentKey && !currentArray) {
      if (!currentObject) currentObject = {};
      currentObject[nestedMatch[1]] = unquote(nestedMatch[2].trim());
      continue;
    }

    // Flush previous key
    if (currentKey !== null) {
      if (currentArray) {
        raw[currentKey] = currentArray;
      } else if (currentObject) {
        raw[currentKey] = currentObject;
      }
      currentArray = null;
      currentObject = null;
      currentKey = null;
    }

    // Top-level "key: value" or "key:"
    const kvMatch = trimmed.match(/^(\w[\w-]*):\s*(.*)$/);
    if (!kvMatch) continue;

    const key = kvMatch[1];
    const value = kvMatch[2].trim();

    if (value === '' || value === undefined) {
      // Signals an upcoming array or nested object
      currentKey = key;
      continue;
    }

    if (value === '[]') {
      raw[key] = [];
    } else if (value === 'true') {
      raw[key] = true;
    } else if (value === 'false') {
      raw[key] = false;
    } else {
      raw[key] = unquote(value);
    }
  }

  // Flush last key
  if (currentKey !== null) {
    if (currentArray) raw[currentKey] = currentArray;
    else if (currentObject) raw[currentKey] = currentObject;
  }

  // Map raw values to typed frontmatter
  const contentType =
    (raw['contentType'] as string) === 'blog' ? 'blog' : 'project';

  if (contentType === 'blog') {
    const fm: BlogFrontmatter = {
      ...createDefaultBlogFrontmatter(),
      title: str(raw['title']),
      slug: str(raw['id'] ?? raw['slug']),
      description: str(raw['description']),
      skills: arr(raw['skills']),
      cardImage: str(raw['cardImage'] ?? raw['image']),
      visible: raw['visible'] !== false,
      date: str(raw['date']) || new Date().toISOString().slice(0, 10),
      tags: arr(raw['tags']),
    };
    return fm;
  }

  const availableOn = raw['availableOn'];
  let availableOnText = '';
  let availableOnHref = '';
  if (typeof availableOn === 'string') {
    availableOnText = availableOn;
  } else if (availableOn && typeof availableOn === 'object') {
    const ao = availableOn as Record<string, string>;
    availableOnText = ao['label'] ?? '';
    availableOnHref = ao['href'] ?? '';
  }

  const fm: ProjectFrontmatter = {
    ...createDefaultProjectFrontmatter(),
    title: str(raw['title']),
    slug: str(raw['id'] ?? raw['slug']),
    description: str(raw['description']),
    category: str(raw['category']) || 'programs',
    devTypes: arr(raw['devTypes']),
    skills: arr(raw['skills']),
    cardImage: str(raw['cardImage'] ?? raw['image']),
    status: str(raw['status']) || 'ongoing',
    type: str(raw['type']),
    duration: str(raw['duration']),
    software: str(raw['software']),
    languages: str(raw['languages']),
    availableOnText,
    availableOnHref,
    visible: raw['visible'] !== false,
  };
  return fm;
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function arr(v: unknown): string[] {
  return Array.isArray(v) ? v.map(String) : [];
}

/** Remove surrounding quotes from a YAML value. */
function unquote(s: string): string {
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    return s
      .slice(1, -1)
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
  }
  return s;
}

// ---------------------------------------------------------------------------
// Carousel export parsing
// ---------------------------------------------------------------------------

type CarouselExportMap = Record<string, CarouselImage[]>;

function parseCarouselExports(body: string): CarouselExportMap {
  const map: CarouselExportMap = {};
  const re = /export\s+const\s+(\w+)\s*=\s*(\[[\s\S]*?\]);/g;
  let m: RegExpExecArray | null;

  while ((m = re.exec(body)) !== null) {
    const varName = m[1];
    let jsonStr = m[2];
    // The generator uses JSON.stringify so values are double-quoted,
    // but hand-written MDX might use single quotes — normalise.
    jsonStr = jsonStr.replace(/'/g, '"');
    try {
      const parsed = JSON.parse(jsonStr) as CarouselImage[];
      map[varName] = parsed;
    } catch {
      // Skip malformed exports
    }
  }

  return map;
}

// ---------------------------------------------------------------------------
// JSX block parsing
// ---------------------------------------------------------------------------

/** Extract a prop value from a JSX tag string.  Handles prop="value" and prop={expr}. */
function extractProp(tag: string, name: string): string {
  // prop="value"
  const strMatch = new RegExp(`${name}="([^"]*)"`, 's').exec(tag);
  if (strMatch) return strMatch[1];

  // prop={`template literal`}
  const tmplMatch = new RegExp(`${name}=\\{\`([\\s\\S]*?)\`\\}`, 's').exec(tag);
  if (tmplMatch) {
    return tmplMatch[1].replace(/\\`/g, '`').replace(/\\\$/g, '$');
  }

  // prop={value}  (non-brace-containing expression)
  const exprMatch = new RegExp(`${name}=\\{([^}]*?)\\}`, 's').exec(tag);
  if (exprMatch) return exprMatch[1].trim();

  return '';
}

/** Parse a JS array literal of strings, e.g. ["a","b"] */
function parseStringArray(raw: string): string[] {
  // Try JSON first
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    // fallback
  }

  // Manually extract quoted strings
  const results: string[] = [];
  const re = /["']([^"']*?)["']/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    results.push(m[1]);
  }
  return results;
}

/** Extract children (innerHTML) between the opening tag's > and the closing tag. */
function extractChildren(
  fullMatch: string,
  tagName: string,
): string {
  // Find the end of the opening tag's attributes
  const openEnd = fullMatch.indexOf('>');
  if (openEnd === -1) return '';
  const closeTag = `</${tagName}>`;
  const closeIdx = fullMatch.lastIndexOf(closeTag);
  if (closeIdx === -1) return '';
  return fullMatch.slice(openEnd + 1, closeIdx).trim();
}

function parseBlocks(
  body: string,
  carouselMap: CarouselExportMap,
): Block[] {
  const blocks: Block[] = [];

  // Remove carousel export statements so they don't interfere with block matching
  const cleaned = body.replace(/export\s+const\s+\w+\s*=\s*\[[\s\S]*?\];/g, '');

  // We match known component tags. Order matters — try more specific patterns first.
  // We'll iterate through the string finding component tags.
  const componentPatterns: {
    name: string;
    re: RegExp;
    handler: (match: RegExpExecArray) => BlockData | null;
  }[] = [
    {
      name: 'HeroSection',
      re: /<HeroSection\b([\s\S]*?)\/>/g,
      handler: (m) => {
        const attrs = m[1];
        const title = extractProp(attrs, 'title');
        const imageSrc = extractProp(attrs, 'imageSrc');
        const imageAlt = extractProp(attrs, 'imageAlt');
        const paragraphsRaw = extractProp(attrs, 'paragraphs');
        // paragraphs is passed as {[...]} so extractProp returns the inner [...] content
        const paragraphs = parseStringArray(
          paragraphsRaw.startsWith('[') ? paragraphsRaw : `[${paragraphsRaw}]`,
        );
        return {
          type: 'hero',
          title,
          paragraphs,
          imageSrc,
          imageAlt,
        };
      },
    },
    {
      name: 'OverviewTable',
      re: /<OverviewTable\b[\s\S]*?\/>/g,
      handler: () => ({
        type: 'overview',
        enabled: true,
      }),
    },
    {
      name: 'FeatureSection',
      re: /<FeatureSection\b[\s\S]*?<\/FeatureSection>/g,
      handler: (m) => {
        const full = m[0];
        const title = extractProp(full, 'title');
        const imageSrc = extractProp(full, 'imageSrc');
        const imageAlt = extractProp(full, 'imageAlt');
        const imageCaption = extractProp(full, 'imageCaption');
        const contentHtml = extractChildren(full, 'FeatureSection');
        return {
          type: 'feature',
          title,
          imageSrc,
          imageAlt,
          imageCaption,
          contentHtml,
        };
      },
    },
    {
      name: 'ImageCarousel',
      re: /<ImageCarousel\b([\s\S]*?)\/>/g,
      handler: (m) => {
        const attrs = m[1];
        const id = extractProp(attrs, 'id');
        const imagesRef = extractProp(attrs, 'images');
        const images = carouselMap[imagesRef] ?? [];
        return {
          type: 'carousel',
          carouselId: id,
          images,
        };
      },
    },
    {
      name: 'ImageParagraph',
      re: /<ImageParagraph\b[\s\S]*?<\/ImageParagraph>/g,
      handler: (m) => {
        const full = m[0];
        const side = (extractProp(full, 'side') || 'left') as 'left' | 'right';
        const imageSrc = extractProp(full, 'imageSrc');
        const imageAlt = extractProp(full, 'imageAlt');
        const imageCaption = extractProp(full, 'imageCaption');
        const contentHtml = extractChildren(full, 'ImageParagraph');
        return {
          type: 'imageParagraph',
          side,
          imageSrc,
          imageAlt,
          imageCaption,
          contentHtml,
        };
      },
    },
    {
      name: 'CodeBlock',
      re: /<CodeBlock\b([\s\S]*?)\/>/g,
      handler: (m) => {
        const attrs = m[1];
        const language = extractProp(attrs, 'language');
        const code = extractProp(attrs, 'code');
        return {
          type: 'codeBlock',
          language,
          code,
        };
      },
    },
    {
      name: 'VideoEmbed',
      re: /<VideoEmbed\b([\s\S]*?)\/>/g,
      handler: (m) => {
        const attrs = m[1];
        const url = extractProp(attrs, 'url');
        return {
          type: 'videoEmbed',
          url,
        };
      },
    },
    {
      name: 'CalloutBox',
      re: /<CalloutBox\b[\s\S]*?<\/CalloutBox>/g,
      handler: (m) => {
        const full = m[0];
        const calloutType = (extractProp(full, 'type') || 'info') as
          | 'info'
          | 'warning'
          | 'tip'
          | 'note';
        const contentHtml = extractChildren(full, 'CalloutBox');
        return {
          type: 'callout',
          calloutType,
          contentHtml,
        };
      },
    },
    {
      name: 'QuoteBlock',
      re: /<QuoteBlock\b([\s\S]*?)\/>/g,
      handler: (m) => {
        const attrs = m[1];
        const quoteText = extractProp(attrs, 'quote');
        const attribution = extractProp(attrs, 'attribution');
        return {
          type: 'quote',
          quoteText,
          attribution,
        };
      },
    },
  ];

  // Collect all matches with their positions so we can emit blocks in
  // document order.
  const found: { index: number; data: BlockData }[] = [];

  for (const pattern of componentPatterns) {
    // Reset lastIndex for global regex
    pattern.re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = pattern.re.exec(cleaned)) !== null) {
      const data = pattern.handler(m);
      if (data) {
        found.push({ index: m.index, data });
      }
    }
  }

  // Sort by position in the source to preserve document order
  found.sort((a, b) => a.index - b.index);

  for (const { data } of found) {
    blocks.push({
      id: generateBlockId(),
      data,
      collapsed: false,
    });
  }

  return blocks;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function parseMdx(mdxContent: string): EditorState {
  // Split frontmatter from body
  const fmMatch = mdxContent.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) {
    throw new Error('No frontmatter found in MDX file');
  }

  const frontmatter = parseFrontmatter(fmMatch[1]);
  const body = mdxContent.slice(fmMatch[0].length);

  const carouselMap = parseCarouselExports(body);
  const blocks = parseBlocks(body, carouselMap);

  return { frontmatter, blocks };
}
