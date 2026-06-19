import { useApp } from '../../context/AppContext'
import { CITIES } from '../../data/cityConfig'

export default function ZoneModule() {
  const { state } = useApp()
  const city = CITIES[state.activeCity]

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{city.country}</span>
        <div>
          <h3 className="text-sm font-semibold text-text">{city.label} — {city.district}</h3>
          <p className="text-xs text-muted">{city.riskType}</p>
        </div>
      </div>

      <div className="rounded-lg border border-border p-3 space-y-2" style={{ background: '#0D1117' }}>
        <div className="text-xs text-muted uppercase tracking-widest font-mono mb-2">Actif ciblé</div>
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs font-medium text-text">{city.asset.type}</div>
            <div className="text-xs text-muted leading-relaxed mt-1">{city.asset.description}</div>
          </div>
        </div>
        <div className="flex items-baseline gap-1 mt-2">
          <span className="font-mono text-lg font-bold" style={{ color: '#1D9E75' }}>
            {(city.asset.value / 1_000_000).toFixed(2)}M€
          </span>
          <span className="text-xs text-muted">valeur de marché estimée</span>
        </div>
      </div>

      <div className="rounded-lg border border-border p-3" style={{ background: '#0D1117' }}>
        <div className="text-xs text-muted uppercase tracking-widest font-mono mb-2">Contexte de risque</div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted">Type de risque principal</span>
            <span className="text-text font-medium">{city.riskType}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted">Zone géographique</span>
            <span className="text-text font-medium">{city.district}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted">Coordonnées actif</span>
            <span className="font-mono text-xs" style={{ color: '#60A5FA' }}>
              {city.asset.lat.toFixed(4)}°N {Math.abs(city.asset.lng).toFixed(4)}°{city.asset.lng < 0 ? 'O' : 'E'}
            </span>
          </div>
        </div>
      </div>

      <div className="text-xs text-muted border border-border/50 rounded p-2 font-mono" style={{ background: '#0A0E17' }}>
        💡 Les hexagones H3 sur la carte représentent l'intensité du risque spatial à résolution 8 (Uber H3-js).
      </div>
    </div>
  )
}
