import type { TextSlideData } from '../../types'

const themes = {
  green: { border: '#82ba26' },
  blue: { border: '#009fe3' },
} as const

export function TextSlide({
  content,
  theme = 'green',
  children,
}: {
  content: TextSlideData
  theme?: 'green' | 'blue'
  children?: React.ReactNode
}) {
  const c = themes[theme]
  const hasImage = content.image && content.image.length > 0

  return (
    <>
      {/* Green accent flex container — height determined by top/bottom */}
      <div
        className="absolute top-[160px] bottom-[112px] left-[134px] flex flex-col gap-[2px] rounded-tl-[42px] rounded-tr-[80px] rounded-bl-[42px] pb-[2px]"
        style={{ backgroundColor: c.border, width: '1650px' }}
      >
        {/* Card (fills remaining space) */}
        <div
          className={
            'ml-[2px] flex-1 overflow-hidden rounded-tl-[40px] rounded-tr-[40px] bg-[#e9e9e9] font-nunito'
          }
        >
          <div className="h-full overflow-hidden px-[56px] pt-[32px]">
            {/* Float spacer for photo area */}
            {hasImage && (
              <div
                className="float-right ml-[20px]"
                style={{ width: '448px', height: '408px' }}
              />
            )}

            {/* Title (renders HTML entities) */}
            <h1
              className="mb-[44px] font-black text-[#1d1d1b] text-[58px] leading-[59px]"
              dangerouslySetInnerHTML={{ __html: content.title }}
            />

            {/* Body */}
            <div className="text-[#1d1d1b] text-[40px] leading-[55px]">
              <div dangerouslySetInnerHTML={{ __html: content.body }} />
            </div>
          </div>
        </div>

        {/* Ticker slot (passed as children) */}
        {children && <div className="ml-[2px]">{children}</div>}
      </div>

      {/* Photo (outside card so it extends behind overlay stripes) */}
      {hasImage && (
        <img
          src={content.image}
          alt=""
          className="absolute top-[160px] right-0 z-10 h-[440px] w-[640px] object-cover"
          style={{ borderBottomLeftRadius: '64px' }}
        />
      )}
    </>
  )
}
