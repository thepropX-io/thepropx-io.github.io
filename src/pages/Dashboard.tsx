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

type FilterType = 'all' | 'push_live_match' | 'activate_segment' | 'protect_revenue' | 'reallocate_focus' | 'inactive'

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
  {
    key: 'inactive',
    label: 'Inactive',
    inactiveColor: 'text-white/25 border-white/[0.06] bg-transparent',
    activeStyle: 'text-white/50 border-white/15 bg-white/[0.04]',
    dot: 'bg-white/30',
  },
]

export function Dashboard() {
  const { user, signOut } = useAuth()
  const { brokers } = useBrokers()
  const broker = brokers.find(b => b.email === user?.email) ?? brokers[0]
  const { items, loading, error, pendingDiff, flushPending } = useInsightFeed(broker?.id)
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

  // Split active vs inactive; the 'All' shows only active, 'Inactive' shows retired/inactive
  const activeItems   = items.filter(i => i.is_active)
  const inactiveItems = items.filter(i => !i.is_active)

  const filtered =
    activeFilter === 'inactive'
      ? inactiveItems
      : activeFilter === 'all'
        ? activeItems
        : activeItems.filter(i => i.insight_type === activeFilter)

  const urgentCount = activeItems.filter(i => i.priority === 'urgent').length

  const PAGE_SIZE = 10
  const [currentPage, setCurrentPage] = useState(1)

  // Reset to page 1 whenever filter changes
  useEffect(() => { setCurrentPage(1) }, [activeFilter])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginatedItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  // Build banner label from the diff
  const bannerLabel = (() => {
    if (!pendingDiff) return null
    const { added, removed } = pendingDiff
    if (added > 0 && removed > 0 && added === removed) return `${added} insight${added === 1 ? '' : 's'} updated`
    if (added > 0 && removed > 0) return `+${added} new, ${removed} removed`
    if (added > 0) return `+${added} new insight${added === 1 ? '' : 's'}`
    return `${removed} insight${removed === 1 ? '' : 's'} removed`
  })()

  return (
    <div className="min-h-screen px-gradient-bg flex flex-col">
      <Header brokerName={displayName} onSignOut={signOut} />

      {/* Pending-changes banner — only mounts when pendingDiff is non-null */}
      {bannerLabel && (
        <div className="sticky top-0 z-50 flex justify-center px-4 py-2 pointer-events-none">
          <button
            onClick={flushPending}
            className="pointer-events-auto inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-[#0f0f1a]/90 backdrop-blur-md px-5 py-2 text-[12px] font-semibold text-white shadow-lg transition-all duration-200 hover:bg-white/10 hover:border-white/30 active:scale-95"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            {bannerLabel} — Refresh
          </button>
        </div>
      )}

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
            {!loading && activeItems.length > 0 && (
              <div className="hidden sm:flex flex-col items-end gap-1 shrink-0 ml-6 pb-1">
                <span className="text-2xl font-bold text-white">{activeItems.length}</span>
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
                const count =
                  f.key === 'inactive'
                    ? inactiveItems.length
                    : f.key === 'all'
                      ? activeItems.length
                      : activeItems.filter(i => i.insight_type === f.key).length
                if (f.key !== 'all' && f.key !== 'inactive' && count === 0) return null
                if (f.key === 'inactive' && count === 0) return null
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
                {activeItems.length === 0
                  ? 'No active insights right now. Run the intelligence refresh to generate actions.'
                  : 'No insights of this type right now.'}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {paginatedItems.map((item, idx) => (
                  <InsightCard key={item.id} item={item} delay={idx} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-8">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-1.5 rounded-full border border-white/[0.08] text-[12px] font-semibold text-white/50 hover:text-white hover:border-white/20 transition-all disabled:opacity-25 disabled:cursor-not-allowed"
                  >
                    ← Prev
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 w-8 rounded-full border text-[12px] font-semibold transition-all ${
                        page === currentPage
                          ? 'border-white/20 bg-white/[0.07] text-white'
                          : 'border-white/[0.06] bg-transparent text-white/35 hover:text-white/70 hover:border-white/15'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-1.5 rounded-full border border-white/[0.08] text-[12px] font-semibold text-white/50 hover:text-white hover:border-white/20 transition-all disabled:opacity-25 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
