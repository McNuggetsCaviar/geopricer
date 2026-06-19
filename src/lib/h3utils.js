import { polygonToCells, cellToBoundary, latLngToCell } from 'h3-js'

export function generateCityGrid(cityId, boundingBox, riskCenter, resolution = 8) {
  const [[minLat, minLng], [maxLat, maxLng]] = boundingBox

  const polygon = [
    [minLat, minLng],
    [maxLat, minLng],
    [maxLat, maxLng],
    [minLat, maxLng],
    [minLat, minLng],
  ]

  let hexIds
  try {
    // h3-js v4: polygonToCells([outerRing, ...holes], resolution) with [lat, lng] order
    hexIds = polygonToCells([polygon], resolution)
  } catch {
    hexIds = []
  }

  return hexIds.map((h) => {
    const boundary = cellToBoundary(h)
    const centerLat = boundary.reduce((s, [lat]) => s + lat, 0) / boundary.length
    const centerLng = boundary.reduce((s, [, lng]) => s + lng, 0) / boundary.length

    const dist = haversineKm(centerLat, centerLng, riskCenter[0], riskCenter[1])
    const maxDist = haversineKm(
      (boundingBox[0][0] + boundingBox[1][0]) / 2,
      (boundingBox[0][1] + boundingBox[1][1]) / 2,
      riskCenter[0],
      riskCenter[1]
    ) * 2.5 + 1

    const proximity = Math.max(0, 1 - dist / maxDist)
    const riskScore = 0.3 + proximity * 0.7

    return { id: h, boundary, riskScore }
  })
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function riskColor(score, mitigated = false) {
  if (mitigated) {
    if (score > 0.7) return '#1D9E75'
    if (score > 0.4) return '#34D399'
    return '#6EE7B7'
  }
  if (score > 0.75) return '#E24B4A'
  if (score > 0.5) return '#EF9F27'
  if (score > 0.25) return '#F59E0B'
  return '#1D9E75'
}
