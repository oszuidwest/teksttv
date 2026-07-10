import { Logo } from './Logo'

export function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <img
        src="/bredanu/background.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <Logo />
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  )
}
