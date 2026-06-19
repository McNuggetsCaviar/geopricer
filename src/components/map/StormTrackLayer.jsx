import { useMemo } from 'react'
import { Polyline, Tooltip } from 'react-leaflet'
import { useApp } from '../../context/AppContext'

// Wind speed → color (Saffir-Simpson)
function windColor(peak_kt) {
  if (peak_kt >= 137) return '#E24B4A'   // Cat 5
  if (peak_kt >= 113) return '#EF9F27'   // Cat 4
  if (peak_kt >= 96)  return '#F59E0B'   // Cat 3
  if (peak_kt >= 83)  return '#60A5FA'   // Cat 2
  if (peak_kt >= 64)  return '#93C5FD'   // Cat 1
  return '#6B7280'                        // TD/TS
}

function windCategory(peak_kt) {
  if (peak_kt >= 137) return 'Cat. 5'
  if (peak_kt >= 113) return 'Cat. 4'
  if (peak_kt >= 96)  return 'Cat. 3'
  if (peak_kt >= 83)  return 'Cat. 2'
  if (peak_kt >= 64)  return 'Cat. 1'
  return 'Dépression tropicale'
}

export default function StormTrackLayer() {
  const { state } = useApp()
  const cityId = state.activeCity
  const cityStorms = state.appData.storms?.[cityId]

  const showStorms = state.activeModule === 'history' || state.activeModule === 'zone'

  const features = useMemo(() => {
    if (!cityStorms?.features) return []
    // Already sorted by year in the GeoJSON; show all tracks
    return cityStorms.features
  }, [cityStorms])

  if (!showStorms || features.length === 0) return null

  return (
    <>
      {features.map((feature, i) => {
        const coords = feature.geometry?.coordinates
        if (!coords || coords.length < 2) return null

        const positions = coords.map(([lng, lat]) => [lat, lng])
        const props = feature.properties
        const color = windColor(props.peak_kt || 0)
        const isIntense = props.peak_kt >= 96  // Cat 3+

        return (
          <Polyline
            key={props.sid || i}
            positions={positions}
            pathOptions={{
              color,
              weight: isIntense ? 2 : 1,
              opacity: isIntense ? 0.75 : 0.35,
              dashArray: isIntense ? undefined : '4 4',
            }}
          >
            {isIntense && (
              <Tooltip sticky>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#E2E8F0', background: '#111827', border: '1px solid #1F2937', borderRadius: 4, padding: '5px 8px' }}>
                  <div style={{ fontWeight: 700, color }}>{props.name} ({props.year})</div>
                  <div>{windCategory(props.peak_kt)} · {Math.round((props.peak_kt || 0) * 1.852)} km/h</div>
                  <div style={{ color: '#6B7280' }}>{Math.round(props.min_dist_km || 0)} km du site</div>
                </div>
              </Tooltip>
            )}
          </Polyline>
        )
      })}
    </>
  )
}
