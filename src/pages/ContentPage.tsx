import { useParams, useLocation } from 'react-router-dom';
import { MDXProvider } from '@mdx-js/react';
import { getProjectBySlug, getBlogBySlug } from '../content';
import { ContentProvider } from '../context/ContentContext';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import HeroSection from '../components/HeroSection';
import OverviewTable from '../components/OverviewTable';
import FeatureSection from '../components/FeatureSection';
import ImageCarousel from '../components/ImageCarousel';
import ImageParagraph from '../components/ImageParagraph';
import CodeBlock from '../components/CodeBlock';
import VideoEmbed from '../components/VideoEmbed';
import CalloutBox from '../components/CalloutBox';
import QuoteBlock from '../components/QuoteBlock';
import DescList from '../components/DescList';
import BlogPostNav from '../components/BlogPostNav';
import ShareButtons from '../components/ShareButtons';
import TableOfContents from '../components/TableOfContents';
import NotFound from './NotFound';

const mdxComponents = {
  HeroSection,
  OverviewTable,
  FeatureSection,
  ImageCarousel,
  ImageParagraph,
  CodeBlock,
  VideoEmbed,
  CalloutBox,
  QuoteBlock,
  DescList,
};

export default function ContentPage() {
  const { slug } = useParams<{ slug: string }>();
  const { pathname } = useLocation();
  const isBlog = pathname.startsWith('/blog');
  const entry = slug
    ? (isBlog ? getBlogBySlug(slug) : getProjectBySlug(slug))
    : null;

  if (!entry) {
    return <NotFound />;
  }

  const { Component, frontmatter } = entry;

  const breadcrumbItems = isBlog
    ? [
        { label: 'Home', href: '/' },
        { label: 'Blog', href: '/blog' },
        { label: frontmatter.title },
      ]
    : [
        { label: 'Home', href: '/' },
        {
          label: (frontmatter.category ?? '').charAt(0).toUpperCase() + (frontmatter.category ?? '').slice(1),
          href: `/#${frontmatter.category}`,
        },
        { label: frontmatter.title },
      ];

  return (
    <ContentProvider frontmatter={frontmatter}>
      <div className="container px-4 pt-3">
        <Breadcrumbs items={breadcrumbItems} />
      </div>
      <SEO title={frontmatter.title} description={frontmatter.description} />
      <div className="container px-4">
        <TableOfContents />
      </div>
      <MDXProvider components={mdxComponents}>
        <Component />
      </MDXProvider>
      <div className="container px-4 py-3">
        <ShareButtons title={frontmatter.title} url={`https://corbinr40.com${pathname}`} />
      </div>
      {isBlog && slug && <BlogPostNav currentSlug={slug} />}
    </ContentProvider>
  );
}
