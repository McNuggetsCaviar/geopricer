import { createContext, useContext, useReducer, useRef, useEffect } from 'react'

const initialState = {
  currentClip: null,
  isPlaying: false,
  isUnlocked: false,
  pendingClip: null,
}

function reducer(state, action) {
  switch (action.type) {
    case 'UNLOCK':
      return { ...state, isUnlocked: true }
    case 'PLAY':
      return { ...state, currentClip: action.clip, isPlaying: true, pendingClip: null }
    case 'PAUSE':
      return { ...state, isPlaying: false }
    case 'RESUME':
      return { ...state, isPlaying: true }
    case 'ENDED':
      return { ...state, isPlaying: false, currentClip: null }
    case 'SET_PENDING':
      return { ...state, pendingClip: action.clip }
    default:
      return state
  }
}

const AudioCtx = createContext(null)

export function AudioProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const audioRef = useRef(new Audio())

  useEffect(() => {
    const audio = audioRef.current
    audio.addEventListener('ended', () => dispatch({ type: 'ENDED' }))
    return () => audio.pause()
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (state.isPlaying && state.currentClip) {
      const src = `/audio/${state.currentClip}.mp3`
      if (audio.src !== window.location.origin + src) {
        audio.src = src
      }
      audio.play().catch(() => {})
    } else if (!state.isPlaying) {
      audio.pause()
    }
  }, [state.isPlaying, state.currentClip])

  function play(clipKey) {
    if (!state.isUnlocked) {
      dispatch({ type: 'SET_PENDING', clip: clipKey })
      return
    }
    dispatch({ type: 'PLAY', clip: clipKey })
  }

  function pause() {
    dispatch({ type: 'PAUSE' })
  }

  function resume() {
    dispatch({ type: 'RESUME' })
  }

  function unlock() {
    dispatch({ type: 'UNLOCK' })
    if (state.pendingClip) {
      dispatch({ type: 'PLAY', clip: state.pendingClip })
    }
  }

  return (
    <AudioCtx.Provider value={{ state, play, pause, resume, unlock, audioRef }}>
      {children}
    </AudioCtx.Provider>
  )
}

export function useAudio() {
  const ctx = useContext(AudioCtx)
  if (!ctx) throw new Error('useAudio must be inside AudioProvider')
  return ctx
}
