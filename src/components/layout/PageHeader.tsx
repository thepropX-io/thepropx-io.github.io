import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  backLabel?: string
  contextIcon?: ReactNode
  contextLabel?: string
}

export function PageHeader({ backLabel = 'Back to Top Actions', contextIcon, contextLabel }: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-3">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors cursor-pointer"
      >
        <ArrowLeft size={14} />
        {backLabel}
      </button>
      {contextLabel && (
        <>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-1.5 text-sm text-white/60">
            {contextIcon}
            {contextLabel}
          </div>
        </>
      )}
    </div>
  )
}
