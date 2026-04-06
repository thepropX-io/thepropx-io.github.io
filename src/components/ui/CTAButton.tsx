import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'

interface CTAButtonProps {
  label: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  icon?: ReactNode
  className?: string
}

export function CTAButton({ label, onClick, variant = 'primary', icon, className = '' }: CTAButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all duration-200 cursor-pointer'

  const variants: Record<string, string> = {
    primary:   'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20',
    secondary: 'border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-white/80',
    ghost:     'text-white/40 hover:text-white/60',
  }

  return (
    <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>
      {icon}
      {label}
      {variant === 'primary' && <ArrowRight size={16} />}
    </button>
  )
}
