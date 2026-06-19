import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useApp } from '../../context/AppContext'
import { CITIES, CITY_ORDER } from '../../data/cityConfig'
import H3Layer from './H3Layer'
import StormTrackLayer from './StormTrackLayer'
import AssetMarker from './AssetMarker'

function MapController() {
  const { state } = useApp()
  const map = useMap()
  const lastCity = useRef(null)
  const mounted = useRef(false)

  useEffect(() => {
    // On first mount: invalidate size so Leaflet gets correct dimensions, then set view
    if (!mounted.current) {
      mounted.current = true
      lastCity.current = state.activeCity
      const city = CITIES[state.activeCity]
      setTimeout(() => {
        try {
          map.invalidateSize()
          map.setView(city.coords, city.zoom, { animate: false })
        } catch {}
      }, 100)
      return
    }
    const city = CITIES[state.activeCity]
    if (!city || lastCity.current === state.activeCity) return
    lastCity.current = state.activeCity
    try {
      map.flyTo(city.coords, city.zoom, { duration: 1.5 })
    } catch {}
  }, [state.activeCity, map])

  return null
}

function CityTabs() {
  const { state, dispatch } = useApp()

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] flex gap-1 bg-panel/90 backdrop-blur-sm border border-border rounded-lg p-1">
      {CITY_ORDER.map((cityId) => {
        const city = CITIES[cityId]
        const isActive = state.activeCity === cityId
        return (
          <button
            key={cityId}
            onClick={() => dispatch({ type: 'SET_ACTIVE_CITY', city: cityId })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200
              ${isActive
                ? 'bg-accent text-app'
                : 'text-muted hover:text-text hover:bg-border'
              }`}
          >
            <span>{city.country}</span>
            <span>{city.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default function CentralMap() {
  const { state } = useApp()
  const activeCity = CITIES[state.activeCity]

  return (
    <div className="relative flex-1 h-full">
      <MapContainer
        center={activeCity.coords}
        zoom={activeCity.zoom}
        style={{ height: '100%', width: '100%', background: '#0A0E17' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains="abcd"
          maxZoom={19}
        />

        <MapController />
        <H3Layer />
        <StormTrackLayer />
        <AssetMarker />
      </MapContainer>

      <CityTabs />

      {/* Attribution */}
      <div className="absolute bottom-2 right-2 z-[1000] text-xs text-muted/60 font-mono">
        © OpenStreetMap · CARTO
      </div>
    </div>
  )
}
