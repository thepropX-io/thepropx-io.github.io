import { LogOut, Zap } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

interface HeaderProps {
  brokerName?: string
  onSignOut?: () => void
}

export function Header({ brokerName, onSignOut }: HeaderProps) {
  const { user } = useAuth()

  // Prefer showing the authenticated user's email in the top-right pill
  // Fallback to brokerName or user metadata name if email is not available
  const nameToShow =
    user?.email || brokerName || user?.user_metadata?.name?.trim() || ''

  return (
    <header className="h-14 border-b border-white/[0.06] flex items-center justify-between px-6 relative">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/40">
            <Zap size={12} className="text-white fill-white" />
          </div>
          <span className="text-sm font-bold tracking-tight text-white">
            prop<span className="text-purple-400">X</span>
          </span>
        </div>
        <div className="h-3.5 w-px bg-white/10" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/20">Intelligence</span>
      </div>

      {/* Right: live indicator + broker name + signout */}
      {nameToShow && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-full px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-xs text-white/50 font-medium">{nameToShow}</span>
          </div>
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="rounded-full p-2 text-white/25 hover:text-white/60 hover:bg-white/[0.05] transition-colors cursor-pointer"
              title="Sign out"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
      )}
    </header>
  )
}
