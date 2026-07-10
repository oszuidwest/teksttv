import { describe, expect, test } from 'bun:test'
import type { SlideData, TickerItem } from '../types'
import { carouselReducer, initialCarouselState } from './useCarousel'

const slide: SlideData = {
  type: 'text',
  duration: 1000,
  title: 'Title',
  body: 'Body',
}

const ticker: TickerItem = { message: 'Ticker' }

describe('carousel reducer initial retry behavior', () => {
  test('LOAD_NEXT does not make slides visible from an empty carousel', () => {
    const nextState = carouselReducer(initialCarouselState, {
      type: 'LOAD_NEXT',
      slides: [slide],
      ticker: [ticker],
      imageUrls: [],
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
      imageUrls: [],
    })

    expect(loadedState.error).toBeNull()
    expect(loadedState.slides).toEqual([slide])
    expect(loadedState.nextSlides).toEqual([])
    expect(loadedState.tickerItems).toEqual([ticker])
  })
})
