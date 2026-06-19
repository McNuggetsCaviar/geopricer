import { useEffect, useRef, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { useAudio } from '../../context/AudioContext'
import { CITY_ORDER, MODULE_ORDER } from '../../data/cityConfig'
import TutorialSidebar from './TutorialSidebar'
import CentralMap from '../map/CentralMap'
import StatsPanel from './StatsPanel'

// Ordered sequence of all clips with their workspace destination
const CLIP_SEQUENCE = [
  { id: '02_manille_zone',     label: 'Manille — Zone & Quartier',   city: 'manila', module: 'zone' },
  { id: '03_manille_rammasun', label: 'Manille — Rammasun 2014',     city: 'manila', module: 'history' },
  { id: '04_manille_ketsana',  label: 'Manille — Ketsana 2009',      city: 'manila', module: 'history' },
  { id: '05_manille_aal',      label: 'Manille — Calcul AAL',        city: 'manila', module: 'aal' },
  { id: '06_manille_mitigation', label: 'Manille — Mitigation',      city: 'manila', module: 'mitigation' },
  { id: '07_miami_zone',       label: 'Miami — Brickell',            city: 'miami',  module: 'zone' },
  { id: '08_tokyo_zone',       label: 'Tokyo — Kōtō-ku',            city: 'tokyo',  module: 'zone' },
  { id: '09_conclusion',       label: 'Conclusion',                  city: null,     module: null },
]

function fmt(secs) {
  if (!secs || !isFinite(secs)) return '0:00'
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function AudioPlayerBar() {
  const { state: audioState, play, pause, resume, audioRef } = useAudio()
  const { dispatch } = useApp()
  const [progress, setProgress] = useState({ current: 0, duration: 0 })

  // Poll audio currentTime at 4fps for smooth progress bar
  useEffect(() => {
    const id = setInterval(() => {
      const audio = audioRef.current
      if (audio) setProgress({ current: audio.currentTime, duration: audio.duration || 0 })
    }, 250)
    return () => clearInterval(id)
  }, [audioRef])

  const currentIdx = CLIP_SEQUENCE.findIndex(c => c.id === audioState.currentClip)
  const currentClipInfo = CLIP_SEQUENCE[currentIdx] ?? null
  const hasPrev = currentIdx > 0
  const hasNext = currentIdx < CLIP_SEQUENCE.length - 1

  function navigate(idx) {
    const clip = CLIP_SEQUENCE[idx]
    if (!clip) return
    play(clip.id)
    if (clip.city) {
      dispatch({ type: 'SET_ACTIVE_CITY', city: clip.city })
      dispatch({ type: 'SET_ACTIVE_MODULE', module: clip.module })
    }
  }

  function handleSeek(e) {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    audio.currentTime = ratio * audio.duration
    setProgress({ current: audio.currentTime, duration: audio.duration })
  }

  const pct = progress.duration > 0 ? (progress.current / progress.duration) * 100 : 0

  return (
    <div
      className="flex items-center gap-3 px-4 border-t border-border flex-shrink-0"
      style={{ background: '#0D1117', height: 48 }}
    >
      {/* Prev */}
      <button
        onClick={() => navigate(currentIdx - 1)}
        disabled={!hasPrev}
        className="text-muted hover:text-text disabled:opacity-20 transition-colors text-sm w-6 text-center"
        title="Clip précédent"
      >
        ⏮
      </button>

      {/* Play / Pause */}
      <button
        onClick={audioState.isPlaying ? pause : resume}
        className="text-text hover:text-risk-low transition-colors text-base w-6 text-center"
        title={audioState.isPlaying ? 'Pause' : 'Lecture'}
      >
        {audioState.isPlaying ? '⏸' : '▶'}
      </button>

      {/* Next */}
      <button
        onClick={() => navigate(currentIdx + 1)}
        disabled={!hasNext}
        className="text-muted hover:text-text disabled:opacity-20 transition-colors text-sm w-6 text-center"
        title="Clip suivant"
      >
        ⏭
      </button>

      {/* Clip label */}
      <div className="text-xs font-mono text-muted truncate w-44 flex-shrink-0">
        {currentClipInfo ? currentClipInfo.label : <span className="opacity-40">— En attente —</span>}
      </div>

      {/* Progress bar — clickable to seek */}
      <div
        className="flex-1 h-1 rounded-full cursor-pointer group relative"
        style={{ background: '#1F2937' }}
        onClick={handleSeek}
      >
        <div
          className="h-full rounded-full transition-none"
          style={{ width: `${pct}%`, background: '#1D9E75' }}
        />
        {/* Scrubber dot */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-text opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{ left: `calc(${pct}% - 5px)` }}
        />
      </div>

      {/* Time */}
      <div className="text-xs font-mono text-muted flex-shrink-0 tabular-nums">
        {fmt(progress.current)} / {fmt(progress.duration)}
      </div>
    </div>
  )
}

function Header() {
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
      <div className="text-xs text-muted font-mono hidden md:block">
        IBTrACS · ERA5 · FEMA
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
  const { state: audioState, unlock, play } = useAudio()
  const [showUnlock, setShowUnlock] = useState(!audioState.isUnlocked)
  const [showCompletion, setShowCompletion] = useState(false)
  const conclusionPlayed = useRef(false)

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

      <Header />

      <div className="flex flex-1 overflow-hidden">
        <TutorialSidebar />
        <CentralMap />
        <StatsPanel />
      </div>

      <AudioPlayerBar />
    </div>
  )
}
