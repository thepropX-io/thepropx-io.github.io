import { Users, Send, FileText } from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { GlassCard } from '../../components/ui/GlassCard'
import { MetricGrid } from '../../components/ui/MetricRow'
import { DonutChart } from '../../components/ui/DonutChart'
import { SectionContainer } from '../../components/ui/SectionContainer'
import { CTAButton } from '../../components/ui/CTAButton'
import { Tag } from '../../components/ui/Tag'
import { Pill } from '../../components/ui/Pill'
import type { InsightDetail } from '../../types'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface Props {
  detail: InsightDetail
}

export function PushLiveMatchView({ detail }: Props) {
  const { insight, metrics, sections, bullets, recommendations, recTags } = detail
  const [showAllMatches, setShowAllMatches] = useState(false)

  // Parse metrics into mandate display values
  const mandateMetrics = metrics.map(m => ({
    label: m.metric_label,
    value: m.display_value,
    accent: m.metric_type === 'yield' || m.metric_type === 'lead_readiness',
  }))

  // Find lead readiness score
  const readiness = metrics.find(m => m.metric_type === 'lead_readiness')
  const readinessScore = readiness?.numeric_value ?? 0

  // Sections: find "why_now" and "lead_readiness" sections
  const readinessSection = sections.find(s => s.section_key === 'lead_readiness')
  const readinessBullets = readinessSection
    ? bullets.filter(b => b.section_id === readinessSection.id)
    : []

  // Recommendations: primary (rank 1) vs alternatives
  const primary = recommendations.find(r => r.rank === 1)
  const alternatives = recommendations.filter(r => r.rank > 1)

  // Context
  const contextLabel = insight.anchor_display_name
    ? `${insight.anchor_display_name} · Active Mandate`
    : 'Active Mandate'

  return (
    <div className="min-h-screen px-gradient-bg flex flex-col">
      <PageHeader
        contextIcon={<Users size={14} className="text-purple-400" />}
        contextLabel={contextLabel}
      />

      <main className="flex-1 overflow-auto">
        <div className="max-w-[680px] mx-auto px-4 py-8">

          {/* Mandate Metrics */}
          {mandateMetrics.length > 0 && (
            <SectionContainer>
              <GlassCard className="bg-black/20">
                <MetricGrid metrics={mandateMetrics} />
              </GlassCard>
            </SectionContainer>
          )}

          {/* Lead Readiness */}
          {readinessScore > 0 && (
            <SectionContainer title="Lead Readiness">
              <div className="flex items-start gap-6">
                <DonutChart score={readinessScore} />
                <ul className="space-y-2 flex-1">
                  {readinessBullets.map(b => (
                    <li key={b.id} className="flex items-start gap-2 text-sm text-white/50">
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-emerald-400 shrink-0" />
                      {b.bullet_text}
                    </li>
                  ))}
                </ul>
              </div>
            </SectionContainer>
          )}

          {/* Recommended Action */}
          <SectionContainer title="Recommended Action">
            {primary && (
              <GlassCard glowColor="emerald" className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                    Recommended for Client
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white">{primary.display_name}</h3>
                <div className="flex items-center gap-3 mt-1 mb-2">
                  {primary.price_aed && (
                    <span className="text-white font-semibold">AED {(primary.price_aed / 1e6).toFixed(1)}M</span>
                  )}
                  {primary.yield_pct && (
                    <span className="text-emerald-400 font-semibold">{primary.yield_pct}% yield</span>
                  )}
                </div>
                {primary.reason_summary && (
                  <p className="text-sm text-white/40 mb-4">{primary.reason_summary}</p>
                )}
                <div className="flex items-center gap-3 border-t border-white/[0.06] pt-3">
                  <CTAButton label="Teaser" variant="secondary" icon={<Send size={14} />} />
                  <CTAButton label="CMA" variant="secondary" icon={<FileText size={14} />} />
                </div>
              </GlassCard>
            )}

            {alternatives.map(rec => (
              <GlassCard key={rec.id} className="mb-4">
                <p className="text-[10px] uppercase tracking-wider text-white/30 mb-2">Alternative Option</p>
                <h3 className="text-base font-semibold text-white">{rec.display_name}</h3>
                <div className="flex items-center gap-3 mt-1 mb-2">
                  {rec.price_aed && (
                    <span className="text-white font-medium">AED {(rec.price_aed / 1e6).toFixed(1)}M</span>
                  )}
                  {rec.yield_pct && (
                    <span className="text-emerald-400 font-medium">{rec.yield_pct}% yield</span>
                  )}
                </div>
                {rec.reason_summary && (
                  <p className="text-sm text-white/40">{rec.reason_summary}</p>
                )}
              </GlassCard>
            ))}

            {/* Primary insight CTA */}
            {insight.primary_cta_label && (
              <CTAButton label={insight.primary_cta_label} className="w-full mt-2" />
            )}
          </SectionContainer>

          {/* Matching Properties (collapsible) */}
          {recommendations.length > 2 && (
            <SectionContainer>
              <button
                onClick={() => setShowAllMatches(!showAllMatches)}
                className="flex items-center justify-between w-full px-glass p-4 text-left cursor-pointer"
              >
                <span className="text-sm font-medium text-white/70">
                  ✨ Matching Properties ({recommendations.length})
                </span>
                {showAllMatches ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
              </button>

              {showAllMatches && (
                <div className="space-y-3 mt-3">
                  {recommendations.map(rec => {
                    const tags = recTags.filter(t => t.recommendation_id === rec.id)
                    return (
                      <GlassCard key={rec.id}>
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-base font-semibold text-white">{rec.display_name}</h4>
                            {rec.subtitle && <p className="text-xs text-white/40">{rec.subtitle}</p>}
                            <div className="flex items-center gap-3 mt-1.5">
                              {rec.price_aed && (
                                <span className="text-sm font-semibold text-white">AED {(rec.price_aed / 1e6).toFixed(1)}M</span>
                              )}
                              {rec.yield_pct && (
                                <span className="text-sm font-semibold text-emerald-400">{rec.yield_pct}% yield</span>
                              )}
                              {rec.size_sqft && <span className="text-xs text-white/30">{rec.size_sqft} sqft</span>}
                              {rec.days_on_market != null && <span className="text-xs text-white/30">{rec.days_on_market}d</span>}
                            </div>
                          </div>
                          {rec.score && (
                            <Pill text={`${rec.score}% Match`} tone="green" />
                          )}
                        </div>
                        {tags.length > 0 && (
                          <div className="mt-3">
                            <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Best For</p>
                            <div className="flex flex-wrap gap-1.5">
                              {tags.map(t => (
                                <Tag key={t.id} label={t.tag_value} />
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-3 mt-3">
                          <CTAButton label="Generate Teaser" variant="secondary" icon={<Send size={14} />} />
                          <CTAButton label="Generate CMA" variant="secondary" icon={<FileText size={14} />} />
                        </div>
                      </GlassCard>
                    )
                  })}
                </div>
              )}
            </SectionContainer>
          )}
        </div>
      </main>
    </div>
  )
}
