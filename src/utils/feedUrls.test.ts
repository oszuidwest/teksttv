import { describe, expect, test } from 'bun:test'
import {
  createChannelFeedUrl,
  createSplitFeedEndpointUrl,
  formatFeedUrlForDisplay,
} from './feedUrls'

const locationHref = 'https://playout.example/zuidwest-1/?nav'

describe('feed URL helpers', () => {
  test('encodes channel values instead of allowing query injection', () => {
    const url = createChannelFeedUrl(
      'https://example.com/wp-json/teksttv/v1/slides',
      'tv1&admin=1',
      locationHref,
    )

    expect(url.searchParams.get('channel')).toBe('tv1&admin=1')
    expect(url.searchParams.has('admin')).toBe(false)
    expect(url.toString()).toBe(
      'https://example.com/wp-json/teksttv/v1/slides?channel=tv1%26admin%3D1',
    )
  })

  test('preserves existing feed query parameters when adding a channel', () => {
    const url = createChannelFeedUrl(
      'https://example.com/wp-json/teksttv/v1/slides?site=5',
      'intern',
      locationHref,
    )

    expect(url.searchParams.get('site')).toBe('5')
    expect(url.searchParams.get('channel')).toBe('intern')
    expect(url.toString()).toBe(
      'https://example.com/wp-json/teksttv/v1/slides?site=5&channel=intern',
    )
  })

  test('appends split endpoints before an existing query string', () => {
    const url = createSplitFeedEndpointUrl(
      'https://cms.example/wp-json/zw/v1?site=5',
      'teksttv-slides',
      locationHref,
    )

    expect(url.toString()).toBe(
      'https://cms.example/wp-json/zw/v1/teksttv-slides?site=5',
    )
  })

  test('normalizes trailing slashes in split endpoint URLs', () => {
    const url = createSplitFeedEndpointUrl(
      'https://cms.example/wp-json/zw/v1/',
      'teksttv-ticker',
      locationHref,
    )

    expect(url.toString()).toBe(
      'https://cms.example/wp-json/zw/v1/teksttv-ticker',
    )
  })

  test('appends split endpoints to host-only bases', () => {
    const url = createSplitFeedEndpointUrl(
      'https://cms.example',
      'teksttv-slides',
      locationHref,
    )

    expect(url.toString()).toBe('https://cms.example/teksttv-slides')
  })

  test('resolves relative feed URLs against the current page', () => {
    const url = createChannelFeedUrl(
      '/wp-json/zw/v1/teksttv',
      'tv1',
      locationHref,
    )

    expect(url.toString()).toBe(
      'https://playout.example/wp-json/zw/v1/teksttv?channel=tv1',
    )
  })

  test('formats feed URLs for display without leaking credentials', () => {
    const url = new URL(
      'https://user:pass@example.com/feed?site=5&token=secret&api_key=abc#frag',
    )

    expect(formatFeedUrlForDisplay(url)).toBe(
      'https://example.com/feed?site=5&token=redacted&api_key=redacted',
    )
  })
})
