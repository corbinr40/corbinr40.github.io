import { useState, useMemo } from 'react';
import type { EditorState, ProjectFrontmatter, BlogFrontmatter } from '../../types/editor';
import {
  ContentProvider,
  type ContentFrontmatter,
} from '../../context/ContentContext';
import HeroSection from '../HeroSection';
import OverviewTable from '../OverviewTable';
import FeatureSection from '../FeatureSection';
import ImageCarousel from '../ImageCarousel';
import ImageParagraph from '../ImageParagraph';
import CodeBlock from '../CodeBlock';
import VideoEmbed from '../VideoEmbed';
import CalloutBox from '../CalloutBox';
import QuoteBlock from '../QuoteBlock';

type DeviceWidth = 'desktop' | 'tablet' | 'mobile';

const deviceWidths: Record<DeviceWidth, number | undefined> = {
  desktop: undefined,
  tablet: 768,
  mobile: 375,
};

function toContentFrontmatter(fm: EditorState['frontmatter']): ContentFrontmatter {
  const base: ContentFrontmatter = {
    id: fm.slug,
    title: fm.title,
    description: fm.description,
    contentType: fm.contentType,
    visible: fm.visible,
    skills: fm.skills,
    image: fm.cardImage,
  };

  if (fm.contentType === 'blog') {
    const b = fm as BlogFrontmatter;
    base.date = b.date;
    base.tags = b.tags;
  }

  if (fm.contentType === 'project') {
    const p = fm as ProjectFrontmatter;
    base.category = p.category;
    base.devTypes = p.devTypes;
    base.status = p.status;
    base.type = p.type;
    base.duration = p.duration;
    base.software = p.software;
    base.languages = p.languages;

    if (p.availableOnHref) {
      base.availableOn = { label: p.availableOnText, href: p.availableOnHref };
    } else if (p.availableOnText) {
      base.availableOn = p.availableOnText;
    }
  }

  return base;
}

export default function PreviewPanel({ state }: { state: EditorState }) {
  const [device, setDevice] = useState<DeviceWidth>('desktop');

  const contentFm = useMemo(
    () => toContentFrontmatter(state.frontmatter),
    [state.frontmatter],
  );

  const maxWidth = deviceWidths[device];

  const hasBlocks = state.blocks.length > 0;

  return (
    <div>
      {/* Device toggle */}
      <div className="btn-group btn-group-sm mb-3" role="group" aria-label="Preview device width">
        <button
          type="button"
          className={`btn btn-sm ${device === 'desktop' ? '' : 'btn-outline-secondary'}`}
          style={device === 'desktop' ? { backgroundColor: 'var(--color-text-primary)', color: 'var(--color-bg-primary)', borderColor: 'var(--color-btn-border)' } : undefined}
          onClick={() => setDevice('desktop')}
          title="Desktop"
        >
          <i className="bi bi-display" />
        </button>
        <button
          type="button"
          className={`btn btn-sm ${device === 'tablet' ? '' : 'btn-outline-secondary'}`}
          style={device === 'tablet' ? { backgroundColor: 'var(--color-text-primary)', color: 'var(--color-bg-primary)', borderColor: 'var(--color-btn-border)' } : undefined}
          onClick={() => setDevice('tablet')}
          title="Tablet (768px)"
        >
          <i className="bi bi-tablet" />
        </button>
        <button
          type="button"
          className={`btn btn-sm ${device === 'mobile' ? '' : 'btn-outline-secondary'}`}
          style={device === 'mobile' ? { backgroundColor: 'var(--color-text-primary)', color: 'var(--color-bg-primary)', borderColor: 'var(--color-btn-border)' } : undefined}
          onClick={() => setDevice('mobile')}
          title="Mobile (375px)"
        >
          <i className="bi bi-phone" />
        </button>
      </div>

      {/* Preview container */}
      <div
        className="border rounded bg-body overflow-auto"
        style={{
          maxWidth: maxWidth ? `${maxWidth}px` : undefined,
          margin: maxWidth ? '0 auto' : undefined,
          minHeight: '300px',
        }}
      >
        <ContentProvider frontmatter={contentFm}>
          {hasBlocks ? (
            state.blocks.map((block) => {
              const d = block.data;

              switch (d.type) {
                case 'hero':
                  return (
                    <div key={block.id} className="section-wrapper">
                      <HeroSection
                        title={d.title}
                        paragraphs={d.paragraphs}
                        imageSrc={d.imageSrc}
                        imageAlt={d.imageAlt}
                      />
                    </div>
                  );

                case 'overview':
                  return d.enabled ? (
                    <div key={block.id} className="section-wrapper">
                      <OverviewTable />
                    </div>
                  ) : null;

                case 'feature':
                  return (
                    <div key={block.id} className="section-wrapper">
                      <FeatureSection
                        title={d.title}
                        imageSrc={d.imageSrc}
                        imageAlt={d.imageAlt}
                        imageCaption={d.imageCaption}
                      >
                        {/* contentHtml is author-controlled editor content, not user input */}
                        <div dangerouslySetInnerHTML={{ __html: d.contentHtml }} />
                      </FeatureSection>
                    </div>
                  );

                case 'carousel':
                  return d.images.length > 0 ? (
                    <ImageCarousel
                      key={block.id}
                      id={d.carouselId}
                      images={d.images}
                    />
                  ) : null;

                case 'imageParagraph':
                  return (
                    <div key={block.id} className="section-wrapper">
                      <ImageParagraph
                        side={d.side}
                        imageSrc={d.imageSrc}
                        imageAlt={d.imageAlt}
                        imageCaption={d.imageCaption}
                      >
                        {/* contentHtml is author-controlled editor content, not user input */}
                        <div dangerouslySetInnerHTML={{ __html: d.contentHtml }} />
                      </ImageParagraph>
                    </div>
                  );

                case 'codeBlock':
                  return (
                    <div key={block.id} className="section-wrapper">
                      <CodeBlock language={d.language} code={d.code} />
                    </div>
                  );

                case 'videoEmbed':
                  return (
                    <div key={block.id} className="section-wrapper">
                      <VideoEmbed url={d.url} />
                    </div>
                  );

                case 'callout':
                  return (
                    <div key={block.id} className="section-wrapper">
                      <CalloutBox type={d.calloutType}>
                        {/* contentHtml is author-controlled editor content, not user input */}
                        <div dangerouslySetInnerHTML={{ __html: d.contentHtml }} />
                      </CalloutBox>
                    </div>
                  );

                case 'quote':
                  return (
                    <div key={block.id} className="section-wrapper">
                      <QuoteBlock quote={d.quoteText} attribution={d.attribution} />
                    </div>
                  );

                default:
                  return null;
              }
            })
          ) : (
            <p className="text-body-secondary text-center py-5">
              Add blocks in the editor to see a live preview.
            </p>
          )}
        </ContentProvider>
      </div>
    </div>
  );
}
