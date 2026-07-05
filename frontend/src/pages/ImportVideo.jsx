import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Video, Youtube, Clock, Eye, AlertCircle, Loader2, Sparkles, CheckCircle2, Tv } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import apiClient from '@/services/api'

export default function ImportVideo() {
  const navigate = useNavigate()
  const [videoUrl, setVideoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [videoInfo, setVideoInfo] = useState(null)
  const [selectedResolution, setSelectedResolution] = useState('')
  const [analyzing, setAnalyzing] = useState(false)

  // Simple client-side YouTube URL validation
  const validateUrl = (url) => {
    return url.includes('youtube.com/') || url.includes('youtu.be/');
  }

  const handleFetchInfo = async (e) => {
    e.preventDefault()
    setError('')
    setVideoInfo(null)

    if (!videoUrl.trim()) {
      setError('Please enter a YouTube video URL.')
      return
    }

    if (!validateUrl(videoUrl.trim())) {
      setError('Invalid YouTube link. Please provide a standard youtube.com or youtu.be URL.')
      return
    }

    setLoading(true)
    try {
      const res = await apiClient.post('/videos/preview', { url: videoUrl.trim() })
      setVideoInfo(res.data)
      // Default to highest resolution or first option
      if (res.data.resolution_options && res.data.resolution_options.length > 0) {
        setSelectedResolution(res.data.resolution_options[0])
      }
    } catch (err) {
      console.error('Error fetching preview:', err)
      setError(err.response?.data?.detail || 'Failed to extract video details. Make sure the link is public and accessible.')
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = async () => {
    if (!videoUrl.trim()) return
    setAnalyzing(true)
    setError('')
    try {
      await apiClient.post('/videos/', { url: videoUrl.trim() })
      // Navigate to Projects view where user can see the processing queue
      navigate('/projects')
    } catch (err) {
      console.error('Error starting analysis:', err)
      setError(err.response?.data?.detail || 'Failed to initiate video analysis.')
    } finally {
      setAnalyzing(false)
    }
  }

  // Format seconds to readable format: MMm SSs or HHh MMm
  const formatDuration = (seconds) => {
    if (!seconds) return '0s'
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)

    if (h > 0) {
      return `${h}h ${m}m`
    }
    if (m > 0) {
      return `${m}m ${s}s`
    }
    return `${s}s`
  }

  // Format view count to compact style: 1.2M, 45K
  const formatViews = (num) => {
    if (!num) return '0'
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toLocaleString()
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
          Import YouTube Source
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Pasting a link queries video data instantly before running the AI viral segmentation.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Form */}
      <Card className="relative overflow-hidden border-border/80">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Youtube className="h-4 w-4 text-rose-500" />
            Enter Video URL
          </CardTitle>
          <CardDescription className="text-xs">
            Enter a standard YouTube watch URL, Shorts link, or Live stream replay.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFetchInfo} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 h-10 rounded-lg border border-border bg-background/30 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground/60 text-foreground"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              disabled={loading || analyzing}
              required
            />
            <Button type="submit" disabled={loading || analyzing} className="h-10 px-4 text-xs font-semibold shrink-0 gap-1.5">
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Fetching Details...
                </>
              ) : (
                <>
                  <Video className="h-3.5 w-3.5" />
                  Fetch Video Details
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Video Preview Card */}
      {videoInfo && (
        <Card className="overflow-hidden border-border/80 animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row">
            {/* Left Thumbnail Section */}
            <div className="w-full md:w-2/5 aspect-video md:aspect-auto bg-black relative">
              <img
                src={videoInfo.thumbnail || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80'}
                alt={videoInfo.title}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:hidden" />
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1.5 border border-border/40 text-foreground">
                <Clock className="h-3.5 w-3.5" />
                {formatDuration(videoInfo.duration)}
              </div>
            </div>

            {/* Right Information Section */}
            <div className="flex-1 p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="success" className="text-[9px] uppercase tracking-wider">
                    Source Verified
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    By {videoInfo.channel || 'Unknown Channel'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-foreground leading-snug">
                  {videoInfo.title}
                </h3>

                {/* Video Metrics */}
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1.5">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {formatViews(videoInfo.views)} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    ~{videoInfo.estimated_processing_time}s processing time
                  </span>
                </div>
              </div>

              {/* Resolution selection and Action Button */}
              <div className="space-y-4 pt-4 border-t border-border/40">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Tv className="h-3.5 w-3.5 text-primary" />
                    Available Resolutions (Select target)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {videoInfo.resolution_options && videoInfo.resolution_options.length > 0 ? (
                      videoInfo.resolution_options.map((res) => (
                        <button
                          key={res}
                          type="button"
                          className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg border transition-all cursor-pointer ${
                            selectedResolution === res
                              ? 'bg-primary border-primary text-primary-foreground shadow-md shadow-primary/10'
                              : 'bg-secondary/40 border-border text-muted-foreground hover:bg-secondary hover:text-foreground'
                          }`}
                          onClick={() => setSelectedResolution(res)}
                        >
                          {res}
                        </button>
                      ))
                    ) : (
                      <span className="text-[10px] text-muted-foreground">Standard 720p fallback</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 pt-2">
                  <div className="text-[10px] text-muted-foreground leading-relaxed hidden sm:block max-w-xs">
                    Targeting resolution <strong className="text-foreground">{selectedResolution || '720p'}</strong>. Whisper speech-to-text transcription will process in parallel.
                  </div>
                  <Button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="h-10 text-xs font-semibold px-6 gap-1.5 shadow-md shadow-primary/20 shrink-0 ml-auto"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Queueing Analysis...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5 fill-current" />
                        Analyze Video
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
