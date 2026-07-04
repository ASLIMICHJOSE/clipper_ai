import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Dashboard from '@/pages/Dashboard'
import Projects from '@/pages/Projects'
import History from '@/pages/History'
import Settings from '@/pages/Settings'
import Login from '@/pages/Login'
import Sidebar from '@/components/Sidebar'
import TopNav from '@/components/TopNav'

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
      default:
        return 'Clipper AI'
    }
  }

  // If not logged in, show Login
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
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('clipper_user') || '')
  const [youtubeConnected, setYoutubeConnected] = useState(true)

  const handleLoginSuccess = (email) => {
    localStorage.setItem('clipper_user', email)
    setUserEmail(email)
  }

  const handleLogout = () => {
    localStorage.removeItem('clipper_user')
    setUserEmail('')
  }

  const handleSyncYoutube = () => {
    setYoutubeConnected(!youtubeConnected)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={
            userEmail ? (
              <Navigate to="/" replace />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
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
