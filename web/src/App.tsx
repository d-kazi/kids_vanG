import { useState } from 'react'
import { HomePage } from './pages/HomePage'
import { LevelPage } from './pages/LevelPage'
import { useSession } from './state/useSession'

export default function App() {
  const session = useSession()
  const [screen, setScreen] = useState<'home' | 'level'>('home')

  if (screen === 'home') {
    return (
      <HomePage
        session={session}
        onPlay={i => {
          session.select(i)
          setScreen('level')
        }}
      />
    )
  }

  return <LevelPage session={session} onClose={() => setScreen('home')} />
}
