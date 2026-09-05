/**
 * BredaNu content window: the 1534 x 904 area at (191, 108) inside the frame
 * chrome. Slides stack a header, their content, and the ticker in it.
 */
export function SlideShell({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`relative h-full w-full ${className}`}>
      <div className="absolute top-[108px] left-[191px] flex h-[904px] w-[1534px] flex-col items-center gap-8">
        {children}
      </div>
    </div>
  )
}
