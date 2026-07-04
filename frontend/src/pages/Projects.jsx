import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Video, Clock, ChevronRight, Play, ExternalLink, Calendar, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Projects() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  // Mock list of projects
  const projects = [
    {
      id: 1,
      title: 'FastAPI Tutorial for Beginners - Build a REST API',
      youtubeId: 'tN8o_E3F9_c',
      duration: '45:12',
      status: 'completed',
      clipsCount: 12,
      created: 'July 3, 2026',
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80'
    },
    {
      id: 2,
      title: 'React 19 Deep Dive - All the new features explained',
      youtubeId: 'yD9d_F3A7_a',
      duration: '1:12:05',
      status: 'completed',
      clipsCount: 8,
      created: 'July 2, 2026',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&q=80'
    },
    {
      id: 3,
      title: 'How to build SaaS in 24 hours - Complete blueprint',
      youtubeId: 'zV9x_D4V3_b',
      duration: '22:15',
      status: 'transcribing',
      clipsCount: 0,
      created: 'Just now',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80'
    },
    {
      id: 4,
      title: 'Why Microservices Fail (and what to do instead)',
      youtubeId: 'pM7o_S1K8_x',
      duration: '35:40',
      status: 'failed',
      clipsCount: 0,
      created: '3 days ago',
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&q=80'
    }
  ]

  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
            Projects Workspace
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Browse and manage all imported YouTube video sources and their clippings.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects..."
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-secondary/50 border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="flex flex-col h-full overflow-hidden group border-border/80">
            {/* Project Cover Image */}
            <div className="h-48 w-full relative overflow-hidden bg-black">
              <img
                src={project.thumbnail}
                alt={project.title}
                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 right-3">
                <Badge
                  variant={
                    project.status === 'completed'
                      ? 'success'
                      : project.status === 'failed'
                      ? 'destructive'
                      : 'warning'
                  }
                >
                  {project.status}
                </Badge>
              </div>
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1.5 border border-border/40">
                <Clock className="h-3 w-3" />
                {project.duration}
              </div>
            </div>

            <CardHeader className="flex-1 pb-3">
              <CardTitle className="text-sm font-semibold line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                {project.title}
              </CardTitle>
              <CardDescription className="font-mono text-[10px] pt-1">
                ID: {project.youtubeId}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-0 pb-4 flex items-center justify-between border-t border-border/40 mt-auto bg-secondary/20 px-6 py-3">
              <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {project.created}
                </span>
                {project.clipsCount > 0 && (
                  <span className="font-semibold text-primary">
                    {project.clipsCount} clips generated
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-secondary rounded-lg"
                  onClick={() => window.open(`https://youtube.com/watch?v=${project.youtubeId}`, '_blank')}
                  title="Watch Source Video"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
                
                <Button
                  variant={project.status === 'completed' ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 text-xs font-semibold gap-1.5"
                  onClick={() => navigate('/editor')}
                  disabled={project.status === 'failed'}
                >
                  {project.status === 'completed' ? (
                    <>
                      <Play className="h-3 w-3 fill-current" />
                      Open Editor
                    </>
                  ) : (
                    'View Details'
                  )}
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
