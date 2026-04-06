interface MetricRowProps {
  label: string
  value: string
  accent?: boolean
}

export function MetricRow({ label, value, accent }: MetricRowProps) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">{label}</p>
      <p className={`text-lg font-semibold ${accent ? 'text-emerald-400' : 'text-white'}`}>{value}</p>
    </div>
  )
}

interface MetricGridProps {
  metrics: { label: string; value: string; accent?: boolean }[]
  columns?: number
}

export function MetricGrid({ metrics, columns = 2 }: MetricGridProps) {
  return (
    <div className={`grid gap-4 ${columns === 2 ? 'grid-cols-2' : columns === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
      {metrics.map((m) => (
        <MetricRow key={m.label} {...m} />
      ))}
    </div>
  )
}
