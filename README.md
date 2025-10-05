# TekstTV / Kabelkrant

A PHP-based cable TV information display system that shows local news, weather forecasts, and advertisements on a rotating slideshow.

## Features

- **Multi-configuration support**: Run multiple instances with different settings using `?config=id`
- **Weather integration**: 5-day weather forecast from OpenWeatherMap (cached for 1 hour)
- **News content**: Pulls posts from WordPress REST API with region filtering
- **Automatic refresh**: Refreshes daily at 02:55 AM
- **Customizable branding**: Configure colors per installation

## Setup

1. Copy `config.json.example` to `config.json`
2. Update the configuration:
   - Set your OpenWeatherMap API key
   - Adjust regions for news filtering
   - Customize brand color
   - Update news API URL if needed

## Configuration

The `config.json` supports multiple configurations:

```json
{
  "default": "zwtv1",
  "configurations": {
    "zwtv1": {
      "display": {
        "brandColor": "#04C104"
      },
      "content": {
        "regio": [3, 2, 29],
        "newsApiUrl": "https://www.zuidwestupdate.nl",
        "numberOfPosts": 15
      },
      "weather": {
        "location": "Woensdrecht,NL",
        "apiKey": "YOUR_API_KEY"
      }
    }
  }
}
```

## Usage

- Default configuration: `index.php`
- Specific configuration: `index.php?config=zwtv2`

## Requirements

- PHP 7.0+
- jQuery 3.7.1 (included)

## Files

- `index.php` - Main display interface
- `content.php` - Data API endpoint (weather, news, ads)
- `slides.php` - Ticker/schedule data
- `config.json` - Configuration file