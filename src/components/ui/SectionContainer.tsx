import type { ReactNode } from 'react'

interface SectionContainerProps {
  title?: string
  icon?: ReactNode
  children: ReactNode
  className?: string
}

export function SectionContainer({ title, icon, children, className = '' }: SectionContainerProps) {
  return (
    <section className={`mb-10 ${className}`}>
      {title && (
        <div className="flex items-center gap-2 mb-4">
          {icon}
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">
            {title}
          </h3>
        </div>
      )}
      {children}
    </section>
  )
}
