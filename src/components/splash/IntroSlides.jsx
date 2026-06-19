import { useState, useEffect, useRef } from 'react'
import { useApp } from '../../context/AppContext'
import { useAudio } from '../../context/AudioContext'

const SLIDES = [
  {
    tag: 'PROBLÉMATIQUE',
    title: 'Le risque climatique physique dans l\'immobilier',
    body: 'Un bien parfaitement situé sur le plan commercial peut être structurellement exposé à un typhon, une submersion marine, ou un tsunami. La localisation devient un facteur de risque de perte en capital — un paramètre encore rarement pricé.',
    accent: '#1D9E75',
  },
  {
    tag: 'MÉTHODOLOGIE',
    title: 'AAL = Exposition × Aléa × Vulnérabilité',
    body: 'La perte annuelle moyenne, standard des réassureurs. Exposure : valeur de marché de l\'actif. Hazard : probabilité annuelle d\'un événement d\'intensité donnée. Vulnerability : taux de dommage structurel attendu selon le type de bâti.',
    accent: '#EF9F27',
    formula: true,
  },
  {
    tag: 'DONNÉES',
    title: 'Sources publiques, aucune donnée inventée',
    items: [
      { icon: '🌀', label: 'IBTrACS NOAA', detail: 'Trajectoires storms 1980–2023' },
      { icon: '💨', label: 'ERA5 Open-Meteo', detail: '40 ans de vent réanalysé' },
      { icon: '🏗️', label: 'FEMA Hazus 5.1', detail: 'Courbes de dommage structurel' },
      { icon: '🗺️', label: 'OpenStreetMap', detail: 'Footprints de bâtiments réels' },
    ],
    accent: '#60A5FA',
  },
  {
    tag: 'MODÈLE DE VENT',
    title: 'Holland (1980) — vent à l\'adresse exacte',
    body: 'Pour chaque événement historique, le modèle calcule le vent subi par chaque bâtiment individuellement à partir de la trajectoire IBTrACS, du rayon de vents maximaux (Willoughby-Darling 2004), et de la distance au centre du système.',
    accent: '#E24B4A',
  },
  {
    tag: '3 ZONES D\'ÉTUDE',
    title: 'Manille · Miami · Tokyo',
    items: [
      { icon: '🇵🇭', label: 'Manille — Malate', detail: 'Risque typhon, Pacifique Ouest' },
      { icon: '🇺🇸', label: 'Miami — Brickell', detail: 'Ouragan + submersion marine' },
      { icon: '🇯🇵', label: 'Tokyo — Kōtō-ku', detail: 'Tsunami + delta inondable' },
    ],
    accent: '#1D9E75',
  },
  {
    tag: 'VALIDATION',
    title: 'Calibré sur pertes documentées réelles',
    body: 'Chaque résultat du modèle est confronté aux pertes économiques publiées par Swiss Re, Munich Re, NDRRMC, NHC et la Banque mondiale. L\'objectif n\'est pas l\'exactitude absolue, mais la cohérence d\'ordre de grandeur.',
    accent: '#EF9F27',
  },
]

export default function IntroSlides() {
  const { dispatch } = useApp()
  const { state: audioState, play, unlock, pause } = useAudio()
  const [slide, setSlide] = useState(0)
  const [audioDone, setAudioDone] = useState(false)
  const [showUnlock, setShowUnlock] = useState(!audioState.isUnlocked)
  const prevClip = useRef(null)

  // Detect when intro audio ends
  useEffect(() => {
    if (prevClip.current === '01_intro' && !audioState.isPlaying && !audioState.currentClip) {
      setAudioDone(true)
    }
    prevClip.current = audioState.currentClip
  }, [audioState.isPlaying, audioState.currentClip])

  function handleUnlock() {
    unlock()
    setShowUnlock(false)
    play('01_intro')
  }

  function goToWorkspace() {
    pause()
    dispatch({ type: 'SET_PHASE', phase: 'workspace' })
  }

  function nextSlide() {
    setSlide((s) => Math.min(s + 1, SLIDES.length - 1))
  }
  function prevSlide() {
    setSlide((s) => Math.max(s - 1, 0))
  }

  const current = SLIDES[slide]

  return (
    <div className="relative flex flex-col h-full" style={{ background: '#0A0E17' }}>
      {/* Audio unlock overlay */}
      {showUnlock && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center cursor-pointer"
          style={{ background: 'rgba(10,14,23,0.95)', backdropFilter: 'blur(4px)' }}
          onClick={handleUnlock}
        >
          <div className="text-center animate-fade-up">
            <div className="text-5xl mb-4">▶</div>
            <div className="text-lg font-semibold text-text mb-2">Cliquez pour démarrer</div>
            <div className="text-sm text-muted">L'audio guidé se lancera automatiquement</div>
            <div className="mt-6 text-xs font-mono" style={{ color: '#1D9E75' }}>
              GeoPricer v1.0 — AXA Climate
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-border flex-shrink-0" style={{ background: '#0D1117' }}>
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-5 bg-risk-low rounded-full" />
          <span className="text-sm font-bold" style={{ color: '#E2E8F0' }}>
            Geo<span style={{ color: '#1D9E75' }}>Pricer</span>
          </span>
          <span className="text-xs text-muted font-mono">v1.0 · Risk Assessment Platform · AXA Climate</span>
        </div>
        <div className="flex items-center gap-3">
          {audioState.isPlaying && (
            <div className="flex items-center gap-1.5 text-xs font-mono" style={{ color: '#1D9E75' }}>
              <span className="animate-pulse">●</span>
              <span>Audio en cours</span>
            </div>
          )}
          <button
            onClick={goToWorkspace}
            className="text-xs text-muted hover:text-text border border-border hover:border-accent/40 px-3 py-1 rounded transition-all font-mono"
          >
            Passer l'intro →
          </button>
        </div>
      </header>

      {/* Main slide area */}
      <div className="flex-1 flex items-center justify-center px-8 py-6">
        <div className="max-w-2xl w-full animate-fade-up" key={slide}>
          {/* Tag */}
          <div className="text-xs font-mono tracking-widest mb-4" style={{ color: current.accent }}>
            {String(slide + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')} — {current.tag}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-text mb-6 leading-tight">
            {current.formula ? (
              <>
                <span style={{ color: '#EF9F27' }}>AAL</span>
                <span className="text-muted"> = </span>
                <span style={{ color: '#60A5FA' }}>Exposition</span>
                <span className="text-muted"> × </span>
                <span style={{ color: '#E24B4A' }}>Aléa</span>
                <span className="text-muted"> × </span>
                <span style={{ color: '#1D9E75' }}>Vulnérabilité</span>
              </>
            ) : current.title}
          </h1>

          {/* Body or items */}
          {current.body && (
            <p className="text-base text-muted leading-relaxed">{current.body}</p>
          )}
          {current.items && (
            <div className="space-y-3">
              {current.items.map((item, i) => (
                <div key={i} className="flex items-center gap-4 rounded-lg p-3 border border-border" style={{ background: '#0D1117' }}>
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <div className="text-sm font-semibold text-text">{item.label}</div>
                    <div className="text-xs text-muted">{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation + progress */}
      <div className="flex items-center justify-between px-8 py-5 border-t border-border flex-shrink-0" style={{ background: '#0D1117' }}>
        {/* Dot indicators */}
        <div className="flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === slide ? 20 : 6,
                height: 6,
                background: i === slide ? current.accent : '#1F2937',
              }}
            />
          ))}
        </div>

        {/* Prev / Next / Commencer */}
        <div className="flex items-center gap-3">
          {slide > 0 && (
            <button
              onClick={prevSlide}
              className="text-xs text-muted hover:text-text px-3 py-1.5 rounded border border-border hover:border-accent/40 transition-all"
            >
              ← Précédent
            </button>
          )}
          {slide < SLIDES.length - 1 ? (
            <button
              onClick={nextSlide}
              className="text-xs text-text px-4 py-1.5 rounded border transition-all"
              style={{ background: current.accent + '22', borderColor: current.accent + '66', color: current.accent }}
            >
              Suivant →
            </button>
          ) : (
            <button
              onClick={goToWorkspace}
              className="text-sm font-semibold px-5 py-2 rounded transition-all"
              style={{
                background: audioDone ? '#1D9E75' : '#1D9E7544',
                color: '#fff',
                border: '1px solid #1D9E75',
                boxShadow: audioDone ? '0 0 20px #1D9E7544' : 'none',
              }}
            >
              {audioDone ? 'Commencer l\'analyse →' : 'Lancer l\'outil →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
