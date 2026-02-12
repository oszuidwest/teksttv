import { Background } from './Background'
import { Header } from './Header'

export function Frame({
  theme,
  children,
}: {
  theme: 'green' | 'blue'
  children: React.ReactNode
}) {
  return (
    <Background theme={theme}>
      <Header theme={theme} />
      {children}
    </Background>
  )
}
