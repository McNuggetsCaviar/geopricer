import { useApp } from '../../context/AppContext'
import { CITIES } from '../../data/cityConfig'
import { calcAAL, calcAvoidedLoss, calcNetROI, formatEur, formatPct } from '../../lib/aal'

export default function MitigationModule() {
  const { state, dispatch } = useApp()
  const cityId = state.activeCity
  const city = CITIES[cityId]
  const hazard = state.appData.hazardRates[cityId]
  const mitigated = state.mitigationEnabled[cityId]

  const aalBefore = calcAAL(city.asset.value, hazard, city.vulnerability.base)
  const aalAfter = calcAAL(city.asset.value, hazard, city.vulnerability.mitigated)
  const avoided10y = calcAvoidedLoss(aalBefore, aalAfter, 10)
  const roi = calcNetROI(city.capex, aalBefore, aalAfter, 10)

  function toggleMitigation() {
    dispatch({ type: 'TOGGLE_MITIGATION', city: cityId })
  }

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="text-xs text-muted uppercase tracking-widest font-mono mb-3">
        🛡️ Stratégie de mitigation — {city.label}
      </div>

      {/* Toggle */}
      <div className="rounded-lg border p-3 flex items-center justify-between"
        style={{
          background: '#0D1117',
          borderColor: mitigated ? '#1D9E7544' : '#1F2937',
        }}
      >
        <div>
          <div className="text-sm font-medium text-text">
            {mitigated ? '✅ Mesures de mitigation actives' : '⬜ Avant mitigation'}
          </div>
          <div className="text-xs text-muted mt-0.5">
            {mitigated ? `CAPEX investis : ${formatEur(city.capex)}` : 'Cliquez pour simuler l\'investissement'}
          </div>
        </div>
        <label className="toggle-switch">
          <input type="checkbox" checked={mitigated} onChange={toggleMitigation} />
          <span className="toggle-slider" />
        </label>
      </div>

      {/* Measures */}
      <div className="rounded-lg border border-border p-3" style={{ background: '#0D1117' }}>
        <div className="text-xs text-muted uppercase tracking-widest font-mono mb-2">
          Mesures de mitigation (CAPEX : {formatEur(city.capex)})
        </div>
        <div className="space-y-1.5">
          {city.mitigationMeasures.map((m, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span style={{ color: mitigated ? '#1D9E75' : '#4B5563' }}>
                {mitigated ? '✓' : '○'}
              </span>
              <span className={mitigated ? 'text-text' : 'text-muted'}>{m}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison */}
      <div className="rounded-lg border border-border p-3" style={{ background: '#0D1117' }}>
        <div className="text-xs text-muted uppercase tracking-widest font-mono mb-3">
          Comparaison vulnérabilité
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className={`rounded p-2 text-center transition-all duration-500 ${!mitigated ? 'border border-risk-high/40' : 'border border-border opacity-60'}`}
            style={{ background: '#111827' }}>
            <div className="text-xs text-muted mb-1">AVANT</div>
            <div className="font-mono text-xl font-bold" style={{ color: '#E24B4A' }}>
              {formatPct(city.vulnerability.base)}
            </div>
            <div className="text-xs text-muted">vulnérabilité</div>
            <div className="font-mono text-sm mt-1" style={{ color: '#E24B4A' }}>
              {formatEur(aalBefore)}/an
            </div>
          </div>
          <div className={`rounded p-2 text-center transition-all duration-500 ${mitigated ? 'border border-risk-low/40' : 'border border-border opacity-40'}`}
            style={{ background: '#111827' }}>
            <div className="text-xs text-muted mb-1">APRÈS</div>
            <div className="font-mono text-xl font-bold" style={{ color: '#1D9E75' }}>
              {formatPct(city.vulnerability.mitigated)}
            </div>
            <div className="text-xs text-muted">vulnérabilité</div>
            <div className="font-mono text-sm mt-1" style={{ color: '#1D9E75' }}>
              {formatEur(aalAfter)}/an
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted">Réduction vulnérabilité</span>
            <span className="font-mono font-bold" style={{ color: '#1D9E75' }}>
              −{formatPct(city.vulnerability.base - city.vulnerability.mitigated)}
            </span>
          </div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted">Pertes évitées / 10 ans</span>
            <span className="font-mono font-bold" style={{ color: '#1D9E75' }}>
              +{formatEur(avoided10y)}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted">ROI net / 10 ans</span>
            <span className="font-mono font-bold" style={{ color: roi > 0 ? '#1D9E75' : '#E24B4A' }}>
              {roi > 0 ? '+' : ''}{formatEur(roi)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
