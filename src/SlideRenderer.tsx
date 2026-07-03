import type { ComponentType, ReactNode } from 'react'
import type {
  FullScreenSlideData,
  SlideData,
  TextSlideData,
  TickerItem,
  WeatherSlideData,
} from './types'

export interface SlideComponents {
  text: ComponentType<{ content: TextSlideData; children?: ReactNode }>
  image: ComponentType<{ content: FullScreenSlideData }>
  weather: ComponentType<{ content: WeatherSlideData; children?: ReactNode }>
}

export type TickerComponent = ComponentType<{
  items: TickerItem[]
  currentIndex: number
}>

export type FrameComponent = ComponentType<{ children: ReactNode }>

// Single dispatch shared by live playout (App) and Preview so the two can
// never drift. Full-screen slides (image/commercial) play without a ticker.
export function renderSlide(
  slides: SlideComponents,
  content: SlideData,
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
