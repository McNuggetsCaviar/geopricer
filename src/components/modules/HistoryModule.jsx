import { useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { CITIES } from '../../data/cityConfig'
import { windAtAsset, windToCategory } from '../../lib/holland'

function ktToCategory(kt) {
  if (!kt) return '—'
  if (kt >= 137) return '5'
  if (kt >= 113) return '4'
  if (kt >= 96)  return '3'
  if (kt >= 83)  return '2'
  if (kt >= 64)  return '1'
  return 'TS'
}

// Real documented losses per storm — sources cited inline
const STORM_DETAILS = {
  'rammasun-2014': {
    emoji: '🌀',
    description: 'Typhon Cat.3 avec passage direct sur Metro Manila (51 km). Rafales à 170 km/h dans la baie. 95 morts à Manille, dommages infrastructure majeurs.',
    impact: 'Sévère',
    impactColor: '#EF9F27',
    documentedLoss_M: 4600,   // $4.6B Philippines (NDRRMC 2014)
    documentedSource: 'NDRRMC Philippines 2014',
    propertyDamage_pct: 0.22,  // ~22% des biens résidentiels in impact zone (PDNA)
  },
  'ketsana-2009': {
    emoji: '🌧️',
    description: 'Dépression tropicale : 455 mm en 6h sur Metro Manila — record absolu. Inondations jusqu\'au 2e étage à Malate. 747 morts, 1 milliard $ de dommages.',
    impact: 'Majeur',
    impactColor: '#EF9F27',
    documentedLoss_M: 1000,   // $1B Philippines (World Bank PDNA 2009)
    documentedSource: 'World Bank PDNA Ondoy 2009',
    propertyDamage_pct: 0.15,
  },
  'irma-2017': {
    emoji: '🌀',
    description: 'Ouragan Cat.4 à Miami (cat.5 aux Keys). Vents soutenus 215 km/h côte SE Floride. Dommages immobiliers Dade County : $4.9B. Norme Miami-Dade impact glass révisée.',
    impact: 'Catastrophique',
    impactColor: '#E24B4A',
    documentedLoss_M: 77000,  // $77B total US (Swiss Re Sigma 2018)
    documentedSource: 'Swiss Re Sigma 1/2018 · FEMA DR-4337',
    propertyDamage_pct: 0.25,
  },
  'andrew-1992': {
    emoji: '💨',
    description: 'Ouragan Cat.5 — passage direct sur Homestead/South Miami. 63 000 habitations détruites. Perte moyenne par bien : 87 000 $ (1992). A refondu le code de construction floridien.',
    impact: 'Catastrophique',
    impactColor: '#E24B4A',
    documentedLoss_M: 35000,  // $35B 2022-adjusted (NOAA)
    documentedSource: 'NOAA NHC Report Andrew 1992',
    propertyDamage_pct: 0.45,
  },
  'faxai-2019': {
    emoji: '🌬️',
    description: 'Typhon Cat.3 — landfall direct Chiba/Tokyo, vents à 195 km/h. 40 000 bâtiments endommagés dans Kōtō-ku. Pertes assurées ¥960 milliards ($9B).',
    impact: 'Sévère',
    impactColor: '#EF9F27',
    documentedLoss_M: 9000,   // $9B insured (Insurance Research Institute Japan 2019)
    documentedSource: 'General Insurance Assoc. of Japan 2019',
    propertyDamage_pct: 0.18,
  },
  'hagibis-2019': {
    emoji: '🌊',
    description: 'Typhon Cat.4 — 70 000 bâtiments inondés Tokyo-Est. Débordement Tama River à Kōtō-ku. 98 morts. Dommages totaux : $15B (Munich Re).',
    impact: 'Majeur',
    impactColor: '#EF9F27',
    documentedLoss_M: 15000,  // $15B total (Munich Re NatCatSERVICE)
    documentedSource: 'Munich Re NatCatSERVICE 2019',
    propertyDamage_pct: 0.20,
  },
}

function findFeature(cityFC, stormId) {
  if (!cityFC?.features) return null
  const [name, year] = stormId.split('-')
  return cityFC.features.find(
    (f) =>
      f.properties.name?.toLowerCase() === name.toLowerCase() &&
      String(f.properties.year) === year
  ) || null
}

function WindImpactBar({ wind_kmh, threshold = 120 }) {
  const pct = Math.min(wind_kmh / 280 * 100, 100)
  const cat = windToCategory(wind_kmh)
  const color = wind_kmh >= 178 ? '#E24B4A' : wind_kmh >= 119 ? '#EF9F27' : '#60A5FA'
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted font-mono">Vent à l'actif (Holland)</span>
        <span className="text-xs font-mono font-bold" style={{ color }}>
          {wind_kmh} km/h · Cat.{cat}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-border overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      {wind_kmh >= threshold && (
        <div className="text-xs font-mono mt-1" style={{ color }}>
          ⚠ Dépasse seuil de dommages ({threshold} km/h)
        </div>
      )}
    </div>
  )
}

export default function HistoryModule() {
  const { state } = useApp()
  const cityId = state.activeCity
  const city = CITIES[cityId]
  const cityFC = state.appData.storms?.[cityId]
  const threshold = city.hazard.threshold_kmh

  const stormAnalyses = useMemo(() => {
    return city.storms.map((stormId) => {
      const feature = findFeature(cityFC, stormId)
      const details = STORM_DETAILS[stormId]
      const props = feature?.properties

      let windResult = null
      if (feature) {
        windResult = windAtAsset(feature, city.asset.lat, city.asset.lng)
      }

      const estimatedLoss = windResult && windResult.maxWind_kmh >= 63 && details?.propertyDamage_pct
        ? Math.round(city.asset.value * details.propertyDamage_pct * Math.min(windResult.maxWind_kmh / 150, 1) / 1000) * 1000
        : 0

      return { stormId, feature, details, props, windResult, estimatedLoss }
    })
  }, [city, cityFC])

  return (
    <div className="space-y-3 animate-fade-up">
      <div className="text-xs text-muted uppercase tracking-widest font-mono mb-3">
        ⚡ Événements historiques — {city.label}
      </div>

      {stormAnalyses.map(({ stormId, feature, details, props, windResult, estimatedLoss }) => {
        const peakKmh = props?.peak_kmh || Math.round((props?.peak_kt || 0) * 1.852)
        const cat = ktToCategory(props?.peak_kt)

        return (
          <div
            key={stormId}
            className="rounded-lg border border-border p-3 space-y-2"
            style={{ background: '#0D1117' }}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">{details?.emoji}</span>
                <div>
                  <div className="text-sm font-semibold text-text">
                    {props?.name || stormId.split('-')[0].toUpperCase()} ({props?.year || stormId.split('-')[1]})
                  </div>
                  {windResult && (
                    <div className="text-xs text-muted">
                      {windResult.minDist_km} km du site · pic {peakKmh} km/h
                    </div>
                  )}
                </div>
              </div>
              <span
                className="text-xs font-mono px-2 py-0.5 rounded flex-shrink-0"
                style={{
                  color: details?.impactColor,
                  background: (details?.impactColor || '#888') + '22',
                  border: `1px solid ${details?.impactColor || '#888'}44`,
                }}
              >
                {details?.impact}
              </span>
            </div>

            {/* Storm stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded p-2 text-center" style={{ background: '#111827' }}>
                <div className="font-mono text-sm font-bold" style={{ color: '#E24B4A' }}>
                  {peakKmh || '—'}<span className="text-xs font-normal text-muted"> km/h</span>
                </div>
                <div className="text-xs text-muted">Pic vent</div>
              </div>
              <div className="rounded p-2 text-center" style={{ background: '#111827' }}>
                <div className="font-mono text-sm font-bold" style={{ color: '#EF9F27' }}>
                  Cat.{cat}
                </div>
                <div className="text-xs text-muted">Catégorie</div>
              </div>
              <div className="rounded p-2 text-center" style={{ background: '#111827' }}>
                <div className="font-mono text-sm font-bold text-text">
                  {details?.documentedLoss_M
                    ? (details.documentedLoss_M >= 1000
                        ? `${(details.documentedLoss_M / 1000).toFixed(0)}B$`
                        : `${details.documentedLoss_M}M$`)
                    : '—'}
                </div>
                <div className="text-xs text-muted">Pertes totales</div>
              </div>
            </div>

            {/* Holland wind at asset */}
            {windResult && (
              <WindImpactBar wind_kmh={windResult.maxWind_kmh} threshold={threshold} />
            )}

            {/* Estimated loss on this asset */}
            {estimatedLoss > 0 && (
              <div className="flex items-center justify-between rounded p-2 border border-risk-high/20" style={{ background: '#E24B4A11' }}>
                <span className="text-xs text-muted font-mono">Perte estimée sur cet actif</span>
                <span className="text-sm font-mono font-bold" style={{ color: '#E24B4A' }}>
                  ~{(estimatedLoss / 1000).toFixed(0)}k€
                </span>
              </div>
            )}

            <p className="text-xs text-muted leading-relaxed">{details?.description}</p>

            <div className="text-xs text-muted/50 font-mono">
              Source : {details?.documentedSource}
            </div>
          </div>
        )
      })}

      <div className="text-xs text-muted border border-border/50 rounded p-2 font-mono" style={{ background: '#0A0E17' }}>
        📍 Trajectoires visibles sur la carte · Modèle vent : Holland (1980) + Willoughby-Darling (2004)
        <br />Source tracks : IBTrACS v04r01 — NOAA/NCEI
      </div>
    </div>
  )
}
