import { Background } from './Background'
import { Header } from './Header'
import type { ThemeName } from './theme'

export function Frame({
  theme,
  children,
}: {
  theme: ThemeName
  children: React.ReactNode
}) {
  return (
    <Background theme={theme}>
      <Header theme={theme} />
      {children}
    </Background>
  )
}
