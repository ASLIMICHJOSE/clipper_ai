import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Play, Pause, Save, Loader2, ArrowLeft, Trash2, 
  Sparkles, CheckCircle2, AlertCircle, Edit3, Volume2, User, Clock 
} from 'lucide-react'
import apiClient from '@/services/api'

export default function Editor() {
  const { video_id } = useParams()
  const navigate = useNavigate()
  const videoRef = useRef(null)

  // State
  const [video, setVideo] = useState(null)
  const [transcript, setTranscript] = useState({ text: '', segments: [] })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(null)
  const [editingSpeakerIndex, setEditingSpeakerIndex] = useState(null)
  const [tempSpeakerName, setTempSpeakerName] = useState('')

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      // 1. Fetch video details
      const videoRes = await apiClient.get(`/videos/${video_id}`)
      setVideo(videoRes.data)

      // 2. Fetch transcript segments
      const transcriptRes = await apiClient.get(`/videos/${video_id}/transcript`)
      setTranscript(transcriptRes.data || { text: '', segments: [] })
    } catch (err) {
      console.error('Error fetching editor data:', err)
      setError('Failed to load video or transcript details. Make sure the server is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [video_id])

  // Track active segment based on video current time
  const handleTimeUpdate = () => {
    if (!videoRef.current || !transcript.segments.length) return
    const currentTime = videoRef.current.currentTime
    const index = transcript.segments.findIndex(
      (seg) => currentTime >= seg.start && currentTime <= seg.end
    )
    if (index !== -1 && index !== activeSegmentIndex) {
      setActiveSegmentIndex(index)
      // Auto-scroll active segment into view
      const activeEl = document.getElementById(`segment-${index}`)
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
  }

  const seekTo = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds
      videoRef.current.play().catch(() => {})
    }
  }

  // Handle transcript text edits
  const handleTextChange = (index, value) => {
    const updatedSegments = [...transcript.segments]
    updatedSegments[index].text = value
    setTranscript({
      ...transcript,
      segments: updatedSegments
    })
  }

  // Change speaker name for globally all segments with that speaker name
  const handleRenameSpeaker = (oldName, newName) => {
    if (!newName.trim()) return
    const updatedSegments = transcript.segments.map((seg) => {
      if (seg.speaker === oldName) {
        return { ...seg, speaker: newName.trim() }
      }
      return seg
    })
    setTranscript({
      ...transcript,
      segments: updatedSegments
    })
    setEditingSpeakerIndex(null)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const fullText = transcript.segments.map((s) => s.text).join(' ')
      
      const payload = {
        text: fullText,
        segments: transcript.segments
      }
      
      await apiClient.put(`/videos/${video_id}/transcript`, payload)
      setSuccess('Transcript changes saved successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Error saving transcript:', err)
      setError(err.response?.data?.detail || 'Failed to save transcript updates.')
    } finally {
      setSaving(false)
    }
  }

  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return '00:00'
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = Math.floor(seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground tracking-wider uppercase">Loading Editor workspace...</p>
        </div>
      </div>
    )
  }

  const storageUrl = video?.file_path 
    ? `http://localhost:8000/storage/videos/${video.youtube_id}.mp4`
    : null

  const youtubeEmbedUrl = `https://www.youtube.com/embed/${video?.youtube_id}?enablejsapi=1`

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 bg-background/50 hover:bg-secondary rounded-lg"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground truncate max-w-[400px]" title={video?.title}>
              {video?.title || 'Clip Editor'}
            </h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Review viral highlights, crop clips, and refine transcription details.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {success && (
            <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] flex items-center gap-1.5 animate-in fade-in duration-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{success}</span>
            </div>
          )}
          {error && (
            <div className="px-3 py-1.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-[11px] flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{error}</span>
            </div>
          )}
          <Button 
            onClick={handleSave} 
            disabled={saving} 
            size="sm" 
            className="h-9 text-xs font-semibold gap-1.5 shadow-md shadow-primary/10 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Video Player & Viral Clips */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          <Card className="overflow-hidden border-border/80 bg-black/40">
            <CardContent className="p-0 aspect-video relative flex items-center justify-center">
              {storageUrl ? (
                <video
                  ref={videoRef}
                  src={storageUrl}
                  controls
                  onTimeUpdate={handleTimeUpdate}
                  className="w-full h-full object-contain"
                />
              ) : (
                <iframe
                  src={youtubeEmbedUrl}
                  title={video?.title}
                  className="w-full h-full border-0 absolute inset-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              )}
            </CardContent>
          </Card>

          {/* Viral Clips list */}
          <Card className="border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-500 fill-current" />
                Suggested Viral Shorts
              </CardTitle>
              <CardDescription className="text-xs">
                AI suggested timestamps based on speech triggers and virality analysis.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {video?.clips && video.clips.length > 0 ? (
                video.clips.map((clip) => (
                  <div 
                    key={clip.id} 
                    className="p-3.5 rounded-lg border border-border bg-secondary/20 hover:bg-secondary/40 transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-4 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-xs text-foreground leading-none">{clip.title}</span>
                        <Badge variant="success" className="text-[9px] px-1 py-0.5">
                          Score: {clip.virality_score}%
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        {clip.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-[10px] font-semibold gap-1 bg-background/50"
                        onClick={() => seekTo(clip.start_time)}
                      >
                        <Play className="h-3 w-3 fill-current text-primary" />
                        Preview Range ({formatTime(clip.start_time)} - {formatTime(clip.end_time)})
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-secondary text-muted-foreground hover:text-foreground"
                        title="Edit Clip Range"
                        onClick={() => seekTo(clip.start_time)}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground/60 flex flex-col items-center justify-center gap-2 border border-dashed border-border/80 rounded-lg">
                  <Sparkles className="h-8 w-8 text-muted-foreground/35 animate-pulse" />
                  <p className="text-xs">Suggested clips will appear here after metadata analysis finishes.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Editable Transcript */}
        <div className="space-y-6">
          <Card className="h-[600px] flex flex-col border-border/80">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-primary" />
                Refine Transcript
              </CardTitle>
              <CardDescription className="text-xs">
                Refine and edit local speech-to-text text blocks segment by segment.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {transcript.segments && transcript.segments.length > 0 ? (
                transcript.segments.map((seg, idx) => {
                  const isActive = activeSegmentIndex === idx
                  const isEditingSpeaker = editingSpeakerIndex === idx

                  return (
                    <div
                      key={idx}
                      id={`segment-${idx}`}
                      className={`p-3 rounded-lg border transition-all ${
                        isActive
                          ? 'border-primary/40 bg-primary/5 shadow-sm shadow-primary/5'
                          : 'border-border/60 bg-secondary/15 hover:bg-secondary/35'
                      }`}
                    >
                      {/* Segment Header */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        {isEditingSpeaker ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={tempSpeakerName}
                              onChange={(e) => setTempSpeakerName(e.target.value)}
                              className="h-6 w-28 text-[10px] bg-background border border-border px-1.5 py-0.5 rounded focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              className="h-6 px-1.5 text-[9px]"
                              onClick={() => handleRenameSpeaker(seg.speaker, tempSpeakerName)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-1.5 text-[9px]"
                              onClick={() => setEditingSpeakerIndex(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Badge 
                            variant="secondary" 
                            className="text-[9px] font-semibold flex items-center gap-1 cursor-pointer hover:bg-secondary py-0.5"
                            onClick={() => {
                              setEditingSpeakerIndex(idx)
                              setTempSpeakerName(seg.speaker)
                            }}
                            title="Click to rename speaker"
                          >
                            <User className="h-2.5 w-2.5" />
                            {seg.speaker}
                          </Badge>
                        )}

                        <Button
                          variant="ghost"
                          className="h-5 px-1.5 rounded text-[10px] font-mono text-muted-foreground/80 hover:text-foreground flex items-center gap-1"
                          onClick={() => seekTo(seg.start)}
                        >
                          <Clock className="h-2.5 w-2.5" />
                          {formatTime(seg.start)} - {formatTime(seg.end)}
                        </Button>
                      </div>

                      {/* Text Input */}
                      <textarea
                        value={seg.text}
                        onChange={(e) => handleTextChange(idx, e.target.value)}
                        rows={2}
                        className="w-full text-xs bg-transparent border-0 resize-none focus:outline-none focus:ring-0 p-0 text-foreground leading-relaxed placeholder:text-muted-foreground/50"
                        placeholder="Segment transcript..."
                      />
                    </div>
                  )
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground/60 gap-2">
                  <Volume2 className="h-8 w-8 text-muted-foreground/35 animate-pulse" />
                  <p className="text-xs">No transcript segments found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
