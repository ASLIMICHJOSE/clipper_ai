import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Youtube, ExternalLink, Calendar, Copy, Check, Eye, Clock } from 'lucide-react'

export default function History() {
  const [copiedId, setCopiedId] = useState(null)

  // Mock historical clips
  const historicalClips = [
    {
      id: 1,
      title: 'The Secret to FastAPI Dependency Injection 🤫',
      videoTitle: 'FastAPI Tutorial for Beginners',
      viralityScore: 92.4,
      publishedAt: 'July 3, 2026',
      youtubeUrl: 'https://youtube.com/shorts/xyz123',
      views: '12.4K',
      duration: '0:45',
      seoTitle: 'FastAPI Dependency Injection in 45 Seconds!'
    },
    {
      id: 2,
      title: 'React Server Components vs Actions 🤯',
      videoTitle: 'React 19 Deep Dive',
      viralityScore: 88.1,
      publishedAt: 'July 2, 2026',
      youtubeUrl: 'https://youtube.com/shorts/abc987',
      views: '8.2K',
      duration: '0:58',
      seoTitle: 'React 19 Server Components Explained'
    },
    {
      id: 3,
      title: 'Why you should NEVER use nested routes in 2026',
      videoTitle: 'React 19 Deep Dive',
      viralityScore: 81.5,
      publishedAt: 'July 2, 2026',
      youtubeUrl: 'https://youtube.com/shorts/uvw456',
      views: '5.1K',
      duration: '0:32',
      seoTitle: 'Nested Routes are a Bad Idea! Here is why.'
    }
  ]

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
          Clips History
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Review all rendered viral shorts and YouTube channel upload activities.
        </p>
      </div>

      {/* Historical List */}
      <div className="space-y-4">
        {historicalClips.map((clip) => (
          <Card key={clip.id} className="relative overflow-hidden border-border/80 hover:border-primary/20 transition-all duration-300">
            {/* Virality score top overlay tag */}
            <div className="absolute top-0 right-0 px-3 py-1 rounded-bl bg-primary/10 border-l border-b border-border/40 text-[10px] font-bold text-primary flex items-center gap-1">
              Score: {clip.viralityScore}%
            </div>

            <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Info Column */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Youtube className="h-4 w-4 text-rose-500" />
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                    {clip.videoTitle}
                  </span>
                  <span className="text-border text-xs">•</span>
                  <Badge variant="outline" className="text-[10px] font-normal py-0">
                    YouTube Shorts
                  </Badge>
                </div>

                <h3 className="text-sm font-bold tracking-tight text-foreground">
                  {clip.title}
                </h3>
                
                <p className="text-[10px] text-muted-foreground italic max-w-xl truncate">
                  SEO Title: "{clip.seoTitle}"
                </p>
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-6 text-xs text-muted-foreground border-t md:border-t-0 pt-4 md:pt-0 border-border/60">
                <div className="flex flex-col items-start gap-1">
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
                    Published
                  </span>
                  <span className="font-medium text-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {clip.publishedAt}
                  </span>
                </div>

                <div className="flex flex-col items-start gap-1">
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
                    Views
                  </span>
                  <span className="font-medium text-foreground flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5" />
                    {clip.views}
                  </span>
                </div>

                <div className="flex flex-col items-start gap-1">
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
                    Length
                  </span>
                  <span className="font-medium text-foreground flex items-center gap-1.5 font-mono">
                    <Clock className="h-3.5 w-3.5" />
                    {clip.duration}
                  </span>
                </div>
              </div>

              {/* Actions Column */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-semibold gap-1.5"
                  onClick={() => handleCopy(clip.seoTitle, clip.id)}
                >
                  {copiedId === clip.id ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      Copied SEO
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copy SEO
                    </>
                  )}
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  className="h-8 text-xs font-semibold gap-1.5"
                  onClick={() => window.open(clip.youtubeUrl, '_blank')}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View Shorts
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
