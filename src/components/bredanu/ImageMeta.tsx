import type { ImageData } from '../../types'

export function ImageMeta({
  image,
}: {
  image: Pick<ImageData, 'caption' | 'attribution'>
}) {
  return (
    <div className="absolute inset-x-0 bottom-0">
      {image.attribution && (
        <div className="flex justify-end p-5">
          <span className="inline-block bg-bredanu-yellow px-2.5 py-1 font-inter font-semibold text-[16px] text-black leading-none">
            Foto: {image.attribution}
          </span>
        </div>
      )}
      {image.caption && (
        <div className="bg-bredanu-gray px-4 py-2.5 font-bahnschrift text-[22px] text-white leading-snug">
          {image.caption}
        </div>
      )}
    </div>
  )
}
