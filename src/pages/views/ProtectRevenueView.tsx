import { TriangleAlert, TrendingDown, PenLine, Eye } from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { GlassCard } from '../../components/ui/GlassCard'
import { SectionContainer } from '../../components/ui/SectionContainer'
import { CTAButton } from '../../components/ui/CTAButton'
import { Pill } from '../../components/ui/Pill'
import type { InsightDetail } from '../../types'

interface Props {
  detail: InsightDetail
}

export function ProtectRevenueView({ detail }: Props) {
  const { insight, metrics } = detail

  const currentPrice = metrics.find(m => m.metric_type === 'current_price' || m.metric_type === 'asking_price' || m.metric_type === 'price')
  const suggestedPrice = metrics.find(m => m.metric_type === 'suggested_price')
  const pricePerSqft = metrics.find(m => m.metric_type === 'price_per_sqft')
  const suggestedPerSqft = metrics.find(m => m.metric_type === 'suggested_price_per_sqft')
  const priceVsMarket = metrics.find(m => m.metric_type === 'price_vs_market')
  const competingBelow = metrics.find(m => m.metric_type === 'competing_units_below')

  const currentVal = currentPrice?.display_value ?? '—'
  const suggestedVal = suggestedPrice?.display_value ?? '—'
  const pctAbove = priceVsMarket?.display_value ?? priceVsMarket?.numeric_value?.toString() ?? ''
  const unitsBelow = competingBelow?.display_value ?? competingBelow?.numeric_value?.toString() ?? ''

  return (
    <div className="min-h-screen px-gradient-bg flex flex-col">
      <PageHeader backLabel="Back to Actions" />

      <main className="flex-1 flex flex-col items-center overflow-auto">
        <div className="w-full max-w-[800px] px-4 py-8">

          {/* Title */}
          <div className="mb-10 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <TriangleAlert size={24} className="text-red-400" />
              <h1 className="text-2xl font-bold text-white">Protect This Listing</h1>
            </div>
            <p className="text-sm text-white/40">{insight.anchor_display_name ?? insight.summary}</p>
          </div>

          {/* Pricing Card */}
          <SectionContainer>
            <GlassCard glowColor="red" className="mb-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Current Price</p>
                  <p className="text-2xl font-bold text-white">{currentVal}</p>
                  {pricePerSqft && (
                    <p className="text-xs text-white/30 mt-0.5">{pricePerSqft.display_value}</p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-emerald-400/60 mb-1">Suggested Price</p>
                  <p className="text-2xl font-bold text-emerald-400">{suggestedVal}</p>
                  {suggestedPerSqft && (
                    <p className="text-xs text-white/30 mt-0.5">{suggestedPerSqft.display_value}</p>
                  )}
                </div>
              </div>

              {/* Competition comparison */}
              <div className="flex items-center gap-3 mb-4">
                {pctAbove && (
                  <Pill text={`${pctAbove} above competition`} tone="red" />
                )}
                {unitsBelow && (
                  <span className="text-xs text-white/30">{unitsBelow} units priced below</span>
                )}
              </div>

              <div className="border-t border-white/[0.06] pt-4">
                <p className="text-sm text-white/40">{insight.summary}</p>
              </div>
            </GlassCard>

            {/* CTAs */}
            <div className="flex flex-col gap-3">
              <CTAButton
                label={`Apply Suggested Price — ${suggestedVal}`}
                className="w-full"
              />
              <CTAButton
                label="Adjust Manually"
                variant="secondary"
                icon={<PenLine size={14} />}
                className="w-full"
              />
              <CTAButton
                label="View Live Market Competition"
                variant="ghost"
                icon={<Eye size={14} />}
                className="w-full"
              />
            </div>
          </SectionContainer>
        </div>
      </main>
    </div>
  )
}
