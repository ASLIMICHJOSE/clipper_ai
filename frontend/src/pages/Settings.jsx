import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Key, Youtube, Sliders, Save, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react'

export default function Settings({ onSyncYoutube, youtubeConnected }) {
  const [groqKey, setGroqKey] = useState('gsk_y6eR...V29l')
  const [subtitleFont, setSubtitleFont] = useState('Impact')
  const [subtitleSize, setSubtitleSize] = useState('24')
  const [subtitleColor, setSubtitleColor] = useState('#FACC15') // Yellow-400
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleSave = (e) => {
    e.preventDefault()
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    }, 1000)
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
          Settings & Configurations
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Configure API credentials, YouTube integrations, and automated rendering presets.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* API Credentials */}
        <Card className="border-border/80">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-primary">
              <Key className="h-4.5 w-4.5" />
              <CardTitle className="text-base font-semibold">API Credentials</CardTitle>
            </div>
            <CardDescription>
              Provide API tokens to unlock LLM processing and transcribing modules.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Groq API Key
              </label>
              <Input
                type="password"
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder="gsk_..."
              />
              <p className="text-[10px] text-muted-foreground leading-normal">
                Your Groq key is stored locally in SQLite database and is never shared outside your system.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* YouTube OAuth Configuration */}
        <Card className="border-border/80 relative overflow-hidden">
          {/* Subtle logo bg */}
          <div className="absolute right-4 bottom-4 text-rose-500/5 select-none pointer-events-none">
            <Youtube className="w-32 h-32" />
          </div>

          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-rose-500">
              <Youtube className="h-4.5 w-4.5" />
              <CardTitle className="text-base font-semibold">YouTube Platform Sync</CardTitle>
            </div>
            <CardDescription>
              Grant permissions to publish shorts directly to your YouTube channel.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border/80 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">Channel: TechVlogs AI</span>
                  {youtubeConnected ? (
                    <Badge variant="success">Synchronized</Badge>
                  ) : (
                    <Badge variant="destructive">Disconnected</Badge>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Linked via OAuth 2.0 with video creation scopes.
                </p>
              </div>
              
              <Button
                type="button"
                variant={youtubeConnected ? 'outline' : 'default'}
                size="sm"
                className="text-xs font-semibold gap-1.5 shrink-0"
                onClick={onSyncYoutube}
              >
                <Youtube className="h-3.5 w-3.5" />
                {youtubeConnected ? 'Disconnect Channel' : 'Connect YouTube'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Formatting Presets */}
        <Card className="border-border/80">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-primary">
              <Sliders className="h-4.5 w-4.5" />
              <CardTitle className="text-base font-semibold">Subtitles Styling Presets</CardTitle>
            </div>
            <CardDescription>
              Configure default styles for automatically generated and burned subtitles.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Font Family
              </label>
              <select
                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                value={subtitleFont}
                onChange={(e) => setSubtitleFont(e.target.value)}
              >
                <option value="Impact">Impact (Standard Viral)</option>
                <option value="Montserrat">Montserrat Black</option>
                <option value="Inter">Inter Semibold</option>
                <option value="Outfit">Outfit Bold</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Font Size (px)
              </label>
              <Input
                type="number"
                value={subtitleSize}
                onChange={(e) => setSubtitleSize(e.target.value)}
                min="12"
                max="72"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Caption Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  className="h-10 w-12 rounded border border-border bg-background p-1 cursor-pointer"
                  value={subtitleColor}
                  onChange={(e) => setSubtitleColor(e.target.value)}
                />
                <Input
                  type="text"
                  value={subtitleColor}
                  onChange={(e) => setSubtitleColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-between border-t border-border/40 bg-secondary/10 px-6 py-4 mt-6">
            <div className="flex items-center gap-1.5 text-[10px] text-amber-400">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>FFmpeg encoding is CPU-intensive.</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" className="text-xs">
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Reset Defaults
              </Button>
              
              <Button type="submit" disabled={saving} size="sm" className="text-xs gap-1.5">
                {saving ? (
                  'Saving...'
                ) : saveSuccess ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
