// logo.png is cropped to its visible pixels; the offsets place it exactly
// where it sat on the original full-canvas asset (82x80 at 1742,54).
export function Logo() {
  return (
    <img
      src="/bredanu/logo.png"
      alt="BredaNu"
      className="pointer-events-none absolute top-[54px] left-[1742px] z-30 h-[80px] w-[82px]"
    />
  )
}
