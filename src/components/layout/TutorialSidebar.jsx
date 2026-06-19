import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { useAudio } from '../../context/AudioContext'
import { CITIES, CITY_ORDER, MODULE_ORDER, MODULE_LABELS, MODULE_ICONS } from '../../data/cityConfig'

function ProgressRing({ visited, total }) {
  const pct = total === 0 ? 0 : visited / total
  const r = 18
  const circ = 2 * Math.PI * r
  const dash = circ * pct

  return (
    <svg width="48" height="48" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r={r} fill="none" stroke="#1F2937" strokeWidth="3" />
      <circle
        cx="24" cy="24" r={r}
        fill="none"
        stroke="#1D9E75"
        strokeWidth="3"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 24 24)"
        style={{ transition: 'stroke-dasharray 0.5s ease' }}
      />
      <text x="24" y="24" textAnchor="middle" dominantBaseline="middle" fill="#E2E8F0" fontSize="10" fontFamily="JetBrains Mono, monospace">
        {visited}/{total}
      </text>
    </svg>
  )
}

function ModuleItem({ cityId, moduleId, visited }) {
  const { state, dispatch } = useApp()
  const { play } = useAudio()
  const city = CITIES[cityId]
  const isActive = state.activeCity === cityId && state.activeModule === moduleId

  function handleClick() {
    dispatch({ type: 'SET_ACTIVE_CITY', city: cityId })
    dispatch({ type: 'SET_ACTIVE_MODULE', module: moduleId })
    const clips = city.audioClips[moduleId]
    if (clips) play(clips)
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left transition-all duration-200 group
        ${isActive
          ? 'bg-panel border border-accent/40 text-text'
          : 'hover:bg-panel/60 text-muted hover:text-text border border-transparent'
        }`}
    >
      <span className="text-sm w-5 flex-shrink-0 text-center">
        {visited ? (
          <span style={{ color: '#1D9E75' }}>✓</span>
        ) : (
          <span className="w-3.5 h-3.5 rounded-sm border border-muted/50 inline-block" />
        )}
      </span>
      <span className="text-xs">{MODULE_ICONS[moduleId]}</span>
      <span className="text-xs leading-tight truncate">{MODULE_LABELS[moduleId]}</span>
    </button>
  )
}

function CitySection({ cityId }) {
  const { state, dispatch } = useApp()
  const city = CITIES[cityId]
  const visited = state.visitedModules[cityId]
  const visitedCount = Object.values(visited).filter(Boolean).length
  const isActiveCity = state.activeCity === cityId
  const [open, setOpen] = useState(cityId === 'manila')

  // Auto-expand when this city becomes active via map tabs
  useEffect(() => {
    if (isActiveCity) setOpen(true)
  }, [isActiveCity])

  function handleCityClick() {
    dispatch({ type: 'SET_ACTIVE_CITY', city: cityId })
    setOpen((o) => !o)
  }

  return (
    <div className="mb-1">
      <button
        onClick={handleCityClick}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded transition-all duration-200
          ${isActiveCity ? 'bg-panel text-text' : 'text-muted hover:text-text hover:bg-panel/40'}`}
      >
        <span className="text-base">{city.country}</span>
        <div className="flex-1 text-left">
          <div className="text-sm font-medium leading-none">{city.label}</div>
          <div className="text-xs text-muted leading-tight mt-0.5 truncate">{city.district}</div>
        </div>
        <div className="text-xs font-mono" style={{ color: '#1D9E75' }}>
          {visitedCount}/{MODULE_ORDER.length}
        </div>
        <svg
          className={`w-3 h-3 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="ml-2 mt-0.5 space-y-0.5">
          {MODULE_ORDER.map((modId) => (
            <ModuleItem
              key={modId}
              cityId={cityId}
              moduleId={modId}
              visited={visited[modId]}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function TutorialSidebar() {
  const { state } = useApp()

  const totalModules = CITY_ORDER.length * MODULE_ORDER.length
  const visitedTotal = CITY_ORDER.reduce(
    (acc, city) =>
      acc + Object.values(state.visitedModules[city]).filter(Boolean).length,
    0
  )

  return (
    <div
      className="flex flex-col h-full border-r border-border"
      style={{ background: '#0D1117', width: 220, minWidth: 220 }}
    >
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-3">
          <ProgressRing visited={visitedTotal} total={totalModules} />
          <div>
            <div className="text-xs font-medium text-text">Guide d'exploration</div>
            <div className="text-xs text-muted mt-0.5">
              {visitedTotal === totalModules ? '✅ Complété !' : `${totalModules - visitedTotal} modules restants`}
            </div>
          </div>
        </div>
      </div>

      {/* City list */}
      <div className="flex-1 overflow-y-auto p-2">
        {CITY_ORDER.map((cityId) => (
          <CitySection key={cityId} cityId={cityId} />
        ))}
      </div>

      {/* Footer hint */}
      <div className="p-3 border-t border-border">
        <p className="text-xs text-muted leading-relaxed">
          Cliquez sur un module pour l'explorer. L'audio démarre automatiquement.
        </p>
      </div>
    </div>
  )
}
