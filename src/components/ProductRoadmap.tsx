import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
  FunnelSimple, 
  CalendarBlank, 
  Target,
  Rocket,
  Users,
  GitBranch,
  Flag,
  Pencil,
  Trash,
  ArrowsDownUp,
  Sparkle,
  Lightning,
  ChartLine,
  Stack
} from '@phosphor-icons/react'
import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import type { StatusType, PriorityType } from '@/types'

interface ProductFeature {
  id: string
  title: string
  description: string
  category: 'core' | 'enhancement' | 'integration' | 'infrastructure'
  status: StatusType
  priority: PriorityType
  owner: string
  release: string
  startDate: string
  endDate: string
  progress: number
  dependencies: string[]
  tags: string[]
  effort: number
  value: number
  notes?: string
}

const categoryConfig = {
  'core': { label: 'Core Features', icon: Rocket, color: 'bg-blue-500' },
  'enhancement': { label: 'Enhancements', icon: Sparkle, color: 'bg-purple-500' },
  'integration': { label: 'Integrations', icon: GitBranch, color: 'bg-green-500' },
  'infrastructure': { label: 'Infrastructure', icon: Stack, color: 'bg-orange-500' }
}

const statusConfig = {
  'not-started': { label: 'Not Started', color: 'secondary' },
  'on-track': { label: 'On Track', color: 'default' },
  'at-risk': { label: 'At Risk', color: 'destructive' },
  'blocked': { label: 'Blocked', color: 'destructive' },
  'completed': { label: 'Completed', color: 'outline' }
} as const

const priorityConfig = {
  'critical': { label: 'Critical', color: 'destructive', score: 4 },
  'high': { label: 'High', color: 'default', score: 3 },
  'medium': { label: 'Medium', color: 'secondary', score: 2 },
  'low': { label: 'Low', color: 'outline', score: 1 }
} as const

export default function ProductRoadmap() {
  const [features, setFeatures] = useKV<ProductFeature[]>('product-features', [])
  const [releases, setReleases] = useKV<string[]>('product-releases', ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'])
  const [selectedRelease, setSelectedRelease] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'kanban' | 'timeline' | 'list'>('kanban')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingFeature, setEditingFeature] = useState<ProductFeature | null>(null)
  const [isReleaseDialogOpen, setIsReleaseDialogOpen] = useState(false)
  const [newRelease, setNewRelease] = useState('')

  const releasesList = releases || ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025']

  const [formData, setFormData] = useState<Partial<ProductFeature>>({
    title: '',
    description: '',
    category: 'core',
    status: 'not-started',
    priority: 'medium',
    owner: '',
    release: releasesList[0],
    startDate: '',
    endDate: '',
    progress: 0,
    dependencies: [],
    tags: [],
    effort: 3,
    value: 3,
    notes: ''
  })

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'core',
      status: 'not-started',
      priority: 'medium',
      owner: '',
      release: releasesList[0],
      startDate: '',
      endDate: '',
      progress: 0,
      dependencies: [],
      tags: [],
      effort: 3,
      value: 3,
      notes: ''
    })
    setEditingFeature(null)
  }

  const handleAddFeature = () => {
    if (!formData.title?.trim() || !formData.description?.trim()) {
      toast.error('Please fill in title and description')
      return
    }

    const feature: ProductFeature = {
      id: `feat-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      category: formData.category || 'core',
      status: formData.status || 'not-started',
      priority: formData.priority || 'medium',
      owner: formData.owner || 'Unassigned',
      release: formData.release || releasesList[0],
      startDate: formData.startDate || '',
      endDate: formData.endDate || '',
      progress: formData.progress || 0,
      dependencies: formData.dependencies || [],
      tags: formData.tags || [],
      effort: formData.effort || 3,
      value: formData.value || 3,
      notes: formData.notes
    }

    setFeatures((current) => [...(current || []), feature])
    setIsAddDialogOpen(false)
    resetForm()
    toast.success('Feature added to roadmap!')
  }

  const handleUpdateFeature = () => {
    if (!editingFeature) return
    
    setFeatures((current) =>
      (current || []).map((f) =>
        f.id === editingFeature.id
          ? { ...editingFeature, ...formData }
          : f
      )
    )
    setIsAddDialogOpen(false)
    resetForm()
    toast.success('Feature updated!')
  }

  const handleDeleteFeature = (id: string) => {
    setFeatures((current) => (current || []).filter((f) => f.id !== id))
    toast.success('Feature deleted')
  }

  const handleEditFeature = (feature: ProductFeature) => {
    setEditingFeature(feature)
    setFormData(feature)
    setIsAddDialogOpen(true)
  }

  const handleAddRelease = () => {
    if (!newRelease.trim()) {
      toast.error('Please enter a release name')
      return
    }
    
    setReleases((current) => [...(current || []), newRelease])
    setIsReleaseDialogOpen(false)
    setNewRelease('')
    toast.success('Release added!')
  }

  const filteredFeatures = useMemo(() => {
    return (features || []).filter((f) => {
      if (selectedRelease !== 'all' && f.release !== selectedRelease) return false
      if (filterCategory !== 'all' && f.category !== filterCategory) return false
      if (filterStatus !== 'all' && f.status !== filterStatus) return false
      return true
    })
  }, [features, selectedRelease, filterCategory, filterStatus])

  const releaseGroups = useMemo(() => {
    const groups: Record<string, ProductFeature[]> = {}
    
    releasesList.forEach((release) => {
      groups[release] = filteredFeatures.filter((f) => f.release === release)
    })
    
    return groups
  }, [releasesList, filteredFeatures])

  const statusGroups = useMemo(() => {
    const groups: Record<StatusType, ProductFeature[]> = {
      'not-started': [],
      'on-track': [],
      'at-risk': [],
      'blocked': [],
      'completed': []
    }
    
    filteredFeatures.forEach((feature) => {
      groups[feature.status].push(feature)
    })
    
    return groups
  }, [filteredFeatures])

  const stats = useMemo(() => {
    const total = filteredFeatures.length
    const completed = filteredFeatures.filter((f) => f.status === 'completed').length
    const inProgress = filteredFeatures.filter((f) => ['on-track', 'at-risk', 'blocked'].includes(f.status)).length
    const avgProgress = total > 0 
      ? Math.round(filteredFeatures.reduce((sum, f) => sum + f.progress, 0) / total) 
      : 0
    
    return { total, completed, inProgress, avgProgress }
  }, [filteredFeatures])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Product Roadmap</h2>
          <p className="text-muted-foreground mt-2">
            Plan and track product development features across releases
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isReleaseDialogOpen} onOpenChange={setIsReleaseDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Flag size={16} weight="bold" />
                Add Release
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Release</DialogTitle>
                <DialogDescription>
                  Create a new release milestone for your roadmap
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="release-name">Release Name</Label>
                  <Input
                    id="release-name"
                    value={newRelease}
                    onChange={(e) => setNewRelease(e.target.value)}
                    placeholder="e.g., Q1 2025, v2.0, Sprint 10"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsReleaseDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddRelease}>Add Release</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={16} weight="bold" />
                Add Feature
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingFeature ? 'Edit Feature' : 'Add New Feature'}</DialogTitle>
                <DialogDescription>
                  {editingFeature ? 'Update feature details' : 'Add a new feature to your product roadmap'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Feature Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., User Authentication System"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the feature and its value..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger id="category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                    >
                      <SelectTrigger id="priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(priorityConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="release">Release</Label>
                    <Select
                      value={formData.release}
                      onValueChange={(value) => setFormData({ ...formData, release: value })}
                    >
                      <SelectTrigger id="release">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {releasesList.map((release) => (
                          <SelectItem key={release} value={release}>
                            {release}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="owner">Owner</Label>
                    <Input
                      id="owner"
                      value={formData.owner}
                      onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                      placeholder="Team or person name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="progress">Progress (%)</Label>
                    <Input
                      id="progress"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.progress}
                      onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="effort">Effort (1-5)</Label>
                    <Select
                      value={formData.effort?.toString()}
                      onValueChange={(value) => setFormData({ ...formData, effort: parseInt(value) })}
                    >
                      <SelectTrigger id="effort">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} - {num === 1 ? 'Very Low' : num === 2 ? 'Low' : num === 3 ? 'Medium' : num === 4 ? 'High' : 'Very High'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="value">Business Value (1-5)</Label>
                    <Select
                      value={formData.value?.toString()}
                      onValueChange={(value) => setFormData({ ...formData, value: parseInt(value) })}
                    >
                      <SelectTrigger id="value">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} - {num === 1 ? 'Very Low' : num === 2 ? 'Low' : num === 3 ? 'Medium' : num === 4 ? 'High' : 'Very High'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional context or requirements..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsAddDialogOpen(false)
                  resetForm()
                }}>
                  Cancel
                </Button>
                <Button onClick={editingFeature ? handleUpdateFeature : handleAddFeature}>
                  {editingFeature ? 'Update Feature' : 'Add Feature'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.avgProgress}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FunnelSimple size={20} weight="bold" className="text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          <Select value={selectedRelease} onValueChange={setSelectedRelease}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Release" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Releases</SelectItem>
              {releasesList.map((release) => (
                <SelectItem key={release} value={release}>
                  {release}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(categoryConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.entries(statusConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(selectedRelease !== 'all' || filterCategory !== 'all' || filterStatus !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedRelease('all')
                setFilterCategory('all')
                setFilterStatus('all')
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
        <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)} className="w-auto">
          <TabsList>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Tabs value={viewMode} className="w-full">
        <TabsContent value="kanban" className="mt-0">
          <div className="grid grid-cols-5 gap-4">
            {(Object.entries(statusGroups) as [StatusType, ProductFeature[]][]).map(([status, features]) => {
              const config = statusConfig[status]
              return (
                <div key={status} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm uppercase tracking-wide">{config.label}</h3>
                    <Badge variant="secondary" className="text-xs">{features.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {features.map((feature) => (
                      <FeatureCard
                        key={feature.id}
                        feature={feature}
                        onEdit={handleEditFeature}
                        onDelete={handleDeleteFeature}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="mt-0">
          <div className="space-y-6">
            {releasesList.map((release) => {
              const releaseFeatures = releaseGroups[release] || []
              if (releaseFeatures.length === 0) return null
              
              return (
                <div key={release} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Flag size={20} weight="fill" className="text-accent" />
                    <h3 className="text-xl font-bold">{release}</h3>
                    <Badge variant="secondary">{releaseFeatures.length} features</Badge>
                  </div>
                  <div className="grid gap-3">
                    {releaseFeatures.map((feature) => (
                      <Card key={feature.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">{feature.title}</h4>
                                <Badge variant={priorityConfig[feature.priority].color as any}>
                                  {priorityConfig[feature.priority].label}
                                </Badge>
                                <Badge variant={statusConfig[feature.status].color as any}>
                                  {statusConfig[feature.status].label}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{feature.description}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Users size={14} />
                                  <span>{feature.owner}</span>
                                </div>
                                {feature.startDate && (
                                  <div className="flex items-center gap-1">
                                    <CalendarBlank size={14} />
                                    <span>{new Date(feature.startDate).toLocaleDateString()} - {feature.endDate ? new Date(feature.endDate).toLocaleDateString() : 'TBD'}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <Target size={14} />
                                  <span>Effort: {feature.effort}/5</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <ChartLine size={14} />
                                  <span>Value: {feature.value}/5</span>
                                </div>
                              </div>
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="text-muted-foreground">Progress</span>
                                  <span className="font-semibold">{feature.progress}%</span>
                                </div>
                                <Progress value={feature.progress} className="h-2" />
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditFeature(feature)}
                              >
                                <Pencil size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteFeature(feature.id)}
                              >
                                <Trash size={16} />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>All Features</CardTitle>
              <CardDescription>Complete list of product roadmap features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredFeatures.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Rocket size={48} weight="thin" className="mx-auto mb-4 opacity-50" />
                    <p>No features found. Add your first feature to get started!</p>
                  </div>
                ) : (
                  filteredFeatures.map((feature) => (
                    <div key={feature.id} className="flex items-center gap-4 p-3 rounded-md hover:bg-muted/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{feature.title}</h4>
                          <Badge variant={statusConfig[feature.status].color as any} className="text-xs">
                            {statusConfig[feature.status].label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{feature.description}</p>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-shrink-0">
                        <Badge variant="outline">{feature.release}</Badge>
                        <Badge variant={priorityConfig[feature.priority].color as any}>
                          {priorityConfig[feature.priority].label}
                        </Badge>
                        <div className="w-24">
                          <Progress value={feature.progress} className="h-1.5" />
                        </div>
                        <span className="font-mono font-semibold w-12 text-right">{feature.progress}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditFeature(feature)}
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFeature(feature.id)}
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function FeatureCard({ 
  feature, 
  onEdit, 
  onDelete 
}: { 
  feature: ProductFeature
  onEdit: (feature: ProductFeature) => void
  onDelete: (id: string) => void
}) {
  const categoryConfig2 = categoryConfig[feature.category]
  const Icon = categoryConfig2.icon

  return (
    <Card className="hover:shadow-md transition-all group">
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className={`${categoryConfig2.color} p-1.5 rounded-md flex-shrink-0`}>
              <Icon size={14} weight="bold" className="text-white" />
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onEdit(feature)}
              >
                <Pencil size={12} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onDelete(feature.id)}
              >
                <Trash size={12} />
              </Button>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-1 line-clamp-2">{feature.title}</h4>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{feature.description}</p>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant={priorityConfig[feature.priority].color as any} className="text-xs">
              {priorityConfig[feature.priority].label}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users size={12} />
            <span className="line-clamp-1">{feature.owner}</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold">{feature.progress}%</span>
            </div>
            <Progress value={feature.progress} className="h-1.5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
