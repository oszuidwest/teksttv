import type { FullScreenSlideData } from '../../types'

export function ImageSlide({ content }: { content: FullScreenSlideData }) {
  return (
    <div className="absolute inset-0">
      <img src={content.url} alt="" className="h-full w-full object-cover" />
    </div>
  )
}
