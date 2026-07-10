# Tekst TV

A lightweight playout application for cable TV text channels (kabelkranten). Displays slides with text, images, weather forecasts, and commercials, with a ticker bar at the bottom. Content is fetched from external APIs.

Built with Astro, React, TypeScript, and Tailwind CSS 4. Output is 1920x1080, designed for full-screen browser playback.

## Table of Contents

- [Architecture](#architecture)
- [Development](#development)
- [Slide Navigation](#slide-navigation)
- [Slide Types](#slide-types)
- [Ticker](#ticker)
- [Auto-Refresh](#auto-refresh)
- [Schema](#schema)
- [Previews](#previews)
- [License](#license)

## Architecture

This application is intentionally designed as a "dumb playout" system. It simply plays a playlist defined as JSON. All logic for generating the playlist resides in an external application. This makes it flexible: any CMS that generates a compatible JSON schema can supply the slides.

The app supports multiple channels with different visual themes:
- **ZuidWest TV1** (`/zuidwest-1/`) — green theme
- **ZuidWest TV2** (`/zuidwest-2/`) — blue theme
- **Rucphen RTV** (`/rucphen/`) — custom theme
- **BredaNu** (`/bredanu/`) — yellow theme

## Development

This project uses [Bun](https://bun.sh/) as its package manager and runtime.

### Commands

```bash
bun install      # Install dependencies
bun run dev      # Start development server
bun run build    # Production build
bun run preview  # Preview production build
bun run check    # Run all CI checks locally (Astro, TypeScript, tests, Biome)
bun run fix      # Auto-fix linting and formatting issues
bun run fix:unsafe  # Auto-fix including unsafe fixes (e.g. Tailwind class sorting)
```

### Slide Navigation

You can manually navigate through slides using keyboard shortcuts:

| Key | Action |
|-----|--------|
| `Space` | Pause / resume auto-advance |
| `→` | Next slide |
| `←` | Previous slide |

A small overlay in the top-right corner shows the current playback state and slide number.

In development mode (`bun run dev`), navigation is always enabled. In production, add the `?nav` query parameter to the URL to activate it.

### Feed Override

Any channel page can be pointed at an arbitrary feed via query parameters, keeping that page's theme. The app has two fetch modes:

| Parameter | Effect |
|-----------|--------|
| `?feed=<url>` | Overrides this page's feed endpoint or API prefix |
| `?channel=<slug>` | Enables channel-payload mode and fetches `<feed>?channel=<slug>` |

Pages with a built-in channel, such as `/zuidwest-1/` and `/zuidwest-2/`, use channel-payload mode by default. Their `apiBase` is the full payload endpoint and the app fetches `{ slides, ticker }` from `<feed>?channel=<slug>`.

Pages without a built-in channel, such as `/rucphen/`, use split-endpoint mode by default. Their `apiBase` is an API prefix and the app fetches slides from `<feed>/teksttv-slides` and ticker items from `<feed>/teksttv-ticker`. Adding `?channel=<slug>` to these pages switches them to channel-payload mode, so combine it with a `?feed=<url>` that points at a payload endpoint returning `{ slides, ticker }`.

Example: `/zuidwest-1/?feed=https://example.com/wp-json/teksttv/v1/slides&channel=intern`. When omitted, the page's built-in feed and channel are used. Feed URLs may include their own query string; the channel parameter is appended safely.

### Code Quality

The project uses [Biome](https://biomejs.dev/) for linting and formatting, and TypeScript for type checking.

Before committing, run `bun run check` to verify your changes pass CI. If there are issues, run `bun run fix` to auto-fix what can be fixed automatically.

### CI/CD

Two GitHub Actions workflows handle automation:

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **Quality** | Push, PR | Auto-fixes style issues, then runs `bun run check` (Astro, TypeScript, tests, Biome) |
| **Release** | Manual | Runs quality checks, builds, and creates a GitHub release |

The Release workflow only creates a new release if the version in `package.json` differs from the latest Git tag. Pre-release versions (containing `alpha`, `beta`, or `rc`) are marked accordingly.

## Slide Types

All slides are 1920x1080 pixels. Each slide has a `duration` (in milliseconds) that determines how long it is displayed.

> **Note:** The `caption` and `attribution` fields on text and image slides are rendered only by **BredaNu**. The ZuidWest and Rucphen templates ignore these fields, so they will not appear on screen there.

### Text Slide
- **Type**: `text`
- Displays a title and body text with an optional sidebar image.
- Supports HTML in title and body fields.
- The `image` field is an object with `url`, optional `caption`, and optional `attribution`.

### Image Slide
- **Type**: `image`
- Displays a full-screen image.
- Supports optional `caption` and `attribution` fields.

### Weather Slide
- **Type**: `weather`
- Shows a multi-day weather forecast with temperature color coding.
- Displays location, date, temperature range, wind info, and weather icons.

### Commercial Slides
- **Type**: `commercial` or `commercial_transition`
- Full-screen images for advertisements.
- Rendered identically to image slides.

### Iframe Slide
- **Type**: `iframe`
- Embeds an external page (e.g. a dashboard) full-screen via an `<iframe>`.
- Only rendered by themes that provide an `iframe` slide component.
- The `url` must use `http` or `https` and point to an **embeddable** page: sites that send `X-Frame-Options: DENY` or a CSP `frame-ancestors` directive will refuse to be framed.
- The renderer disables pointer interaction on iframe slides and hides inactive instances; theme components should render the frame sandboxed (e.g. `allow-scripts allow-same-origin`).
- Every distinct iframe URL in the current and upcoming playlist stays mounted (hidden while inactive), so embeds are warm before they appear and do not reload each cycle.
- Hidden iframe instances are periodically remounted to recover from transient browser or network load failures.

## Ticker

A ticker bar at the bottom displays rotating messages. Messages support HTML and can include a label prefix (text before a colon is displayed in bold).

## Auto-Refresh

The app fetches new content on startup and every 5 minutes. Fetches time out after 30 seconds. Current slides continue playing while new content loads in the background. New slides are swapped in at the end of the current playlist cycle.

If the internet connection drops, the app continues with cached slides and ticker items and keeps retrying every 5 minutes. While no slides are loaded at all (for example after a failed startup), it retries every 60 seconds and shows an error panel with the failing URL instead of content.

A meta-refresh reloads the page daily at 3 AM to prevent cache issues.

## Schema

See [`src/types.ts`](src/types.ts) for the Zod schemas defining all slide types and ticker items, and [`src/types.examples.ts`](src/types.examples.ts) for example data.

## Previews

Preview individual slides at `/{channel}/preview?data={base64}`. Encode a single slide's JSON as base64 and pass it as the `data` parameter. The preview is responsive while maintaining a 16:9 aspect ratio.

## License

This project is licensed under the Mozilla Public License 2.0 (MPL-2.0).

You may:
- Use the software for any purpose
- Modify and distribute changes
- Include it in larger projects under different licenses

If you modify files, you must:
- Make the source code of those changes available
- Publish modifications under the MPL license

See the full [LICENSE](LICENSE) for details.
