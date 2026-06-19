import { createContext, useContext, useReducer, useRef, useEffect, useCallback } from 'react'

const initialState = {
  currentClip: null,
  clipQueue: [],
  isPlaying: false,
  isUnlocked: false,
  pendingClip: null,
  pendingQueue: [],
  loadError: false,
}

function reducer(state, action) {
  switch (action.type) {
    case 'UNLOCK':
      return { ...state, isUnlocked: true }
    case 'PLAY':
      return { ...state, currentClip: action.clip, clipQueue: action.queue || [], isPlaying: true, pendingClip: null, pendingQueue: [], loadError: false }
    case 'PLAYING':
      return { ...state, isPlaying: true }
    case 'PAUSE':
      return { ...state, isPlaying: false }
    case 'RESUME':
      return { ...state, isPlaying: true }
    case 'LOAD_ERROR':
      return { ...state, isPlaying: false, loadError: true }
    case 'ENDED':
      if (state.clipQueue.length > 0) {
        const [next, ...rest] = state.clipQueue
        return { ...state, currentClip: next, clipQueue: rest, isPlaying: true, loadError: false }
      }
      return { ...state, isPlaying: false, currentClip: null, clipQueue: [], loadError: false }
    case 'SET_PENDING':
      return { ...state, pendingClip: action.clip, pendingQueue: action.queue || [] }
    default:
      return state
  }
}

const AudioCtx = createContext(null)

export function AudioProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const audioRef = useRef(null)
  const pendingRef = useRef({ clip: null, queue: [] })  // ref avoids stale closure in unlock()

  // Create audio element once
  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'metadata'
    audioRef.current = audio

    audio.addEventListener('ended', () => dispatch({ type: 'ENDED' }))
    audio.addEventListener('error', () => dispatch({ type: 'LOAD_ERROR' }))

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [])

  // React to clip changes — wait for loadedmetadata before play()
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (state.isPlaying && state.currentClip) {
      const src = `/audio/${state.currentClip}.mp3`

      if (audio.src !== window.location.origin + src) {
        // Stop current playback immediately — no overlap
        audio.pause()
        audio.currentTime = 0
        audio.src = src

        const onReady = () => {
          audio.removeEventListener('loadedmetadata', onReady)
          audio.play().catch(() => dispatch({ type: 'LOAD_ERROR' }))
        }
        audio.addEventListener('loadedmetadata', onReady)
        audio.load()
      } else {
        // Same file, just resume
        audio.play().catch(() => dispatch({ type: 'LOAD_ERROR' }))
      }
    } else if (!state.isPlaying) {
      audio.pause()
    }
  }, [state.isPlaying, state.currentClip])

  // play(clip) or play([clip1, clip2]) for sequences
  // Skips restart if same single clip already playing (Miami/Tokyo multi-module)
  const play = useCallback((clipOrArray, extraQueue = []) => {
    const clip = Array.isArray(clipOrArray) ? clipOrArray[0] : clipOrArray
    const queue = Array.isArray(clipOrArray) ? [...clipOrArray.slice(1), ...extraQueue] : extraQueue

    if (!clip) return

    if (!state.isUnlocked) {
      pendingRef.current = { clip, queue }
      dispatch({ type: 'SET_PENDING', clip, queue })
      return
    }
    // Don't restart if same clip already playing with no queue change
    if (state.currentClip === clip && state.isPlaying && queue.length === 0) return

    dispatch({ type: 'PLAY', clip, queue })
  }, [state.isUnlocked, state.currentClip, state.isPlaying])

  const pause = useCallback(() => dispatch({ type: 'PAUSE' }), [])
  const resume = useCallback(() => dispatch({ type: 'RESUME' }), [])

  // unlock() reads pendingRef (not stale state) so the clip plays immediately
  const unlock = useCallback((immediateClip = null, immediateQueue = []) => {
    dispatch({ type: 'UNLOCK' })
    const clip = immediateClip || pendingRef.current.clip
    const queue = immediateClip ? immediateQueue : pendingRef.current.queue
    if (clip) {
      dispatch({ type: 'PLAY', clip, queue })
      pendingRef.current = { clip: null, queue: [] }
    }
  }, [])

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (audio) { audio.pause(); audio.currentTime = 0 }
    dispatch({ type: 'ENDED' })
  }, [])

  return (
    <AudioCtx.Provider value={{ state, play, pause, resume, unlock, stop, audioRef }}>
      {children}
    </AudioCtx.Provider>
  )
}

export function useAudio() {
  const ctx = useContext(AudioCtx)
  if (!ctx) throw new Error('useAudio must be inside AudioProvider')
  return ctx
}
