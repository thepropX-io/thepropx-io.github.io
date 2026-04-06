/* ── Insight feed row (from v_insight_feed view) ──────── */
export interface InsightFeedItem {
  id: string
  broker_id: string
  broker_name: string
  insight_type: 'push_live_match' | 'activate_segment' | 'protect_revenue' | 'reallocate_focus'
  title: string
  summary: string
  subtitle: string | null
  status_badge_text: string | null
  status_tone: string | null
  priority: string
  priority_score: number
  confidence: number | null
  score_label: string | null
  state: string
  is_active: boolean
  primary_cta_label: string | null
  primary_cta_type: string | null
  source_labels: { type: string; value: string }[] | null
  why_now_bullets: string[] | null
  context_data: Record<string, unknown> | null
}

/* ── Insight detail (full card) ───────────────────────── */
export interface Insight {
  id: string
  broker_id: string
  insight_type: string
  title: string
  summary: string
  subtitle: string | null
  status_badge_text: string | null
  status_tone: string | null
  priority: string
  priority_score: number
  confidence: number | null
  score_label: string | null
  state: string
  is_active: boolean
  primary_cta_label: string | null
  primary_cta_type: string | null
  anchor_entity_type: string | null
  anchor_entity_id: string | null
  anchor_display_name: string | null
  context_data: Record<string, unknown> | null
}

export interface InsightLabel {
  id: string
  insight_id: string
  label_type: string
  label_value: string
  display_order: number
}

export interface InsightSection {
  id: string
  insight_id: string
  parent_section_id: string | null
  section_key: string
  section_title: string | null
  body_text: string | null
  display_order: number
}

export interface InsightBullet {
  id: string
  section_id: string
  bullet_text: string
  display_order: number
}

export interface InsightMetric {
  id: string
  insight_id: string
  metric_type: string
  metric_label: string
  numeric_value: number | null
  display_value: string
  unit: string | null
  display_order: number
}

export interface InsightRecommendation {
  id: string
  insight_id: string
  recommendation_type: string
  rank: number
  score: number | null
  score_label: string | null
  display_name: string
  subtitle: string | null
  price_aed: number | null
  yield_pct: number | null
  size_sqft: number | null
  days_on_market: number | null
  budget_min_aed: number | null
  budget_max_aed: number | null
  yield_target_pct: number | null
  investment_horizon: string | null
  reason_summary: string | null
  crm_mandate_id: string | null
  inventory_id: string | null
  listing_id: string | null
  buyer_id: string | null
}

export interface RecommendationTag {
  id: string
  recommendation_id: string
  tag_type: string
  tag_value: string
  display_order: number
}

export interface RecommendationMetric {
  id: string
  recommendation_id: string
  metric_type: string
  metric_label: string
  numeric_value: number | null
  display_value: string
  unit: string | null
  display_order: number
}

export interface InsightActionDef {
  id: string
  insight_id: string
  recommendation_id: string | null
  scope: string
  action_type: string
  label: string
  is_primary: boolean
  target_entity_type: string | null
  target_entity_id: string | null
  payload_template: Record<string, unknown> | null
  display_order: number
}

/* ── Full detail bundle ───────────────────────────────── */
export interface InsightDetail {
  insight: Insight
  labels: InsightLabel[]
  sections: InsightSection[]
  bullets: InsightBullet[]
  metrics: InsightMetric[]
  recommendations: InsightRecommendation[]
  recTags: RecommendationTag[]
  recMetrics: RecommendationMetric[]
  actions: InsightActionDef[]
}

/* ── Auth ──────────────────────────────────────────────── */
export interface Broker {
  id: string
  name: string
  email: string
  focus_areas: string[]
}
