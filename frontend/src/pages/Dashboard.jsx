import React from 'react'

export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">AI YouTube Viral Clip Generator</h1>
        <p className="text-muted-foreground text-lg">
          Import any YouTube video to automatically extract viral shorts with subtitles, and post directly to YouTube.
        </p>
      </header>

      <main className="grid gap-6 md:grid-cols-1">
        <div className="rounded-xl border bg-card text-card-foreground p-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Import YouTube Video</h2>
          <div className="flex gap-4 max-w-2xl">
            <input
              type="text"
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Import
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
