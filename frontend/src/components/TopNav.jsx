import React from 'react'
import { Bell, Search, LogOut, CheckCircle2, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from './ui/button'

export default function TopNav({ pageTitle, userEmail, onLogout, youtubeConnected }) {
  const navigate = useNavigate()

  return (
    <header className="h-16 border-b border-border bg-card/40 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Workspace
        </h2>
        <span className="text-border">/</span>
        <span className="text-sm font-medium text-foreground">{pageTitle}</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Search Input Placeholder */}
        <div className="relative w-64 hidden md:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects or clips... (⌘K)"
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-background/50 border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground"
          />
        </div>

        {/* YouTube Connection Indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/60 border border-border text-xs text-muted-foreground">
          {youtubeConnected ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span className="hidden sm:inline">YouTube Sync</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">API Disconnected</span>
            </>
          )}
        </div>

        {/* Notification bell */}
        <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-all">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        </button>

        {/* User Account / Log out */}
        {userEmail && (
          <div className="flex items-center gap-3 pl-2 border-l border-border">
            <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs uppercase border border-primary/30">
              {userEmail.substring(0, 2)}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold max-w-[120px] truncate">{userEmail}</p>
              <p className="text-[10px] text-muted-foreground">Creator</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:text-destructive text-muted-foreground"
              onClick={onLogout}
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
