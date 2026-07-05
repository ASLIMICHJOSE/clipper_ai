import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, History as HistoryIcon, Settings2, Sparkles, Youtube } from 'lucide-react'

export default function Sidebar({ projectsCount = 0 }) {
  return (
    <aside className="w-64 border-r border-border bg-card/60 backdrop-blur-md flex flex-col h-full sticky top-0">
      {/* Brand Section */}
      <div className="p-6 border-b border-border flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary to-violet-500 flex items-center justify-center text-white font-black text-sm tracking-wider shadow-lg shadow-primary/20">
          C
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80 leading-none">
            CLIPPER AI
          </span>
          <span className="text-[9px] text-muted-foreground font-semibold mt-1 tracking-widest uppercase">
            Viral Engine
          </span>
        </div>
      </div>
      
      {/* Navigation Sections */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        <div className="space-y-1">
          <p className="text-[10px] font-semibold text-muted-foreground/60 px-3 uppercase tracking-wider mb-2">
            Overview
          </p>
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </div>
          </NavLink>

          <NavLink
            to="/import"
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <Youtube className="h-4 w-4" />
              <span>Import Video</span>
            </div>
          </NavLink>

          <NavLink
            to="/projects"
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <FolderKanban className="h-4 w-4" />
              <span>Projects</span>
            </div>
            {projectsCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary border border-border text-foreground font-mono">
                {projectsCount}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/history"
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <HistoryIcon className="h-4 w-4" />
              <span>History</span>
            </div>
          </NavLink>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-semibold text-muted-foreground/60 px-3 uppercase tracking-wider mb-2">
            Configuration
          </p>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`
            }
          >
            <Settings2 className="h-4 w-4" />
            <span>Settings</span>
          </NavLink>
        </div>
      </nav>

      {/* Pro Badge / Upgrade */}
      <div className="p-4 border-t border-border mt-auto">
        <div className="p-4 rounded-xl bg-gradient-to-tr from-secondary/50 to-primary/10 border border-border/80 relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-primary/20 rounded-full blur-xl group-hover:scale-150 transition-all duration-500" />
          <div className="flex items-center gap-2 text-primary mb-2">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Groq Pro Plan</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed mb-3">
            Unlock lightning-fast transcriptions and infinite viral clipping.
          </p>
          <button className="w-full py-1.5 px-3 bg-secondary hover:bg-primary/20 border border-border hover:border-primary/50 text-[10px] font-bold rounded-lg transition-all">
            Upgrade Tier
          </button>
        </div>
      </div>
    </aside>
  )
}
