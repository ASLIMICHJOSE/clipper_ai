import React from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from '@/pages/Dashboard'
import Editor from '@/pages/Editor'
import History from '@/pages/History'
import { Video, History as HistoryIcon, Edit } from 'lucide-react'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-background text-foreground font-sans antialiased overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-64 border-r border-border bg-card flex flex-col">
          <div className="p-6 border-b border-border flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
              C
            </div>
            <span className="font-bold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-400">
              CLIPPER AI
            </span>
          </div>
          
          <nav className="flex-1 p-4 space-y-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`
              }
            >
              <Video className="h-4 w-4" />
              Import Video
            </NavLink>

            <NavLink
              to="/editor"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`
              }
            >
              <Edit className="h-4 w-4" />
              Editor / Preview
            </NavLink>

            <NavLink
              to="/history"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`
              }
            >
              <HistoryIcon className="h-4 w-4" />
              History
            </NavLink>
          </nav>

          <div className="p-4 border-t border-border mt-auto">
            <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg">
              <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center font-bold text-sm">
                YT
              </div>
              <div>
                <p className="text-xs font-semibold">YouTube Status</p>
                <p className="text-[10px] text-muted-foreground">Connected</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-background/50">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/editor" element={<Editor />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
