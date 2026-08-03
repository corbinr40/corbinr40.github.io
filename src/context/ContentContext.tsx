import { createContext, useContext } from 'react';

export interface ContentFrontmatter {
  id: string;
  title: string;
  description: string;
  category?: string;
  devTypes?: string[];
  skills?: string[];
  image?: string;
  status?: string;
  type?: string;
  duration?: string;
  software?: string;
  languages?: string;
  availableOn?: string | { label: string; href?: string };
  contentType: 'project' | 'blog';
  visible?: boolean;
  date?: string;
  tags?: string[];
}

const ContentContext = createContext<ContentFrontmatter | null>(null);

export function ContentProvider({
  frontmatter,
  children,
}: {
  frontmatter: ContentFrontmatter;
  children: React.ReactNode;
}) {
  return (
    <ContentContext.Provider value={frontmatter}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContentFrontmatter() {
  return useContext(ContentContext);
}
