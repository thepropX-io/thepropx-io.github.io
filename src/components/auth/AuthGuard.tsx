import type { ReactNode } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { LoginPage } from './LoginPage'
import { Loader } from '../ui/Loader'

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen px-gradient-bg flex items-center justify-center">
        <Loader text="Authenticating…" />
      </div>
    )
  }

  if (!user) return <LoginPage />

  return <>{children}</>
}
