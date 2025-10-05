# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a PHP-based cable TV information display system (Kabelkrant/TekstTV) that shows news, weather, and other information slides. The system fetches content from external sources and displays it in a web-based slideshow format.

## Common Development Commands

### Code Quality
```bash
# Run PHP CodeSniffer (checks PSR-12 compliance)
vendor/bin/phpcs

# Run PHPStan static analysis
vendor/bin/phpstan analyse

# Install dependencies
composer install
```

### Testing the Application
```bash
# Start a local PHP server to test the application
php -S localhost:8000

# Then access:
# Main display: http://localhost:8000/index.php
# Slide overview: http://localhost:8000/slides.php
```

### Weather Data Update
```bash
# Update weather data manually
php weather.php
```

## Architecture

### Core Components

1. **index.php**: Main display interface with auto-refresh mechanism
   - Calculates refresh timing (refreshes at 02:55 AM daily)
   - Renders the cable TV display layout with CSS styling
   - Handles slideshow presentation with jQuery

2. **content.php**: Content aggregation and processing
   - Fetches news from ZuidwestUpdate.nl
   - Processes weather data from OpenWeatherMap API
   - Generates formatted HTML content for various slide types
   - Returns JSON data structure with all slides

3. **slides.php**: Administrative interface
   - Lists all available slides with type and title
   - Provides links to preview individual slides

4. **weather.php**: Weather data fetcher
   - Retrieves 5-day forecast from OpenWeatherMap
   - Implements retry logic (up to 300 attempts with 10-second intervals)
   - Caches data in weather.json

### Data Flow

1. Weather data: OpenWeatherMap API → weather.php → weather.json → content.php
2. News content: ZuidwestUpdate.nl RSS → content.php
3. Display: content.php → index.php (via AJAX) → Browser display

### Slide Types

The system supports multiple slide types:
- Weather forecasts (5-day view)
- News articles from RSS feeds
- Image slides with advertisements
- Standard text content slides

### External Dependencies

- **OpenWeatherMap API**: Weather data (API key included in weather.php:4)
- **ZuidwestUpdate.nl**: News RSS feed
- **jQuery 1.6.1**: Frontend slideshow functionality

## Development Notes

- The system uses legacy jQuery (1.6.1) for slideshow functionality
- PHP error reporting is configured differently for development vs production in content.php
- The display viewport is optimized for 1920x1080 resolution
- Auto-refresh mechanism ensures fresh content daily