import React from 'react'

export default function History() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">History</h1>
        <p className="text-muted-foreground">List of previously processed YouTube videos and their generated clips.</p>
      </header>

      <div className="rounded-xl border bg-card text-card-foreground p-6 shadow-sm">
        <p className="text-muted-foreground text-center py-8">No videos found. Start by importing a video on the dashboard.</p>
      </div>
    </div>
  )
}
