const cache = {}

export async function fetchRiskGrid(cityId) {
  if (cache[cityId]) return cache[cityId]
  try {
    const res = await fetch(`/data/risk-grid/${cityId}.json`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    cache[cityId] = data.points  // [{lat, lng, score}]
    return cache[cityId]
  } catch {
    return null
  }
}

// Find nearest grid point and return its score (simple nearest-neighbor)
export function interpolateRisk(gridPoints, lat, lng) {
  if (!gridPoints || gridPoints.length === 0) return 0.5
  let minDist = Infinity
  let score = 0.5
  for (const p of gridPoints) {
    const d = (p.lat - lat) ** 2 + (p.lng - lng) ** 2
    if (d < minDist) {
      minDist = d
      score = p.score
    }
  }
  return score
}
