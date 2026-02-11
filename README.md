# Tekst TV

A lightweight playout application for cable TV text channels (kabelkranten). Displays slides with text, images, weather forecasts, and commercials, with a ticker bar at the bottom. Content is fetched from external APIs.

Built with Astro, React, TypeScript, and Tailwind CSS 4. Output is 1920x1080, designed for full-screen browser playback.

## Table of Contents

- [Architecture](#architecture)
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

## Slide Types

All slides are 1920x1080 pixels. Each slide has a `duration` (in milliseconds) that determines how long it is displayed.

### Text Slide
- **Type**: `text`
- Displays a title and body text with an optional sidebar image.
- Supports HTML in title and body fields.

### Image Slide
- **Type**: `image`
- Displays a full-screen image.

### Weather Slide
- **Type**: `weather`
- Shows a multi-day weather forecast with temperature color coding.
- Displays location, date, temperature range, wind info, and weather icons.

### Commercial Slides
- **Type**: `commercial` or `commercial_transition`
- Full-screen images for advertisements.
- Rendered identically to image slides.

## Ticker

A ticker bar at the bottom displays rotating messages. Messages support HTML and can include a label prefix (text before a colon is displayed in bold).

## Auto-Refresh

The app fetches new content on startup and every 5 minutes. Current slides continue playing while new content loads in the background. New slides are swapped in at the end of the current playlist cycle.

If the internet connection drops, the app continues with cached slides and ticker items. It retries fetching every 60 seconds until successful.

A meta-refresh reloads the page daily at 3 AM to prevent cache issues.

## Schema

See [SCHEMA.md](SCHEMA.md) for the complete JSON schema reference with examples for all slide types and ticker items.

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
