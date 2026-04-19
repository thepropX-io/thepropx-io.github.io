import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Tag } from '../ui/Tag'
import { Pill } from '../ui/Pill'
import type { InsightFeedItem } from '../../types'

const TYPE_META = {
  push_live_match: {
    label: 'PUSH LIVE MATCH',
    rgb: '52, 211, 153',
    hex: '#34d399',
    dotCls: 'bg-emerald-400',
    textCls: 'text-emerald-400',
    bulletCls: 'bg-emerald-400',
  },
  activate_segment: {
    label: 'ACTIVATE SEGMENT',
    rgb: '147, 51, 234',
    hex: '#9333ea',
    dotCls: 'bg-purple-400',
    textCls: 'text-purple-400',
    bulletCls: 'bg-purple-400',
  },
  protect_revenue: {
    label: 'PROTECT REVENUE',
    rgb: '248, 113, 113',
    hex: '#f87171',
    dotCls: 'bg-red-400',
    textCls: 'text-red-400',
    bulletCls: 'bg-red-400',
  },
  reallocate_focus: {
    label: 'REALLOCATE EFFORT',
    rgb: '251, 191, 36',
    hex: '#fbbf24',
    dotCls: 'bg-amber-400',
    textCls: 'text-amber-400',
    bulletCls: 'bg-amber-400',
  },
} as const

type InsightType = keyof typeof TYPE_META

function getTone(item: InsightFeedItem): string {
  if (item.status_tone) return item.status_tone
  switch (item.insight_type) {
    case 'push_live_match':  return 'green'
    case 'protect_revenue':  return 'red'
    case 'reallocate_focus': return 'amber'
    default:                 return 'purple'
  }
}

interface InsightCardProps {
  item: InsightFeedItem
  delay?: number
}

export function InsightCard({ item, delay = 0 }: InsightCardProps) {
  const navigate = useNavigate()
  const delayClass = delay <= 1 ? `animate-fade-in-d${delay}` : 'animate-fade-in-d4'
  const meta = TYPE_META[item.insight_type as InsightType] ?? TYPE_META.activate_segment
  const isInactive = !item.is_active

  const cardStyle: React.CSSProperties = isInactive
    ? {
        background: 'linear-gradient(135deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 55%)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderLeft: '3px solid rgba(255,255,255,0.15)',
        borderRadius: '12px',
        opacity: 0.6,
      }
    : {
        background: `linear-gradient(135deg, rgba(${meta.rgb}, 0.07) 0%, rgba(255,255,255,0.015) 55%)`,
        border: `1px solid rgba(${meta.rgb}, 0.18)`,
        borderLeft: `3px solid ${meta.hex}`,
        borderRadius: '12px',
        boxShadow: `-4px 0 28px -6px rgba(${meta.rgb}, 0.22)`,
      }

  return (
    <div
      onClick={() => navigate(`/insight/${item.id}`)}
      style={cardStyle}
      className={`px-insight-card p-5 cursor-pointer animate-fade-in ${delayClass}`}
    >
      {/* Type badge + priority row */}
      <div className="flex items-center justify-between mb-4">
        <div className={`flex items-center gap-2 ${isInactive ? 'text-white/30' : meta.textCls}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${isInactive ? 'bg-white/20' : meta.dotCls + ' animate-pulse'} shrink-0`} />
          <span className="text-[10px] font-bold uppercase tracking-[0.12em]">{meta.label}</span>
        </div>
        <div className="flex items-center gap-2">
          {isInactive && (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/30 bg-white/[0.04] border border-white/[0.08] rounded-full px-2.5 py-0.5">
              {item.state ?? 'retired'}
            </span>
          )}
          {!isInactive && (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/25 bg-white/[0.05] border border-white/[0.07] rounded-full px-2.5 py-0.5">
              {item.priority}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <h2 className="text-[17px] font-semibold text-white leading-snug mb-1.5">
        {item.title}
      </h2>

      {/* Summary */}
      <p className="text-sm text-white/45 leading-relaxed mb-3">{item.summary}</p>

      {/* Score pill */}
      {item.score_label && (
        <div className="mb-4">
          <Pill text={item.score_label} tone={getTone(item)} />
        </div>
      )}

      {/* WHY NOW */}
      {item.why_now_bullets && item.why_now_bullets.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/25">Why Now</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>
          <ul className="space-y-2">
            {item.why_now_bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[13px] text-white/55 leading-relaxed">
                <span className={`mt-[5px] h-1.5 w-1.5 rounded-full ${meta.bulletCls} opacity-60 shrink-0`} />
                {b}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer: tags + execute */}
      <div className="flex items-center justify-between pt-3.5 border-t border-white/[0.06]">
        <div className="flex flex-wrap gap-1.5">
          {item.source_labels?.map((l) => (
            <Tag key={l.value} label={l.value} />
          ))}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/insight/${item.id}`) }}
          className={`inline-flex items-center gap-1.5 shrink-0 ml-3 text-[13px] font-semibold ${meta.textCls} opacity-70 hover:opacity-100 transition-opacity`}
        >
          Execute
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}
