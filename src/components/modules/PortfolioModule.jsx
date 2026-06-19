import { useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { CITIES } from '../../data/cityConfig'
import { PORTFOLIO } from '../../data/portfolioBuildings'
import { windAtAsset } from '../../lib/holland'
import { damageRatio, BUILDING_TYPE_LABELS } from '../../lib/fema'

function BuildingRow({ building, stormAnalyses }) {
  const bestWind = Math.max(...stormAnalyses.map((a) => a.wind))
  const bestDmg  = stormAnalyses.reduce(
    (acc, a) => Math.max(acc, a.loss),
    0
  )
  const dr = damageRatio(bestWind, building.type)
  const maxLoss = Math.round(building.value * dr)
  const typeLabel = BUILDING_TYPE_LABELS[building.type] || building.type

  const color = bestWind >= 178 ? '#E24B4A'
    : bestWind >= 119 ? '#EF9F27'
    : bestWind >= 63  ? '#60A5FA'
    : '#6B7280'

  return (
    <div className="rounded border border-border p-2.5 space-y-1.5" style={{ background: '#0D1117' }}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs font-semibold text-text">{building.label}</div>
          <div className="text-xs text-muted">{typeLabel} · {(building.value / 1000).toFixed(0)}k€</div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-xs font-mono font-bold" style={{ color }}>
            {bestWind} km/h
          </div>
          {maxLoss > 0 && (
            <div className="text-xs font-mono" style={{ color: '#E24B4A' }}>
              -{(maxLoss / 1000).toFixed(0)}k€
            </div>
          )}
        </div>
      </div>
      {/* Per-storm wind bars */}
      <div className="flex gap-1">
        {stormAnalyses.map((a) => {
          const pct = Math.min(a.wind / 280 * 100, 100)
          const c = a.wind >= 178 ? '#E24B4A' : a.wind >= 119 ? '#EF9F27' : a.wind >= 63 ? '#60A5FA' : '#374151'
          return (
            <div key={a.stormId} className="flex-1" title={`${a.stormId}: ${a.wind} km/h`}>
              <div className="text-xs text-muted/60 font-mono mb-0.5" style={{ fontSize: '9px' }}>
                {a.stormId.split('-')[0].slice(0, 5)}
              </div>
              <div className="h-1 rounded-full bg-border overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: c }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function PortfolioModule() {
  const { state } = useApp()
  const cityId = state.activeCity
  const city = CITIES[cityId]
  const portfolio = PORTFOLIO[cityId]
  const cityFC = state.appData.storms?.[cityId]

  const analysis = useMemo(() => {
    if (!portfolio) return null
    const stormIds = city.storms

    const buildingResults = portfolio.buildings.map((b) => {
      const stormAnalyses = stormIds.map((stormId) => {
        const feature = cityFC?.features?.find((f) => {
          const [name, year] = stormId.split('-')
          return f.properties.name?.toLowerCase() === name.toLowerCase()
            && String(f.properties.year) === year
        })
        const wind = feature ? windAtAsset(feature, b.lat, b.lng).maxWind_kmh : 0
        const dr = damageRatio(wind, b.type)
        const loss = Math.round(b.value * dr)
        return { stormId, wind, dr, loss }
      })
      return { building: b, stormAnalyses }
    })

    // Aggregate AAL per storm
    const stormTotals = stormIds.map((stormId) => {
      const totalLoss = buildingResults.reduce((acc, { stormAnalyses }) => {
        const a = stormAnalyses.find((s) => s.stormId === stormId)
        return acc + (a?.loss || 0)
      }, 0)
      return { stormId, totalLoss }
    })

    const totalPortfolioValue = portfolio.buildings.reduce((s, b) => s + b.value, 0)

    return { buildingResults, stormTotals, totalPortfolioValue }
  }, [portfolio, cityFC, city.storms])

  if (!portfolio || !analysis) return null

  return (
    <div className="space-y-3 animate-fade-up">
      <div className="text-xs text-muted uppercase tracking-widest font-mono mb-3">
        🏘️ Portfolio quartier — {portfolio.neighborhoodLabel}
      </div>

      {/* Buildings grid */}
      <div className="space-y-2">
        {analysis.buildingResults.map(({ building, stormAnalyses }) => (
          <BuildingRow key={building.id} building={building} stormAnalyses={stormAnalyses} />
        ))}
      </div>

      {/* Aggregate comparison */}
      <div className="rounded-lg border border-border p-3 space-y-2" style={{ background: '#0D1117' }}>
        <div className="text-xs font-mono text-muted uppercase tracking-widest">
          Pertes agrégées — {portfolio.buildings.length} bâtiments
        </div>

        <div className="space-y-1.5">
          {analysis.stormTotals.map(({ stormId, totalLoss }) => {
            const documented = portfolio.documentedLoss_storm[stormId]
            const [name, year] = stormId.split('-')
            return (
              <div key={stormId} className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-text">
                    {name.toUpperCase()} {year}
                  </span>
                  <span className="text-xs font-mono font-bold" style={{ color: '#E24B4A' }}>
                    {totalLoss > 0
                      ? `-${(totalLoss / 1000000).toFixed(2)}M€ (portfolio)`
                      : 'Sous seuil'}
                  </span>
                </div>
                {documented && (
                  <div className="text-xs text-muted/70 font-mono">
                    Pertes documentées zone : ${documented.totalM}M · {documented.source}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="pt-1 border-t border-border">
          <div className="text-xs text-muted font-mono">
            Valeur totale portfolio : {(analysis.totalPortfolioValue / 1000000).toFixed(1)}M€
          </div>
          <div className="text-xs text-muted/60 font-mono mt-0.5">
            ⚠ Agrégat partiel (~{portfolio.buildings.length} bâtiments) vs perte zonale documentée.
            Le ratio calibre l'ordre de grandeur.
          </div>
        </div>
      </div>

      <div className="text-xs text-muted border border-border/50 rounded p-2 font-mono" style={{ background: '#0A0E17' }}>
        📐 Bâtiments : OpenStreetMap / Overpass API · Courbes dommages : FEMA Hazus 5.1 Chap.5
        <br />Vent par bâtiment : Holland (1980) + Willoughby-Darling (2004) · IBTrACS v04r01
      </div>
    </div>
  )
}
