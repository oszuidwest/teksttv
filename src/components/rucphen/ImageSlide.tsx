import type { FullScreenSlideData } from '../../types'

export const ImageSlide = ({ content }: { content: FullScreenSlideData }) => (
  <div className="relative z-40 h-full w-full bg-black">
    <img src={content.url} alt="" className="h-full w-full object-cover" />
  </div>
)
