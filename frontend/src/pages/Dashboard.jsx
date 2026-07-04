import React, { useState } from 'react'
import MetricCard from '@/components/MetricCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Video, Sparkles, Youtube, ListChecks, Play, RefreshCw, Loader2, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const navigate = useNavigate()
  const [videoUrl, setVideoUrl] = useState('')
  const [importing, setImporting] = useState(false)

  // Mock statistics
  const stats = [
    { title: 'Videos Processed', value: '18', icon: Video, description: '+4 this week', trend: '24%', trendDirection: 'up' },
    { title: 'Clips Generated', value: '142', icon: Sparkles, description: 'Avg. 7.8 per video', trend: '18%', trendDirection: 'up' },
    { title: 'YouTube Uploads', value: '59', icon: Youtube, description: '41 Shorts published', trend: '32%', trendDirection: 'up' },
    { title: 'Processing Queue', value: '2', icon: ListChecks, description: '1 active, 1 waiting', trend: '0%', trendDirection: 'down' }
  ]

  // Mock processing queue
  const queue = [
    { id: 1, title: 'How to build SaaS in 24 hours', progress: 68, step: 'transcribing', time: '2m remaining' },
    { id: 2, title: 'Linear CEO Interview on Design', progress: 0, step: 'queued', time: 'Waiting...' }
  ]

  // Mock recent activity
  const recentActivity = [
    { id: 101, title: 'FastAPI Tutorial for Beginners', youtubeId: 'tN8o_E3F9_c', clips: 12, status: 'completed', date: '2 hours ago' },
    { id: 102, title: 'React 19 Deep Dive', youtubeId: 'yD9d_F3A7_a', clips: 8, status: 'completed', date: '1 day ago' },
    { id: 103, title: 'Why Microservices Fail', youtubeId: 'pM7o_S1K8_x', clips: 0, status: 'failed', date: '3 days ago' }
  ]

  const handleImport = (e) => {
    e.preventDefault()
    if (!videoUrl) return
    setImporting(true)
    setTimeout(() => {
      setImporting(false)
      setVideoUrl('')
      // Proactively navigate to projects to show queue
      navigate('/projects')
    }, 1500)
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
            Dashboard
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Overview of your channel's virality metrics and processing status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <MetricCard key={i} {...stat} />
        ))}
      </div>

      {/* Import & Queue row */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Import Video Card */}
        <Card className="md:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <CardHeader>
            <CardTitle>Import YouTube Video</CardTitle>
            <CardDescription>
              Submit any public YouTube URL to download, transcribe, and find viral segments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleImport} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="flex-1 h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  disabled={importing}
                  required
                />
                <Button type="submit" disabled={importing} className="gap-2 shrink-0">
                  {importing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5" />
                      Generate Clips
                    </>
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                By importing, you confirm you have permission to access the video content. We support links from standard video players, Live replays, and Shorts.
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Processing Queue Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Active Queue</CardTitle>
            <CardDescription>Currently processing tasks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {queue.length > 0 ? (
              queue.map((task) => (
                <div key={task.id} className="space-y-1.5 p-3 rounded-lg bg-secondary/50 border border-border/60">
                  <div className="flex justify-between items-center text-xs">
                    <p className="font-semibold truncate max-w-[150px]">{task.title}</p>
                    <span className="text-[10px] font-mono text-muted-foreground">{task.time}</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-background rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500 rounded-full"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase tracking-widest font-semibold pt-0.5">
                    <span>{task.step}</span>
                    <span>{task.progress}%</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">No active tasks in queue.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
          <div>
            <CardTitle>Recent Imports</CardTitle>
            <CardDescription>Manage and preview your recently imported YouTube files.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => navigate('/projects')}>
            View All Projects
            <ArrowRight className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-secondary/30 text-muted-foreground">
                  <th className="p-4 font-semibold uppercase tracking-wider">Video Title</th>
                  <th className="p-4 font-semibold uppercase tracking-wider">YouTube ID</th>
                  <th className="p-4 font-semibold uppercase tracking-wider">Clips Detected</th>
                  <th className="p-4 font-semibold uppercase tracking-wider">Status</th>
                  <th className="p-4 font-semibold uppercase tracking-wider">Created</th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {recentActivity.map((activity) => (
                  <tr key={activity.id} className="hover:bg-secondary/20 transition-colors group">
                    <td className="p-4 font-medium text-foreground max-w-[280px] truncate">
                      {activity.title}
                    </td>
                    <td className="p-4 font-mono text-muted-foreground">{activity.youtubeId}</td>
                    <td className="p-4">
                      {activity.clips > 0 ? (
                        <span className="font-semibold text-primary">{activity.clips} clips</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={
                          activity.status === 'completed'
                            ? 'success'
                            : activity.status === 'failed'
                            ? 'destructive'
                            : 'warning'
                        }
                      >
                        {activity.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">{activity.date}</td>
                    <td className="p-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                        onClick={() => navigate('/projects')}
                      >
                        Manage
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
