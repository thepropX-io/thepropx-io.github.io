import { useState, useEffect } from 'react'
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

  useEffect(() => {
    let cancelled = false

    async function load(showSpinner: boolean) {
      if (showSpinner) setLoading(true)
      let query = supabase
        .from('v_insight_feed')
        .select('*')
        // Fetch all insights (active + inactive) — frontend splits them by is_active.
        // Primary: newest first. For items with identical timestamps (batch inserts),
        // tie-break by `id` (UUID) to avoid grouping identical-type batches together.
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })

      if (brokerId) {
        query = query.eq('broker_id', brokerId)
      }

      const { data, error: err } = await query
      if (cancelled) return
      if (err) {
        setError(err.message)
      } else {
        setItems((data ?? []) as InsightFeedItem[])
      }
      if (showSpinner) setLoading(false)
    }

    load(true)

    // Auto-refresh every 30 seconds — runs silently in the background without
    // showing the loading spinner so the UI doesn't flash.
    const interval = setInterval(() => load(false), 30_000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [brokerId])

  return { items, loading, error }
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
