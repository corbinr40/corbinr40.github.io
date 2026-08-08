import type {
  EditorState,
  Frontmatter,
  ProjectFrontmatter,
  BlogFrontmatter,
  HeroBlockData,
  FeatureBlockData,
  CarouselBlockData,
  OverviewBlockData,
  ImageParagraphBlockData,
  CodeBlockData,
  VideoEmbedBlockData,
  CalloutBlockData,
  QuoteBlockData,
} from '../../types/editor';

/** Escape a string for safe use as a YAML quoted value. */
function yamlValue(str: string): string {
  return `"${str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function generateFrontmatter(fm: Frontmatter): string {
  const lines: string[] = ['---'];

  lines.push(`id: ${yamlValue(fm.slug)}`);
  lines.push(`title: ${yamlValue(fm.title)}`);
  lines.push(`description: ${yamlValue(fm.description)}`);
  lines.push(`contentType: ${yamlValue(fm.contentType)}`);
  lines.push(`visible: ${fm.visible}`);
  // Serialized as "image" — the site's content registry (src/content/index.ts)
  // and all existing MDX use that key; "cardImage" is editor-internal only.
  lines.push(`image: ${yamlValue(fm.cardImage)}`);

  if (fm.contentType === 'blog') {
    const b = fm as BlogFrontmatter;
    lines.push(`date: ${yamlValue(b.date)}`);
    if (b.tags.length > 0) {
      lines.push('tags:');
      for (const t of b.tags) {
        lines.push(`  - ${yamlValue(t)}`);
      }
    } else {
      lines.push('tags: []');
    }
  }

  if (fm.contentType === 'project') {
    const p = fm as ProjectFrontmatter;
    lines.push(`category: ${yamlValue(p.category)}`);
    lines.push(`status: ${yamlValue(p.status)}`);
    lines.push(`type: ${yamlValue(p.type)}`);
    lines.push(`duration: ${yamlValue(p.duration)}`);
    lines.push(`software: ${yamlValue(p.software)}`);
    lines.push(`languages: ${yamlValue(p.languages)}`);

    if (p.devTypes.length > 0) {
      lines.push('devTypes:');
      for (const d of p.devTypes) {
        lines.push(`  - ${yamlValue(d)}`);
      }
    } else {
      lines.push('devTypes: []');
    }

    if (p.availableOnHref) {
      lines.push('availableOn:');
      lines.push(`  label: ${yamlValue(p.availableOnText)}`);
      lines.push(`  href: ${yamlValue(p.availableOnHref)}`);
    } else if (p.availableOnText) {
      lines.push(`availableOn: ${yamlValue(p.availableOnText)}`);
    }
  }

  if (fm.skills.length > 0) {
    lines.push('skills:');
    for (const s of fm.skills) {
      lines.push(`  - ${yamlValue(s)}`);
    }
  } else {
    lines.push('skills: []');
  }

  lines.push('---');
  return lines.join('\n');
}

function toJsVarName(carouselId: string): string {
  return carouselId.replace(/-/g, '_');
}

function generateCarouselExports(state: EditorState): string {
  const carouselBlocks = state.blocks
    .map((b) => b.data)
    .filter((d): d is CarouselBlockData => d.type === 'carousel');

  if (carouselBlocks.length === 0) return '';

  const exports: string[] = [];
  for (const c of carouselBlocks) {
    const varName = toJsVarName(c.carouselId);
    const imagesJson = JSON.stringify(c.images, null, 2);
    exports.push(`export const ${varName}_images = ${imagesJson};`);
  }
  return '\n' + exports.join('\n\n') + '\n';
}

function generateBlockJsx(state: EditorState): string {
  const jsxParts: string[] = [];

  for (const block of state.blocks) {
    const d = block.data;

    switch (d.type) {
      case 'hero': {
        const hero = d as HeroBlockData;
        const paragraphsStr = JSON.stringify(hero.paragraphs);
        jsxParts.push(
          `<div className="section-wrapper">` +
            `<HeroSection title=${yamlValue(hero.title)} paragraphs={${paragraphsStr}} imageSrc=${yamlValue(hero.imageSrc)} imageAlt=${yamlValue(hero.imageAlt)} />` +
            `</div>`,
        );
        break;
      }

      case 'overview': {
        const ov = d as OverviewBlockData;
        if (ov.enabled) {
          jsxParts.push(
            `<div className="section-wrapper"><OverviewTable /></div>`,
          );
        }
        break;
      }

      case 'feature': {
        const feat = d as FeatureBlockData;
        jsxParts.push(
          `<div className="section-wrapper">` +
            `<FeatureSection title=${yamlValue(feat.title)} imageSrc=${yamlValue(feat.imageSrc)} imageAlt=${yamlValue(feat.imageAlt)} imageCaption=${yamlValue(feat.imageCaption)}>` +
            `${feat.contentHtml}` +
            `</FeatureSection>` +
            `</div>`,
        );
        break;
      }

      case 'carousel': {
        const car = d as CarouselBlockData;
        const varName = toJsVarName(car.carouselId);
        jsxParts.push(
          `<ImageCarousel id=${yamlValue(car.carouselId)} images={${varName}_images} />`,
        );
        break;
      }

      case 'imageParagraph': {
        const ip = d as ImageParagraphBlockData;
        jsxParts.push(
          `<ImageParagraph side=${yamlValue(ip.side)} imageSrc=${yamlValue(ip.imageSrc)} imageAlt=${yamlValue(ip.imageAlt)} imageCaption=${yamlValue(ip.imageCaption)}>` +
            `${ip.contentHtml}` +
            `</ImageParagraph>`,
        );
        break;
      }

      case 'codeBlock': {
        const cb = d as CodeBlockData;
        const escapedCode = cb.code.replace(/`/g, '\\`').replace(/\$/g, '\\$');
        jsxParts.push(
          `<CodeBlock language=${yamlValue(cb.language)} code={\`${escapedCode}\`} />`,
        );
        break;
      }

      case 'videoEmbed': {
        const ve = d as VideoEmbedBlockData;
        jsxParts.push(`<VideoEmbed url=${yamlValue(ve.url)} />`);
        break;
      }

      case 'callout': {
        const co = d as CalloutBlockData;
        jsxParts.push(
          `<CalloutBox type=${yamlValue(co.calloutType)}>` +
            `${co.contentHtml}` +
            `</CalloutBox>`,
        );
        break;
      }

      case 'quote': {
        const q = d as QuoteBlockData;
        jsxParts.push(
          `<QuoteBlock quote=${yamlValue(q.quoteText)} attribution=${yamlValue(q.attribution)} />`,
        );
        break;
      }
    }
  }

  return jsxParts.join('\n\n');
}

export function generateMdx(state: EditorState): string {
  const parts: string[] = [];

  parts.push(generateFrontmatter(state.frontmatter));

  const carouselExports = generateCarouselExports(state);
  if (carouselExports) {
    parts.push(carouselExports);
  }

  const blockJsx = generateBlockJsx(state);
  if (blockJsx) {
    parts.push('');
    parts.push(blockJsx);
  }

  return parts.join('\n') + '\n';
}
