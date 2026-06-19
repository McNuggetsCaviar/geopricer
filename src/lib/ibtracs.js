// Load IBTrACS storm track FeatureCollections (one per city, pre-filtered from full dataset)
const cache = {}

export async function fetchCityStorms(cityId) {
  if (cache[cityId]) return cache[cityId]
  const res = await fetch(`/data/storms/${cityId}-tracks.geojson`)
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${cityId}-tracks.geojson`)
  const data = await res.json()
  cache[cityId] = data
  return data
}

export async function fetchAllStorms(onProgress) {
  onProgress?.('loading')
  const results = {}
  const cities = ['manila', 'miami', 'tokyo']

  await Promise.allSettled(
    cities.map(async (cityId) => {
      try {
        results[cityId] = await fetchCityStorms(cityId)
      } catch (err) {
        console.warn(`[ibtracs] ${cityId} failed:`, err.message)
        results[cityId] = null
      }
    })
  )

  onProgress?.(Object.values(results).some((v) => v !== null) ? 'done' : 'error')
  return results
}
