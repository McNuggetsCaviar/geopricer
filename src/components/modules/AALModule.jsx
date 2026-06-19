import { useApp } from '../../context/AppContext'
import { CITIES } from '../../data/cityConfig'
import { calcAAL, calcAALYears, formatEur, formatPct } from '../../lib/aal'

function FormulaRow({ label, value, color = '#E2E8F0', sub }) {
  return (
    <div className="flex items-baseline justify-between py-1.5 border-b border-border/40">
      <div>
        <span className="text-xs text-muted">{label}</span>
        {sub && <div className="text-xs text-muted/60 font-mono">{sub}</div>}
      </div>
      <span className="font-mono text-sm font-bold" style={{ color }}>
        {value}
      </span>
    </div>
  )
}

export default function AALModule() {
  const { state } = useApp()
  const cityId = state.activeCity
  const city = CITIES[cityId]
  const hazard = state.appData.hazardRates[cityId]
  const vuln = city.vulnerability.base

  const aal = calcAAL(city.asset.value, hazard, vuln)
  const aal10y = calcAALYears(aal, 10)

  const loadingStatus = {
    manila: state.loadingProgress.openMeteoManila,
    miami: state.loadingProgress.openMeteoMiami,
    tokyo: state.loadingProgress.openMeteoTokyo,
  }[cityId]

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="text-xs text-muted uppercase tracking-widest font-mono mb-3">
        📊 Calcul AAL — {city.label}
      </div>

      {/* Formula */}
      <div className="rounded-lg border border-border p-3" style={{ background: '#0D1117' }}>
        <div className="text-xs text-muted font-mono mb-3 text-center">
          AAL = Exposition × Aléa × Vulnérabilité
        </div>

        <FormulaRow
          label="Exposition (valeur marché)"
          value={formatEur(city.asset.value)}
          sub={city.asset.type}
          color="#60A5FA"
        />
        <FormulaRow
          label={`Aléa (${city.hazard.label})`}
          value={formatPct(hazard)}
          sub={`Source: ${city.hazard.source}${loadingStatus === 'error' ? ' · fallback' : ''}`}
          color={loadingStatus === 'done' ? '#1D9E75' : '#EF9F27'}
        />
        <FormulaRow
          label="Vulnérabilité (taux de dommage)"
          value={formatPct(vuln)}
          sub={`Courbe ${city.vulnerability.curve}`}
          color="#EF9F27"
        />

        {/* Result */}
        <div className="mt-3 rounded p-3 text-center" style={{ background: '#111827', border: '1px solid #E24B4A33' }}>
          <div className="text-xs text-muted mb-1">Perte Annuelle Moyenne (AAL)</div>
          <div className="font-mono text-2xl font-bold" style={{ color: '#E24B4A' }}>
            {formatEur(aal)}
            <span className="text-sm text-muted font-normal">/an</span>
          </div>
        </div>
      </div>

      {/* 10-year projection */}
      <div className="rounded-lg border border-border p-3" style={{ background: '#0D1117' }}>
        <div className="text-xs text-muted uppercase tracking-widest font-mono mb-2">Projection 10 ans</div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted">Pertes cumulées attendues</span>
          <span className="font-mono text-base font-bold" style={{ color: '#E24B4A' }}>
            {formatEur(aal10y)}
          </span>
        </div>
        <div className="mt-2 h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(100, (aal10y / city.asset.value) * 100)}%`,
              background: 'linear-gradient(90deg, #EF9F27, #E24B4A)',
            }}
          />
        </div>
        <div className="text-xs text-muted mt-1 text-right">
          {formatPct(aal10y / city.asset.value)} de la valeur actif
        </div>
      </div>

      {/* Data source note */}
      <div className="text-xs text-muted border border-border/50 rounded p-2 font-mono" style={{ background: '#0A0E17' }}>
        {loadingStatus === 'done'
          ? `✅ Aléa calculé depuis Open-Meteo ERA5 (1984-2023) sur ${formatPct(hazard)} jours avec rafales > ${city.hazard.threshold_kmh} km/h`
          : `⚠ Valeur fallback IBTrACS : ${formatPct(hazard)} — API indisponible`
        }
      </div>
    </div>
  )
}
