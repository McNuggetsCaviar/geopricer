import { Component } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import { AudioProvider } from './context/AudioContext'
import SplashScreen from './components/splash/SplashScreen'
import IntroSlides from './components/splash/IntroSlides'
import WorkspaceLayout from './components/layout/WorkspaceLayout'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] caught:', error.message, info.componentStack?.split('\n').slice(0,5).join(' | '))
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ background: '#0A0E17', color: '#E24B4A', padding: 24, fontFamily: 'monospace', fontSize: 13, height: '100%', overflow: 'auto' }}>
          <h2 style={{ color: '#E24B4A', marginBottom: 12 }}>🚨 Runtime Error</h2>
          <pre style={{ color: '#EF9F27', whiteSpace: 'pre-wrap', marginBottom: 16 }}>{this.state.error.message}</pre>
          <pre style={{ color: '#6B7280', fontSize: 11, whiteSpace: 'pre-wrap' }}>{this.state.error.stack}</pre>
        </div>
      )
    }
    return this.props.children
  }
}

function AppContent() {
  const { state } = useApp()
  if (state.phase === 'splash') return <SplashScreen />
  if (state.phase === 'intro') return <IntroSlides />
  return <WorkspaceLayout />
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AudioProvider>
          <AppContent />
        </AudioProvider>
      </AppProvider>
    </ErrorBoundary>
  )
}
