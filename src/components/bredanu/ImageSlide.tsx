import type { FullScreenSlideData } from '../../types'
import { ImageMeta } from './ImageMeta'

export function ImageSlide({ content }: { content: FullScreenSlideData }) {
  return (
    <div className="relative z-40 h-full w-full bg-black">
      <img src={content.url} alt="" className="h-full w-full object-cover" />
      {content.type === 'image' && (content.caption || content.attribution) && (
        <div className="absolute bottom-[182px] left-[191px] w-[1534px]">
          <ImageMeta image={content} />
        </div>
      )}
    </div>
  )
}
