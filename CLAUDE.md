# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website built with **Svelte 5**, **Vite**, and **Three.js**. The portfolio features a 3D interactive background, project showcase with carousels, blog feed integration, and PDF thumbnails.

## Build Commands

### Development
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production (runs `prebuild` automatically)
- `npm run preview` - Preview production build locally
- `npm run prebuild` - Fetch RSS feed data (runs automatically before build)

### Build Process
The `prebuild` script fetches blog RSS data and saves it to `public/rss.json`. This runs automatically before every production build.

## Architecture

### Main Application Structure
- **Entry point**: `src/main.js` mounts the Svelte app
- **Root component**: `src/App.svelte` contains the Three.js scene and main layout
- **Component pattern**: Reusable Svelte components with TypeScript support

### Three.js Integration (src/App.svelte)
The main app component initializes a Three.js scene with:
- Skybox environment using 6 PNG textures from `public/skybox/`
- GLTF model loading (plane.glb from public/)
- OrbitControls for camera interaction
- WebGL renderer with proper color space management
- Animation loop managed via Svelte lifecycle (onMount/onDestroy)

**Important**: All Three.js resources (renderer, controls, animation frames) must be properly cleaned up in `onDestroy` to prevent memory leaks.

### Project System
Projects are defined by the `Project` type in `src/types.ts`:
```typescript
{
  slug: string;
  title: string;
  image: string;
  href?: string;           // External link
  description?: string;
  tags?: string[];
  detail?: ProjectDetailLoader;  // Lazy-loaded Svelte component
  detailProps?: Record<string, unknown>;
  html?: string;          // Raw HTML for detail view
}
```

**Detail components** are stored in `src/projects/` subdirectories. Each project can have:
1. A lazy-loaded Svelte component (`detail` property)
2. Raw HTML content (`html` property)
3. An external link only (`href` property)

Project detail components are loaded on-demand via dynamic imports when opened in `ProjectWindow.svelte`.

### Component Organization

**Display Components**:
- `BlockFrame.svelte` - Reusable container with title/background
- `Grid.svelte` - CSS Grid/Masonry layout wrapper
- `Portrait.svelte` - Profile image display
- `Presentation.svelte` - Content presentation wrapper

**Content Components**:
- `ProjectCarousel.svelte` - Swipeable project gallery with keyboard/mouse navigation
- `ProjectWindow.svelte` - Modal for displaying project details
- `BlogFeed.svelte` - RSS feed reader (supports local JSON and remote RSS via rss2json.com)
- `PDFThumb.svelte` - PDF thumbnail generator using pdfjs-dist
- `BlueSky.svelte` - Bluesky social feed integration
- `YouTube.svelte` - YouTube playlist embed
- `Socials.svelte` - Social media icon bar
- `Gist.svelte` - GitHub Gist embed

### RSS Feed System
The blog feed has two data sources:
1. **Pre-built JSON** (`public/rss.json`) - Generated during build by `scripts/fetch-rss.mjs`
2. **Live RSS URLs** - Fetched at runtime via rss2json.com API

The `fetch-rss.mjs` script contains utilities for:
- Parsing RSS/XML with `fast-xml-parser`
- Extracting images from various sources (media:content, enclosures, img tags in HTML)
- Detecting YouTube videos in feed content
- Normalizing feed data structure

**Note**: The script currently only exports utility functions. The main execution logic that fetches feeds and writes to `public/rss.json` may need to be added if modifying the build process.

### Chunk Optimization (vite.config.ts)
The build splits vendor code into specific chunks:
- `three` - Three.js library
- `pdfjs` - PDF.js library
- `icons` - FontAwesome icons
- `vendor` - Other node_modules

This improves caching and initial load performance.

## File Locations

### Source Files
- `src/` - All Svelte components and TypeScript
- `src/projects/` - Project detail components (organized by project)
- `src/assets/` - Static assets imported by components
- `src/app.css` - Global styles

### Public Files
- `public/` - Static files served as-is
- `public/skybox/` - Skybox texture images (6 PNGs)
- `public/projects/` - Project-specific assets
- `public/docs/` - Document files (PDFs, etc.)
- `public/rss.json` - Pre-built RSS feed data
- `public/plane.glb` - 3D model file

### Build Output
- `dist/` - Production build output (gitignored)

## TypeScript Configuration

The project uses:
- ESNext target with bundler module resolution
- Strict mode enabled
- Svelte and Vite types included
- `verbatimModuleSyntax` for proper module handling

## Styling Approach

Components use scoped `<style>` blocks with Svelte. Global styles are in `src/app.css`. FontAwesome icons are imported from `@fortawesome/fontawesome-free`.

## Important Patterns

### Lazy Loading
Use dynamic imports for project details to reduce initial bundle size:
```typescript
detail: () => import('./projects/example/Example.svelte')
```

### Image Handling
- Use `loading="lazy"` on images
- Provide proper alt text
- Consider using `srcset` for responsive images

### Three.js Textures
Always configure textures with:
- Proper color space (THREE.SRGBColorSpace)
- Appropriate filters (LinearMipmapLinearFilter/LinearFilter)
- Max anisotropy for quality
- Call `needsUpdate = true` after modifications
