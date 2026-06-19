import { useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { fetchAllHazardRates } from '../lib/openMeteo'
import { fetchAllStorms } from '../lib/ibtracs'
import { CITIES } from '../data/cityConfig'

const MIN_SPLASH_MS = 3000

export function useDataLoader() {
  const { dispatch } = useApp()
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    const startTime = Date.now()

    async function load() {
      const hazardPromise = fetchAllHazardRates((cityId, status) => {
        const keyMap = { manila: 'openMeteoManila', miami: 'openMeteoMiami', tokyo: 'openMeteoTokyo' }
        dispatch({ type: 'SET_LOADING_STATUS', key: keyMap[cityId], status })
        if (status === 'done' || status === 'error') {
          const city = CITIES[cityId]
          // rate will be set below via SET_HAZARD_RATE
        }
      })

      dispatch({ type: 'SET_LOADING_STATUS', key: 'storms', status: 'loading' })
      const stormPromise = fetchAllStorms((status) => {
        dispatch({ type: 'SET_LOADING_STATUS', key: 'storms', status })
      })

      dispatch({ type: 'SET_LOADING_STATUS', key: 'elevation', status: 'loading' })
      const elevationPromise = new Promise((resolve) => {
        setTimeout(() => {
          dispatch({ type: 'SET_LOADING_STATUS', key: 'elevation', status: 'done' })
          resolve({ manila: 2.1, miami: 1.4, tokyo: 0.7 })
        }, 800)
      })

      const [hazardRates, storms] = await Promise.all([
        hazardPromise,
        stormPromise,
        elevationPromise,
      ])

      Object.entries(hazardRates).forEach(([city, rate]) => {
        dispatch({ type: 'SET_HAZARD_RATE', city, rate })
      })

      dispatch({ type: 'SET_STORMS', storms })

      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, MIN_SPLASH_MS - elapsed)
      await new Promise((r) => setTimeout(r, remaining))

      dispatch({ type: 'SET_PHASE', phase: 'intro' })
    }

    load().catch(console.error)
  }, [dispatch])
}
