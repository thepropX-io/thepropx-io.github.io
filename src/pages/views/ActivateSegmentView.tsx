import { Package, TrendingUp, Users as UsersIcon } from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { GlassCard } from '../../components/ui/GlassCard'
import { SectionContainer } from '../../components/ui/SectionContainer'
import { CTAButton } from '../../components/ui/CTAButton'
import { Tag } from '../../components/ui/Tag'
import { Pill } from '../../components/ui/Pill'
import type { InsightDetail, InsightSection, InsightBullet } from '../../types'

interface Props {
  detail: InsightDetail
}

function SectionBlock({ section, bullets, allSections, allBullets }: {
  section: InsightSection
  bullets: InsightBullet[]
  allSections: InsightSection[]
  allBullets: InsightBullet[]
}) {
  const childSections = allSections.filter(s => s.parent_section_id === section.id)

  return (
    <div className="mb-4">
      {section.section_title && (
        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-2">
          {section.section_title}
        </p>
      )}
      {bullets.length > 0 && (
        <ul className="space-y-1.5 mb-3">
          {bullets.map(b => (
            <li key={b.id} className="flex items-start gap-2 text-sm text-white/60">
              <span className="mt-1.5 h-1 w-1 rounded-full bg-white/20 shrink-0" />
              {b.bullet_text}
            </li>
          ))}
        </ul>
      )}
      {section.body_text && (
        <p className="text-sm font-semibold text-white/80">{section.body_text}</p>
      )}
      {childSections.map(child => (
        <SectionBlock
          key={child.id}
          section={child}
          bullets={allBullets.filter(b => b.section_id === child.id)}
          allSections={allSections}
          allBullets={allBullets}
        />
      ))}
    </div>
  )
}

export function ActivateSegmentView({ detail }: Props) {
  const { insight, labels, sections, bullets, recommendations } = detail

  // Top-level sections (no parent)
  const topSections = sections.filter(s => !s.parent_section_id)

  // Summary stats from context_data
  const ctx = insight.context_data ?? {}
  const activeUnits = ctx.active_listings as number | undefined
  const avgDom = ctx.avg_dom as number | undefined

  return (
    <div className="min-h-screen px-gradient-bg flex flex-col">
      <PageHeader
        contextIcon={<Package size={14} className="text-purple-400" />}
        contextLabel="Segment Execution"
      />

      <main className="flex-1 overflow-auto">
        <div className="max-w-[720px] mx-auto px-4 py-8">

          {/* Title */}
          <div className="mb-10 animate-fade-in">
            <h1 className="text-2xl font-bold text-white mb-2">{insight.title}</h1>
            <p className="text-sm text-white/40">{insight.summary}</p>
            {(activeUnits || avgDom) && (
              <p className="text-sm text-white/30 mt-1">
                {activeUnits && <>{activeUnits} competing units currently active. </>}
                {avgDom && <>Average DOM: {avgDom} days. </>}
                {insight.subtitle}
              </p>
            )}
          </div>

          {/* Segment Momentum */}
          <SectionContainer title="Segment Momentum" icon={<TrendingUp size={14} className="text-purple-400" />}>
            <GlassCard>
              {topSections.map(section => (
                <SectionBlock
                  key={section.id}
                  section={section}
                  bullets={bullets.filter(b => b.section_id === section.id)}
                  allSections={sections}
                  allBullets={bullets}
                />
              ))}

              {labels.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-white/[0.06]">
                  {labels.map(l => (
                    <Tag key={l.id} label={l.label_value} />
                  ))}
                </div>
              )}
            </GlassCard>
          </SectionContainer>

          {/* Top Buyers */}
          {recommendations.length > 0 && (
            <SectionContainer title="Top Buyers for This Segment" icon={<UsersIcon size={14} className="text-purple-400" />}>
              <div className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <GlassCard key={rec.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="text-white/30 text-sm font-medium">{idx + 1}.</span>
                        <h4 className="text-base font-semibold text-white">{rec.display_name}</h4>
                        {rec.score != null && (
                          <Pill text={`${rec.score}% Segment Fit`} tone="green" />
                        )}
                      </div>
                      {rec.reason_summary && (
                        <p className="text-sm text-white/40 ml-6">{rec.reason_summary}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 ml-6 text-xs text-white/30">
                        {rec.budget_min_aed && rec.budget_max_aed && (
                          <span>AED {(rec.budget_min_aed / 1e6).toFixed(1)}–{(rec.budget_max_aed / 1e6).toFixed(1)}M</span>
                        )}
                        {rec.yield_target_pct && (
                          <><span>·</span><span>{rec.yield_target_pct}%+ yield</span></>
                        )}
                        {rec.investment_horizon && (
                          <><span>·</span><span>{rec.investment_horizon}</span></>
                        )}
                      </div>
                    </div>
                    <CTAButton label="Open Deal Mode" />
                  </GlassCard>
                ))}
              </div>
            </SectionContainer>
          )}
        </div>
      </main>
    </div>
  )
}
