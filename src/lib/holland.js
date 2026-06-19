/**
 * Simplified Holland (1980) wind field model.
 * Given a storm track (array of {lat, lng, wind_kt}) and a target point,
 * returns the estimated maximum sustained wind speed (km/h) at that point.
 *
 * Reference: Holland, G.J. (1980). An analytic model of the wind and pressure
 * profiles in hurricanes. Monthly Weather Review, 108(8), 1212-1218.
 */

const DEG_TO_RAD = Math.PI / 180

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dlat = (lat2 - lat1) * DEG_TO_RAD
  const dlng = (lng2 - lng1) * DEG_TO_RAD
  const a =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(lat1 * DEG_TO_RAD) * Math.cos(lat2 * DEG_TO_RAD) * Math.sin(dlng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/**
 * Estimate radius of maximum winds (km) from Vmax (kt).
 * Empirical fit from Willoughby & Darling (2004).
 */
function estimateRmax(vmax_kt, lat) {
  return 46.4 * Math.exp(-0.0155 * vmax_kt + 0.0169 * lat)
}

/**
 * Holland radial wind profile.
 * Returns sustained wind speed (km/h) at distance r_km from storm center.
 */
function hollandWindAtRadius(r_km, vmax_kt, rmax_km, B = 1.3) {
  if (r_km < 1) r_km = 1  // avoid division by zero
  const ratio = rmax_km / r_km
  const wind_kt = vmax_kt * Math.sqrt(ratio ** B * Math.exp(1 - ratio ** B))
  return wind_kt * 1.852  // convert to km/h
}

/**
 * For a given storm feature (IBTrACS GeoJSON), compute the maximum
 * wind speed (km/h) at the asset location (assetLat, assetLng).
 *
 * @param {object} feature  - GeoJSON Feature with LineString geometry
 *                            and properties {peak_kt, ...}
 * @param {number} assetLat
 * @param {number} assetLng
 * @param {Array}  rawPoints - optional array of {lat, lng, wind_kt} per timestep
 * @returns {{ maxWind_kmh: number, minDist_km: number, closestWind_kt: number }}
 */
export function windAtAsset(feature, assetLat, assetLng, rawPoints = null) {
  const coords = feature.geometry?.coordinates
  if (!coords || coords.length === 0) return { maxWind_kmh: 0, minDist_km: Infinity, closestWind_kt: 0 }

  const peakKt = feature.properties.peak_kt || 0
  let maxWind_kmh = 0
  let minDist_km = Infinity
  let closestWind_kt = 0

  coords.forEach(([lng, lat], i) => {
    const dist = haversineKm(assetLat, assetLng, lat, lng)
    // Use per-timestep wind if available, otherwise interpolate from peak
    const trackWind_kt = rawPoints?.[i]?.wind_kt || peakKt

    if (dist < minDist_km) {
      minDist_km = dist
      closestWind_kt = trackWind_kt
    }

    if (trackWind_kt > 34) {  // only tropical storm force and above
      const rmax = estimateRmax(trackWind_kt, Math.abs(lat))
      const wind = hollandWindAtRadius(dist, trackWind_kt, rmax)
      if (wind > maxWind_kmh) maxWind_kmh = wind
    }
  })

  return {
    maxWind_kmh: Math.round(maxWind_kmh),
    minDist_km: Math.round(minDist_km),
    closestWind_kt,
  }
}

/**
 * Categorize a wind speed (km/h) on the Saffir-Simpson scale.
 */
export function windToCategory(kmh) {
  if (kmh >= 252) return '5'
  if (kmh >= 209) return '4'
  if (kmh >= 178) return '3'
  if (kmh >= 154) return '2'
  if (kmh >= 119) return '1'
  if (kmh >= 63)  return 'TS'
  return 'TD'
}
