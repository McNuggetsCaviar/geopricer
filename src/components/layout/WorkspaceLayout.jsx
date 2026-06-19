import { useEffect, useState } from 'react'
import { useAudio } from '../../context/AudioContext'
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

export default function WorkspaceLayout() {
  const { state, pause, resume, unlock } = useAudio()
  const [showUnlock, setShowUnlock] = useState(!state.isUnlocked)

  function handleUnlock() {
    unlock()
    setShowUnlock(false)
  }

  return (
    <div className="relative flex flex-col h-full" style={{ background: '#0A0E17' }}>
      {showUnlock && <AudioUnlockOverlay onUnlock={handleUnlock} />}

      <Header
        onPauseResume={state.isPlaying ? pause : resume}
        isPlaying={state.isPlaying}
        hasAudio={!!state.currentClip || state.isPlaying}
      />

      <div className="flex flex-1 overflow-hidden">
        <TutorialSidebar />
        <CentralMap />
        <StatsPanel />
      </div>
    </div>
  )
}
