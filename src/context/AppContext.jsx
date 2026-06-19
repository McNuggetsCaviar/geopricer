import { createContext, useContext, useReducer } from 'react'
import { CITY_ORDER, MODULE_ORDER } from '../data/cityConfig'

const initialVisited = Object.fromEntries(
  CITY_ORDER.map((city) => [
    city,
    Object.fromEntries(MODULE_ORDER.map((mod) => [mod, false])),
  ])
)

const initialState = {
  phase: 'splash', // 'splash' | 'intro' | 'workspace'
  loadingProgress: {
    openMeteoManila: 'idle',
    openMeteoMiami: 'idle',
    openMeteoTokyo: 'idle',
    storms: 'idle',
    elevation: 'idle',
  },
  appData: {
    hazardRates: { manila: 0.08, miami: 0.06, tokyo: 0.04 },
    storms: {},
    elevation: { manila: 2, miami: 1.5, tokyo: 0.8 },
  },
  activeCity: 'manila',
  activeModule: null,
  visitedModules: initialVisited,
  mitigationEnabled: { manila: false, miami: false, tokyo: false },
  // focus: null | { type:'storm', name, year, bounds } | { type:'building', id, lat, lng, label }
  focus: null,
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PHASE':
      return { ...state, phase: action.phase }

    case 'SET_LOADING_STATUS':
      return {
        ...state,
        loadingProgress: { ...state.loadingProgress, [action.key]: action.status },
      }

    case 'SET_HAZARD_RATE':
      return {
        ...state,
        appData: {
          ...state.appData,
          hazardRates: { ...state.appData.hazardRates, [action.city]: action.rate },
        },
      }

    case 'SET_STORMS':
      return {
        ...state,
        appData: { ...state.appData, storms: action.storms },
      }

    case 'SET_ACTIVE_CITY':
      return { ...state, activeCity: action.city, activeModule: null }

    case 'SET_ACTIVE_MODULE':
      return {
        ...state,
        activeModule: action.module,
        visitedModules: {
          ...state.visitedModules,
          [state.activeCity]: {
            ...state.visitedModules[state.activeCity],
            [action.module]: true,
          },
        },
      }

    case 'MARK_VISITED':
      return {
        ...state,
        visitedModules: {
          ...state.visitedModules,
          [action.city]: {
            ...state.visitedModules[action.city],
            [action.module]: true,
          },
        },
      }

    case 'TOGGLE_MITIGATION':
      return {
        ...state,
        mitigationEnabled: {
          ...state.mitigationEnabled,
          [action.city]: !state.mitigationEnabled[action.city],
        },
      }

    case 'SET_FOCUS':
      return { ...state, focus: action.focus }

    case 'CLEAR_FOCUS':
      return { ...state, focus: null }

    default:
      return state
  }
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
