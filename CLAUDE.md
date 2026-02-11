# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tekst TV is a "dumb playout" application for cable TV text channels (kabelkranten). It displays slides with text, images, and weather data, plus a ticker bar at the bottom. All content is fetched from external APIs as JSON — the app only handles presentation, not content generation.

Built with: Astro + React + TypeScript + Tailwind CSS 4. Uses **bun** as package manager. Output is 1920x1080, displayed in full-screen browser.

## Commands

```bash
bun run dev       # Start Astro dev server
bun run build     # Production build
bun run preview   # Preview production build
bun run check     # Run CI checks locally (TypeScript + Biome)
bun run fix       # Auto-fix all lint/format issues
```

## Architecture

### Multi-Tenant Structure
The app serves multiple TV channels with different visual themes:
- **ZuidWest TV** (`/zuidwest-1/`, `/zuidwest-2/`): Uses `ZuidWestApp.tsx` with green/blue themes
- **Rucphen RTV** (`/rucphen/`): Uses `RucphenApp.tsx` with its own component set

### Component Composition Pattern
The main `App.tsx` is a headless carousel controller that accepts **injectable slide components**:
```
App.tsx (carousel logic)
  ├── ZuidWestApp.tsx (injects zuidwest/ components with theme)
  └── RucphenApp.tsx (injects rucphen/ components)
```

Each channel app passes its own `TextSlide`, `ImageSlide`, `WeatherSlide`, `Ticker`, and optional `Frame` components to the generic `App`.

### Key Files
- `src/types.ts` — Zod schemas for all slide types (text, image, weather, commercial)
- `src/hooks/useCarousel.ts` — Data fetching, slide timing, image preloading, View Transitions API
- `src/utils/tempColor.ts` — Temperature-to-color interpolation for weather displays
- `src/Preview.tsx` — Renders single slides from base64-encoded URL param for CMS previews

### Slide Types
All defined in `types.ts` with Zod validation:
- `text` — Title + body + optional sidebar image
- `image` — Full-screen image
- `weather` — Multi-day forecast display
- `commercial` / `commercial_transition` — Full-screen images (rendered same as image)

### Data Flow
1. Astro pages render channel-specific React apps with `client:only="react"`
2. `useCarousel` fetches slides/ticker from API on mount and every 5 minutes
3. Slides advance based on their `duration` property (milliseconds)
4. New data is staged in `nextSlides`/`nextTickerItems`, swapped in at carousel loop boundary
5. Images are preloaded via `<link rel="preload">`

### Preview System
Route: `/[channel]/preview?data={{base64}}` — decodes JSON slide data and renders at responsive scale. Used by external CMS for previewing slides before publishing.

## Code Style

- Biome for formatting and linting (not ESLint/Prettier)
- Single quotes, no semicolons
- Tailwind classes must be sorted (enforced by `useSortedClasses` rule)
- `.astro` files excluded from Biome linting
