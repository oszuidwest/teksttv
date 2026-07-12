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
  // The App host keeps one instance per distinct URL mounted so embeds load
  // once and stay warm; it hides inactive instances, disables pointer
  // interaction, and may remount inactive instances on a slow interval to
  // recover from transient load failures. Preview renders one active
  // instance directly. The component must fill the canvas above the frame
  // chrome (z-40, like full-screen image slides) and must render the frame
  // regardless of `active` — the host handles hiding.
  iframe?: IframeSlideComponent
}

export type IframeSlideComponent = ComponentType<{
  url: string
  active: boolean
}>

// Everything App and Preview need to render a station: its slide components,
// ticker, and optional frame chrome. Station kits implement this shape.
export interface SlideKit {
  slides: SlideComponents
  Ticker: ComponentType<{ items: TickerItem[]; currentIndex: number }>
  Frame?: ComponentType<{ children: ReactNode }>
}

// Single dispatch for content slides, shared by live playout (App) and
// Preview so the two can never drift. Iframe slides are host-managed (App
// keeps them mounted in a persistent layer, Preview renders one directly),
// so each host handles them itself — the type excludes them here.
// Full-screen slides (image/commercial) play without a ticker.
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
