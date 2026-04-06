import { Users, BarChart2, Package, Tag as TagIcon, TrendingUp, PieChart } from 'lucide-react'
import type { ReactNode } from 'react'

const ICON_MAP: Record<string, ReactNode> = {
  Mandate:            <Users size={10} />,
  Market:             <BarChart2 size={10} />,
  Inventory:          <Package size={10} />,
  Pricing:            <TagIcon size={10} />,
  Liquidity:          <TrendingUp size={10} />,
  'Portfolio Exposure': <PieChart size={10} />,
  'Market Momentum':  <BarChart2 size={10} />,
}

interface TagProps {
  label: string
  icon?: ReactNode
}

export function Tag({ label, icon }: TagProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-white/45">
      <span className="text-white/30">{icon ?? ICON_MAP[label] ?? <TagIcon size={10} />}</span>
      {label}
    </span>
  )
}
