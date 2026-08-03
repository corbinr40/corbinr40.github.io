# MDX Content System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hardcoded project pages with an MDX-based content system where adding a project or blog post means creating a single `.mdx` file.

**Architecture:** MDX files with YAML frontmatter live in `src/content/`. Vite compiles them at build time via `@mdx-js/rollup`. A content registry (`src/content/index.ts`) uses `import.meta.glob` to auto-discover all content files and export metadata arrays. A single dynamic route renders content by slug lookup.

**Tech Stack:** `@mdx-js/rollup`, `@mdx-js/react`, `remark-frontmatter`, `remark-mdx-frontmatter`, Vite, React Router v7

---

## File Structure

```
src/content/
  projects/
    rtcc.mdx                    # CREATE - RTCC project content
    diceroll.mdx                # CREATE - DiceRoll project content
    infinitediver.mdx           # CREATE - InfiniteDiver project content
    letsplay.mdx                # CREATE - LetsPlay project content
    scraper.mdx                 # CREATE - Scraper project content
  blog/                         # CREATE - empty dir for future blog posts
  index.ts                      # CREATE - content registry (import.meta.glob)
src/context/
  ContentContext.tsx             # CREATE - React context for passing frontmatter to OverviewTable
src/pages/
  ContentPage.tsx               # CREATE - generic MDX renderer
  BlogList.tsx                  # CREATE - blog listing page
src/components/
  OverviewTable.tsx             # MODIFY - add context-based rendering
src/App.tsx                     # MODIFY - replace hardcoded routes with dynamic routes
src/pages/Home.tsx              # MODIFY - import from content registry instead of projects.ts
vite.config.ts                  # MODIFY - add MDX plugin
vite-env.d.ts                   # MODIFY - add .mdx type declarations
```

Files to DELETE after migration is verified:
- `src/pages/projects/RTCC.tsx`
- `src/pages/projects/DiceRoll.tsx`
- `src/pages/projects/InfiniteDiver.tsx`
- `src/pages/projects/LetsPlay.tsx`
- `src/pages/projects/Scraper.tsx`
- `src/data/projects.ts`

---

### Task 1: Install MDX Dependencies

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Modify: `vite-env.d.ts`

- [ ] **Step 1: Install packages**

```bash
npm install @mdx-js/rollup @mdx-js/react remark-frontmatter remark-mdx-frontmatter
```

- [ ] **Step 2: Configure Vite MDX plugin**

Edit `vite.config.ts` to:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'

export default defineConfig({
  plugins: [
    mdx({
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
    }),
    react(),
  ],
  base: '/',
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function'],
      },
    },
  },
})
```

Note: The `mdx()` plugin MUST come before `react()` in the plugins array so `.mdx` files are processed before the React transform.

- [ ] **Step 3: Add TypeScript declarations for .mdx files**

Edit `vite-env.d.ts` to:

```ts
/// <reference types="vite/client" />

declare module '*.mdx' {
  import type { ComponentType } from 'react';
  export const frontmatter: Record<string, unknown>;
  const MDXComponent: ComponentType;
  export default MDXComponent;
}
```

- [ ] **Step 4: Verify the build still works**

```bash
npm run build
```

Expected: Build succeeds with no errors (no MDX files exist yet, so the plugin has nothing to process).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vite.config.ts vite-env.d.ts
git commit -m "feat: add MDX build tooling for content system"
```

---

### Task 2: Create Content Context and Update OverviewTable

**Files:**
- Create: `src/context/ContentContext.tsx`
- Modify: `src/components/OverviewTable.tsx`

- [ ] **Step 1: Create ContentContext**

Create `src/context/ContentContext.tsx`:

```tsx
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
```

- [ ] **Step 2: Update OverviewTable to support context-based rendering**

Edit `src/components/OverviewTable.tsx`. The component should work both ways: with explicit props (existing usage) AND by reading from context (MDX usage). Replace the entire file with:

```tsx
import { useContentFrontmatter } from '../context/ContentContext';

interface OverviewTableProps {
  status?: string;
  type?: string;
  duration?: string;
  software?: string;
  languages?: string;
  availableOn?: string | { label: string; href?: string };
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="d-flex justify-content-between py-2 border-bottom">
      <span className="fw-bold">{label}</span>
      <span>{children}</span>
    </div>
  );
}

export default function OverviewTable(props: OverviewTableProps) {
  const ctx = useContentFrontmatter();

  const status = props.status ?? ctx?.status ?? '';
  const type = props.type ?? ctx?.type ?? '';
  const duration = props.duration ?? ctx?.duration ?? '';
  const software = props.software ?? ctx?.software ?? '';
  const languages = props.languages ?? ctx?.languages ?? '';
  const availableOn = props.availableOn ?? ctx?.availableOn ?? '';

  const availableContent =
    typeof availableOn === 'string' ? (
      availableOn
    ) : availableOn.href ? (
      <a href={availableOn.href} target="_blank" rel="noopener noreferrer">
        {availableOn.label}
      </a>
    ) : (
      availableOn.label
    );

  return (
    <div className="col-lg-6 mx-auto my-4">
      <Row label="Status">{status}</Row>
      <Row label="Type">{type}</Row>
      <Row label="Duration">{duration}</Row>
      <Row label="Software">{software}</Row>
      <Row label="Languages">{languages}</Row>
      <Row label="Available On">{availableContent}</Row>
    </div>
  );
}
```

- [ ] **Step 3: Verify existing pages still render correctly**

```bash
npm run dev
```

Open `http://localhost:5173/projects/programs/rtcc` in a browser. The OverviewTable should render exactly as before since it falls back to props when context is null.

- [ ] **Step 4: Commit**

```bash
git add src/context/ContentContext.tsx src/components/OverviewTable.tsx
git commit -m "feat: add ContentContext and update OverviewTable for MDX support"
```

---

### Task 3: Create Content Registry

**Files:**
- Create: `src/content/index.ts`

- [ ] **Step 1: Create the content registry**

Create `src/content/index.ts`:

```ts
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

export function getContentBySlug(slug: string) {
  return (
    projectEntries.find((e) => e.slug === slug) ??
    blogEntries.find((e) => e.slug === slug) ??
    null
  );
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

export const projects: Project[] = projectEntries
  .map((e) => {
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
  });
```

- [ ] **Step 2: Commit**

```bash
git add src/content/index.ts
git commit -m "feat: add content registry with import.meta.glob"
```

---

### Task 4: Create ContentPage Renderer

**Files:**
- Create: `src/pages/ContentPage.tsx`

- [ ] **Step 1: Create the generic MDX page renderer**

Create `src/pages/ContentPage.tsx`:

```tsx
import { useParams } from 'react-router-dom';
import { MDXProvider } from '@mdx-js/react';
import { getContentBySlug } from '../content';
import { ContentProvider } from '../context/ContentContext';
import SEO from '../components/SEO';
import HeroSection from '../components/HeroSection';
import OverviewTable from '../components/OverviewTable';
import FeatureSection from '../components/FeatureSection';
import ImageCarousel from '../components/ImageCarousel';
import NotFound from './NotFound';

const mdxComponents = {
  HeroSection,
  OverviewTable,
  FeatureSection,
  ImageCarousel,
  // Wrap sections in section-wrapper divs to match existing styling
  wrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
};

export default function ContentPage() {
  const { slug } = useParams<{ slug: string }>();
  const entry = slug ? getContentBySlug(slug) : null;

  if (!entry) {
    return <NotFound />;
  }

  const { Component, frontmatter } = entry;

  return (
    <ContentProvider frontmatter={frontmatter}>
      <SEO title={frontmatter.title} description={frontmatter.description} />
      <MDXProvider components={mdxComponents}>
        <Component />
      </MDXProvider>
    </ContentProvider>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/ContentPage.tsx
git commit -m "feat: add ContentPage generic MDX renderer"
```

---

### Task 5: Convert DiceRoll (simplest page, proves the system works)

**Files:**
- Create: `src/content/projects/diceroll.mdx`

- [ ] **Step 1: Create the MDX file**

Create directory and file `src/content/projects/diceroll.mdx`:

```mdx
---
id: "diceroll"
title: "Dice Roll"
description: "Dice. Maths. Rolling. What more could you want? Here is a casual game where you have to equal a randomly chosen number using the sum of a dice roll. Created using Unity and C# for Android and iOS devices."
category: "games"
devTypes:
  - "personal"
skills:
  - "unity"
  - "csharp"
image: "/unsplash-photo-2.jpg"
status: "ongoing"
type: "Personal/Game"
duration: "~3 Months"
software: "Unity, Xcode"
languages: "C#"
availableOn: "Coming soon to App Store\u00AE and Google Play"
contentType: "project"
visible: true
---

<div className="section-wrapper">
  <HeroSection
    title="Dice Roll"
    paragraphs={["Dice. Maths. Rolling. What more could you want? Here is a casual game where you have to equal a randomly chosen number using the sum of a dice roll. Created using Unity and C# for Android and iOS devices."]}
  />
</div>

<div className="section-wrapper">
  <OverviewTable />
</div>

<div className="section-wrapper">
  <FeatureSection title="Features">
    <p>A Unity-powered mobile game built for both Android and iOS.</p>
    <ul>
      <li>Match a randomly generated target number by rolling dice</li>
      <li>Simple and addictive casual gameplay</li>
      <li>Share your high scores with friends</li>
    </ul>
  </FeatureSection>
</div>
```

- [ ] **Step 2: Add a temporary test route in App.tsx**

Add this import and route to `src/App.tsx` to test alongside existing pages:

Add import at top:
```tsx
import ContentPage from './pages/ContentPage';
```

Add route inside the `<Route element={<Layout />}>` block, before the `*` catch-all:
```tsx
<Route path="/content/:category/:slug" element={<ContentPage />} />
```

- [ ] **Step 3: Test in browser**

```bash
npm run dev
```

Open `http://localhost:5173/content/games/diceroll`. Compare side-by-side with `http://localhost:5173/projects/games/diceroll`. They should look identical: same HeroSection, same OverviewTable values, same Features list.

- [ ] **Step 4: Verify build succeeds**

```bash
npm run build
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add src/content/projects/diceroll.mdx src/App.tsx
git commit -m "feat: convert DiceRoll to MDX and add content test route"
```

---

### Task 6: Convert Remaining Simple Projects

**Files:**
- Create: `src/content/projects/infinitediver.mdx`
- Create: `src/content/projects/letsplay.mdx`
- Create: `src/content/projects/scraper.mdx`

- [ ] **Step 1: Create infinitediver.mdx**

Create `src/content/projects/infinitediver.mdx`:

```mdx
---
id: "infinitediver"
title: "Infinite Diver"
description: "Made for Junior Developers\u2019 week long Game Jam. With the theme being \u201CUnderwater\u201D, a diving game was made. Was it good? No. Did I have fun and learn a load? Yes. Would I do it again? Yes, but better! Created using Unity and C#."
category: "games"
devTypes:
  - "jam"
  - "personal"
skills:
  - "unity"
  - "csharp"
image: "/unsplash-photo-2.jpg"
status: "completed"
type: "Game Jam"
duration: "1 Week"
software: "Unity"
languages: "C#"
availableOn: "Itch.io"
contentType: "project"
visible: true
---

<div className="section-wrapper">
  <HeroSection
    title="Infinite Diver"
    paragraphs={["Made for Junior Developers\u2019 week long Game Jam. With the theme being \u201CUnderwater\u201D, a diving game was made. Was it good? No. Did I have fun and learn a load? Yes. Would I do it again? Yes, but better! Created using Unity and C#."]}
  />
</div>

<div className="section-wrapper">
  <OverviewTable />
</div>

<div className="section-wrapper">
  <FeatureSection title="Features">
    <p>An endless scroller diving game built in a single week for a Game Jam.</p>
    <ul>
      <li>Dive deeper and deeper in an endless underwater environment</li>
      <li>In-game shop to spend collected currency</li>
      <li>10 upgrade levels to improve your diver</li>
    </ul>
  </FeatureSection>
</div>
```

- [ ] **Step 2: Create letsplay.mdx**

Create `src/content/projects/letsplay.mdx`:

```mdx
---
id: "letsplay"
title: "Lets Play"
description: "Mobile and Web App to help users find what games are available on what platforms, subscription services, and their prices all in one place. Developed using Native."
category: "programs"
devTypes:
  - "personal"
skills:
  - "react"
  - "ts"
image: "/unsplash-photo-2.jpg"
status: "ongoing"
type: "Application/Personal"
duration: "~2 months"
software: "Visual Studio Code"
languages: "React Native, Type Script"
availableOn: "Coming soon to App Store\u00AE and Google Play"
contentType: "project"
visible: true
---

<div className="section-wrapper">
  <HeroSection
    title="Lets Play"
    paragraphs={["Mobile and Web App to help users find what games are available on what platforms, subscription services, and their prices all in one place. Developed using React Native."]}
  />
</div>

<div className="section-wrapper">
  <OverviewTable />
</div>

<div className="section-wrapper">
  <FeatureSection title="Features">
    <p>Data is collected from the Xbox and PlayStation stores to provide up-to-date information on available games.</p>
    <ul>
      <li>Search for games across multiple platforms</li>
      <li>View prices and availability at a glance</li>
      <li>Filter by platform, price, and subscription service</li>
    </ul>
  </FeatureSection>
</div>
```

- [ ] **Step 3: Create scraper.mdx**

Create `src/content/projects/scraper.mdx`:

```mdx
---
id: "scraper"
title: "PS and Xbox Web Scraper"
description: "A Python 3 program using selenium to extract game information (Name, Price, Description and Image) from both the Xbox and PlayStation Store."
category: "programs"
devTypes:
  - "personal"
skills:
  - "python"
  - "selenium"
image: "/unsplash-photo-2.jpg"
status: "ongoing"
type: "Personal/Script"
duration: "~2 months"
software: "Python IDE, Selenium"
languages: "Python"
availableOn: "GitHub"
contentType: "project"
visible: true
---

<div className="section-wrapper">
  <HeroSection
    title="PlayStation Xbox Scraper"
    paragraphs={["A Python 3 program using Selenium to extract game information (Name, Price, Description and Image) from both the Xbox and PlayStation Store."]}
  />
</div>

<div className="section-wrapper">
  <OverviewTable />
</div>

<div className="section-wrapper">
  <FeatureSection title="Features">
    <p>A custom-built web scraper that collects game data from multiple storefronts.</p>
    <ul>
      <li>Scrapes game info from both Xbox and PlayStation stores</li>
      <li>Supports multi-platform data collection in a single run</li>
      <li>Exports data from CSV to a TypeScript database for use in other projects</li>
    </ul>
  </FeatureSection>
</div>
```

- [ ] **Step 4: Test all simple pages**

```bash
npm run dev
```

Open each in the browser and compare with the original:
- `http://localhost:5173/content/games/infinitediver` vs `/projects/games/infinitediver`
- `http://localhost:5173/content/programs/letsplay` vs `/projects/programs/letsplay`
- `http://localhost:5173/content/programs/scraper` vs `/projects/programs/scraper`

All should render identically.

- [ ] **Step 5: Commit**

```bash
git add src/content/projects/infinitediver.mdx src/content/projects/letsplay.mdx src/content/projects/scraper.mdx
git commit -m "feat: convert InfiniteDiver, LetsPlay, and Scraper to MDX"
```

---

### Task 7: Convert RTCC (Complex Page)

**Files:**
- Create: `src/content/projects/rtcc.mdx`

This is the most complex conversion — 710 lines of TSX with 7 FeatureSections, 2 ImageCarousels, rich HTML content, and embedded figures.

- [ ] **Step 1: Create rtcc.mdx**

Create `src/content/projects/rtcc.mdx`:

```mdx
---
id: "rtcc"
title: "RTCC - Real Time Communication Captions"
description: "A piece of software that converts voice to text in a visual output, as an aid to individuals who are hard of hearing. The plan is to deliver this via a piece of hardware in the form of glasses with a heads up display."
category: "programs"
devTypes:
  - "university"
skills:
  - "python"
image: "/unsplash-photo-3.jpg"
status: "completed"
type: "University/Project"
duration: "9 Months"
software: "Visual Studio Code"
languages: "Python, OpenCV"
availableOn:
  label: "GitHub"
  href: "https://github.com/corbinr40/RTCC"
contentType: "project"
visible: true
---

export const design3DImages = [
  {
    src: '/assets/pageAssets/rtcc/Prototype1Diagram.png',
    alt: 'A whiteboard diagram of the first wearable design',
    title: 'Original Design of the Wearable',
    caption: 'A whiteboard diagram, where many product start off.',
  },
  {
    src: '/assets/pageAssets/rtcc/Prototype1Model.png',
    alt: 'A render of the first wearable design',
    title: 'Original Design 3D Rendered Model',
    caption: 'This model was rendered in Blender and was designed to keep the cables contained in the band and to rest on a persons head.',
  },
  {
    src: '/assets/pageAssets/rtcc/Prototype2Model.png',
    alt: 'A render of the second wearable design',
    title: 'Updated Design 3D Rendered Model',
    caption: 'The Second 3D rendered design, again from Blender, to look more like traditional glasses.',
  },
  {
    src: '/assets/pageAssets/rtcc/3DPrinterWhole.png',
    alt: 'An image of the Ultimaker S5 3D printer',
    title: 'Ultimaker S5 Printer',
    caption: 'This is the printer used to make the case.',
  },
  {
    src: '/assets/pageAssets/rtcc/3DPrinterNozel.jpg',
    alt: 'An image of the Ultimaker S5 printing a part of the projects case',
    title: 'An Action Shot of the Print',
    caption: 'The Ultimaker S5 printing the main housing of the model.',
  },
  {
    src: '/assets/pageAssets/rtcc/3DPrint.png',
    alt: 'The many different 3D printed parts laid on a table',
    title: 'The final parts all printed',
    caption: 'All of the final parts taken off the glass bed after the print has been completed.',
  },
];

export const hardwareModelImages = [
  {
    src: '/assets/pageAssets/rtcc/PrototypeHardwareDiagram.png',
    alt: 'Hardware Sketch of the Project',
    title: 'Hardware Sketch of the Project',
    caption: 'A hardware sketch to be followed when assembling the project created using Fritzing',
  },
  {
    src: '/assets/pageAssets/rtcc/WiredUpHardware.jpg',
    alt: 'Hardware components assembled in a 3D printed case',
    title: 'Hardware Assembled!',
    caption: 'All of the hardware, apart from the output screen, being assembled within the 3D printed case.',
  },
];

<div className="section-wrapper">
  <HeroSection
    title="Real Time Communication Captions (RTCC)"
    paragraphs={['RTCC, or Real Time Communication Captions, is a project that converts voice to text and displays them similar to subtitles. The project acts as an aid to individuals whom are hard of hearing. This Raspberry Pi powered project, written in Python, will use a camera and a custom machine learning model to track a persons face and place their words beneath them with the use of a microphone and speech to text library. All of it being housed in a custom 3D printed case.']}
    imageSrc="/assets/pageAssets/rtcc/OriginalDesign.png"
    imageAlt="Showing Off Image"
  />
</div>

<div className="section-wrapper">
  <OverviewTable />
</div>

{/* Features */}
<div className="section-wrapper">
  <FeatureSection
    title="Features"
    imageSrc="/assets/pageAssets/rtcc/3DPrint.png"
    imageAlt="3D Printed Parts"
    imageCaption="3D Printed Parts"
  >
    <p>From the start of the project, we set ourself a couple of development goals to adhere by:</p>
    <ul>
      <li>The project works completely offline</li>
      <li>Everything's powered by single device</li>
    </ul>
    <p>RTCC is broken down into 4 main areas: <b>hardware</b>, <b>audio</b>, <b>visual</b>, and <b>UI</b>. The audio component focuses on taking audio in from the user, processing it and then outputting, along with handling audio commands for system processes. The visual component will use a camera to look for a face, detect where it is and pass the data onto the UI. The UI handles all of the aspects which the user sees and interacts with. And finally, the hardware component is making sure all of the software works efficiently and cohesive with one another.</p>
  </FeatureSection>
</div>

{/* Getting Started */}
<div className="section-wrapper">
  <FeatureSection
    title="Getting Started"
    imageSrc="/assets/pageAssets/rtcc/OriginalDesign.png"
    imageAlt="Original Design of RTCC"
    imageCaption="Original Design of RTCC"
  >
    <p><i>This page is not an installation/development guide but serves as more of an overview of the development. For a complete installation guide, visit the <a href="https://github.com/corbinr40/RTCC#installation"><u>GitHub</u></a>. But, the following section will showcase a few important parts related to the development.</i></p>
    <p>There are a few dependencies for getting this project up and running. The project has been created for the Raspberry Pi Zero W 2, but can also run on Windows and Mac.</p>
    <p>The hardware used in this project:</p>
    <div className="listContainer">
      <ul className="list">
        <li><a href="https://www.raspberrypi.com/products/raspberry-pi-zero-2-w/"><u>Raspberry Pi Zero W 2</u></a></li>
        <li><a href="https://www.adafruit.com/product/3421"><u>Adafruit I2S MEMS Microphone</u></a></li>
        <li><a href="https://thepihut.com/collections/raspberry-pi-camera/products/raspberry-pi-camera-module"><u>Raspberry Pi Camera Module 2</u></a></li>
        <li><a href="https://www.waveshare.com/wiki/UPS_HAT_(C)"><u>Waveshare UPS HAT (C)</u></a></li>
        <li><a href="http://www.nvi.co.kr/gnuboard4/data/file/p1_1_4/2943682643_s9pCEKIH_LE-750A_700A.pdf"><u>Liteye Systems LE-750A</u></a></li>
      </ul>
    </div>
    <p>The main library requirements for this project are:</p>
    <div className="listContainer">
      <ul className="list">
        <li><a href="https://docs.python.org/3/library/tkinter.html"><u>Tkinter</u></a></li>
        <li><a href="https://numpy.org"><u>NumPy</u></a></li>
        <li><a href="https://pypi.org/project/opencv-python/"><u>OpenCV-Python</u></a></li>
        <li><a href="https://alphacephei.com/vosk/install"><u>VOSK</u></a></li>
        <li><a href="https://pypi.org/project/pyjokes/"><u>pyjokes</u></a> (gotta have a little bit of fun)</li>
        <li><i>For full list, visit the <a href="https://github.com/corbinr40/rtcc#required-modules"><u>GitHub</u></a></i></li>
      </ul>
    </div>
  </FeatureSection>
</div>

{/* Usage */}
<div className="section-wrapper">
  <FeatureSection
    title="Usage"
    imageSrc="/assets/pageAssets/rtcc/OriginalDesign.png"
    imageAlt="Original Design of RTCC"
    imageCaption="Original Design of RTCC"
  >
    <p><i>The entire project is intended for use with voice commands, but does have them bound to keys for debugging/use without microphone</i></p>
    <p>Much like smart assistants now, the project needs a wake word to activate/interact with the software. The word chosen was "Armadillo". This word came from the development group collaborating on a Google Docs and one member being assigned the name "Ominous Armadillos", so we named our group after that and thus the wake word.</p>
    <p>When you want to interact with the software, you need to say a command. Every command follows the same structure that most are familiar with:<br /><code>&lt;wake word&gt; &lt;state&gt; &lt;command&gt;</code><br /><i>eg: <code>armadillo activate face detection</code></i><br />or<br /><code>&lt;wake word&gt; &lt;command&gt; &lt;state&gt;</code><br /><i>eg: <code>armadillo set Font Colour to Red</code></i></p>
    <p>Full list of commands:</p>
    <div className="listContainer">
      <ul className="list">
        <li><b>face detection</b> - Activate/Deactivate face detection</li>
        <li><b>voice detection</b> - Conversation Start/Stop</li>
        <li><b>settings</b> - Show settings</li>
        <li><b>commands</b> - Show command list</li>
        <li><b>shut down</b> - Close program</li>
        <li><b>set font colour red</b> - Set font colour to Red</li>
        <li><b>set font colour green</b> - Set font colour to Green</li>
        <li><b>set font colour blue</b> - Set font colour to Blue</li>
        <li><b>set font colour white</b> - Set font colour to White</li>
        <li><b>increase font size</b> - Increase font size</li>
        <li><b>decrease font size</b> - Decrease font size</li>
      </ul>
    </div>
    <br />
    <b><u>Key combines</u></b><br />
    <b><i>All are case-sensitive</i></b><br />
    <b>System Wide</b>
    <div className="listContainer">
      <ul className="list">
        <li><kbd>o</kbd> - Activate/Deactivate face detection</li>
        <li><kbd>p</kbd> - Activate/Deactivate voice detection</li>
        <li><kbd>s</kbd> - Show settings</li>
        <li><kbd>c</kbd> - Show command list</li>
        <li><kbd>escape</kbd> - Close program</li>
      </ul>
    </div>
    <br />
    <b>Settings only</b>
    <div className="listContainer">
      <ul className="list">
        <li><kbd>P</kbd> - Set font colour to Red</li>
        <li><kbd>O</kbd> - Set font colour to Green</li>
        <li><kbd>I</kbd> - Set font colour to Blue</li>
        <li><kbd>U</kbd> - Set font colour to White</li>
        <li><kbd>+</kbd> - Increase font size</li>
        <li><kbd>-</kbd> - Decrease font size</li>
      </ul>
    </div>
  </FeatureSection>
</div>

{/* Hardware */}
<div className="section-wrapper">
  <FeatureSection title="Hardware">
    <div className="textContainer">
      <p>Sourcing the hardware was fun, but also quite challenging as this was a new venture for the entire group. As stated before, we had some requirements, so we had a vague idea of what we needed but no specifics.</p>
      <p>We wanted to keep the project to be small, self-contained and requiring a low power source. This led us to using a Raspberry Pi Zero 2 W due to its small form factor, surprising amount of power, and ease of use. Plus, I already had some experience with using a Pi and spent a lot of time in Linux.</p>
      <p>Once the brains of the operations had been decided, we had to think of other elements we required for the basics of the project to work. We needed a microphone, camera and screen/ output, the latter of which we'll go over later. Luckily for us, Raspberry Pi already had a camera module (aptly named the Raspberry Pi Camera Module) with loads of examples and documentation to boot. Following this, we researched a few different microphones to use and ended up using the Adafruit I2S MEMS Microphone.</p>
      <p>When trying to figure out how we wanted to output the application, our lecturer pointed us towards some old gadgets milling around their office. There, we were shown a tiny head mounted display which had a projector that refracted the screen to overlay what you can see.</p>
      <p>The last piece of hardware was a UPS HAT for the Raspberry Pi Zero. This served as our power source for the entire device delivering 1000mAh at 3.7V, which was enough to power the Pi, Camera, Microphone, and display.</p>
      <p>Once all the hardware had been sourced, we need a way to house it all. We toyed around with a few designs different ways we wanted the hardware to fit, but ultimately landed on a device that could clip onto an individual's current glasses, this seemed the most accessible outcome especially from this prototyping phase. This now meant we needed to design something, so we moved onto learning CAD. This wasn't overly difficult as I already had experience using Blender, so I had to convert my existing knowledge to a more realistic point of thinking. Eventually we settled on a model we were happy with and sent it off to the printer. This was the first time any of us had used a 3D printer, so we were entirely new to the types of materials and everything else that comes with that, but luckily all we had to do was supply the model. The printer was an Ultimaker S5 and we used a white PLA filament.</p>
      <ImageCarousel id="carouselCaptions3DDesign" images={design3DImages} />
      <p>Whilst the model was printing it was time to test all the hardware together. After creating some wiring diagrams, everything was fit together. The design ended up being bulkier than anticipated as the hardware wasn't ours (it was the Uni's) so we couldn't solder anything together and had to rely on connecting pins together.</p>
      <ImageCarousel id="carouselCaptionsHardwareModel" images={hardwareModelImages} />
      <p>Each element had some fun additions with them. Such as the UPS battery had the ability to see the real time power usage and current remaining power. We were able to implement this into the UI.</p>
      <p>Another would be the microphone. When testing, it couldn't pick up voices that well. So, we went hunting around and found out the microphone is mostly used for "loud sudden noises" such as a clap or beep. To overcome this, we boosted the audio capture to better hear voices. When listening back, it's very noisy and not too pleasant but that wasn't an issue as we only needed to convert the audio to text, and this worked a treat (as explained in the next section).</p>
      <figure className="text-center my-4">
        <img src="/assets/pageAssets/rtcc/AudioAlsaMixer.png" className="img-fluid border rounded-3 shadow-lg mb-4" alt="Audio Alsamixer" loading="lazy" />
        <figcaption>Audio Alsamixer</figcaption>
      </figure>
      <p>After several hours, the print was completed, and we can begin a fit test. And... I forgot to add holes for the USB, power, and SD card slot but I did remember the camera cable hole! So, after measuring a few more times and add in more holes, we now have a fully functional case.</p>
      <p>All the hardware was working perfectly together, but that was all thanks to the 3 software elements of the project: Audio, Visual and UI.</p>
    </div>
  </FeatureSection>
</div>

{/* Audio */}
<div className="section-wrapper">
  <FeatureSection title="Audio">
    <div className="textContainer">
      <p>TL;DR: Due to time constraints we weren't able to create a custom voice recognition machine learning model so we ended up using Alphacephei's VOSK Small English Model which worked a treat.</p>
      <p>Initially, we wanted our system to record the conversation, save to a .wav file format, then convert the audio file to text so the users can, at any point, go "back in time" on the conversation. Ultimately this was far too slow for our application, so we had to think of a new solution.</p>
      <p>On the hunt for a new method, we solved that and another concern we were having. We were debating on how to navigate the device (change settings, enable/disable the transcription, etc) as we wanted the device to be self-contained. We wouldn't have minded any physical interaction (button, touch pad, etc) but wanted the device to be as minimalistic as possible (which could never work considering the hardware we had). This led us to lean more towards using voice commands, like AI Personal Assistants (such as Alexa and Siri). When discussing this, the thought occurred to just use the same method to capture the conversation as to use voice commands.</p>
      <p>Our new goal was to create our own voice recognition machine learning model but due to the tight time constraints and the amount of data required to train a model of that magnitude, we ultimately made it a stretch goal of the project. With that in mind, we ensured that our code would theoretically have a "drop in, swap out" effect when it comes to using a custom ML or preexisting one. Unfortunately, we had to go with a preexisting library, but we didn't just settle on the first one which we found.</p>
      <p>To make sure our code worked; we used Google's speech recognition API (well, library). This worked as well as expected but was not good enough for us as it always required an Internet connection, plus we couldn't validate the safety and security of the data being sent off. So, we investigated offline models.</p>
      <p>We researched a few models, and tried a couple out, but they were either far too computationally heavy, especially for a Raspberry Pi, or didn't work that well within our application. The model we ultimately landed on was Alphacephei's VOSK library with their "VOSK Small EN US" model. This worked an absolute treat, and we were more than happy with how well it recognised voices and how it performed integrated in our application.</p>
    </div>
  </FeatureSection>
</div>

{/* Visual */}
<div className="section-wrapper">
  <FeatureSection title="Visual">
    <div className="textContainer">
      <p>TL;DR: The visual component is a custom Machine Learning Model trained on Flickr-Faces-HQ Dataset (by NVLabs) and further with MaskedFace-Net dataset, totalling 4500 images, using OpenCV.</p>
      <p>After researching how to train an image-based machine learning model, I settled on using OpenCV due to its ease of implementing into Python. Once I had a vague understanding of what I was doing, I set off on looking for a "face" dataset. This ended up being easier that I thought as Nvidia have already collated a library of 70,000 faces from Flickr with their Flickr-Faces-HQ Dataset, but I did not have enough storage to download their entire data set which totalled 2.56 TB, so I only got the images which was only 89.1 GB.</p>
      <p>Now the images have been obtained, I needed to label the photos to tell OpenCV what part of the images are faces and what is not. I ended up labelling roughly 3000 images over several evenings. Once labelled I thought I could move onto the fun part of training the models, but alas this was too good to be true.</p>
      <p>To not have the model training take an age and a half, I wanted to leverage the power of CUDA (as I had a 1080ti at the time). I thought this would be a relatively easy task, but boy was I wrong. Initially I was doing all of this on Windows but later moved onto Linux (Ubuntu to be specific) which worked so much better with the model training.</p>
      <p>Now everything was up and running in Ubuntu, I was able to train my first model. To make sure everything was set up correctly and the images were labelled correctly, I did a small model with a fraction of the images. This first model consisted of 700 positive images and 1000 negative ones. This model confirmed that everything that I had done was correct but was nowhere near perfect, requiring to ramp up the amount of training images. The next model was ramped up to 2700 positive images and 5000 negative images and everything was working perfectly!</p>
      <p>But there was an issue. After showing off the model to the rest of the team, I tried wearing a mask to use the model and nothing. The model failed as it could not detect a face where the mouth and nose were hidden, so back to the drawing board. Well, the Internet to find another dataset that included face masks. After some research, I found the MaskedFace-Net dataset which, as the name suggests, has images of people wearing face masks. Now the fun part, again, labelling all the images. This time it only took a couple of evenings as it was only 1800 images. So, with everything was labelled, it was time to do the final training of the model, and everything went off without a hitch!</p>
      <p>The final step, which will be expanded upon in the following section, was to implement to work with the UI.</p>
    </div>
  </FeatureSection>
</div>

{/* UI */}
<div className="section-wrapper">
  <FeatureSection title="UI">
    <div className="textContainer">
      <p>TL;DR: The UI is developed with Pythons preinstalled library, Tkinter. The UI consists of the main screen (with the ability to toggle the face detection and subtitles), the settings screen, and command hints.</p>
      <p>From the get-go, we knew the UI had to be clean and concise. We broke down the key elements of what screens needed to be built and how they all interacted with one another. This led to 4 main elements: displaying audio (text from a voice); face tracking; settings menu; and help menu.</p>
      <p>The bulk of the UI development stemmed from a class diagram designed quite early in the like of the project. Even though some elements slightly changed, we tried to keep everything as close to this as possible.</p>
      <p>Now that the main elements have been designed, we need to develop them. We muddled over some different UI libraries, PyQt5 and Tkinter, but ultimately settled on Tkinter as its preinstalled with Python and supports many different platforms, also the team was familiar working with Tkinter. Another reason for going with Tkinter was due to its ability to easily overlay elements on top of one another. This would drastically help with what we wanted to develop. Another reason was down to how the UI looked when contrasted against the "real world" when using the eyepiece screen. This is one of the reasons we decided to use a pure black background as elements would nicely contrast against it, making it much easier to see and read everything.</p>
      <p>The first developed screen was the main/Home Screen. This consisted of the current battery level, the current time, and indications to whether microphone and/or camera were currently active. This screen was the primary screen which all the other elements would overlay onto.</p>
      <p>The visual component worked by matching the canvas and camera resolution to the output display (640p) enabling a much closer cross over when displaying the results of the face detection model. As the eyepiece and camera weren't directly overlaying one another, we had to slightly displace the visual detection (the square representing a person's face) so it was accurate to where the person is. Once we'd perfected this, we made the square thick enough that it's noticeable but not intrusive.</p>
      <p>The next part to develop is adding the text to the screen. As we already were tracking someone's face, we just needed to add the text floating below a person's face. Simple, right? Except, the text wouldn't be remembered when the face moved, which was happening every frame (technically). So, a new approach had to be done! Nothing too technical as all we did was save the text into a variable and cleared it after each sentence. And now, everything worked fine!</p>
      <p>The last part was to add a settings menu. This was quite simple to implement as it was just a white rectangle with text on it. We just needed to make sure everything would still fit and scale depending on what resolution was being used. This made us change from absolute values to fractional based ones. When discussing what settings we wanted to include, we started listing things we liked on our own devices. These included, changing the text size, text colours and font type. So, we investigated implementing these. We managed to implement changing the text's font, size and colour and the face detectors colour and size.</p>
      <p>The last part to add was the help menu. This was relatively simple as it followed the same technique as the settings menu, except it would disappear after a certain number of seconds. Unfortunately, not much more to say about it.</p>
    </div>
  </FeatureSection>
</div>

{/* Future Development */}
<div className="section-wrapper">
  <FeatureSection title="Future Development">
    <div className="textContainer">
      <p>As fun as the project wound up to be, it wasn't all smooth sailing. There were a few ups and downs due to unforeseen circumstances, but due to the amount of planning we did before the project started, we were never lost or had to scramble to get things finished. But we did have some stretch goals for the project that we weren't able to complete but could be completed one day.</p>
      <p>As mentioned throughout, we wanted to develop our own custom speech to text machine learning model. This is more than possible but it takes a monumental about of time and data to develop something even half decent.</p>
      <p>Building on from this, it would be great have a real time conversation translator. This would, theoretically, work the exact same but would translate what a person was saying to the user to enable a conversation to take place. This translator would ideally automatically detect the language being spoken. Stemming on from this, we wanted to have a sign translation for more of the same reasons previously said.</p>
      <p>Another interesting development would be to directly tell the user through audio prompts. This would require a small speaker relaying information to the user, but it would be an entirely optional feature.</p>
      <p>The next one is something everyone wants: their program to run faster and more efficiently. There are many ways this can be achieved, but the easiest one with keeping the costs virtually the same would be to rewrite the application in C, or similar language. This would be a huge task, especially with many of us only just beginning to learn it.</p>
      <p>The final improvement would be to make the overall design much sleeker. We were very much limited with the hardware supplied to us and the time we had to develop everything. When doing research, we found there were some small scale transparent OLED displays. Using one of these, it could drastically improve performance as the Raspbian OS UI wouldn't have to be loaded for the application to run and we would directly render to the display. This would be a monumental task to pull off, but an extremely rewarding one.</p>
    </div>
  </FeatureSection>
</div>
```

- [ ] **Step 2: Test RTCC MDX page**

```bash
npm run dev
```

Open `http://localhost:5173/content/programs/rtcc`. Carefully compare with `http://localhost:5173/projects/programs/rtcc`:
- HeroSection with image renders correctly
- OverviewTable shows all 6 fields with correct values
- All 7 FeatureSections render with correct titles and content
- Both ImageCarousels in the Hardware section work (click prev/next)
- The AlsaMixer figure image renders
- All links, bold text, italic text, kbd tags, code blocks render correctly
- Lists have correct formatting with listContainer/list classes

- [ ] **Step 3: Commit**

```bash
git add src/content/projects/rtcc.mdx
git commit -m "feat: convert RTCC to MDX (most complex project page)"
```

---

### Task 8: Add External Link Projects to Content Registry

The content registry currently only builds `Project` objects from MDX files. But `projects.ts` also has external link entries (GitHub, Itch.io, Sketchfab) and projects without detail pages (LiminalSpace, ShopperVR, etc.) that Home.tsx needs for card rendering. These don't have MDX pages — they're metadata-only entries.

**Files:**
- Modify: `src/content/index.ts`

- [ ] **Step 1: Add static entries for non-MDX projects**

Edit `src/content/index.ts`. After the `projects` array built from MDX entries, add the static entries that don't have detail pages. Append this after the existing `projects` export:

```ts
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
    href: '/projects/games/liminalspace',
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
```

Then update the `projects` export to merge both arrays:

```ts
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
```

Also export `skillsets` from this file (copy from `projects.ts`):

```ts
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
```

- [ ] **Step 2: Commit**

```bash
git add src/content/index.ts
git commit -m "feat: add static project entries and skillsets to content registry"
```

---

### Task 9: Switch Home.tsx to Content Registry

**Files:**
- Modify: `src/pages/Home.tsx`

- [ ] **Step 1: Update imports in Home.tsx**

Change the import from:

```tsx
import { projects, skillsets } from '../data/projects';
import type { Project } from '../data/projects';
```

To:

```tsx
import { projects, skillsets } from '../content';
import type { Project } from '../content';
```

No other changes needed — the `Project` type and `projects` array have the same shape.

- [ ] **Step 2: Test Home page**

```bash
npm run dev
```

Open `http://localhost:5173/`. Verify:
- Programs section shows GitHub header card + RTCC, LetsPlay, Scraper project cards
- Games section shows Itch.io header card + DiceRoll, InfiniteDiver project cards
- All card links, badges, descriptions match the original
- Skill Set section renders correctly

- [ ] **Step 3: Commit**

```bash
git add src/pages/Home.tsx
git commit -m "refactor: switch Home.tsx to content registry"
```

---

### Task 10: Switch to Dynamic Routing

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Replace hardcoded routes with dynamic routes**

Update `src/App.tsx` to:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Search from './pages/Search';
import PrivacyPolicy from './pages/PrivacyPolicy';
import NotFound from './pages/NotFound';
import ContentPage from './pages/ContentPage';
import { usePageTracking } from './hooks/usePageTracking';

function AppRoutes() {
  usePageTracking();
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/projects/:category/:slug" element={<ContentPage />} />
        <Route path="/blog/:slug" element={<ContentPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
```

This removes all 5 hardcoded project imports and routes, replacing them with a single dynamic route.

- [ ] **Step 2: Test all project routes**

```bash
npm run dev
```

Open each URL and verify the page renders correctly:
- `http://localhost:5173/projects/programs/rtcc`
- `http://localhost:5173/projects/programs/letsplay`
- `http://localhost:5173/projects/programs/scraper`
- `http://localhost:5173/projects/games/diceroll`
- `http://localhost:5173/projects/games/infinitediver`
- `http://localhost:5173/projects/nonexistent/fake` (should show 404)

Also verify navigation from Home page cards works (clicking a project card should navigate to the correct MDX-powered page).

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "refactor: replace hardcoded project routes with dynamic content routing"
```

---

### Task 11: Clean Up Old Files

**Files:**
- Delete: `src/pages/projects/RTCC.tsx`
- Delete: `src/pages/projects/DiceRoll.tsx`
- Delete: `src/pages/projects/InfiniteDiver.tsx`
- Delete: `src/pages/projects/LetsPlay.tsx`
- Delete: `src/pages/projects/Scraper.tsx`
- Delete: `src/data/projects.ts`

- [ ] **Step 1: Verify no other files import from the old locations**

Search for any remaining imports of the old files:

```bash
grep -r "from.*data/projects" src/ --include="*.tsx" --include="*.ts"
grep -r "from.*pages/projects/" src/ --include="*.tsx" --include="*.ts"
```

Expected: No results (Home.tsx was already switched, App.tsx no longer imports individual pages).

If any imports remain, update them before proceeding.

- [ ] **Step 2: Delete old files**

```bash
rm src/pages/projects/RTCC.tsx src/pages/projects/DiceRoll.tsx src/pages/projects/InfiniteDiver.tsx src/pages/projects/LetsPlay.tsx src/pages/projects/Scraper.tsx
rm src/data/projects.ts
```

- [ ] **Step 3: Verify build succeeds**

```bash
npm run build
```

Expected: Clean build with no errors.

- [ ] **Step 4: Final smoke test**

```bash
npm run dev
```

Click through every page: Home, each project, Search, Privacy, a non-existent URL. Everything should work.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove old hardcoded project pages and projects.ts"
```

---

### Task 12: Add Blog Support

**Files:**
- Create: `src/pages/BlogList.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create BlogList page**

Create `src/pages/BlogList.tsx`:

```tsx
import SEO from '../components/SEO';
import { blogEntries } from '../content';
import { Link } from 'react-router-dom';

export default function BlogList() {
  const visiblePosts = blogEntries.filter((e) => e.frontmatter.visible !== false);

  return (
    <>
      <SEO title="Blog" />
      <div className="container px-4 py-5">
        <h1 className="pb-2 border-bottom">Blog</h1>
        {visiblePosts.length === 0 ? (
          <p className="text-muted mt-3">No posts yet. Check back soon!</p>
        ) : (
          <div className="row row-cols-1 g-4 py-3">
            {visiblePosts.map((entry) => (
              <div className="col" key={entry.slug}>
                <Link to={`/blog/${entry.slug}`} className="text-decoration-none">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title">{entry.frontmatter.title}</h5>
                      <p className="card-text text-muted">{entry.frontmatter.description}</p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Add blog list route to App.tsx**

Add import:
```tsx
import BlogList from './pages/BlogList';
```

Add route inside the Layout route, before the `*` catch-all:
```tsx
<Route path="/blog" element={<BlogList />} />
```

- [ ] **Step 3: Create blog directory**

```bash
mkdir -p src/content/blog
```

- [ ] **Step 4: Test blog page**

```bash
npm run dev
```

Open `http://localhost:5173/blog`. Should show "No posts yet. Check back soon!" message.

- [ ] **Step 5: Verify build**

```bash
npm run build
```

Expected: Clean build.

- [ ] **Step 6: Commit**

```bash
git add src/pages/BlogList.tsx src/App.tsx
git commit -m "feat: add blog listing page and route"
```

---

## Verification Checklist

After all tasks are complete, perform a full end-to-end test:

1. **`npm run build`** — clean build, no TypeScript errors
2. **`npm run dev`** — dev server starts
3. **Home page** — all project cards render with correct data, links work
4. **RTCC page** — all 7 sections, both carousels, all rich formatting (bold, italic, kbd, code, links, lists)
5. **Simple project pages** — DiceRoll, InfiniteDiver, LetsPlay, Scraper all render correctly
6. **Blog page** — `/blog` shows empty state
7. **404** — navigating to `/projects/fake/slug` shows NotFound
8. **New content test** — create a test `.mdx` file in `src/content/projects/`, verify it appears in listings and renders at its URL without any code changes
9. **Search page** — still works (if it reads from projects data, verify it's updated)
10. **No old files remain** — `src/pages/projects/` directory and `src/data/projects.ts` are gone
