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
    description: "Source code and smaller experiments live on my GitHub. Browse the repos, star what's useful, open an issue if something breaks.",
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
    description: "Playable builds of my game jam entries and side projects, hosted on Itch.io. Mostly free, mostly short, occasionally fun.",
    category: 'games',
    devTypes: ['extLink'],
    skills: [],
    image: '/unsplash-photo-1.jpg',
    href: 'https://corbinr40.itch.io',
    externalLink: true,
    status: 'ongoing',
    visible: false,
  },
  {
    id: 'liminalspace',
    title: 'Liminal Space',
    description: 'A one-week Brackeys Game Jam entry for the theme "This is not real". You wake up in an empty school. Something else is awake too. Built in Unreal Engine 4.',
    category: 'games',
    devTypes: ['jam', 'personal'],
    skills: ['ue'],
    image: '/unsplash-photo-2.jpg',
    status: 'completed',
    visible: false,
  },
  {
    id: 'shoppervr',
    title: 'Shopper - VR',
    description: 'Do your weekly grocery shop in VR. A casual Meta Quest 2 experience built with Unity\'s Android SDK. Less stressful than a real Tesco on a Saturday.',
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
    description: 'A narrative mystery set on a train stuck in a loop, where you piece the story together by talking to passengers. Built in Unreal Engine 5.',
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
    description: 'Up to 9 players compete in a touch-typing battle royale. A Game Jam entry for the "Genre Mash" theme, built in Unity and C#.',
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
    description: 'A gallery of my 3D work on Sketchfab. Spin them around, zoom in on the textures, judge my topology freely.',
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
    description: "The Belcher family's restaurant, recreated in 3D. Modelled in Blender, textured with Adobe Substance. A love letter to a show that refuses to get old.",
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
    description: "Springfield's favourite dive bar, built in Blender and rendered in Cycles. A study in how to make 2D animation shapes feel plausible in 3D lighting.",
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
    description: 'A suburban crime scene set behind police tape at night. Modelled in Blender, brought to life under Unreal Engine\'s real-time lighting.',
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
    description: "A noir-era detective's office with heavy shadows, stacked paperwork, and a smoking ashtray. Blender for the geometry, Unreal Engine for the mood lighting.",
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

export type SkillLevel = 'expert' | 'proficient' | 'familiar';

export interface SkillEntry {
  name: string;
  level?: SkillLevel;
}

export const skillsets: { title: string; skills: SkillEntry[] }[] = [
  { title: 'Languages', skills: [
    { name: 'Python', level: 'expert' }, { name: 'TypeScript', level: 'expert' },
    { name: 'JavaScript', level: 'expert' }, { name: 'C#', level: 'expert' },
    { name: 'C', level: 'proficient' }, { name: 'C++', level: 'proficient' },
    { name: 'Dart', level: 'proficient' }, { name: 'Java', level: 'proficient' },
    { name: 'HTML', level: 'expert' }, { name: 'CSS', level: 'expert' },
  ]},
  { title: 'Frameworks', skills: [
    { name: 'React', level: 'expert' }, { name: 'React Native', level: 'proficient' },
    { name: 'Flutter', level: 'proficient' }, { name: 'FastAPI', level: 'proficient' },
    { name: 'ESP-IDF', level: 'familiar' }, { name: 'OpenCV', level: 'familiar' },
  ]},
  { title: 'Cloud & Services', skills: [
    { name: 'AWS', level: 'familiar' }, { name: 'Azure', level: 'familiar' },
  ]},
  { title: 'Databases', skills: [
    { name: 'PostgreSQL', level: 'proficient' }, { name: 'TimescaleDB', level: 'familiar' },
    { name: 'MySQL', level: 'familiar' }, { name: 'SQLite' },
  ]},
  { title: 'Programs', skills: [
    { name: 'KiCad', level: 'familiar' },
  ]},
  { title: 'Operating Systems', skills: [
    { name: 'Windows' }, { name: 'macOS' }, { name: 'Linux' },
  ]},
  { title: 'IDEs & Tooling', skills: [
    { name: 'Visual Studio Code' }, { name: 'Visual Studio' },
    { name: 'PyCharm' }, { name: 'Android Studio', level: 'familiar' },
    { name: 'Xcode' }, { name: 'Eclipse' },
  ]},
];
