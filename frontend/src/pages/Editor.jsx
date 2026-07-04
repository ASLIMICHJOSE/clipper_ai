import React from 'react'

export default function Editor() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Clip Editor & Preview</h1>
        <p className="text-muted-foreground">
          Edit timestamps, view transcript, select virality analysis options, and configure subtitles.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video bg-black rounded-xl flex items-center justify-center text-muted-foreground border">
            Video Player Placeholder
          </div>
          <div className="rounded-xl border bg-card text-card-foreground p-6">
            <h3 className="text-xl font-semibold mb-4">Transcript</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              No transcript available. Import a video first to view auto-generated Whisper transcribing.
            </p>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="rounded-xl border bg-card text-card-foreground p-6">
            <h3 className="text-xl font-semibold mb-4">Viral Clips</h3>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Clips will appear here after analysis completes.</p>
            </div>
          </div>
          <div className="rounded-xl border bg-card text-card-foreground p-6">
            <h3 className="text-xl font-semibold mb-4">SEO Details</h3>
            <p className="text-sm text-muted-foreground">Auto-generated titles, tags, and descriptions.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
