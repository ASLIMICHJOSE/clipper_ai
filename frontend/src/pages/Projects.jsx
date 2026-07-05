import React, { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Video, Calendar, Search, Plus, Trash2, Archive, Edit3, Loader2, X, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import apiClient from '@/services/api'

export default function Projects() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Create Project Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDesc, setNewProjectDesc] = useState('')
  const [newProjectThumb, setNewProjectThumb] = useState('')
  const [creating, setCreating] = useState(false)

  // Edit Project Modal State
  const [editingProject, setEditingProject] = useState(null)
  const [editProjectName, setEditProjectName] = useState('')
  const [editProjectDesc, setEditProjectDesc] = useState('')
  const [editProjectThumb, setEditProjectThumb] = useState('')
  const [updating, setUpdating] = useState(false)

  // Delete Confirmation Modal State
  const [projectToDelete, setProjectToDelete] = useState(null)

  const fetchProjects = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await apiClient.get('/projects/')
      setProjects(res.data || [])
    } catch (err) {
      console.error('Error fetching projects:', err)
      setError('Failed to load projects. Make sure the backend server is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleCreateProject = async (e) => {
    e.preventDefault()
    if (!newProjectName.trim()) return
    setCreating(true)
    setError('')
    try {
      const res = await apiClient.post('/projects/', {
        name: newProjectName.trim(),
        description: newProjectDesc.trim() || null,
        thumbnail: newProjectThumb.trim() || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80',
        status: 'active'
      })
      setProjects([res.data, ...projects])
      setIsCreateOpen(false)
      setNewProjectName('')
      setNewProjectDesc('')
      setNewProjectThumb('')
    } catch (err) {
      console.error('Error creating project:', err)
      setError(err.response?.data?.detail || 'Failed to create project.')
    } finally {
      setCreating(false)
    }
  }

  const startEditProject = (project) => {
    setEditingProject(project)
    setEditProjectName(project.name)
    setEditProjectDesc(project.description || '')
    setEditProjectThumb(project.thumbnail || '')
  }

  const handleRenameProject = async (e) => {
    e.preventDefault()
    if (!editingProject || !editProjectName.trim()) return
    setUpdating(true)
    setError('')
    try {
      const res = await apiClient.put(`/projects/${editingProject.id}`, {
        name: editProjectName.trim(),
        description: editProjectDesc.trim() || null,
        thumbnail: editProjectThumb.trim() || null
      })
      setProjects(projects.map(p => p.id === editingProject.id ? res.data : p))
      setEditingProject(null)
    } catch (err) {
      console.error('Error updating project:', err)
      setError(err.response?.data?.detail || 'Failed to update project.')
    } finally {
      setUpdating(false)
    }
  }

  const confirmDeleteProject = async (id) => {
    setError('')
    try {
      await apiClient.delete(`/projects/${id}`)
      setProjects(projects.filter(p => p.id !== id))
      setProjectToDelete(null)
    } catch (err) {
      console.error('Error deleting project:', err)
      setError(err.response?.data?.detail || 'Failed to delete project.')
    }
  }

  const handleArchiveProject = async (id) => {
    setError('')
    try {
      const res = await apiClient.post(`/projects/${id}/archive`)
      setProjects(projects.map(p => p.id === id ? res.data : p))
    } catch (err) {
      console.error('Error archiving project:', err)
      setError(err.response?.data?.detail || 'Failed to archive project.')
    }
  }

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

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
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
            Browse and manage all workspace projects and metadata.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full h-9 pl-9 pr-4 rounded-lg bg-secondary/50 border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground text-foreground"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsCreateOpen(true)} size="sm" className="h-9 gap-1.5 font-semibold shrink-0">
            <Plus className="h-4 w-4" />
            Create Project
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-80 rounded-xl bg-card/40 border border-border/60 p-6 animate-pulse flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-32 w-full bg-muted rounded-lg"></div>
                <div className="h-4 w-1/3 bg-muted rounded"></div>
                <div className="h-3 w-3/4 bg-muted rounded"></div>
              </div>
              <div className="h-8 w-24 bg-muted rounded mt-4"></div>
            </div>
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        /* Projects Grid */
        <div className="grid gap-6 md:grid-cols-2">
          {filteredProjects.map((project) => (
            <Card key={project.id} className={`flex flex-col h-full overflow-hidden group border-border/80 transition-all duration-300 ${project.status === 'archived' ? 'opacity-60 hover:opacity-80' : ''}`}>
              {/* Project Cover Image */}
              <div className="h-40 w-full relative overflow-hidden bg-black">
                <img
                  src={project.thumbnail || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80'}
                  alt={project.name}
                  className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <Badge variant={project.status === 'active' ? 'success' : 'warning'}>
                    {project.status}
                  </Badge>
                </div>
              </div>

              <CardHeader className="flex-1 pb-3">
                <CardTitle className="text-sm font-semibold line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                  {project.name}
                </CardTitle>
                <CardDescription className="text-xs pt-1 line-clamp-2 text-muted-foreground min-h-[2rem]">
                  {project.description || 'No description provided.'}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0 pb-4 flex items-center justify-between border-t border-border/40 mt-auto bg-secondary/20 px-6 py-3">
                <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Created: {formatDate(project.created_at)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground"
                    onClick={() => startEditProject(project)}
                    title="Rename / Edit Project"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </Button>

                  {project.status !== 'archived' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-secondary rounded-lg text-muted-foreground hover:text-amber-400"
                      onClick={() => handleArchiveProject(project.id)}
                      title="Archive Project"
                    >
                      <Archive className="h-3.5 w-3.5" />
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-destructive/15 rounded-lg text-muted-foreground hover:text-destructive"
                    onClick={() => setProjectToDelete(project)}
                    title="Delete Project"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px] border border-dashed border-border/80 rounded-xl bg-card/20">
          <Video className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-semibold text-muted-foreground/80 mb-1">No projects found</p>
          <p className="text-xs text-muted-foreground/60 max-w-xs mb-4">
            {searchTerm ? "Try searching for another keyword or clear the search field." : "Create your first project workspace folder to start organizing."}
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsCreateOpen(true)} size="sm" className="gap-1.5 font-semibold">
              <Plus className="h-4 w-4" />
              Create Project
            </Button>
          )}
        </div>
      )}

      {/* Create Project Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0C0C0D] border border-border rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border/60 p-4">
              <h3 className="font-semibold text-foreground text-sm">Create New Project</h3>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setIsCreateOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleCreateProject} className="p-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Viral Shorts Project"
                  className="w-full h-10 px-3 rounded-lg bg-secondary/30 border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary transition-all text-foreground placeholder:text-muted-foreground/50"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Description</label>
                <textarea
                  placeholder="Describe the purpose of this project workspace..."
                  rows={3}
                  className="w-full p-3 rounded-lg bg-secondary/30 border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary transition-all text-foreground placeholder:text-muted-foreground/50 resize-none"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Thumbnail URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full h-10 px-3 rounded-lg bg-secondary/30 border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary transition-all text-foreground placeholder:text-muted-foreground/50"
                  value={newProjectThumb}
                  onChange={(e) => setNewProjectThumb(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                <Button type="button" variant="ghost" className="h-9 text-xs" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={creating} className="h-9 text-xs gap-1.5">
                  {creating && <Loader2 className="h-3 w-3 animate-spin" />}
                  Create Project
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0C0C0D] border border-border rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border/60 p-4">
              <h3 className="font-semibold text-foreground text-sm">Edit Project Details</h3>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setEditingProject(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleRenameProject} className="p-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="Project Name"
                  className="w-full h-10 px-3 rounded-lg bg-secondary/30 border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary transition-all text-foreground placeholder:text-muted-foreground/50"
                  value={editProjectName}
                  onChange={(e) => setEditProjectName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Description</label>
                <textarea
                  placeholder="Describe the purpose of this project workspace..."
                  rows={3}
                  className="w-full p-3 rounded-lg bg-secondary/30 border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary transition-all text-foreground placeholder:text-muted-foreground/50 resize-none"
                  value={editProjectDesc}
                  onChange={(e) => setEditProjectDesc(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Thumbnail URL</label>
                <input
                  type="url"
                  placeholder="Thumbnail Image URL"
                  className="w-full h-10 px-3 rounded-lg bg-secondary/30 border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary transition-all text-foreground placeholder:text-muted-foreground/50"
                  value={editProjectThumb}
                  onChange={(e) => setEditProjectThumb(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                <Button type="button" variant="ghost" className="h-9 text-xs" onClick={() => setEditingProject(null)}>Cancel</Button>
                <Button type="submit" disabled={updating} className="h-9 text-xs gap-1.5">
                  {updating && <Loader2 className="h-3 w-3 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#0C0C0D] border border-border rounded-xl shadow-2xl overflow-hidden p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-destructive/15 text-destructive shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground text-sm">Delete Project</h3>
                <p className="text-xs text-muted-foreground leading-normal">
                  Are you sure you want to delete <strong className="text-foreground">"{projectToDelete.name}"</strong>? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
              <Button type="button" variant="ghost" className="h-9 text-xs" onClick={() => setProjectToDelete(null)}>Cancel</Button>
              <Button type="button" variant="destructive" className="h-9 text-xs" onClick={() => confirmDeleteProject(projectToDelete.id)}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
