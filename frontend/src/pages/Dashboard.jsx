import React, { useState, useEffect } from 'react'
import MetricCard from '@/components/MetricCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Video, Sparkles, Youtube, ListChecks, Play, RefreshCw, Loader2, ArrowRight, AlertCircle, XCircle, RotateCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import apiClient from '@/services/api'

export default function Dashboard() {
  const navigate = useNavigate()
  const [videoUrl, setVideoUrl] = useState('')
  const [importing, setImporting] = useState(false)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setRefreshing(true)
    setError('')
    try {
      const res = await apiClient.get('/videos/')
      setVideos(res.data || [])
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to connect to the backend server. Make sure it is running.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Dynamic polling based on active jobs in queue
  useEffect(() => {
    const hasActiveJobs = videos.some(v => !['completed', 'failed', 'cancelled'].includes(v.status))
    const intervalTime = hasActiveJobs ? 2000 : 10000

    const interval = setInterval(() => {
      fetchData()
    }, intervalTime)

    return () => clearInterval(interval)
  }, [videos])

  const handleCancel = async (videoId) => {
    setError('')
    try {
      await apiClient.post(`/videos/${videoId}/cancel`)
      fetchData()
    } catch (err) {
      console.error('Error cancelling download:', err)
      setError(err.response?.data?.detail || 'Failed to cancel download.')
    }
  }

  const handleRetry = async (videoId) => {
    setError('')
    try {
      await apiClient.post(`/videos/${videoId}/retry`)
      fetchData()
    } catch (err) {
      console.error('Error retrying download:', err)
      setError(err.response?.data?.detail || 'Failed to retry download.')
    }
  }

  const handleImport = async (e) => {
    e.preventDefault()
    if (!videoUrl) return
    setImporting(true)
    setError('')
    try {
      await apiClient.post('/videos/', { url: videoUrl })
      setVideoUrl('')
      // Proactively navigate to projects to show queue
      navigate('/projects')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to import video. Make sure the backend is active.')
    } finally {
      setImporting(false)
    }
  }

  // Helper to format dates
  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return dateStr
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch (e) {
      return dateStr
    }
  }

  // Calculate dynamic stats
  const totalVideos = videos.length
  
  let totalClips = 0
  let uploadedClips = 0
  let activeQueueCount = 0
  const activeQueueItems = []

  videos.forEach(v => {
    // Check clips count
    const clipsList = v.clips || []
    totalClips += clipsList.length

    // Count uploaded clips
    clipsList.forEach(c => {
      if (c.youtube_upload_id) {
        uploadedClips++
      }
    })

    // Check if video is processing
    const isVideoProcessing = !['completed', 'failed', 'cancelled'].includes(v.status)
    if (isVideoProcessing) {
      activeQueueCount++
      let progress = v.progress || 10
      if (v.status === 'downloading') progress = v.progress || 0
      else if (v.status === 'extracting') progress = v.progress || 0
      else if (v.status === 'transcribing') progress = v.progress || 50
      else if (v.status === 'analyzing') progress = v.progress || 80
      
      activeQueueItems.push({
        id: `v-${v.id}`,
        videoId: v.id,
        title: v.title || 'Processing Video Source...',
        progress,
        step: v.status,
        speed: v.speed,
        eta: v.eta,
        time: 'Active'
      })
    }

    // Check if clips are rendering or uploading
    clipsList.forEach(c => {
      const isClipProcessing = !['completed', 'failed'].includes(c.status)
      if (isClipProcessing) {
        activeQueueCount++
        let progress = 15
        if (c.status === 'clipping') progress = 50
        else if (c.status === 'uploading') progress = 80

        activeQueueItems.push({
          id: `c-${c.id}`,
          title: c.title || `Clip #${c.id} of Video #${v.id}`,
          progress,
          step: c.status,
          time: 'Active'
        })
      }
    })
  })

  const stats = [
    { title: 'Total Projects', value: String(totalVideos), icon: Video, description: 'Workspace folders', trend: '100%', trendDirection: 'up' },
    { title: 'Clips Generated', value: String(totalClips), icon: Sparkles, description: 'Viral Short snippets', trend: totalVideos > 0 ? `${(totalClips / totalVideos).toFixed(1)} avg/vid` : '0 avg', trendDirection: 'up' },
    { title: 'YouTube Uploads', value: String(uploadedClips), icon: Youtube, description: 'Shorts published', trend: totalClips > 0 ? `${Math.round((uploadedClips / totalClips) * 100)}% upload rate` : '0%', trendDirection: 'up' },
    { title: 'Processing Queue', value: String(activeQueueCount), icon: ListChecks, description: 'Active background tasks', trend: '0%', trendDirection: 'down' }
  ]

  // Sort and pick top 5 most recent imports
  const sortedVideos = [...videos].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  const recentImports = sortedVideos.slice(0, 5)

  // Skeleton Loaders
  const renderMetricSkeletons = () => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-28 rounded-xl bg-card/40 border border-border/60 p-6 animate-pulse flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="h-4 w-28 bg-muted rounded"></div>
            <div className="h-8 w-8 rounded-lg bg-muted"></div>
          </div>
          <div className="space-y-2 mt-4">
            <div className="h-6 w-16 bg-muted rounded"></div>
            <div className="h-3 w-32 bg-muted rounded"></div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderQueueSkeletons = () => (
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="p-3 rounded-lg bg-secondary/30 border border-border/40 space-y-2 animate-pulse">
          <div className="flex justify-between">
            <div className="h-3 w-28 bg-muted rounded"></div>
            <div className="h-3.5 w-12 bg-muted rounded"></div>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full"></div>
          <div className="flex justify-between">
            <div className="h-2.5 w-14 bg-muted rounded"></div>
            <div className="h-2.5 w-8 bg-muted rounded"></div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderTableSkeletons = () => (
    <div className="divide-y divide-border/60 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between p-4">
          <div className="flex-1 space-y-2 pr-4">
            <div className="h-4 w-48 bg-muted rounded"></div>
          </div>
          <div className="w-32 h-3.5 bg-muted rounded mr-4"></div>
          <div className="w-20 h-3.5 bg-muted rounded mr-4"></div>
          <div className="w-16 h-5 bg-muted rounded mr-4"></div>
          <div className="w-24 h-3.5 bg-muted rounded mr-4"></div>
          <div className="w-16 h-8 bg-muted rounded"></div>
        </div>
      ))}
    </div>
  )

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
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 bg-background/50" 
            onClick={() => fetchData(true)}
            disabled={loading || refreshing}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Grid */}
      {loading ? (
        renderMetricSkeletons()
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <MetricCard key={i} {...stat} />
          ))}
        </div>
      )}

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
                  className="flex-1 h-10 rounded-lg border border-border bg-background/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground"
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
        <Card className="bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle>Active Queue</CardTitle>
            <CardDescription>Currently processing tasks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              renderQueueSkeletons()
            ) : activeQueueItems.length > 0 ? (
              activeQueueItems.map((task) => (
                <div key={task.id} className="space-y-1.5 p-3 rounded-lg bg-secondary/30 border border-border/60 relative group/queue">
                  <div className="flex justify-between items-center text-xs pr-6">
                    <p className="font-semibold truncate max-w-[150px]" title={task.title}>{task.title}</p>
                    <span className="text-[9px] font-mono text-muted-foreground/80 uppercase">{task.time}</span>
                  </div>
                  
                  {/* Cancel Button */}
                  {task.videoId && ['pending', 'downloading'].includes(task.step) && (
                    <button
                      onClick={() => handleCancel(task.videoId)}
                      className="absolute right-2 top-2 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                      title="Cancel Download"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  )}
                  
                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-background/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300 rounded-full"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center text-[9px] text-muted-foreground uppercase tracking-wider font-bold pt-0.5">
                    <span>
                      {task.step} {task.speed && `(${task.speed})`}
                    </span>
                    <span>
                      {task.eta && task.eta !== 'estimating...' && `ETA: ${task.eta} • `}
                      {task.progress}%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground/60 flex flex-col items-center justify-center gap-2">
                <ListChecks className="h-7 w-7 text-muted-foreground/35" />
                <p className="text-xs">No active tasks in queue.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <Card className="bg-card/40">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/40 pb-4 gap-4">
          <div>
            <CardTitle>Recent Imports</CardTitle>
            <CardDescription>Manage and preview your recently imported YouTube files.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="text-xs gap-1 self-start sm:self-auto hover:bg-secondary" onClick={() => navigate('/projects')}>
            View All Projects
            <ArrowRight className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            renderTableSkeletons()
          ) : recentImports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-secondary/20 text-muted-foreground font-semibold">
                    <th className="p-4 uppercase tracking-wider">Video Title</th>
                    <th className="p-4 uppercase tracking-wider">YouTube ID</th>
                    <th className="p-4 uppercase tracking-wider">Clips</th>
                    <th className="p-4 uppercase tracking-wider">Status</th>
                    <th className="p-4 uppercase tracking-wider">Created</th>
                    <th className="p-4 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {recentImports.map((activity) => (
                    <tr key={activity.id} className="hover:bg-secondary/15 transition-colors group">
                      <td className="p-4 font-medium text-foreground max-w-[280px] truncate" title={activity.title || 'Untitled'}>
                        {activity.title || 'Untitled Video'}
                      </td>
                      <td className="p-4 font-mono text-muted-foreground">{activity.youtube_id}</td>
                      <td className="p-4">
                        {activity.clips && activity.clips.length > 0 ? (
                          <span className="font-semibold text-primary">{activity.clips.length} clips</span>
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
                      <td className="p-4 text-muted-foreground">{formatDate(activity.created_at)}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                          {['failed', 'cancelled'].includes(activity.status) && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-[10px] font-semibold gap-1 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20"
                              onClick={() => handleRetry(activity.id)}
                            >
                              <RotateCcw className="h-3 w-3" />
                              Retry
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs hover:bg-secondary text-primary font-semibold"
                            onClick={() => navigate(`/editor/${activity.id}`)}
                          >
                            Edit & Preview
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center min-h-[220px]">
              <Video className="h-8 w-8 text-muted-foreground/40 mb-3" />
              <p className="text-xs font-semibold text-muted-foreground/80 mb-1">No video projects found</p>
              <p className="text-[11px] text-muted-foreground/60 max-w-xs">
                Import your first YouTube link to start generating viral short clips.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
