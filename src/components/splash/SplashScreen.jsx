import { useApp } from '../../context/AppContext'
import { useDataLoader } from '../../hooks/useDataLoader'

const TASKS = [
  { key: 'openMeteoManila', label: 'Données ERA5 — Manille (Open-Meteo)', icon: '🌀' },
  { key: 'openMeteoMiami', label: 'Données ERA5 — Miami (Open-Meteo)', icon: '🌪️' },
  { key: 'openMeteoTokyo', label: 'Données ERA5 — Tokyo (Open-Meteo)', icon: '🌊' },
  { key: 'storms', label: 'Trajectoires IBTrACS — 6 tempêtes historiques', icon: '⚡' },
  { key: 'elevation', label: 'Modèle d\'élévation numérique (MNT)', icon: '📡' },
]

function TaskRow({ task }) {
  const { state } = useApp()
  const status = state.loadingProgress[task.key]

  const icons = {
    idle: <span className="w-4 h-4 rounded-full border border-muted inline-block" />,
    loading: (
      <svg className="w-4 h-4 animate-spin text-accent" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    ),
    done: <span className="text-risk-low text-sm">✓</span>,
    error: <span className="text-risk-med text-sm">⚠</span>,
  }

  const colors = {
    idle: 'text-muted',
    loading: 'text-text',
    done: 'text-risk-low',
    error: 'text-risk-med',
  }

  return (
    <div className={`flex items-center gap-3 py-1.5 transition-all duration-300 ${colors[status]}`}>
      <div className="w-4 flex-shrink-0 flex items-center justify-center">{icons[status]}</div>
      <span className="text-xs font-mono">
        {task.icon} {task.label}
      </span>
      {status === 'error' && (
        <span className="text-xs text-muted ml-auto">fallback</span>
      )}
    </div>
  )
}

export default function SplashScreen() {
  useDataLoader()
  const { state } = useApp()
  const progress = state.loadingProgress

  const doneCount = Object.values(progress).filter(
    (s) => s === 'done' || s === 'error'
  ).length
  const total = Object.keys(progress).length
  const pct = Math.round((doneCount / total) * 100)

  return (
    <div
      className="fixed inset-0 bg-app flex flex-col items-center justify-center z-50"
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      {/* Scanline effect */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden opacity-5"
        style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)' }}
      />

      {/* Logo area */}
      <div className="mb-12 text-center">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-2 h-8 bg-risk-low rounded-full" />
          <h1
            className="text-4xl font-bold tracking-tight"
            style={{ color: '#E2E8F0', letterSpacing: '-0.02em' }}
          >
            Geo<span style={{ color: '#1D9E75' }}>Pricer</span>
          </h1>
          <div className="w-2 h-8 bg-risk-low rounded-full" />
        </div>
        <p className="text-xs font-mono text-muted tracking-widest uppercase">
          v1.0 — Moteur de risque climatique
        </p>
      </div>

      {/* Loading panel */}
      <div
        className="w-full max-w-md rounded-lg border border-border p-6"
        style={{ background: '#111827' }}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono text-muted uppercase tracking-widest">
            Initialisation des modules
          </span>
          <span className="text-xs font-mono" style={{ color: '#1D9E75' }}>
            {pct}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-border rounded-full mb-6 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, #1D9E75, #34D399)',
            }}
          />
        </div>

        {/* Task list */}
        <div className="space-y-0.5">
          {TASKS.map((t) => (
            <TaskRow key={t.key} task={t} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-10 text-center">
        <p className="text-xs text-muted font-mono">
          AXA Climate — Risk Assessment & IA · 2024
        </p>
        <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted font-mono">
          <span>IBTrACS · NOAA</span>
          <span className="text-border">·</span>
          <span>Open-Meteo ERA5</span>
          <span className="text-border">·</span>
          <span>FEMA Hazus</span>
        </div>
      </div>

      {/* Blinking cursor */}
      {pct < 100 && (
        <div className="absolute bottom-4 left-4 font-mono text-xs text-muted animate-blink">
          █
        </div>
      )}
    </div>
  )
}
