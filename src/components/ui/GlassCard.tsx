import type { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  glowLeft?: boolean
  accentColor?: 'purple' | 'green' | 'red' | 'amber' | 'none'
  glowColor?: 'purple' | 'red' | 'emerald' | 'none'
  onClick?: () => void
}

export function GlassCard({
  children,
  className = '',
  glowLeft = false,
  accentColor,
  glowColor = 'none',
  onClick,
}: GlassCardProps) {
  const leftAccent =
    accentColor === 'green'  ? 'px-glow-left-green' :
    accentColor === 'red'    ? 'px-glow-left-red' :
    accentColor === 'amber'  ? 'px-glow-left-amber' :
    accentColor === 'purple' ? 'px-glow-left' :
    glowLeft                 ? 'px-glow-left' :
    ''

  const glow =
    glowColor === 'red'     ? 'px-glow-red' :
    glowColor === 'emerald' ? 'px-glow-emerald' :
    ''

  return (
    <div
      onClick={onClick}
      className={`px-glass ${leftAccent} ${glow} p-5 ${onClick ? 'cursor-pointer hover:bg-white/[0.04] transition-colors' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
