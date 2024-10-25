export interface ImageSlideData {
  type: 'image'
  duration: number
  url: string
}

export interface TextSlideData {
  type: 'text'
  duration: number
  title: string
  body: string
  image: string
}

export type SlideData = ImageSlideData | TextSlideData

export interface TickerItem {
  message: string
}
