import { describe, expect, test } from 'bun:test'
import type { SlideData, TickerItem } from '../types'
import {
  carouselReducer,
  iframeUrlsFor,
  initialCarouselState,
} from './useCarousel'

const slide: SlideData = {
  type: 'text',
  duration: 1000,
  title: 'Title',
  body: 'Body',
}

const ticker: TickerItem = { message: 'Ticker' }

const iframeSlide = (url: string): SlideData => ({
  type: 'iframe',
  duration: 1000,
  url,
})

describe('iframeUrlsFor', () => {
  test('returns distinct iframe URLs in first-occurrence playlist order', () => {
    // Playlist order matters: moving keyed iframes reloads their embeds.
    expect(
      iframeUrlsFor([
        iframeSlide('https://example.com/b'),
        slide,
        iframeSlide('https://example.com/a'),
        iframeSlide('https://example.com/b'),
      ]),
    ).toEqual(['https://example.com/b', 'https://example.com/a'])
  })

  test('returns no URLs for a playlist without iframe slides', () => {
    expect(iframeUrlsFor([slide])).toEqual([])
  })
})

describe('carousel reducer iframe warm-mount list', () => {
  test('LOAD_NEXT appends new embed URLs without moving existing ones', () => {
    const loadedState = carouselReducer(initialCarouselState, {
      type: 'LOAD_INITIAL',
      slides: [iframeSlide('https://example.com/a'), slide],
      ticker: [],
    })

    const nextState = carouselReducer(loadedState, {
      type: 'LOAD_NEXT',
      slides: [
        iframeSlide('https://example.com/b'),
        iframeSlide('https://example.com/a'),
      ],
      ticker: [],
    })

    // Warm-mount /b before the swap while /a stays put, avoiding reloads.
    expect(nextState.iframeUrls).toEqual([
      'https://example.com/a',
      'https://example.com/b',
    ])
  })

  test('LOAD_NEXT drops URLs only referenced by a superseded next set', () => {
    const loadedState = carouselReducer(initialCarouselState, {
      type: 'LOAD_INITIAL',
      slides: [iframeSlide('https://example.com/a')],
      ticker: [],
    })

    const firstNextState = carouselReducer(loadedState, {
      type: 'LOAD_NEXT',
      slides: [iframeSlide('https://example.com/b')],
      ticker: [],
    })

    const secondNextState = carouselReducer(firstNextState, {
      type: 'LOAD_NEXT',
      slides: [iframeSlide('https://example.com/c')],
      ticker: [],
    })

    // Drop unshown superseded /b immediately; keep current /a in place.
    expect(secondNextState.iframeUrls).toEqual([
      'https://example.com/a',
      'https://example.com/c',
    ])
  })

  test('TICK prunes dropped embed URLs at the slide-set swap boundary', () => {
    const loadedState = carouselReducer(initialCarouselState, {
      type: 'LOAD_INITIAL',
      slides: [iframeSlide('https://example.com/a')],
      ticker: [],
    })

    const nextState = carouselReducer(loadedState, {
      type: 'LOAD_NEXT',
      slides: [iframeSlide('https://example.com/b')],
      ticker: [],
    })
    expect(nextState.iframeUrls).toEqual([
      'https://example.com/a',
      'https://example.com/b',
    ])

    const swappedState = carouselReducer(nextState, { type: 'TICK' })
    expect(swappedState.slides).toEqual([iframeSlide('https://example.com/b')])
    expect(swappedState.iframeUrls).toEqual(['https://example.com/b'])
  })
})

describe('carousel reducer initial retry behavior', () => {
  test('LOAD_NEXT does not make slides visible from an empty carousel', () => {
    const nextState = carouselReducer(initialCarouselState, {
      type: 'LOAD_NEXT',
      slides: [slide],
      ticker: [ticker],
    })

    expect(nextState.slides).toEqual([])
    expect(nextState.nextSlides).toEqual([slide])

    const tickedState = carouselReducer(nextState, { type: 'TICK' })

    expect(tickedState.slides).toEqual([])
    expect(tickedState.nextSlides).toEqual([slide])
  })

  test('LOAD_INITIAL replaces an initial error with visible slides', () => {
    const errorState = carouselReducer(initialCarouselState, {
      type: 'LOAD_ERROR',
      message: 'Unable to fetch feed',
    })

    const loadedState = carouselReducer(errorState, {
      type: 'LOAD_INITIAL',
      slides: [slide],
      ticker: [ticker],
    })

    expect(loadedState.error).toBeNull()
    expect(loadedState.slides).toEqual([slide])
    expect(loadedState.nextSlides).toEqual([])
    expect(loadedState.tickerItems).toEqual([ticker])
  })
})
