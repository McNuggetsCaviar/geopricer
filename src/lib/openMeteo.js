import { CITIES } from '../data/cityConfig'

const BASE_URL = 'https://archive-api.open-meteo.com/v1/archive'

async function fetchWindHistory(lat, lng, threshold_kmh) {
  const url = new URL(BASE_URL)
  url.searchParams.set('latitude', lat)
  url.searchParams.set('longitude', lng)
  url.searchParams.set('start_date', '1984-01-01')
  url.searchParams.set('end_date', '2023-12-31')
  url.searchParams.set('daily', 'windgusts_10m_max')
  url.searchParams.set('windspeed_unit', 'kmh')
  url.searchParams.set('timezone', 'auto')

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`)
  const data = await res.json()

  const gusts = data.daily?.windgusts_10m_max ?? []
  const totalDays = gusts.filter((v) => v !== null).length
  const exceedDays = gusts.filter((v) => v !== null && v >= threshold_kmh).length

  if (totalDays === 0) throw new Error('No wind data returned')

  const annualFreq = exceedDays / (totalDays / 365)
  return Math.min(annualFreq, 0.5)
}

export async function fetchHazardRate(cityId, onProgress) {
  const city = CITIES[cityId]
  const { lat, lng } = city.asset
  const threshold = city.hazard.threshold_kmh

  try {
    onProgress?.('loading')
    const rate = await fetchWindHistory(lat, lng, threshold)
    onProgress?.('done')
    return rate
  } catch (err) {
    console.warn(`[openMeteo] ${cityId} fallback:`, err.message)
    onProgress?.('error')
    return city.hazard.fallback
  }
}

export async function fetchAllHazardRates(onProgress) {
  const cityIds = ['manila', 'miami', 'tokyo']
  const results = {}

  await Promise.allSettled(
    cityIds.map(async (id) => {
      results[id] = await fetchHazardRate(id, (status) =>
        onProgress?.(id, status)
      )
    })
  )

  return results
}
