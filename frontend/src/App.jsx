import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Dashboard from '@/pages/Dashboard'
import Projects from '@/pages/Projects'
import History from '@/pages/History'
import Settings from '@/pages/Settings'
import Login from '@/pages/Login'
import Sidebar from '@/components/Sidebar'
import TopNav from '@/components/TopNav'
import ImportVideo from '@/pages/ImportVideo'
import Editor from '@/pages/Editor'
import { supabase } from '@/services/supabase'

function AppContent({ userEmail, onLogout, youtubeConnected, onSyncYoutube }) {
  const location = useLocation()
  
  // Decide page title based on active path
  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/':
        return 'Dashboard'
      case '/projects':
        return 'Projects'
      case '/history':
        return 'History'
      case '/settings':
        return 'Settings'
      case '/import':
        return 'Import Video'
      default:
        return 'Clipper AI'
    }
  }

  // If not logged in, redirect to login page
  if (!userEmail) {
    return <Navigate to="/login" replace />
  }

  // Prevent routing to /login if already logged in
  if (location.pathname === '/login') {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex h-screen bg-background text-foreground font-sans antialiased overflow-hidden">
      {/* Navigation Sidebar */}
      <Sidebar projectsCount={3} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav 
          pageTitle={getPageTitle(location.pathname)} 
          userEmail={userEmail}
          onLogout={onLogout}
          youtubeConnected={youtubeConnected}
        />
        
        <main className="flex-1 overflow-y-auto bg-background/50">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/import" element={<ImportVideo />} />
            <Route path="/editor/:video_id" element={<Editor />} />
            <Route path="/history" element={<History />} />
            <Route 
              path="/settings" 
              element={
                <Settings 
                  youtubeConnected={youtubeConnected} 
                  onSyncYoutube={onSyncYoutube} 
                />
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [youtubeConnected, setYoutubeConnected] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe()
      }
    }
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (e) {
      console.error('Error during signOut:', e)
    }
    setSession(null)
  }

  const handleSyncYoutube = () => {
    setYoutubeConnected(!youtubeConnected)
  }

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0C0C0D] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-xs text-muted-foreground tracking-wider uppercase font-semibold">Loading session...</p>
        </div>
      </div>
    )
  }

  const userEmail = session?.user?.email || ''

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={
            session ? (
              <Navigate to="/" replace />
            ) : (
              <Login />
            )
          } 
        />
        <Route 
          path="/*" 
          element={
            <AppContent 
              userEmail={userEmail} 
              onLogout={handleLogout} 
              youtubeConnected={youtubeConnected}
              onSyncYoutube={handleSyncYoutube}
            />
          } 
        />
      </Routes>
    </BrowserRouter>
  )
}
