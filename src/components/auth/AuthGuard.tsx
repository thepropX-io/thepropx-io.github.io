import type { ReactNode } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useBroker } from '../../hooks/useBroker'
import { LoginPage } from './LoginPage'
import { OnboardingPage } from '../../pages/OnboardingPage'
import { Loader } from '../ui/Loader'

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading, signOut } = useAuth()
  const { broker, brokerLoading, createBroker, focusAreaOptions } = useBroker(user)

  if (loading || (user && brokerLoading)) {
    return (
      <div className="min-h-screen px-gradient-bg flex items-center justify-center">
        <Loader text="Authenticating…" />
      </div>
    )
  }

  if (!user) return <LoginPage />

  if (!broker) {
    return (
      <OnboardingPage
        focusAreaOptions={focusAreaOptions}
        createBroker={createBroker}
        brokerLoading={brokerLoading}
        signOut={signOut}
      />
    )
  }

  return <>{children}</>
}
