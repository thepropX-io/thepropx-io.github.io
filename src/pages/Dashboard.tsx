import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Header } from '../components/layout/Header'
import { InsightCard } from '../components/cards/InsightCard'
import { Loader } from '../components/ui/Loader'
import { useInsightFeed, useBrokers } from '../hooks/useInsights'
import { useAuth } from '../hooks/useAuth'

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

type FilterType = 'all' | 'push_live_match' | 'activate_segment' | 'protect_revenue' | 'reallocate_focus'

const FILTERS: { key: FilterType; label: string; inactiveColor: string; activeStyle: string; dot: string }[] = [
  {
    key: 'all',
    label: 'All',
    inactiveColor: 'text-white/40 border-white/[0.08] bg-transparent',
    activeStyle: 'text-white border-white/20 bg-white/[0.07]',
    dot: 'bg-white/40',
  },
  {
    key: 'push_live_match',
    label: 'Push Match',
    inactiveColor: 'text-emerald-500/50 border-emerald-500/15 bg-transparent',
    activeStyle: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/[0.08]',
    dot: 'bg-emerald-400',
  },
  {
    key: 'activate_segment',
    label: 'Activate',
    inactiveColor: 'text-purple-500/50 border-purple-500/15 bg-transparent',
    activeStyle: 'text-purple-400 border-purple-500/40 bg-purple-500/[0.08]',
    dot: 'bg-purple-400',
  },
  {
    key: 'protect_revenue',
    label: 'Protect Revenue',
    inactiveColor: 'text-red-500/50 border-red-500/15 bg-transparent',
    activeStyle: 'text-red-400 border-red-500/40 bg-red-500/[0.08]',
    dot: 'bg-red-400',
  },
  {
    key: 'reallocate_focus',
    label: 'Reallocate',
    inactiveColor: 'text-amber-500/50 border-amber-500/15 bg-transparent',
    activeStyle: 'text-amber-400 border-amber-500/40 bg-amber-500/[0.08]',
    dot: 'bg-amber-400',
  },
]

export function Dashboard() {
  const { user, signOut } = useAuth()
  const { brokers } = useBrokers()
  const broker = brokers.find(b => b.email === user?.email) ?? brokers[0]
  const { items, loading, error } = useInsightFeed(broker?.id)
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeFilter, setActiveFilter] = useState<FilterType>(
    (searchParams.get('filter') as FilterType) ?? 'all'
  )

  useEffect(() => {
    const param = searchParams.get('filter') as FilterType | null
    if (param && param !== activeFilter) setActiveFilter(param)
  }, [])

  // Name priority: user metadata (from sign-up) → matched broker name → email prefix
  const matchedBroker = brokers.find(b => b.email === user?.email)
  const displayName =
    user?.user_metadata?.name?.trim() ||
    matchedBroker?.name ||
    user?.email?.split('@')[0] ||
    'there'
  const firstName = displayName.split(' ')[0]

  const filtered = activeFilter === 'all'
    ? items
    : items.filter(i => i.insight_type === activeFilter)

  const urgentCount = items.filter(i => i.priority === 'urgent').length

  return (
    <div className="min-h-screen px-gradient-bg flex flex-col">
      <Header brokerName={displayName} onSignOut={signOut} />

      <main className="flex-1 flex flex-col items-center px-4 sm:px-6 py-8 overflow-auto">
        <div className="w-full max-w-[1000px]">

          {/* Greeting */}
          <div className="mb-8 animate-fade-in flex items-end justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white leading-snug">
                {getGreeting()}, {firstName}.
                <br />
                <span className="text-white/40">Where to focus today.</span>
              </h1>
              <p className="text-xs text-white/20 mt-2 uppercase tracking-widest font-medium">
                Powered by CRM · Inventory · Market data
              </p>
            </div>
            {!loading && items.length > 0 && (
              <div className="hidden sm:flex flex-col items-end gap-1 shrink-0 ml-6 pb-1">
                <span className="text-2xl font-bold text-white">{items.length}</span>
                <span className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">Actions</span>
                {urgentCount > 0 && (
                  <span className="text-[10px] text-red-400 font-semibold">{urgentCount} urgent</span>
                )}
              </div>
            )}
          </div>

          {/* Filter bar */}
          {!loading && !error && items.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6 animate-fade-in-d1">
              {FILTERS.map(f => {
                const count = f.key === 'all' ? items.length : items.filter(i => i.insight_type === f.key).length
                if (f.key !== 'all' && count === 0) return null
                const isActive = activeFilter === f.key
                return (
                  <button
                    key={f.key}
                    onClick={() => {
                      setActiveFilter(f.key)
                      if (f.key === 'all') {
                        setSearchParams({}, { replace: true })
                      } else {
                        setSearchParams({ filter: f.key }, { replace: true })
                      }
                    }}
                    className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold tracking-wide transition-all duration-150 cursor-pointer ${isActive ? f.activeStyle : f.inactiveColor + ' hover:brightness-125'}`}
                  >
                    {isActive && (
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${f.dot}`} />
                    )}
                    {f.label}
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${isActive ? 'bg-white/15' : 'bg-white/[0.05]'}`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Feed */}
          {loading ? (
            <Loader />
          ) : error ? (
            <div className="px-glass p-6 text-center">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-glass p-10 text-center animate-fade-in">
              <p className="text-white/40 text-sm">
                {items.length === 0
                  ? 'No active insights right now. Run the intelligence refresh to generate actions.'
                  : 'No insights of this type right now.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((item, idx) => (
                <InsightCard key={item.id} item={item} delay={idx} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
