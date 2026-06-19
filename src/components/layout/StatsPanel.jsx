import { useApp } from '../../context/AppContext'
import { useAudio } from '../../context/AudioContext'
import { CITIES } from '../../data/cityConfig'
import ZoneModule from '../modules/ZoneModule'
import HistoryModule from '../modules/HistoryModule'
import PortfolioModule from '../modules/PortfolioModule'
import AALModule from '../modules/AALModule'
import MitigationModule from '../modules/MitigationModule'
import ROIModule from '../modules/ROIModule'
import SourcesModule from '../modules/SourcesModule'

const MODULE_COMPONENTS = {
  zone: ZoneModule,
  history: HistoryModule,
  portfolio: PortfolioModule,
  aal: AALModule,
  mitigation: MitigationModule,
  roi: ROIModule,
  sources: SourcesModule,
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <div className="text-4xl mb-4 opacity-40">🗺️</div>
      <div className="text-sm text-muted">
        Sélectionnez un module dans le panneau de gauche pour commencer l'analyse.
      </div>
      <div className="mt-4 text-xs text-muted/60 font-mono">
        Conseil : commencez par "Zone & Quartier"
      </div>
    </div>
  )
}

function AudioControls() {
  const { state, pause, resume } = useAudio()

  if (!state.currentClip && !state.isPlaying) return null

  return (
    <div className="flex items-center gap-2 px-2">
      <div className="w-1.5 h-1.5 rounded-full bg-risk-low animate-pulse" />
      <span className="text-xs text-muted font-mono truncate max-w-24">{state.currentClip}</span>
      <button
        onClick={state.isPlaying ? pause : resume}
        className="text-xs text-muted hover:text-text px-1"
      >
        {state.isPlaying ? '⏸' : '▶'}
      </button>
    </div>
  )
}

export default function StatsPanel() {
  const { state } = useApp()
  const city = CITIES[state.activeCity]
  const ActiveModule = state.activeModule ? MODULE_COMPONENTS[state.activeModule] : null

  return (
    <div
      className="flex flex-col h-full border-l border-border"
      style={{ background: '#0D1117', width: 280, minWidth: 280 }}
    >
      {/* Panel header */}
      <div className="px-3 py-2.5 border-b border-border flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm">{city.country}</span>
          <div>
            <div className="text-xs font-semibold text-text leading-none">{city.label}</div>
            <div className="text-xs text-muted leading-none mt-0.5 truncate" style={{ maxWidth: 160 }}>
              {city.riskType}
            </div>
          </div>
        </div>
        <AudioControls />
      </div>

      {/* Active module content */}
      <div className="flex-1 overflow-y-auto p-3">
        {ActiveModule ? <ActiveModule /> : <EmptyState />}
      </div>

      {/* Bottom data badge */}
      <div className="px-3 py-2 border-t border-border flex items-center justify-between flex-shrink-0">
        <span className="text-xs text-muted font-mono">AAL</span>
        <span className="text-xs font-mono" style={{ color: '#E24B4A' }}>
          {city.label} · {city.district}
        </span>
      </div>
    </div>
  )
}
