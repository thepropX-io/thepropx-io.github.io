import { Package, TrendingUp, Users as UsersIcon } from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { GlassCard } from '../../components/ui/GlassCard'
import { SectionContainer } from '../../components/ui/SectionContainer'
import { CTAButton } from '../../components/ui/CTAButton'
import { Tag } from '../../components/ui/Tag'
import type { InsightDetail, InsightSection, InsightBullet } from '../../types'

interface Props {
  detail: InsightDetail
}

function NumberedSection({ index, section, bullets }: {
  index: number
  section: InsightSection
  bullets: InsightBullet[]
}) {
  return (
    <div className="mb-5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-2">
        {index}. {section.section_title}
      </p>
      <ul className="space-y-1.5">
        {bullets.map(b => (
          <li key={b.id} className="flex items-start gap-2 text-sm text-white/60">
            <span className="mt-1.5 h-1 w-1 rounded-full bg-white/20 shrink-0" />
            {b.bullet_text}
          </li>
        ))}
      </ul>
      {section.body_text && (
        <p className="text-sm font-semibold text-white/80 mt-3">{section.body_text}</p>
      )}
    </div>
  )
}

export function ReallocateFocusView({ detail }: Props) {
  const { insight, labels, sections, bullets, recommendations } = detail

  const topSections = sections.filter(s => !s.parent_section_id)

  return (
    <div className="min-h-screen px-gradient-bg flex flex-col">
      <PageHeader
        contextIcon={<Package size={14} className="text-purple-400" />}
        contextLabel="Portfolio Reallocation"
      />

      <main className="flex-1 overflow-auto">
        <div className="max-w-[720px] mx-auto px-4 py-8">

          {/* Title */}
          <div className="mb-10 animate-fade-in">
            <h1 className="text-2xl font-bold text-white mb-2">{insight.title}</h1>
            <p className="text-sm text-white/40">{insight.summary}</p>
          </div>

          {/* Portfolio Shift Logic */}
          <SectionContainer title="Portfolio Shift Logic" icon={<TrendingUp size={14} className="text-purple-400" />}>
            <GlassCard>
              {topSections.map((section, idx) => (
                <NumberedSection
                  key={section.id}
                  index={idx + 1}
                  section={section}
                  bullets={bullets.filter(b => b.section_id === section.id)}
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

          {/* Buyers to Deploy */}
          {recommendations.length > 0 && (
            <SectionContainer title="Buyers to Deploy in This Pocket" icon={<UsersIcon size={14} className="text-purple-400" />}>
              <div className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <GlassCard key={rec.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-white/30 text-sm font-medium">{idx + 1}.</span>
                        <h4 className="text-base font-semibold text-white">{rec.display_name}</h4>
                      </div>
                      {rec.reason_summary && (
                        <p className="text-sm text-white/40 ml-6 whitespace-pre-line">{rec.reason_summary}</p>
                      )}
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
