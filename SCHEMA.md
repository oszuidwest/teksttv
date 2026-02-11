# Schema Reference

This document describes the JSON schemas for slides and ticker items.

## Slide Schema

All slides require a `type` and `duration` (in milliseconds).

### Image Slide

```json
{
  "type": "image",
  "duration": 10000,
  "url": "https://example.com/image.jpg"
}
```

### Text Slide

```json
{
  "type": "text",
  "duration": 15000,
  "title": "News of the Day",
  "body": "This is a news article with <strong>HTML</strong> support.",
  "image": "https://example.com/sidebar.jpg"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Slide title (HTML supported) |
| `body` | string | Main content (HTML supported) |
| `image` | string | Optional sidebar image URL |

### Weather Slide

```json
{
  "type": "weather",
  "duration": 20000,
  "title": "Weather Forecast",
  "location": "Roosendaal",
  "days": [
    {
      "date": "2024-01-15",
      "day_short": "Mon",
      "temp_min": 5,
      "temp_max": 12,
      "weather_id": 800,
      "description": "Sunny",
      "icon": "01d",
      "wind_direction": "SW",
      "wind_beaufort": 3
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Slide title |
| `location` | string | Location name |
| `days` | array | Array of forecast days |

**Day object:**

| Field | Type | Description |
|-------|------|-------------|
| `date` | string | Date (YYYY-MM-DD) |
| `day_short` | string | Short day name (Mon, Tue, etc.) |
| `temp_min` | number | Minimum temperature (°C) |
| `temp_max` | number | Maximum temperature (°C) |
| `weather_id` | number | OpenWeatherMap weather condition ID |
| `description` | string | Weather description |
| `icon` | string | Weather icon code |
| `wind_direction` | string | Wind direction (N, NE, E, etc.) |
| `wind_beaufort` | number | Wind force (Beaufort scale) |

### Commercial Slide

```json
{
  "type": "commercial",
  "duration": 8000,
  "url": "https://example.com/ad.jpg"
}
```

### Commercial Transition Slide

```json
{
  "type": "commercial_transition",
  "duration": 2000,
  "url": "https://example.com/transition.jpg"
}
```

## Ticker Schema

```json
[
  {
    "message": "Now on air: Morning Show"
  },
  {
    "message": "Breaking: Local news update"
  }
]
```

| Field | Type | Description |
|-------|------|-------------|
| `message` | string | Ticker message (HTML supported) |

Messages with a colon (`:`) in the first 30 characters are parsed as `Label: Content`, where the label is displayed in bold with an arrow separator.

## Full Example

```json
{
  "slides": [
    {
      "type": "text",
      "duration": 15000,
      "title": "Welcome",
      "body": "Welcome to our channel!",
      "image": ""
    },
    {
      "type": "weather",
      "duration": 20000,
      "title": "Weather",
      "location": "Roosendaal",
      "days": [
        {
          "date": "2024-01-15",
          "day_short": "Mon",
          "temp_min": 5,
          "temp_max": 12,
          "weather_id": 800,
          "description": "Sunny",
          "icon": "01d",
          "wind_direction": "SW",
          "wind_beaufort": 3
        }
      ]
    },
    {
      "type": "image",
      "duration": 10000,
      "url": "https://example.com/image.jpg"
    }
  ],
  "ticker": [
    { "message": "Now on air: Morning Show" },
    { "message": "Next: News at noon" }
  ]
}
```
