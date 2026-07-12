import type { ComponentType, ReactNode } from 'react'
import type {
  FullScreenSlideData,
  SlideData,
  TextSlideData,
  TickerItem,
  WeatherSlideData,
} from './types'

interface SlideComponents {
  text: ComponentType<{ content: TextSlideData; children?: ReactNode }>
  image: ComponentType<{ content: FullScreenSlideData }>
  weather: ComponentType<{
    content: WeatherSlideData
    children?: ReactNode
  }>
  // Hosts own iframe lifecycle. App keeps keyed URLs mounted and hides
  // inactive wrappers; Preview renders only the active instance. Components
  // must fill the canvas above frame chrome and render even when inactive.
  iframe?: IframeSlideComponent
}

export type IframeSlideComponent = ComponentType<{
  url: string
  active: boolean
}>

/** Station kit consumed by both live playout and preview. */
export interface SlideKit {
  slides: SlideComponents
  Ticker: ComponentType<{ items: TickerItem[]; currentIndex: number }>
  Frame?: ComponentType<{ children: ReactNode }>
}

/**
 * Shared renderer for non-iframe slides; hosts manage iframe lifecycle
 * separately. Full-screen slides play without a ticker.
 */
export function renderSlide(
  slides: SlideComponents,
  content: Exclude<SlideData, { type: 'iframe' }>,
  ticker: ReactNode,
  key?: number,
): ReactNode {
  switch (content.type) {
    case 'text':
      return (
        <slides.text key={key} content={content}>
          {ticker}
        </slides.text>
      )
    case 'weather':
      return (
        <slides.weather key={key} content={content}>
          {ticker}
        </slides.weather>
      )
    case 'image':
    case 'commercial':
    case 'commercial_transition':
      return <slides.image key={key} content={content} />
  }
}
