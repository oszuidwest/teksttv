import { useCallback, useEffect, useMemo, useReducer } from 'react'
import type { z } from 'zod'
import type { SlideData, TickerItem } from '../types'
import { SlideDataSchema, TickerItemSchema } from '../types'
import {
  createChannelFeedUrl,
  createSplitFeedEndpointUrl,
  formatFeedUrlForDisplay,
} from '../utils/feedUrls'

const REFRESH_INTERVAL_MS = 5 * 60 * 1000
// Poll faster until the first successful load.
const INITIAL_RETRY_INTERVAL_MS = 60 * 1000
const FEED_FETCH_TIMEOUT_MS = 30_000

const urlParams = new URLSearchParams(
  typeof window === 'undefined' ? '' : window.location.search,
)

const navEnabled = import.meta.env.DEV || urlParams.has('nav')

const feedOverride = urlParams.get('feed')?.trim() || null
const channelOverride = urlParams.get('channel')?.trim() || null

export interface CarouselState {
  slides: SlideData[]
  nextSlides: SlideData[]
  currentSlide: number
  tickerItems: TickerItem[]
  nextTickerItems: TickerItem[]
  tickerIndex: number
  iframeUrls: string[]
  paused: boolean
  error: string | null
}

export type CarouselAction =
  | {
      type: 'LOAD_INITIAL'
      slides: SlideData[]
      ticker: TickerItem[]
    }
  | {
      type: 'LOAD_NEXT'
      slides: SlideData[]
      ticker: TickerItem[]
    }
  | { type: 'TICK' }
  | { type: 'NAV_PREV' }
  | { type: 'NAV_NEXT' }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'LOAD_ERROR'; message: string }

export const initialCarouselState: CarouselState = {
  slides: [],
  nextSlides: [],
  currentSlide: 0,
  tickerItems: [],
  nextTickerItems: [],
  tickerIndex: 0,
  iframeUrls: [],
  paused: false,
  error: null,
}

/**
 * Returns distinct embed URLs in playlist order; moving keyed iframes reloads
 * them.
 */
export function iframeUrlsFor(slides: SlideData[]): string[] {
  return [
    ...new Set(
      slides.flatMap((slide) => (slide.type === 'iframe' ? [slide.url] : [])),
    ),
  ]
}

function imageUrlsFor(slides: SlideData[]): string[] {
  return slides.flatMap((slide) => {
    switch (slide.type) {
      case 'text':
        return slide.image?.url ? [slide.image.url] : []
      case 'image':
      case 'commercial':
      case 'commercial_transition':
        return [slide.url]
      default:
        return []
    }
  })
}

// Pruning by filter keeps surviving entries in their existing positions.
function keepOnly(urls: string[], kept: string[]): string[] {
  const keptSet = new Set(kept)
  return urls.filter((url) => keptSet.has(url))
}

// Per-item validation at the trust boundary: one malformed entry is skipped
// (and logged) instead of rejecting the whole feed.
function getValidItems<T>(
  schema: z.ZodType<T>,
  value: unknown,
  source: string,
  kind: string,
): T[] {
  if (!Array.isArray(value)) {
    console.error(`Invalid ${kind} payload from ${source}: expected array`)
    return []
  }

  return value.flatMap((entry, index) => {
    const parsed = schema.safeParse(entry)
    if (!parsed.success) {
      console.error(
        `Skipping invalid ${kind} ${index} from ${source}`,
        parsed.error.issues,
      )
      return []
    }
    return [parsed.data]
  })
}

export function carouselReducer(
  state: CarouselState,
  action: CarouselAction,
): CarouselState {
  switch (action.type) {
    case 'LOAD_INITIAL':
      return {
        ...state,
        slides: action.slides,
        tickerItems: action.ticker,
        iframeUrls: iframeUrlsFor(action.slides),
        error: null,
      }

    case 'LOAD_NEXT': {
      const nextIframeUrls = iframeUrlsFor(action.slides)
      return {
        ...state,
        nextSlides: action.slides,
        nextTickerItems: action.ticker,
        // Upcoming embeds warm-mount before the swap. Surviving URLs keep
        // their positions; URLs only referenced by a superseded next set are
        // dropped right away instead of staying warm until the swap.
        iframeUrls: [
          ...new Set([
            ...keepOnly(state.iframeUrls, [
              ...iframeUrlsFor(state.slides),
              ...nextIframeUrls,
            ]),
            ...nextIframeUrls,
          ]),
        ],
      }
    }

    case 'TICK': {
      if (state.slides.length === 0) return state

      // Slides and ticker advance independently; each swaps in its pending
      // "next" set when its own cycle wraps around.
      const candidate = (state.currentSlide + 1) % state.slides.length
      const swapSlides = candidate === 0 && state.nextSlides.length > 0

      const slides = swapSlides ? state.nextSlides : state.slides
      const nextSlides = swapSlides ? [] : state.nextSlides
      const currentSlide = swapSlides ? 0 : candidate
      const iframeUrls = swapSlides
        ? keepOnly(state.iframeUrls, iframeUrlsFor(state.nextSlides))
        : state.iframeUrls

      let tickerItems = state.tickerItems
      let nextTickerItems = state.nextTickerItems
      let tickerIndex: number

      if (state.tickerItems.length === 0) {
        if (state.nextTickerItems.length > 0) {
          tickerItems = state.nextTickerItems
          nextTickerItems = []
        }
        tickerIndex = 0
      } else {
        const tickerCandidate =
          (state.tickerIndex + 1) % state.tickerItems.length
        if (tickerCandidate === 0 && state.nextTickerItems.length > 0) {
          tickerItems = state.nextTickerItems
          nextTickerItems = []
          tickerIndex = 0
        } else {
          tickerIndex = tickerCandidate
        }
      }

      return {
        ...state,
        slides,
        nextSlides,
        currentSlide,
        iframeUrls,
        tickerItems,
        nextTickerItems,
        tickerIndex,
      }
    }

    case 'NAV_PREV':
      if (state.slides.length === 0) return state
      return {
        ...state,
        currentSlide:
          (state.currentSlide - 1 + state.slides.length) % state.slides.length,
      }

    case 'NAV_NEXT':
      if (state.slides.length === 0) return state
      return {
        ...state,
        currentSlide: (state.currentSlide + 1) % state.slides.length,
      }

    case 'TOGGLE_PAUSE':
      return { ...state, paused: !state.paused }

    case 'LOAD_ERROR':
      return { ...state, error: action.message }
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown feed error'
}

function getFetchErrorMessage(error: unknown) {
  if (error instanceof Error && error.name === 'TimeoutError') {
    return `timed out after ${FEED_FETCH_TIMEOUT_MS / 1000} seconds`
  }

  return getErrorMessage(error)
}

async function fetchFeed(url: URL) {
  try {
    return await fetch(url, {
      signal: AbortSignal.timeout(FEED_FETCH_TIMEOUT_MS),
    })
  } catch (error) {
    throw new Error(
      `Unable to fetch ${formatFeedUrlForDisplay(url)}: ${getFetchErrorMessage(error)}`,
    )
  }
}

async function readJson(response: Response, url: URL) {
  try {
    return await response.json()
  } catch (error) {
    throw new Error(
      `Unable to parse JSON from ${formatFeedUrlForDisplay(url)}: ${getErrorMessage(error)}`,
    )
  }
}

export function useCarousel({
  apiBase: apiBaseProp,
  channel: channelProp,
}: {
  apiBase: string
  channel?: string
}) {
  const [state, dispatch] = useReducer(carouselReducer, initialCarouselState)

  const fetchData = useCallback(
    async (isInitialLoad: boolean) => {
      // Channel mode expects apiBase to be a complete payload endpoint. Without
      // a channel, apiBase is a prefix for the split slides/ticker endpoints.
      const apiBase = feedOverride ?? apiBaseProp
      const channel = channelOverride ?? channelProp
      try {
        let slidesData: unknown
        let tickerData: unknown
        let slidesSourceUrl: URL

        if (channel) {
          const url = createChannelFeedUrl(apiBase, channel)
          slidesSourceUrl = url
          const response = await fetchFeed(url)
          if (!response.ok) {
            throw new Error(
              `Unable to fetch channel feed ${formatFeedUrlForDisplay(url)} (status ${response.status})`,
            )
          }
          const data = (await readJson(response, url)) as {
            slides?: unknown
            ticker?: unknown
          }
          slidesData = data.slides
          tickerData = data.ticker
        } else {
          const slidesUrl = createSplitFeedEndpointUrl(
            apiBase,
            'teksttv-slides',
          )
          const tickerUrl = createSplitFeedEndpointUrl(
            apiBase,
            'teksttv-ticker',
          )
          slidesSourceUrl = slidesUrl
          const [slidesResponse, tickerResponse] = await Promise.all([
            fetchFeed(slidesUrl),
            fetchFeed(tickerUrl),
          ])
          if (!slidesResponse.ok || !tickerResponse.ok) {
            throw new Error(
              `Unable to fetch feed (slides ${slidesResponse.status} from ${formatFeedUrlForDisplay(slidesUrl)}, ticker ${tickerResponse.status} from ${formatFeedUrlForDisplay(tickerUrl)})`,
            )
          }
          const [rawSlidesData, rawTickerData] = await Promise.all([
            readJson(slidesResponse, slidesUrl),
            readJson(tickerResponse, tickerUrl),
          ])
          slidesData = rawSlidesData
          tickerData = rawTickerData
        }

        const source = channel ? `channel ${channel}` : 'feed'
        const newSlides = getValidItems(
          SlideDataSchema,
          slidesData,
          source,
          'slide',
        )
        const newTickerItems = getValidItems(
          TickerItemSchema,
          tickerData,
          source,
          'ticker item',
        )

        if (newSlides.length === 0) {
          throw new Error(
            `Feed returned no valid slides from ${formatFeedUrlForDisplay(slidesSourceUrl)}`,
          )
        }

        dispatch({
          type: isInitialLoad ? 'LOAD_INITIAL' : 'LOAD_NEXT',
          slides: newSlides,
          ticker: newTickerItems,
        })
      } catch (error) {
        console.error('Error fetching data:', error)
        if (isInitialLoad) {
          dispatch({ type: 'LOAD_ERROR', message: getErrorMessage(error) })
        }
      }
    },
    [apiBaseProp, channelProp],
  )

  useEffect(() => {
    fetchData(true)
  }, [fetchData])

  const hasSlides = state.slides.length > 0

  useEffect(() => {
    const fetchInterval = setInterval(
      () => {
        // If startup failed, the retry must replace visible slides. LOAD_NEXT
        // only swaps at a slide boundary, which never happens with no slides.
        fetchData(!hasSlides)
      },
      hasSlides ? REFRESH_INTERVAL_MS : INITIAL_RETRY_INTERVAL_MS,
    )

    return () => clearInterval(fetchInterval)
  }, [fetchData, hasSlides])

  useEffect(() => {
    if (!navEnabled) return

    // The reducer already no-ops NAV actions on an empty deck.
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault()
        dispatch({ type: 'TOGGLE_PAUSE' })
      } else if (e.key === 'ArrowRight') {
        dispatch({ type: 'NAV_NEXT' })
      } else if (e.key === 'ArrowLeft') {
        dispatch({ type: 'NAV_PREV' })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (state.slides.length === 0) return
    if (state.paused) return
    const currentDuration =
      state.slides[state.currentSlide]?.duration ?? state.slides[0]?.duration
    if (!currentDuration) return

    const timer = setInterval(() => {
      const tick = () => dispatch({ type: 'TICK' })
      if (document.startViewTransition) {
        document.startViewTransition(tick)
      } else {
        tick()
      }
    }, currentDuration)

    return () => clearInterval(timer)
  }, [state.slides, state.currentSlide, state.paused])

  // Derived, not stored: everything the current and pending slide sets need.
  const imagesToPreload = useMemo(
    () => [...new Set(imageUrlsFor([...state.slides, ...state.nextSlides]))],
    [state.slides, state.nextSlides],
  )

  return {
    slides: state.slides,
    currentSlide: state.currentSlide,
    tickerItems: state.tickerItems,
    tickerIndex: state.tickerIndex,
    imagesToPreload,
    iframeUrls: state.iframeUrls,
    paused: state.paused,
    error: state.error,
    navEnabled,
  }
}
