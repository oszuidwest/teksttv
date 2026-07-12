import type { TextSlideData } from '../../types'
import { SlideShell } from './SlideShell'
import type { ThemeName } from './theme'

export function TextSlide({
  content,
  theme,
  children,
}: {
  content: TextSlideData
  theme: ThemeName
  children?: React.ReactNode
}) {
  const imageUrl = content.image?.url
  const hasImage = !!imageUrl

  return (
    <>
      <SlideShell theme={theme} ticker={children}>
        <div className="h-full overflow-hidden px-[56px] pt-[32px]">
          {/* Reserve wrapped text space for the overlaid photo. */}
          {hasImage && (
            <div
              className="float-right ml-[20px]"
              style={{ width: '448px', height: '408px' }}
            />
          )}

          <h1
            className="mb-[44px] font-black text-[#1d1d1b] text-[58px] leading-[59px]"
            dangerouslySetInnerHTML={{ __html: content.title }}
          />

          <div className="font-[500] text-[#1d1d1b] text-[42px] leading-[58px]">
            <div dangerouslySetInnerHTML={{ __html: content.body }} />
          </div>
        </div>
      </SlideShell>

      {/* Outside the card so overlay stripes cross the photo. */}
      {hasImage && (
        <img
          src={imageUrl}
          alt=""
          className="absolute top-[160px] right-0 z-10 h-[440px] w-[640px] object-cover"
          style={{ borderBottomLeftRadius: '64px' }}
        />
      )}
    </>
  )
}
