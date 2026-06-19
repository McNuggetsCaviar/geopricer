import { useEffect, useRef, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { useAudio } from '../../context/AudioContext'
import { CITY_ORDER, MODULE_ORDER } from '../../data/cityConfig'
import TutorialSidebar from './TutorialSidebar'
import CentralMap from '../map/CentralMap'
import StatsPanel from './StatsPanel'

function Header({ onPauseResume, isPlaying, hasAudio }) {
  return (
    <header
      className="flex items-center justify-between px-4 py-2 border-b border-border flex-shrink-0"
      style={{ background: '#0D1117', height: 44 }}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-5 bg-risk-low rounded-full" />
          <span className="text-sm font-bold tracking-tight" style={{ color: '#E2E8F0', letterSpacing: '-0.01em' }}>
            Geo<span style={{ color: '#1D9E75' }}>Pricer</span>
          </span>
          <span className="text-xs text-muted font-mono hidden sm:inline">v1.0</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted font-mono">
          <span className="text-border">·</span>
          <span>Risk Assessment Platform</span>
          <span className="text-border">·</span>
          <span style={{ color: '#1D9E75' }}>AXA Climate</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {hasAudio && (
          <button
            onClick={onPauseResume}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-border text-xs text-muted hover:text-text hover:border-accent/40 transition-all"
          >
            {isPlaying ? (
              <><span>⏸</span><span className="hidden sm:inline">Pause audio</span></>
            ) : (
              <><span>▶</span><span className="hidden sm:inline">Reprendre</span></>
            )}
          </button>
        )}
        <div className="text-xs text-muted font-mono hidden md:block">
          IBTrACS · ERA5 · FEMA
        </div>
      </div>
    </header>
  )
}

function AudioUnlockOverlay({ onUnlock }) {
  return (
    <div
      className="absolute inset-0 z-[2000] flex items-center justify-center"
      style={{ background: 'rgba(10,14,23,0.92)', backdropFilter: 'blur(4px)' }}
      onClick={onUnlock}
    >
      <div className="text-center animate-fade-up">
        <div className="text-5xl mb-4">▶</div>
        <div className="text-lg font-semibold text-text mb-2">Cliquez pour démarrer</div>
        <div className="text-sm text-muted">L'audio guidé se lancera automatiquement</div>
        <div className="mt-6 text-xs text-muted/60 font-mono">
          GeoPricer v1.0 — Moteur de risque climatique
        </div>
      </div>
    </div>
  )
}

function CompletionScreen({ onRestart }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(10,14,23,0.96)', backdropFilter: 'blur(8px)' }}>
      <div className="text-center animate-fade-up max-w-lg px-8">
        <div className="text-5xl mb-6">✅</div>
        <div className="text-2xl font-bold text-text mb-3">Présentation terminée</div>
        <p className="text-sm text-muted leading-relaxed mb-8">
          Les trois zones ont été analysées — Manille, Miami, Tokyo. La méthodologie AAL, le modèle Holland, et les stratégies d'adaptation ont été présentés sur 15 modules.
        </p>
        <div className="grid grid-cols-3 gap-4 mb-8 text-xs font-mono">
          {[
            { city: '🇵🇭 Manille', risk: 'Typhon', color: '#E24B4A' },
            { city: '🇺🇸 Miami', risk: 'Ouragan', color: '#EF9F27' },
            { city: '🇯🇵 Tokyo', risk: 'Tsunami', color: '#60A5FA' },
          ].map((c) => (
            <div key={c.city} className="rounded-lg p-3 border border-border" style={{ background: '#0D1117' }}>
              <div className="text-text mb-1">{c.city}</div>
              <div style={{ color: c.color }}>{c.risk} ✓</div>
            </div>
          ))}
        </div>
        <button
          onClick={onRestart}
          className="text-sm text-muted border border-border hover:border-accent/40 hover:text-text px-5 py-2 rounded transition-all"
        >
          ← Revoir un module
        </button>
      </div>
    </div>
  )
}

export default function WorkspaceLayout() {
  const { state: appState } = useApp()
  const { state: audioState, pause, resume, unlock, play } = useAudio()
  const [showUnlock, setShowUnlock] = useState(!audioState.isUnlocked)
  const [showCompletion, setShowCompletion] = useState(false)
  const conclusionPlayed = useRef(false)

  // Detect all 15 modules visited → play conclusion + show screen
  useEffect(() => {
    const allDone = CITY_ORDER.every((c) =>
      MODULE_ORDER.every((m) => appState.visitedModules[c]?.[m])
    )
    if (allDone && !conclusionPlayed.current) {
      conclusionPlayed.current = true
      play('09_conclusion')
      setTimeout(() => setShowCompletion(true), 500)
    }
  }, [appState.visitedModules, play])

  function handleUnlock() {
    unlock()
    setShowUnlock(false)
  }

  return (
    <div className="relative flex flex-col h-full" style={{ background: '#0A0E17' }}>
      {showUnlock && <AudioUnlockOverlay onUnlock={handleUnlock} />}
      {showCompletion && <CompletionScreen onRestart={() => setShowCompletion(false)} />}

      <Header
        onPauseResume={audioState.isPlaying ? pause : resume}
        isPlaying={audioState.isPlaying}
        hasAudio={!!audioState.currentClip || audioState.isPlaying}
      />

      <div className="flex flex-1 overflow-hidden">
        <TutorialSidebar />
        <CentralMap />
        <StatsPanel />
      </div>
    </div>
  )
}
