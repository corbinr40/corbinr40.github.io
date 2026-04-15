import type { ComponentType } from 'react';
import type { ContentFrontmatter } from '../context/ContentContext';

interface ContentModule {
  default: ComponentType;
  frontmatter: ContentFrontmatter;
}

// Eagerly import all MDX modules at build time
const projectModules = import.meta.glob<ContentModule>('./projects/*.mdx', { eager: true });
const blogModules = import.meta.glob<ContentModule>('./blog/*.mdx', { eager: true });

function extractSlug(path: string): string {
  const filename = path.split('/').pop() ?? '';
  return filename.replace(/\.mdx$/, '');
}

function buildEntries(modules: Record<string, ContentModule>) {
  return Object.entries(modules).map(([path, mod]) => ({
    slug: extractSlug(path),
    frontmatter: mod.frontmatter,
    Component: mod.default,
  }));
}

export const projectEntries = buildEntries(projectModules);
export const blogEntries = buildEntries(blogModules);

export function getProjectBySlug(slug: string) {
  return projectEntries.find((e) => e.slug === slug) ?? null;
}

export function getBlogBySlug(slug: string) {
  return blogEntries.find((e) => e.slug === slug) ?? null;
}

// Backwards-compatible Project type for Home.tsx and ProjectSection
export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  devTypes: string[];
  skills: string[];
  image?: string;
  href?: string;
  externalLink?: boolean;
  status: string;
  type?: string;
  duration?: string;
  software?: string;
  languages?: string;
  availableOn?: string | { label: string; href?: string };
  visible: boolean;
}

// Static entries for projects that don't have detail pages (external links, hidden, no content yet)
const staticProjects: Project[] = [
  {
    id: 'github',
    title: 'GitHub',
    description: "All of my personal projects codes are stored on my GitHub account. On this page you can see how my programs have been made, and add any additions you seem necessary.",
    category: 'programs',
    devTypes: ['extLink'],
    skills: [],
    image: '/unsplash-photo-1.jpg',
    href: 'https://github.com/corbinr40',
    externalLink: true,
    status: 'ongoing',
    visible: true,
  },
  {
    id: 'itchio',
    title: 'Itch.io',
    description: "Want to try out any of the games I've made? Chances are they will be on my Itch.io page. Click the button below to be directed to my custom Itch.io page!",
    category: 'games',
    devTypes: ['extLink'],
    skills: [],
    image: '/unsplash-photo-1.jpg',
    href: 'https://corbinr40.itch.io',
    externalLink: true,
    status: 'ongoing',
    visible: true,
  },
  {
    id: 'liminalspace',
    title: 'Liminal Space',
    description: "Made for Brackeys Game Jam 2022.1 week long jam. The theme was \u201CThis is not real\u201D. A game where you\u2019ve woken in an old school with a creature lurking\u2026 somewhere. Created using Unreal Engine 4 and their Blueprints.",
    category: 'games',
    devTypes: ['jam', 'personal'],
    skills: ['ue'],
    image: '/unsplash-photo-2.jpg',
    status: 'completed',
    visible: true,
  },
  {
    id: 'shoppervr',
    title: 'Shopper - VR',
    description: 'A casual shopping experience on the Meta Quest. Pick up your weekly shop by going through a virtual environment. Built using Unity Android SDK for Meta Quest 2.',
    category: 'games',
    devTypes: ['personal'],
    skills: ['unity', 'csharp'],
    image: '/unsplash-photo-3.jpg',
    status: 'coming-soon',
    visible: false,
  },
  {
    id: 'trainloop',
    title: 'Train Loop',
    description: "Stuck in a constant loop on a train that's destined to not make its final stop. Talk to passengers to find information and uncover the mystery. Created using Unreal Engine 5.",
    category: 'games',
    devTypes: ['personal'],
    skills: ['ue'],
    image: '/unsplash-photo-2.jpg',
    status: 'coming-soon',
    visible: false,
  },
  {
    id: 'wordbattleroyale',
    title: 'Word Battle Royale',
    description: 'A Game Jam submission where up to 9 players compete in a touch typing battle royale. The theme was "Genre Mash". Created using Unity and C#.',
    category: 'games',
    devTypes: ['jam', 'personal'],
    skills: ['unity', 'csharp'],
    image: '/unsplash-photo-2.jpg',
    status: 'coming-soon',
    visible: false,
  },
  {
    id: 'sketchfab',
    title: 'SketchFab',
    description: 'View all of my 3D models on Sketchfab.',
    category: '3dprojects',
    devTypes: ['extLink'],
    skills: [],
    image: '/unsplash-photo-1.jpg',
    href: 'https://sketchfab.com/corbinr40',
    externalLink: true,
    status: 'ongoing',
    visible: false,
  },
  {
    id: 'bobsburgers',
    title: "Bob's Burgers",
    description: "The restaurant from Fox's animated sitcom Bob's Burgers. Created in Blender and textured using the Adobe Substance Suite.",
    category: '3dprojects',
    devTypes: ['personal'],
    skills: ['blender', 'substance'],
    image: '/unsplash-photo-2.jpg',
    status: 'completed',
    visible: false,
  },
  {
    id: 'moestavern',
    title: "Moe's Tavern",
    description: "The local tavern of Springfield from The Simpsons. Created in Blender and rendered using Blender Cycles.",
    category: '3dprojects',
    devTypes: ['personal'],
    skills: ['blender'],
    image: '/unsplash-photo-3.jpg',
    status: 'completed',
    visible: false,
  },
  {
    id: 'crimescene',
    title: 'Crime Scene',
    description: 'A house being barriered off from the rest of the street. Created in Blender and rendered in Unreal Engine.',
    category: '3dprojects',
    devTypes: ['personal'],
    skills: ['blender', 'ue'],
    image: '/unsplash-photo-2.jpg',
    status: 'coming-soon',
    visible: false,
  },
  {
    id: 'detectivesoffice',
    title: "Detective's Office",
    description: "A noir style detective's office. Created in Blender and rendered using Unreal Engine.",
    category: '3dprojects',
    devTypes: ['personal'],
    skills: ['blender', 'ue'],
    image: '/unsplash-photo-2.jpg',
    status: 'coming-soon',
    visible: false,
  },
];

export const projects: Project[] = [
  ...projectEntries.map((e) => {
    const fm = e.frontmatter;
    return {
      id: fm.id,
      title: fm.title,
      description: fm.description,
      category: fm.category ?? '',
      devTypes: fm.devTypes ?? [],
      skills: fm.skills ?? [],
      image: fm.image,
      href: `/projects/${fm.category}/${e.slug}`,
      externalLink: false,
      status: fm.status ?? 'coming-soon',
      type: fm.type,
      duration: fm.duration,
      software: fm.software,
      languages: fm.languages,
      availableOn: fm.availableOn,
      visible: fm.visible ?? true,
    };
  }),
  ...staticProjects,
];

export const skillsets = [
  { title: 'Languages', skills: ['Python', 'C#', 'C++', 'Java', 'HTML', 'CSS', 'JavaScript', 'OpenCV'] },
  { title: 'Frameworks', skills: ['React Native (JS and TS)', 'Flutter (Dart)'] },
  { title: 'Programs', skills: ['Blender', "Adobe's Substance Suite (Painter, Designer and Sampler)", 'Krita', 'ProCreate'] },
  { title: 'Services', skills: ['AWS', 'Azure'] },
  { title: 'Database', skills: ['MySQL', 'SQLite'] },
  { title: 'Operating Systems', skills: ['Windows', 'MacOS', 'Linux'] },
  { title: 'Game Engines', skills: ['Unity', 'Unreal Engine'] },
  { title: "IDE's", skills: ['Android Studio', 'Visual Studio', 'Visual Studio Code', 'Eclipse', 'Xcode'] },
];
