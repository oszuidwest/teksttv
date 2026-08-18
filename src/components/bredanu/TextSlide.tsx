import type { TextSlideData } from '../../types'
import { ImageMeta } from './ImageMeta'
import { SlideShell } from './SlideShell'

function Header({ title }: { title: string }) {
  return (
    <header className="flex h-[112px] w-full flex-shrink-0 items-center bg-bredanu-gray px-6 text-white">
      <h1
        className="font-inter font-semibold text-[48px] leading-[1.08]"
        dangerouslySetInnerHTML={{ __html: title }}
      />
    </header>
  )
}

function Body({ content }: { content: TextSlideData }) {
  return (
    <div className="flex min-h-0 w-full flex-1 gap-8">
      {content.image?.url && (
        <div className="relative w-[343px] overflow-hidden bg-black">
          <img
            src={content.image.url}
            alt=""
            className="h-full w-full object-cover"
          />
          <ImageMeta image={content.image} />
        </div>
      )}
      <div className="flex-1 overflow-hidden bg-white px-8 py-6">
        <div
          className="font-bahnschrift font-normal text-[42px] text-black leading-[1.46] [&_p+p]:mt-[0.85em]"
          dangerouslySetInnerHTML={{ __html: content.body }}
        />
      </div>
    </div>
  )
}

export function TextSlide({
  content,
  children,
}: {
  content: TextSlideData
  children?: React.ReactNode
}) {
  return (
    <SlideShell>
      <Header title={content.title} />
      <Body content={content} />
      {children}
    </SlideShell>
  )
}
