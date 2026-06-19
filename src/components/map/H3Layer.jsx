import { useMemo, useState, useEffect } from 'react'
import { Polygon } from 'react-leaflet'
import { useApp } from '../../context/AppContext'
import { CITIES } from '../../data/cityConfig'
import { generateCityGrid, riskColor } from '../../lib/h3utils'
import { fetchRiskGrid, interpolateRisk } from '../../lib/riskGrid'

export default function H3Layer() {
  const { state } = useApp()
  const cityId = state.activeCity
  const city = CITIES[cityId]
  const mitigated = state.mitigationEnabled[cityId]

  const [riskGrid, setRiskGrid] = useState({})  // cityId → [{lat,lng,score}]

  // Load risk grid for active city on demand
  useEffect(() => {
    if (riskGrid[cityId]) return
    fetchRiskGrid(cityId).then((pts) => {
      if (pts) setRiskGrid((prev) => ({ ...prev, [cityId]: pts }))
    })
  }, [cityId])

  const hexagons = useMemo(() => {
    try {
      const rawHexes = generateCityGrid(cityId, city.boundingBox, city.coords, 8)
      const grid = riskGrid[cityId]
      if (!grid) return rawHexes  // fallback to distance-based while grid loads

      // Override each hex's riskScore with real IBTrACS track density score
      return rawHexes.map((hex) => {
        // hex.boundary is array of [lat, lng] pairs
        const centLat = hex.boundary.reduce((s, [lat]) => s + lat, 0) / hex.boundary.length
        const centLng = hex.boundary.reduce((s, [, lng]) => s + lng, 0) / hex.boundary.length
        return { ...hex, riskScore: interpolateRisk(grid, centLat, centLng) }
      })
    } catch {
      return []
    }
  }, [cityId, city.boundingBox, city.coords, riskGrid])

  if (hexagons.length === 0) return null

  return (
    <>
      {hexagons.map((hex) => {
        const color = riskColor(hex.riskScore, mitigated)
        const opacity = mitigated ? 0.3 : 0.2 + hex.riskScore * 0.45
        return (
          <Polygon
            key={hex.id}
            positions={hex.boundary}
            pathOptions={{
              fillColor: color,
              fillOpacity: opacity,
              color: color,
              weight: 0.5,
              opacity: 0.4,
            }}
          />
        )
      })}
    </>
  )
}
