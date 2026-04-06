interface LoaderProps {
  text?: string
}

export function Loader({ text = 'Loading intelligence…' }: LoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="h-8 w-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      <p className="text-sm text-white/40">{text}</p>
    </div>
  )
}
