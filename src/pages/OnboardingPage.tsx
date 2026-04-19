import { useState } from 'react'

interface Props {
  focusAreaOptions: string[]
  createBroker: (name: string, focusAreas: string[]) => Promise<void>
  brokerLoading: boolean
  signOut: () => Promise<void>
}

export function OnboardingPage({ focusAreaOptions, createBroker, brokerLoading, signOut }: Props) {
  const [name, setName] = useState('')
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function toggleArea(area: string) {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Please enter your name.')
      return
    }
    if (selectedAreas.length === 0) {
      setError('Select at least one focus area.')
      return
    }

    setSubmitting(true)
    try {
      await createBroker(name.trim(), selectedAreas)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile.')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen px-gradient-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-light tracking-tight text-white/90">
            prop<span className="font-bold text-purple-400">X</span>
          </h1>
          <p className="text-sm text-white/30 mt-2">Set up your broker profile</p>
        </div>

        <form onSubmit={handleSubmit} className="px-glass p-6 space-y-5">
          <h2 className="text-lg font-medium text-white">Welcome — let's get you set up</h2>

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label
              htmlFor="broker-name"
              className="block text-xs uppercase tracking-wider text-white/30 mb-1.5"
            >
              Your name
            </label>
            <input
              id="broker-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 transition-colors"
              placeholder="Full name"
            />
          </div>

          {/* Focus areas */}
          <div>
            <p className="block text-xs uppercase tracking-wider text-white/30 mb-2">
              Focus areas
            </p>
            {brokerLoading ? (
              <p className="text-sm text-white/30">Loading communities…</p>
            ) : focusAreaOptions.length === 0 ? (
              <p className="text-sm text-white/30">No communities available.</p>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1 rounded-lg border border-white/10 bg-white/[0.03] p-3">
                {focusAreaOptions.map((area) => (
                  <label
                    key={area}
                    className="flex items-center gap-2.5 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAreas.includes(area)}
                      onChange={() => toggleArea(area)}
                      className="accent-purple-500 w-4 h-4 rounded"
                    />
                    <span className="text-sm text-white/70 group-hover:text-white transition-colors">
                      {area}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 py-3 text-sm font-medium text-white transition-colors cursor-pointer"
          >
            {submitting ? 'Setting up…' : 'Start using PropX'}
          </button>

          <p className="text-center text-sm text-white/30 pt-1">
            Wrong account?{' '}
            <button
              type="button"
              onClick={signOut}
              className="text-purple-400 hover:text-purple-300 cursor-pointer"
            >
              Sign out
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
