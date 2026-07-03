import { type ThemeName, themes } from './theme'

export function Background({
  theme,
  children,
}: {
  theme: ThemeName
  children: React.ReactNode
}) {
  const c = themes[theme]

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ backgroundColor: c.surface }}
    >
      {/* Background layer (behind content) */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="none"
      >
        {/* Green band — top 600px, right 640px is dark */}
        <rect x="0" y="0" width="1280" height="600" fill={c.accent} />
        <rect x="1280" y="0" width="640" height="600" fill={c.accentDark} />
        {/* Top-left corner triangles */}
        <polygon points="0,0 0,320 160,0" fill={c.accentMid} />
        <polygon points="0,0 0,192 96,0" fill={c.accentDeep} />
      </svg>

      {/* Content layer (no z-index — children use parent stacking context) */}
      <div className="relative h-full w-full">{children}</div>

      {/* Overlay layer (on top of content) */}
      <svg
        className="pointer-events-none absolute inset-0 z-20 h-full w-full"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="none"
      >
        {/* Right-side diagonal stripes (over the card/photo) */}
        <path
          d="M 1920,600 H 1784 V 968 C 1806,968 1832,952 1842,932 L 1920,776 Z"
          fill={c.accent}
        />
        <polygon
          points="1920,472 1784,744 1784,896 1920,624"
          fill={c.accentMid}
        />
        <path
          d="M 1920,373 C 1897,391 1878,412 1866,435 L 1784,600 V 744 L 1920,472 Z"
          fill={c.accentDeep}
        />
        {/* Top-right logo bar stripes */}
        <polygon points="1160,0 1080,160 1160,160 1240,0" fill={c.accentMid} />
        <polygon points="1240,0 1160,160 1280,160 1360,0" fill={c.accentDeep} />
        <polygon points="1360,0 1280,160 1920,160 1920,0" fill={c.accentDark} />
      </svg>
    </div>
  )
}
