import { CircleMarker, Tooltip } from 'react-leaflet'
import { useApp } from '../../context/AppContext'
import { CITIES } from '../../data/cityConfig'
import { formatEur } from '../../lib/aal'

export default function AssetMarker() {
  const { state } = useApp()
  const city = CITIES[state.activeCity]
  const mitigated = state.mitigationEnabled[state.activeCity]

  return (
    <>
      {/* Pulse rings */}
      <CircleMarker
        center={[city.asset.lat, city.asset.lng]}
        radius={18}
        pathOptions={{ color: mitigated ? '#1D9E75' : '#E24B4A', weight: 1, fillOpacity: 0, opacity: 0.3 }}
      />
      <CircleMarker
        center={[city.asset.lat, city.asset.lng]}
        radius={10}
        pathOptions={{ color: mitigated ? '#1D9E75' : '#E24B4A', weight: 1.5, fillOpacity: 0, opacity: 0.5 }}
      />
      <CircleMarker
        center={[city.asset.lat, city.asset.lng]}
        radius={5}
        pathOptions={{
          color: mitigated ? '#1D9E75' : '#E24B4A',
          fillColor: mitigated ? '#1D9E75' : '#E24B4A',
          fillOpacity: 0.9,
          weight: 2,
        }}
      >
        <Tooltip permanent direction="top" offset={[0, -8]}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#E2E8F0', background: '#111827', border: '1px solid #1F2937', borderRadius: 4, padding: '4px 8px', whiteSpace: 'nowrap' }}>
            🏠 {city.asset.type}<br />
            <span style={{ color: '#1D9E75' }}>{formatEur(city.asset.value)}</span>
            {mitigated && <span style={{ color: '#34D399', marginLeft: 4 }}>✓ mitigé</span>}
          </div>
        </Tooltip>
      </CircleMarker>
    </>
  )
}
