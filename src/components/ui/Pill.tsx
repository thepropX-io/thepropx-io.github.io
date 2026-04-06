import { TrendingUp, Flame, Clock, TrendingDown } from 'lucide-react'

type Tone = 'green' | 'purple' | 'red' | 'amber' | string

interface PillProps {
  text: string
  tone: Tone
}

const toneClasses: Record<string, string> = {
  green:  'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  purple: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
  red:    'border-red-500/30 bg-red-500/10 text-red-400',
  amber:  'border-amber-500/30 bg-amber-500/10 text-amber-400',
}

const toneIcons: Record<string, React.ReactNode> = {
  green:  <TrendingUp size={14} />,
  red:    <Flame size={14} />,
  purple: <Clock size={14} />,
  amber:  <TrendingDown size={14} />,
}

export function Pill({ text, tone }: PillProps) {
  const cls = toneClasses[tone] ?? toneClasses.purple
  const icon = toneIcons[tone] ?? null

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${cls}`}>
      {icon}
      {text}
    </span>
  )
}
