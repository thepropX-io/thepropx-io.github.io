import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type {
  InsightFeedItem,
  InsightDetail,
  Insight,
  InsightLabel,
  InsightSection,
  InsightBullet,
  InsightMetric,
  InsightRecommendation,
  RecommendationTag,
  RecommendationMetric,
  InsightActionDef,
  Broker,
} from '../types'

export function useInsightFeed(brokerId?: string) {
  const [items, setItems] = useState<InsightFeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Diff summary exposed to the UI — the ONLY state that changes during background polls.
  // Keeping this as a minimal {added, removed} object means every poll that finds a change
  // triggers exactly one small re-render (the banner), never a full list re-render.
  const [pendingDiff, setPendingDiff] = useState<{ added: number; removed: number } | null>(null)

  // Latest polled dataset that has NOT been promoted to `items` yet.
  // Stored in a ref so writing to it produces zero re-renders.
  const pendingDataRef = useRef<InsightFeedItem[] | null>(null)

  // ID set of whatever is currently visible to the user.
  // Stored in a ref so the polling closure always reads the live committed set
  // without needing to be recreated every time `items` changes (avoids stale closure).
  const committedIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    let cancelled = false

    // ── Shared fetcher ───────────────────────────────────────────────────────
    async function fetchAll(): Promise<InsightFeedItem[] | null> {
      let query = supabase
        .from('v_insight_feed')
        .select('*')
        .order('updated_at', { ascending: false })
        .order('id', { ascending: false })
      if (brokerId) query = query.eq('broker_id', brokerId)

      const { data, error: err } = await query
      if (cancelled) return null
      if (err) { setError(err.message); return null }
      return (data ?? []) as InsightFeedItem[]
    }

    // ── Initial load — shows spinner and commits directly to items ───────────
    async function initialLoad() {
      setLoading(true)
      const data = await fetchAll()
      if (data === null) { setLoading(false); return }
      committedIdsRef.current = new Set(data.map(i => i.id))
      setItems(data)
      setLoading(false)
    }

    // ── Background poll — only update pendingDiff state when IDs change ──────
    // This function never touches `items`, so it can never cause the card list
    // to re-render. The only possible state write is one tiny setPendingDiff call.
    async function poll() {
      const fresh = await fetchAll()
      if (fresh === null) return

      const freshIds = new Set(fresh.map(i => i.id))
      const committed = committedIdsRef.current

      // ID-set diff — O(n), no object comparisons
      const added   = fresh.filter(i => !committed.has(i.id)).length
      const removed = [...committed].filter(id => !freshIds.has(id)).length

      if (added === 0 && removed === 0) return // identical — zero state writes, zero re-renders

      // Cache the full dataset in the ref (no re-render)
      pendingDataRef.current = fresh

      // Write only the diff summary to state (one re-render for the banner)
      // Bail out of the setState if the numbers haven't actually changed
      // (e.g. two polls in a row that both see the same pending diff).
      setPendingDiff(prev =>
        prev?.added === added && prev?.removed === removed ? prev : { added, removed }
      )
    }

    initialLoad()
    const interval = setInterval(poll, 30_000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [brokerId])

  // Called when the user clicks the refresh banner.
  // Promotes pendingDataRef → items and clears the diff banner.
  // useCallback with [] because it only ever reads/writes refs and stable setters —
  // it never needs to be recreated, so the Dashboard can safely pass it to onClick
  // without wrapping it further.
  const flushPending = useCallback(() => {
    const fresh = pendingDataRef.current
    if (!fresh) return
    committedIdsRef.current = new Set(fresh.map(i => i.id))
    pendingDataRef.current = null
    setItems(fresh)
    setPendingDiff(null)
  }, [])

  return { items, loading, error, pendingDiff, flushPending }
}

export function useInsightDetail(insightId: string | undefined) {
  const [detail, setDetail] = useState<InsightDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!insightId) return

    async function fetch() {
      setLoading(true)

      const [
        insightRes,
        labelsRes,
        sectionsRes,
        metricsRes,
        recsRes,
        actionsRes,
      ] = await Promise.all([
        supabase.from('insights').select('*').eq('id', insightId).single(),
        supabase.from('insight_labels').select('*').eq('insight_id', insightId).order('display_order'),
        supabase.from('insight_sections').select('*').eq('insight_id', insightId).order('display_order'),
        supabase.from('insight_metrics').select('*').eq('insight_id', insightId).order('display_order'),
        supabase.from('insight_recommendations').select('*').eq('insight_id', insightId).order('rank'),
        supabase.from('insight_action_defs').select('*').eq('insight_id', insightId).order('display_order'),
      ])

      if (insightRes.error) {
        setError(insightRes.error.message)
        setLoading(false)
        return
      }

      const insight = insightRes.data as Insight
      const labels = (labelsRes.data ?? []) as InsightLabel[]
      const sections = (sectionsRes.data ?? []) as InsightSection[]
      const metrics = (metricsRes.data ?? []) as InsightMetric[]
      const recommendations = (recsRes.data ?? []) as InsightRecommendation[]
      const actions = (actionsRes.data ?? []) as InsightActionDef[]

      // Fetch bullets for all sections
      const sectionIds = sections.map(s => s.id)
      let bullets: InsightBullet[] = []
      if (sectionIds.length > 0) {
        const { data } = await supabase
          .from('insight_section_bullets')
          .select('*')
          .in('section_id', sectionIds)
          .order('display_order')
        bullets = (data ?? []) as InsightBullet[]
      }

      // Fetch tags and metrics for all recommendations
      const recIds = recommendations.map(r => r.id)
      let recTags: RecommendationTag[] = []
      let recMetrics: RecommendationMetric[] = []
      if (recIds.length > 0) {
        const [tagsRes, rmRes] = await Promise.all([
          supabase.from('recommendation_tags').select('*').in('recommendation_id', recIds).order('display_order'),
          supabase.from('recommendation_metrics').select('*').in('recommendation_id', recIds).order('display_order'),
        ])
        recTags = (tagsRes.data ?? []) as RecommendationTag[]
        recMetrics = (rmRes.data ?? []) as RecommendationMetric[]
      }

      setDetail({ insight, labels, sections, bullets, metrics, recommendations, recTags, recMetrics, actions })
      setLoading(false)
    }

    fetch()
  }, [insightId])

  return { detail, loading, error }
}

export function useBrokers() {
  const [brokers, setBrokers] = useState<Broker[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('brokers').select('*').then(({ data }) => {
      setBrokers((data ?? []) as Broker[])
      setLoading(false)
    })
  }, [])

  return { brokers, loading }
}
