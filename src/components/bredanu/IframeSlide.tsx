export function IframeSlide({ url, active }: { url: string; active: boolean }) {
  return (
    <iframe
      src={url}
      title="Ingesloten pagina"
      loading="eager"
      sandbox="allow-scripts allow-same-origin"
      className={`pointer-events-none absolute inset-0 z-40 h-full w-full border-0 bg-black ${
        active ? 'opacity-100' : 'opacity-0'
      }`}
    />
  )
}
