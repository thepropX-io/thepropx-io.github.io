type BadgeTone = 'default' | 'green' | 'red' | 'amber' | 'purple'

interface BadgeProps {
  text: string
  tone?: BadgeTone
}

const toneStyles: Record<BadgeTone, string> = {
  default: 'border-white/10 bg-white/[0.04] text-white/40',
  green:   'border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-400',
  red:     'border-red-500/30 bg-red-500/[0.08] text-red-400',
  amber:   'border-amber-500/30 bg-amber-500/[0.08] text-amber-400',
  purple:  'border-purple-500/30 bg-purple-500/[0.08] text-purple-400',
}

export function Badge({ text, tone = 'default' }: BadgeProps) {
  return (
    <span className={`inline-block rounded border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${toneStyles[tone]}`}>
      {text}
    </span>
  )
}
