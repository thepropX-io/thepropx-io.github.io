import { useParams } from 'react-router-dom'
import { useInsightDetail } from '../hooks/useInsights'
import { Loader } from '../components/ui/Loader'
import { PushLiveMatchView } from './views/PushLiveMatchView'
import { ActivateSegmentView } from './views/ActivateSegmentView'
import { ProtectRevenueView } from './views/ProtectRevenueView'
import { ReallocateFocusView } from './views/ReallocateFocusView'

export function InsightDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { detail, loading, error } = useInsightDetail(id)

  if (loading) {
    return (
      <div className="min-h-screen px-gradient-bg flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (error || !detail) {
    return (
      <div className="min-h-screen px-gradient-bg flex items-center justify-center">
        <div className="px-glass p-6 text-center">
          <p className="text-red-400 text-sm">{error ?? 'Insight not found'}</p>
        </div>
      </div>
    )
  }

  const views: Record<string, React.ComponentType<{ detail: typeof detail }>> = {
    push_live_match:  PushLiveMatchView,
    activate_segment: ActivateSegmentView,
    protect_revenue:  ProtectRevenueView,
    reallocate_focus: ReallocateFocusView,
  }

  const View = views[detail.insight.insight_type] ?? PushLiveMatchView

  return <View detail={detail} />
}
