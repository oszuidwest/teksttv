import { useState } from 'react'

type Mode = 'off' | 'opacity' | 'difference'

export function DevOverlay({ src }: { src: string }) {
  const [mode, setMode] = useState<Mode>('off')

  const next = () =>
    setMode((m) =>
      m === 'off' ? 'opacity' : m === 'opacity' ? 'difference' : 'off',
    )

  const label =
    mode === 'off'
      ? 'Overlay: off'
      : mode === 'opacity'
        ? 'Overlay: 50%'
        : 'Overlay: diff'

  return (
    <>
      <button
        type="button"
        onClick={next}
        className="fixed top-[8px] right-[8px] z-50 rounded bg-black/70 px-[12px] py-[6px] font-mono text-[14px] text-white"
      >
        {label}
      </button>
      {mode !== 'off' && (
        <img
          src={src}
          alt="Design overlay"
          className="pointer-events-none absolute inset-0 z-40 h-[1080px] w-[1920px]"
          style={{
            opacity: mode === 'opacity' ? 0.5 : 1,
            mixBlendMode: mode === 'difference' ? 'difference' : 'normal',
          }}
        />
      )}
    </>
  )
}
