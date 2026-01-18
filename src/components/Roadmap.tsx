import { useKV } from '@github/spark/hooks'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Target, 
  ChartBar, 
  GridFour, 
  TrendUp, 
  Gauge, 
  ListChecks,
  CheckCircle,
  WarningCircle,
  XCircle,
  Circle,
  Plus,
  FolderOpen,
  Trash,
  PencilSimple,
  CalendarBlank,
  CurrencyDollar,
  Users,
  Lightning,
  ArrowsDownUp,
  Link as LinkIcon,
  WarningOctagon
} from '@phosphor-icons/react'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import type { RoadmapProject, RoadmapObjective, RoadmapMetric, BowlingChartData, StatusType, PriorityType, Countermeasure } from '@/types'

interface XMatrixItem {
  id: string
  type: 'objective' | 'strategy' | 'tactic' | 'metric'
  text: string
  relationships: string[]
}

function ProjectsView({ projects, setProjects }: { projects: RoadmapProject[], setProjects: (updater: (prev: RoadmapProject[]) => RoadmapProject[]) => void }) {
  const [isAddingProject, setIsAddingProject] = useState(false)
  const [editingProject, setEditingProject] = useState<RoadmapProject | null>(null)
  const [isAddingObjective, setIsAddingObjective] = useState(false)
  const [isAddingMetric, setIsAddingMetric] = useState(false)
  const [isAddingCountermeasure, setIsAddingCountermeasure] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [newProject, setNewProject] = useState<Partial<RoadmapProject>>({
    name: '',
    description: '',
    owner: '',
    status: 'not-started',
    priority: 'medium',
    startDate: '',
    endDate: '',
    progress: 0,
    objectives: [],
    metrics: [],
    budget: 0,
    actualSpend: 0,
    dependencies: [],
    countermeasures: []
  })
  const [newCountermeasure, setNewCountermeasure] = useState<Partial<Countermeasure>>({
    issue: '',
    action: '',
    owner: '',
    dueDate: '',
    status: 'open'
  })
  const [newObjective, setNewObjective] = useState<Partial<RoadmapObjective>>({
    category: 'annual',
    description: '',
    owner: '',
    targetDate: '',
    status: 'not-started',
    metrics: []
  })
  const [newMetric, setNewMetric] = useState<Partial<RoadmapMetric>>({
    name: '',
    baseline: 0,
    current: 0,
    target: 0,
    unit: '',
    frequency: 'monthly',
    trend: 'stable'
  })

  const handleAddProject = () => {
    if (!newProject.name || !newProject.owner || !newProject.startDate || !newProject.endDate) {
      toast.error('Please fill in all required fields')
      return
    }

    const project: RoadmapProject = {
      id: `proj-${Date.now()}`,
      name: newProject.name,
      description: newProject.description || '',
      owner: newProject.owner,
      status: newProject.status as StatusType,
      priority: newProject.priority as PriorityType,
      startDate: newProject.startDate,
      endDate: newProject.endDate,
      progress: 0,
      objectives: [],
      metrics: [],
      budget: newProject.budget || 0,
      actualSpend: 0,
      dependencies: [],
      countermeasures: []
    }

    setProjects((prev) => [...prev, project])
    setIsAddingProject(false)
    setNewProject({
      name: '',
      description: '',
      owner: '',
      status: 'not-started',
      priority: 'medium',
      startDate: '',
      endDate: '',
      progress: 0,
      objectives: [],
      metrics: [],
      budget: 0,
      actualSpend: 0,
      dependencies: [],
      countermeasures: []
    })
    toast.success('Project created successfully')
  }

  const handleDeleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter(p => p.id !== projectId))
    toast.success('Project deleted')
  }

  const handleAddObjective = () => {
    if (!newObjective.description || !newObjective.owner || !newObjective.targetDate) {
      toast.error('Please fill in all required fields')
      return
    }

    const objective: RoadmapObjective = {
      id: `obj-${Date.now()}`,
      projectId: selectedProjectId,
      category: newObjective.category as 'breakthrough' | 'annual' | 'improvement',
      description: newObjective.description,
      owner: newObjective.owner,
      targetDate: newObjective.targetDate,
      status: newObjective.status as StatusType,
      metrics: []
    }

    setProjects((prev) => prev.map(p => 
      p.id === selectedProjectId 
        ? { ...p, objectives: [...p.objectives, objective] }
        : p
    ))
    
    setIsAddingObjective(false)
    setNewObjective({
      category: 'annual',
      description: '',
      owner: '',
      targetDate: '',
      status: 'not-started',
      metrics: []
    })
    toast.success('Objective added to project')
  }

  const handleAddMetric = () => {
    if (!newMetric.name || !newMetric.unit) {
      toast.error('Please fill in all required fields')
      return
    }

    const metric: RoadmapMetric = {
      id: `metric-${Date.now()}`,
      name: newMetric.name || '',
      baseline: newMetric.baseline || 0,
      current: newMetric.current || 0,
      target: newMetric.target || 0,
      unit: newMetric.unit || '',
      frequency: newMetric.frequency as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual',
      lastUpdated: new Date().toISOString(),
      trend: newMetric.trend as 'improving' | 'stable' | 'declining'
    }

    setProjects((prev) => prev.map(p => 
      p.id === selectedProjectId 
        ? { ...p, metrics: [...p.metrics, metric] }
        : p
    ))
    
    setIsAddingMetric(false)
    setNewMetric({
      name: '',
      baseline: 0,
      current: 0,
      target: 0,
      unit: '',
      frequency: 'monthly',
      trend: 'stable'
    })
    toast.success('Metric added to project')
  }

  const handleAddCountermeasure = () => {
    if (!newCountermeasure.issue || !newCountermeasure.action || !newCountermeasure.owner || !newCountermeasure.dueDate) {
      toast.error('Please fill in all required fields')
      return
    }

    const countermeasure: Countermeasure = {
      id: `cm-${Date.now()}`,
      issue: newCountermeasure.issue,
      action: newCountermeasure.action,
      owner: newCountermeasure.owner,
      dueDate: newCountermeasure.dueDate,
      status: newCountermeasure.status as 'open' | 'in-progress' | 'completed',
      createdAt: new Date().toISOString()
    }

    setProjects((prev) => prev.map(p => 
      p.id === selectedProjectId 
        ? { ...p, countermeasures: [...(p.countermeasures || []), countermeasure] }
        : p
    ))
    
    setIsAddingCountermeasure(false)
    setNewCountermeasure({
      issue: '',
      action: '',
      owner: '',
      dueDate: '',
      status: 'open'
    })
    toast.success('Countermeasure added to project')
  }

  const handleUpdateProjectProgress = (projectId: string) => {
    setProjects((prev) => prev.map(p => {
      if (p.id !== projectId) return p
      
      const totalMetrics = p.metrics.length
      if (totalMetrics === 0) return p

      const totalProgress = p.metrics.reduce((sum, metric) => {
        const progress = ((metric.current - metric.baseline) / (metric.target - metric.baseline)) * 100
        return sum + Math.max(0, Math.min(100, progress))
      }, 0)

      return { ...p, progress: Math.round(totalProgress / totalMetrics) }
    }))
  }

  const statusColors = {
    'not-started': 'bg-muted text-muted-foreground',
    'on-track': 'bg-success/10 text-success border-success/30',
    'at-risk': 'bg-warning/10 text-warning border-warning/30',
    'blocked': 'bg-destructive/10 text-destructive border-destructive/30',
    'completed': 'bg-primary/10 text-primary border-primary/30'
  }

  const priorityColors = {
    'critical': 'bg-destructive/10 text-destructive border-destructive/30',
    'high': 'bg-warning/10 text-warning border-warning/30',
    'medium': 'bg-primary/10 text-primary border-primary/30',
    'low': 'bg-muted text-muted-foreground border-muted'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Strategic Projects</h3>
          <p className="text-sm text-muted-foreground">Manage projects with objectives and metrics</p>
        </div>
        <Dialog open={isAddingProject} onOpenChange={setIsAddingProject}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={20} weight="bold" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>Add a strategic project to track on the roadmap</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="Enter project name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Enter project description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="owner">Owner *</Label>
                  <Input
                    id="owner"
                    value={newProject.owner}
                    onChange={(e) => setNewProject({ ...newProject, owner: e.target.value })}
                    placeholder="Project owner"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={newProject.priority} 
                    onValueChange={(value) => setNewProject({ ...newProject, priority: value as PriorityType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newProject.startDate}
                    onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newProject.endDate}
                    onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={newProject.status} 
                  onValueChange={(value) => setNewProject({ ...newProject, status: value as StatusType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-started">Not Started</SelectItem>
                    <SelectItem value="on-track">On Track</SelectItem>
                    <SelectItem value="at-risk">At Risk</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="budget">Budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={newProject.budget}
                  onChange={(e) => setNewProject({ ...newProject, budget: parseFloat(e.target.value) })}
                  placeholder="0"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingProject(false)}>Cancel</Button>
              <Button onClick={handleAddProject}>Create Project</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen size={48} className="text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">No projects yet. Create your first strategic project to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className={`${statusColors[project.status]} capitalize font-semibold`}>
                        {project.status.replace('-', ' ')}
                      </Badge>
                      <Badge variant="outline" className={`${priorityColors[project.priority]} capitalize font-semibold`}>
                        {project.priority}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    {project.description && (
                      <CardDescription className="mt-2">{project.description}</CardDescription>
                    )}
                    <CardDescription className="mt-2">
                      <div className="flex items-center gap-4 text-sm">
                        <span><strong>Owner:</strong> {project.owner}</span>
                        <span><strong>Timeline:</strong> {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}</span>
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteProject(project.id)}>
                      <Trash size={16} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">Overall Progress</span>
                      <span className="text-sm font-mono">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                  
                  {project.budget && project.budget > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold flex items-center gap-2">
                          <CurrencyDollar size={16} weight="bold" className="text-accent" />
                          Budget Utilization
                        </span>
                        <span className="text-sm font-mono">
                          ${(project.actualSpend || 0).toLocaleString()} / ${project.budget.toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={((project.actualSpend || 0) / project.budget) * 100} 
                        className="h-2" 
                      />
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Objectives</span>
                        <span className="text-sm font-semibold">{project.objectives.length}</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full gap-2"
                        onClick={() => {
                          setSelectedProjectId(project.id)
                          setIsAddingObjective(true)
                        }}
                      >
                        <Plus size={16} weight="bold" />
                        Add Objective
                      </Button>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Metrics</span>
                        <span className="text-sm font-semibold">{project.metrics.length}</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full gap-2"
                        onClick={() => {
                          setSelectedProjectId(project.id)
                          setIsAddingMetric(true)
                        }}
                      >
                        <Plus size={16} weight="bold" />
                        Add Metric
                      </Button>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Countermeasures</span>
                        <span className="text-sm font-semibold">{project.countermeasures?.length || 0}</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full gap-2"
                        onClick={() => {
                          setSelectedProjectId(project.id)
                          setIsAddingCountermeasure(true)
                        }}
                      >
                        <Plus size={16} weight="bold" />
                        Add Action
                      </Button>
                    </div>
                  </div>

                  {project.objectives.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <h5 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Project Objectives</h5>
                        {project.objectives.map((obj) => (
                          <div key={obj.id} className="p-3 border border-border rounded-lg bg-muted/20">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="text-sm font-medium flex-1">{obj.description}</p>
                              <Badge variant="outline" className="shrink-0 text-xs capitalize">
                                {obj.category}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Owner: {obj.owner} • Target: {new Date(obj.targetDate).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {project.metrics.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <h5 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Project Metrics</h5>
                        {project.metrics.map((metric) => {
                          const progressPercent = ((metric.current - metric.baseline) / (metric.target - metric.baseline)) * 100
                          return (
                            <div key={metric.id} className="p-3 border border-border rounded-lg bg-muted/20">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold">{metric.name}</span>
                                <Badge variant="outline" className="font-mono text-xs">
                                  {metric.current}{metric.unit} / {metric.target}{metric.unit}
                                </Badge>
                              </div>
                              <Progress value={Math.max(0, Math.min(100, progressPercent))} className="h-1.5" />
                            </div>
                          )
                        })}
                      </div>
                    </>
                  )}

                  {project.countermeasures && project.countermeasures.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <h5 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                          <Lightning size={16} weight="bold" className="text-warning" />
                          Active Countermeasures
                        </h5>
                        {project.countermeasures.map((cm) => (
                          <div key={cm.id} className="p-3 border border-warning/30 rounded-lg bg-warning/5">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground mb-1">{cm.issue}</p>
                                <p className="text-xs text-muted-foreground mb-2">Action: {cm.action}</p>
                              </div>
                              <Badge variant="outline" className={`shrink-0 text-xs capitalize ${
                                cm.status === 'completed' ? 'bg-success/10 text-success border-success/30' :
                                cm.status === 'in-progress' ? 'bg-primary/10 text-primary border-primary/30' :
                                'bg-muted text-muted-foreground'
                              }`}>
                                {cm.status.replace('-', ' ')}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Owner: {cm.owner} • Due: {new Date(cm.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isAddingObjective} onOpenChange={setIsAddingObjective}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Objective to Project</DialogTitle>
            <DialogDescription>Create a strategic objective with measurable outcomes</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="obj-description">Objective Description *</Label>
              <Textarea
                id="obj-description"
                value={newObjective.description}
                onChange={(e) => setNewObjective({ ...newObjective, description: e.target.value })}
                placeholder="e.g., Achieve 25% revenue growth in Q2"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="obj-category">Category</Label>
                <Select 
                  value={newObjective.category} 
                  onValueChange={(value) => setNewObjective({ ...newObjective, category: value as 'breakthrough' | 'annual' | 'improvement' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakthrough">Breakthrough Goal</SelectItem>
                    <SelectItem value="annual">Annual Goal</SelectItem>
                    <SelectItem value="improvement">Improvement Goal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="obj-owner">Owner *</Label>
                <Input
                  id="obj-owner"
                  value={newObjective.owner}
                  onChange={(e) => setNewObjective({ ...newObjective, owner: e.target.value })}
                  placeholder="Objective owner"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="obj-targetDate">Target Date *</Label>
                <Input
                  id="obj-targetDate"
                  type="date"
                  value={newObjective.targetDate}
                  onChange={(e) => setNewObjective({ ...newObjective, targetDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="obj-status">Status</Label>
                <Select 
                  value={newObjective.status} 
                  onValueChange={(value) => setNewObjective({ ...newObjective, status: value as StatusType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-started">Not Started</SelectItem>
                    <SelectItem value="on-track">On Track</SelectItem>
                    <SelectItem value="at-risk">At Risk</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingObjective(false)}>Cancel</Button>
            <Button onClick={handleAddObjective}>Add Objective</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddingMetric} onOpenChange={setIsAddingMetric}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Metric to Project</DialogTitle>
            <DialogDescription>Define a measurable KPI to track progress</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="metric-name">Metric Name *</Label>
              <Input
                id="metric-name"
                value={newMetric.name}
                onChange={(e) => setNewMetric({ ...newMetric, name: e.target.value })}
                placeholder="e.g., Monthly Recurring Revenue"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="metric-baseline">Baseline</Label>
                <Input
                  id="metric-baseline"
                  type="number"
                  value={newMetric.baseline}
                  onChange={(e) => setNewMetric({ ...newMetric, baseline: parseFloat(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="metric-current">Current Value</Label>
                <Input
                  id="metric-current"
                  type="number"
                  value={newMetric.current}
                  onChange={(e) => setNewMetric({ ...newMetric, current: parseFloat(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="metric-target">Target</Label>
                <Input
                  id="metric-target"
                  type="number"
                  value={newMetric.target}
                  onChange={(e) => setNewMetric({ ...newMetric, target: parseFloat(e.target.value) })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="metric-unit">Unit *</Label>
                <Input
                  id="metric-unit"
                  value={newMetric.unit}
                  onChange={(e) => setNewMetric({ ...newMetric, unit: e.target.value })}
                  placeholder="e.g., $, %, pts"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="metric-frequency">Frequency</Label>
                <Select 
                  value={newMetric.frequency} 
                  onValueChange={(value) => setNewMetric({ ...newMetric, frequency: value as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="metric-trend">Trend</Label>
                <Select 
                  value={newMetric.trend} 
                  onValueChange={(value) => setNewMetric({ ...newMetric, trend: value as 'improving' | 'stable' | 'declining' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="improving">Improving</SelectItem>
                    <SelectItem value="stable">Stable</SelectItem>
                    <SelectItem value="declining">Declining</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingMetric(false)}>Cancel</Button>
            <Button onClick={handleAddMetric}>Add Metric</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddingCountermeasure} onOpenChange={setIsAddingCountermeasure}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Countermeasure</DialogTitle>
            <DialogDescription>Define an action to address an issue or risk (Hoshin Kanri PDCA)</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cm-issue">Issue / Problem Statement *</Label>
              <Textarea
                id="cm-issue"
                value={newCountermeasure.issue}
                onChange={(e) => setNewCountermeasure({ ...newCountermeasure, issue: e.target.value })}
                placeholder="Describe the problem or risk requiring countermeasures"
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cm-action">Countermeasure Action *</Label>
              <Textarea
                id="cm-action"
                value={newCountermeasure.action}
                onChange={(e) => setNewCountermeasure({ ...newCountermeasure, action: e.target.value })}
                placeholder="Describe the specific action to resolve the issue"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cm-owner">Owner *</Label>
                <Input
                  id="cm-owner"
                  value={newCountermeasure.owner}
                  onChange={(e) => setNewCountermeasure({ ...newCountermeasure, owner: e.target.value })}
                  placeholder="Action owner"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cm-dueDate">Due Date *</Label>
                <Input
                  id="cm-dueDate"
                  type="date"
                  value={newCountermeasure.dueDate}
                  onChange={(e) => setNewCountermeasure({ ...newCountermeasure, dueDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cm-status">Status</Label>
                <Select 
                  value={newCountermeasure.status} 
                  onValueChange={(value) => setNewCountermeasure({ ...newCountermeasure, status: value as 'open' | 'in-progress' | 'completed' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingCountermeasure(false)}>Cancel</Button>
            <Button onClick={handleAddCountermeasure}>Add Countermeasure</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ObjectivesView({ projects, setProjects }: { projects: RoadmapProject[], setProjects: (updater: (prev: RoadmapProject[]) => RoadmapProject[]) => void }) {
  const [isAddingMetricToObjective, setIsAddingMetricToObjective] = useState(false)
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string>('')
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [newMetric, setNewMetric] = useState<Partial<RoadmapMetric>>({
    name: '',
    baseline: 0,
    current: 0,
    target: 0,
    unit: '',
    frequency: 'monthly',
    trend: 'stable'
  })

  const allObjectivesWithProject = projects.flatMap(p => 
    p.objectives.map(obj => ({ ...obj, projectName: p.name, projectId: p.id }))
  )

  const handleAddMetricToObjective = () => {
    if (!newMetric.name || !newMetric.unit) {
      toast.error('Please fill in all required fields')
      return
    }

    const metric: RoadmapMetric = {
      id: `metric-${Date.now()}`,
      name: newMetric.name || '',
      baseline: newMetric.baseline || 0,
      current: newMetric.current || 0,
      target: newMetric.target || 0,
      unit: newMetric.unit || '',
      frequency: newMetric.frequency as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual',
      lastUpdated: new Date().toISOString(),
      trend: newMetric.trend as 'improving' | 'stable' | 'declining'
    }

    setProjects((prev) => prev.map(p => {
      if (p.id !== selectedProjectId) return p
      return {
        ...p,
        objectives: p.objectives.map(obj =>
          obj.id === selectedObjectiveId
            ? { ...obj, metrics: [...obj.metrics, metric] }
            : obj
        )
      }
    }))
    
    setIsAddingMetricToObjective(false)
    setNewMetric({
      name: '',
      baseline: 0,
      current: 0,
      target: 0,
      unit: '',
      frequency: 'monthly',
      trend: 'stable'
    })
    toast.success('Metric added to objective')
  }

  const categoryColors = {
    breakthrough: 'bg-accent/10 text-accent border-accent/30',
    annual: 'bg-primary/10 text-primary border-primary/30',
    improvement: 'bg-success/10 text-success border-success/30'
  }

  const statusIcons = {
    'on-track': <CheckCircle size={20} weight="fill" className="text-success" />,
    'at-risk': <WarningCircle size={20} weight="fill" className="text-warning" />,
    'blocked': <XCircle size={20} weight="fill" className="text-destructive" />,
    'completed': <CheckCircle size={20} weight="fill" className="text-success" />,
    'not-started': <Circle size={20} className="text-muted-foreground" />
  }

  if (allObjectivesWithProject.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Target size={48} className="text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">No objectives yet. Add projects with objectives to track them here.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {allObjectivesWithProject.map((objective) => (
        <Card key={objective.id}>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="outline" className={`${categoryColors[objective.category]} capitalize font-semibold`}>
                    {objective.category} Goal
                  </Badge>
                  {statusIcons[objective.status]}
                </div>
                <CardTitle className="text-lg">{objective.description}</CardTitle>
                <CardDescription className="mt-2">
                  <div className="flex items-center gap-4 text-sm">
                    <span><strong>Owner:</strong> {objective.owner}</span>
                    <span><strong>Target:</strong> {new Date(objective.targetDate).toLocaleDateString()}</span>
                  </div>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Key Metrics</h4>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => {
                    setSelectedObjectiveId(objective.id)
                    setSelectedProjectId(objective.projectId)
                    setIsAddingMetricToObjective(true)
                  }}
                >
                  <Plus size={16} weight="bold" />
                  Add Metric
                </Button>
              </div>
              {objective.metrics.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No metrics yet</p>
              ) : (
                objective.metrics.map((metric) => {
                  const progressPercent = ((metric.current - metric.baseline) / (metric.target - metric.baseline)) * 100
                  const isOnTrack = progressPercent >= 70
                  
                  return (
                    <div key={metric.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">{metric.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">
                            {metric.current}{metric.unit} / {metric.target}{metric.unit}
                          </span>
                          <Badge variant={isOnTrack ? "default" : "secondary"} className="font-mono text-xs">
                            {Math.round(progressPercent)}%
                          </Badge>
                        </div>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Baseline: {metric.baseline}{metric.unit}</span>
                        <span>Updated: {new Date(metric.lastUpdated).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    <Dialog open={isAddingMetricToObjective} onOpenChange={setIsAddingMetricToObjective}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Metric to Objective</DialogTitle>
          <DialogDescription>Define a measurable KPI to track objective progress</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="obj-metric-name">Metric Name *</Label>
            <Input
              id="obj-metric-name"
              value={newMetric.name}
              onChange={(e) => setNewMetric({ ...newMetric, name: e.target.value })}
              placeholder="e.g., Monthly Recurring Revenue"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="obj-metric-baseline">Baseline</Label>
              <Input
                id="obj-metric-baseline"
                type="number"
                value={newMetric.baseline}
                onChange={(e) => setNewMetric({ ...newMetric, baseline: parseFloat(e.target.value) })}
                placeholder="0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="obj-metric-current">Current Value</Label>
              <Input
                id="obj-metric-current"
                type="number"
                value={newMetric.current}
                onChange={(e) => setNewMetric({ ...newMetric, current: parseFloat(e.target.value) })}
                placeholder="0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="obj-metric-target">Target</Label>
              <Input
                id="obj-metric-target"
                type="number"
                value={newMetric.target}
                onChange={(e) => setNewMetric({ ...newMetric, target: parseFloat(e.target.value) })}
                placeholder="0"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="obj-metric-unit">Unit *</Label>
              <Input
                id="obj-metric-unit"
                value={newMetric.unit}
                onChange={(e) => setNewMetric({ ...newMetric, unit: e.target.value })}
                placeholder="e.g., $, %, pts"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="obj-metric-frequency">Frequency</Label>
              <Select 
                value={newMetric.frequency} 
                onValueChange={(value) => setNewMetric({ ...newMetric, frequency: value as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="obj-metric-trend">Trend</Label>
              <Select 
                value={newMetric.trend} 
                onValueChange={(value) => setNewMetric({ ...newMetric, trend: value as 'improving' | 'stable' | 'declining' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="improving">Improving</SelectItem>
                  <SelectItem value="stable">Stable</SelectItem>
                  <SelectItem value="declining">Declining</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsAddingMetricToObjective(false)}>Cancel</Button>
          <Button onClick={handleAddMetricToObjective}>Add Metric</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>
  )
}

function MetricsView({ projects, setProjects }: { projects: RoadmapProject[], setProjects: (updater: (prev: RoadmapProject[]) => RoadmapProject[]) => void }) {
  const [editingMetric, setEditingMetric] = useState<RoadmapMetric & { projectId: string } | null>(null)
  const [isUpdatingMetric, setIsUpdatingMetric] = useState(false)
  const [newValue, setNewValue] = useState<number>(0)

  const allMetrics = projects.flatMap(project => 
    project.metrics.map(m => ({ ...m, projectName: project.name, projectId: project.id }))
  )

  const handleUpdateMetric = () => {
    if (!editingMetric) return

    setProjects((prev) => prev.map(p => {
      if (p.id !== editingMetric.projectId) return p
      return {
        ...p,
        metrics: p.metrics.map(m =>
          m.id === editingMetric.id
            ? { ...m, current: newValue, lastUpdated: new Date().toISOString() }
            : m
        )
      }
    }))

    setIsUpdatingMetric(false)
    setEditingMetric(null)
    toast.success('Metric updated successfully')
  }

  const trendIcons = {
    improving: <TrendUp size={16} className="text-success" weight="bold" />,
    stable: <span className="text-warning text-xs">→</span>,
    declining: <TrendUp size={16} className="text-destructive rotate-180" weight="bold" />
  }

  if (allMetrics.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ChartBar size={48} className="text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">No metrics yet. Add projects with metrics to track them here.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Metrics Dashboard</CardTitle>
            <CardDescription>Track all key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allMetrics.map((metric) => {
                const progressPercent = ((metric.current - metric.baseline) / (metric.target - metric.baseline)) * 100
                const variance = metric.current - metric.target
                const variancePercent = (variance / metric.target) * 100
                
                return (
                  <div key={metric.id} className="p-4 border border-border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{metric.name}</h4>
                          {trendIcons[metric.trend]}
                        </div>
                        <p className="text-xs text-muted-foreground">{metric.projectName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono shrink-0">
                          {metric.frequency}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setEditingMetric(metric)
                            setNewValue(metric.current)
                            setIsUpdatingMetric(true)
                          }}
                        >
                          <PencilSimple size={16} />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground text-xs mb-1">Baseline</div>
                        <div className="font-semibold font-mono">{metric.baseline}{metric.unit}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs mb-1">Current</div>
                        <div className="font-semibold font-mono text-accent">{metric.current}{metric.unit}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs mb-1">Target</div>
                        <div className="font-semibold font-mono">{metric.target}{metric.unit}</div>
                      </div>
                    </div>
                    
                    <Progress value={Math.min(progressPercent, 100)} className="h-2" />
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className={variance >= 0 ? 'text-success' : 'text-destructive'}>
                        Variance: {variance > 0 ? '+' : ''}{variance.toFixed(1)}{metric.unit} ({variancePercent > 0 ? '+' : ''}{variancePercent.toFixed(1)}%)
                      </span>
                      <span className="text-muted-foreground">Last updated: {new Date(metric.lastUpdated).toLocaleDateString()}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isUpdatingMetric} onOpenChange={setIsUpdatingMetric}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Metric Value</DialogTitle>
            <DialogDescription>Enter the new current value for {editingMetric?.name}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-value">Current Value</Label>
              <Input
                id="new-value"
                type="number"
                value={newValue}
                onChange={(e) => setNewValue(parseFloat(e.target.value))}
                placeholder="Enter new value"
              />
            </div>
            {editingMetric && (
              <div className="grid grid-cols-3 gap-4 text-sm p-3 bg-muted/30 rounded">
                <div>
                  <div className="text-muted-foreground text-xs mb-1">Baseline</div>
                  <div className="font-semibold font-mono">{editingMetric.baseline}{editingMetric.unit}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-1">New Value</div>
                  <div className="font-semibold font-mono text-accent">{newValue}{editingMetric.unit}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-1">Target</div>
                  <div className="font-semibold font-mono">{editingMetric.target}{editingMetric.unit}</div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdatingMetric(false)}>Cancel</Button>
            <Button onClick={handleUpdateMetric}>Update Value</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function BowlingChartView({ projects }: { projects: RoadmapProject[] }) {
  const statusColors = {
    green: 'bg-success',
    yellow: 'bg-warning',
    red: 'bg-destructive',
    'not-started': 'bg-muted'
  }

  const statusLabels = {
    green: 'On Track',
    yellow: 'At Risk',
    red: 'Off Track',
    'not-started': 'Not Started'
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  const bowlingData: BowlingChartData[] = projects.flatMap(project => 
    project.objectives.map(obj => {
      const monthlyData = months.map((month, idx) => {
        const avgProgress = obj.metrics.length > 0 
          ? obj.metrics.reduce((sum, m) => {
              const progress = ((m.current - m.baseline) / (m.target - m.baseline)) * 100
              return sum + progress
            }, 0) / obj.metrics.length
          : 0

        const currentMonth = new Date().getMonth()
        const isNotStarted = idx > currentMonth
        const targetProgress = ((idx + 1) / 12) * 100
        
        let status: 'green' | 'yellow' | 'red' | 'not-started' = 'not-started'
        if (!isNotStarted) {
          const diff = avgProgress - targetProgress
          if (diff >= -5) status = 'green'
          else if (diff >= -15) status = 'yellow'
          else status = 'red'
        }

        return {
          month,
          status,
          actual: isNotStarted ? 0 : Math.round(avgProgress),
          target: Math.round(targetProgress)
        }
      })

      return {
        objective: obj.description,
        months: monthlyData
      }
    })
  )

  if (bowlingData.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ListChecks size={48} className="text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">No objectives to track. Add projects with objectives to see the bowling chart.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bowling Chart - Monthly Tracking</CardTitle>
          <CardDescription>Visual month-by-month progress tracking for strategic objectives</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {bowlingData.map((item, idx) => (
              <div key={idx} className="space-y-3">
                {idx > 0 && <Separator />}
                <h4 className="font-semibold">{item.objective}</h4>
                <div className="grid grid-cols-12 gap-2">
                  {item.months.map((month, monthIdx) => (
                    <div key={monthIdx} className="flex flex-col items-center gap-1">
                      <div 
                        className={`w-full aspect-square rounded-md ${statusColors[month.status]} flex items-center justify-center text-xs font-bold ${month.status === 'not-started' ? 'text-muted-foreground' : 'text-white'}`}
                        title={month.status !== 'not-started' ? `Actual: ${month.actual}%, Target: ${month.target}%` : 'Not Started'}
                      >
                        {month.status !== 'not-started' && month.actual}
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">{month.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <Separator className="my-6" />
          
          <div className="flex items-center justify-center gap-6">
            {Object.entries(statusLabels).map(([status, label]) => (
              <div key={status} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${statusColors[status as keyof typeof statusColors]}`} />
                <span className="text-sm text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function XMatrixView({ projects }: { projects: RoadmapProject[] }) {
  const allObjectives = projects.flatMap(p => p.objectives)
  const annualObjectives = allObjectives.filter(o => o.category === 'annual')
  const breakthroughObjectives = allObjectives.filter(o => o.category === 'breakthrough')
  const improvementObjectives = allObjectives.filter(o => o.category === 'improvement')
  
  const allMetrics = projects.flatMap(p => p.metrics)
  const topMetrics = allMetrics.slice(0, 4)

  const hasData = projects.length > 0 && (annualObjectives.length > 0 || breakthroughObjectives.length > 0)

  if (!hasData) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <GridFour size={48} className="text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">No data for X-Matrix. Add projects with objectives to see strategic alignment.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>X-Matrix (Hoshin Kanri)</CardTitle>
          <CardDescription>Strategic alignment matrix connecting objectives, strategies, tactics, and metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-accent uppercase tracking-wider">Annual Objectives</h4>
                <div className="space-y-2">
                  {annualObjectives.length > 0 ? (
                    annualObjectives.slice(0, 4).map((obj) => (
                      <div key={obj.id} className="p-3 border-l-4 border-accent bg-accent/5 rounded text-sm">
                        {obj.description}
                      </div>
                    ))
                  ) : (
                    breakthroughObjectives.slice(0, 4).map((obj) => (
                      <div key={obj.id} className="p-3 border-l-4 border-accent bg-accent/5 rounded text-sm">
                        {obj.description}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">Strategic Projects</h4>
                <div className="space-y-2">
                  {projects.slice(0, 4).map((project) => (
                    <div key={project.id} className="p-3 border-l-4 border-primary bg-primary/5 rounded text-sm">
                      {project.name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-success uppercase tracking-wider">Key Metrics (KPIs)</h4>
                <div className="space-y-2">
                  {topMetrics.length > 0 ? (
                    topMetrics.map((metric) => (
                      <div key={metric.id} className="p-3 border-l-4 border-success bg-success/5 rounded text-sm">
                        {metric.name}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 border-l-4 border-muted bg-muted/5 rounded text-sm text-muted-foreground">
                      No metrics defined yet
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="bg-muted/30 p-6 rounded-lg">
              <h4 className="font-semibold text-sm text-secondary uppercase tracking-wider mb-4">Improvement Tactics</h4>
              <div className="grid grid-cols-2 gap-3">
                {improvementObjectives.length > 0 ? (
                  improvementObjectives.map((obj) => (
                    <div key={obj.id} className="p-3 border-l-4 border-secondary bg-card rounded text-sm">
                      {obj.description}
                    </div>
                  ))
                ) : (
                  <>
                    <div className="p-3 border-l-4 border-muted bg-card rounded text-sm text-muted-foreground">
                      Add improvement objectives to projects
                    </div>
                    <div className="p-3 border-l-4 border-muted bg-card rounded text-sm text-muted-foreground">
                      Tactics will appear here
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-6 p-4 bg-accent/5 border border-accent/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> The X-Matrix creates strategic alignment by connecting Annual Objectives → Strategic Projects → Improvement Tactics → Key Metrics. 
                Each connection represents a cause-and-effect relationship ensuring all activities drive toward strategic goals.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function TimelineView({ projects }: { projects: RoadmapProject[] }) {
  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CalendarBlank size={48} className="text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">No projects to display. Add projects to see the timeline.</p>
        </CardContent>
      </Card>
    )
  }

  const allDates = projects.flatMap(p => [new Date(p.startDate), new Date(p.endDate)])
  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())))
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())))
  
  const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))
  const monthsInRange = Math.ceil(totalDays / 30)
  
  const getProjectPosition = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const startOffset = Math.ceil((start.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    
    return {
      left: `${(startOffset / totalDays) * 100}%`,
      width: `${(duration / totalDays) * 100}%`
    }
  }

  const statusColorsBg = {
    'not-started': 'bg-muted',
    'on-track': 'bg-success',
    'at-risk': 'bg-warning',
    'blocked': 'bg-destructive',
    'completed': 'bg-primary'
  }

  const priorityBorders = {
    'critical': 'border-destructive',
    'high': 'border-warning',
    'medium': 'border-primary',
    'low': 'border-muted-foreground'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Timeline</CardTitle>
          <CardDescription>Gantt-style view of all strategic projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between text-sm text-muted-foreground border-b border-border pb-2">
              <span className="font-semibold">
                Timeline: {minDate.toLocaleDateString()} - {maxDate.toLocaleDateString()}
              </span>
              <span className="font-mono">
                {monthsInRange} months
              </span>
            </div>

            <div className="space-y-4">
              {projects.map((project) => {
                const position = getProjectPosition(project.startDate, project.endDate)
                return (
                  <div key={project.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-sm">{project.name}</h4>
                        <Badge variant="outline" className={`${statusColorsBg[project.status]} text-white border-0 capitalize text-xs`}>
                          {project.status.replace('-', ' ')}
                        </Badge>
                        <Badge variant="outline" className={`${priorityBorders[project.priority]} capitalize text-xs`}>
                          {project.priority}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(project.startDate).toLocaleDateString()} → {new Date(project.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="relative h-10 bg-muted/30 rounded-lg overflow-hidden">
                      <div 
                        className={`absolute h-full ${statusColorsBg[project.status]} rounded-lg flex items-center px-3 text-white text-xs font-semibold shadow-md border-l-4 ${priorityBorders[project.priority]}`}
                        style={position}
                      >
                        <span className="truncate">{project.progress}%</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Status Legend</h5>
                <div className="space-y-2">
                  {Object.entries(statusColorsBg).map(([status, color]) => (
                    <div key={status} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded ${color}`} />
                      <span className="text-sm capitalize">{status.replace('-', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Priority Legend</h5>
                <div className="space-y-2">
                  {Object.entries(priorityBorders).map(([priority, border]) => (
                    <div key={priority} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border-2 ${border}`} />
                      <span className="text-sm capitalize">{priority}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CountermeasuresView({ projects, setProjects }: { projects: RoadmapProject[], setProjects: (updater: (prev: RoadmapProject[]) => RoadmapProject[]) => void }) {
  const allCountermeasures = projects.flatMap(project =>
    (project.countermeasures || []).map(cm => ({ ...cm, projectName: project.name, projectId: project.id }))
  )

  const handleUpdateStatus = (projectId: string, countermeasureId: string, newStatus: 'open' | 'in-progress' | 'completed') => {
    setProjects((prev) => prev.map(p => {
      if (p.id !== projectId) return p
      return {
        ...p,
        countermeasures: (p.countermeasures || []).map(cm =>
          cm.id === countermeasureId ? { ...cm, status: newStatus } : cm
        )
      }
    }))
    toast.success('Countermeasure status updated')
  }

  const handleDeleteCountermeasure = (projectId: string, countermeasureId: string) => {
    setProjects((prev) => prev.map(p => {
      if (p.id !== projectId) return p
      return {
        ...p,
        countermeasures: (p.countermeasures || []).filter(cm => cm.id !== countermeasureId)
      }
    }))
    toast.success('Countermeasure deleted')
  }

  const statusColors = {
    'open': 'bg-muted text-muted-foreground',
    'in-progress': 'bg-primary/10 text-primary border-primary/30',
    'completed': 'bg-success/10 text-success border-success/30'
  }

  if (allCountermeasures.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Lightning size={48} className="text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">No countermeasures defined. Add countermeasures to projects to track corrective actions.</p>
        </CardContent>
      </Card>
    )
  }

  const openCountermeasures = allCountermeasures.filter(cm => cm.status === 'open')
  const inProgressCountermeasures = allCountermeasures.filter(cm => cm.status === 'in-progress')
  const completedCountermeasures = allCountermeasures.filter(cm => cm.status === 'completed')

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Open</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-muted-foreground">{openCountermeasures.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>In Progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{inProgressCountermeasures.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{completedCountermeasures.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Countermeasures (PDCA Actions)</CardTitle>
          <CardDescription>Track corrective and preventive actions across all projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allCountermeasures.map((cm) => {
              const isOverdue = new Date(cm.dueDate) < new Date() && cm.status !== 'completed'
              return (
                <div key={cm.id} className={`p-4 border rounded-lg ${isOverdue ? 'border-destructive/50 bg-destructive/5' : 'border-border bg-card'}`}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className={`${statusColors[cm.status]} capitalize font-semibold`}>
                          {cm.status.replace('-', ' ')}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {cm.projectName}
                        </Badge>
                        {isOverdue && (
                          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-xs">
                            Overdue
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-semibold mb-2">{cm.issue}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        <strong>Action:</strong> {cm.action}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span><strong>Owner:</strong> {cm.owner}</span>
                        <span><strong>Due:</strong> {new Date(cm.dueDate).toLocaleDateString()}</span>
                        <span><strong>Created:</strong> {new Date(cm.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Select
                        value={cm.status}
                        onValueChange={(value) => handleUpdateStatus(cm.projectId, cm.id, value as 'open' | 'in-progress' | 'completed')}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteCountermeasure(cm.projectId, cm.id)}
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DashboardView({ projects }: { projects: RoadmapProject [] }) {
  const allObjectives = projects.flatMap(p => p.objectives)
  const allCountermeasures = projects.flatMap(p => p.countermeasures || [])
  
  const overallHealth = {
    onTrack: allObjectives.filter(o => o.status === 'on-track').length,
    atRisk: allObjectives.filter(o => o.status === 'at-risk').length,
    offTrack: allObjectives.filter(o => o.status === 'blocked').length,
    notStarted: allObjectives.filter(o => o.status === 'not-started').length
  }

  const total = Object.values(overallHealth).reduce((a, b) => a + b, 0)
  const healthPercent = total > 0 ? Math.round((overallHealth.onTrack / total) * 100) : 0

  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0)
  const totalSpend = projects.reduce((sum, p) => sum + (p.actualSpend || 0), 0)
  const budgetUtilization = totalBudget > 0 ? Math.round((totalSpend / totalBudget) * 100) : 0

  const openCountermeasures = allCountermeasures.filter(cm => cm.status === 'open' || cm.status === 'in-progress').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Overall Health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-accent">{healthPercent}%</div>
              <Gauge size={32} className="text-accent" weight="bold" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>On Track</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-success">{overallHealth.onTrack}</div>
              <CheckCircle size={32} className="text-success" weight="fill" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>At Risk</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-warning">{overallHealth.atRisk}</div>
              <WarningCircle size={32} className="text-warning" weight="fill" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Budget Used</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-primary">{budgetUtilization}%</div>
              <CurrencyDollar size={32} className="text-primary" weight="bold" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ${totalSpend.toLocaleString()} / ${totalBudget.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-warning">{openCountermeasures}</div>
              <Lightning size={32} className="text-warning" weight="bold" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Financial Overview</CardTitle>
            <CardDescription>Budget tracking across all strategic projects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No projects to display</p>
            ) : (
              projects.map((proj) => {
                const budget = proj.budget || 0
                const spend = proj.actualSpend || 0
                const utilization = budget > 0 ? (spend / budget) * 100 : 0
                const isOverBudget = utilization > 100

                return (
                  <div key={proj.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{proj.name}</span>
                      <Badge variant="outline" className={`font-mono ${isOverBudget ? 'bg-destructive/10 text-destructive border-destructive/30' : ''}`}>
                        {Math.round(utilization)}%
                      </Badge>
                    </div>
                    <Progress value={Math.min(utilization, 100)} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Spent: ${spend.toLocaleString()}</span>
                      <span>Budget: ${budget.toLocaleString()}</span>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Strategic Objectives Summary</CardTitle>
            <CardDescription>Progress across all strategic goals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {allObjectives.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No objectives to display</p>
            ) : (
              allObjectives.slice(0, 6).map((obj) => {
              const avgProgress = obj.metrics.length > 0 
                ? obj.metrics.reduce((sum, m) => {
                  const progress = ((m.current - m.baseline) / (m.target - m.baseline)) * 100
                  return sum + progress
                }, 0) / obj.metrics.length
                : 0

              return (
                <div key={obj.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate flex-1">{obj.description}</span>
                    <Badge variant="outline" className="font-mono shrink-0 ml-2">
                      {Math.round(avgProgress)}%
                    </Badge>
                  </div>
                  <Progress value={Math.max(0, Math.min(100, avgProgress))} className="h-2" />
                </div>
              )
            }))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Metrics by Category</CardTitle>
            <CardDescription>Performance across different goal types</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {['breakthrough', 'annual', 'improvement'].map((category) => {
              const objectives = allObjectives.filter(obj => obj.category === category)
              const categoryMetrics = objectives.flatMap(obj => obj.metrics)
              const avgProgress = categoryMetrics.length > 0 
                ? categoryMetrics.reduce((sum, m) => {
                    const progress = ((m.current - m.baseline) / (m.target - m.baseline)) * 100
                    return sum + progress
                  }, 0) / categoryMetrics.length
                : 0

              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{category} Goals</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{categoryMetrics.length} metrics</span>
                      <Badge variant="outline" className="font-mono">
                        {Math.round(avgProgress)}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={Math.max(0, Math.min(100, avgProgress))} className="h-2" />
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Projects Overview</CardTitle>
            <CardDescription>Status distribution across all projects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {projects.map((proj) => (
              <div key={proj.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium">{proj.name}</p>
                  <p className="text-xs text-muted-foreground">{proj.owner}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={`capitalize ${
                    proj.status === 'on-track' ? 'bg-success/10 text-success border-success/30' :
                    proj.status === 'at-risk' ? 'bg-warning/10 text-warning border-warning/30' :
                    proj.status === 'blocked' ? 'bg-destructive/10 text-destructive border-destructive/30' :
                    proj.status === 'completed' ? 'bg-primary/10 text-primary border-primary/30' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {proj.status.replace('-', ' ')}
                  </Badge>
                  <span className="text-sm font-mono font-semibold">{proj.progress}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Updates</CardTitle>
          <CardDescription>Latest metric changes and milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-success/5 border border-success/30 rounded">
              <TrendUp size={20} className="text-success shrink-0 mt-0.5" weight="bold" />
              <div className="flex-1">
                <p className="text-sm font-medium">Revenue Growth on track</p>
                <p className="text-xs text-muted-foreground">Current: 115%, Target: 125% - Ahead of Q1 milestone</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">2 days ago</span>
            </div>

            <div className="flex items-start gap-3 p-3 bg-warning/5 border border-warning/30 rounded">
              <WarningCircle size={20} className="text-warning shrink-0 mt-0.5" weight="fill" />
              <div className="flex-1">
                <p className="text-sm font-medium">Cost Reduction needs attention</p>
                <p className="text-xs text-muted-foreground">Current: 92%, Target: 85% - Behind schedule, countermeasures required</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">1 week ago</span>
            </div>

            <div className="flex items-start gap-3 p-3 bg-success/5 border border-success/30 rounded">
              <CheckCircle size={20} className="text-success shrink-0 mt-0.5" weight="fill" />
              <div className="flex-1">
                <p className="text-sm font-medium">Customer Satisfaction exceeding targets</p>
                <p className="text-xs text-muted-foreground">NPS Score: 84pts, Target: 95pts - Strong upward trend</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">3 days ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function Roadmap() {
  const [projects, setProjects] = useKV<RoadmapProject[]>('roadmap-projects', [])
  const [hasInitialized, setHasInitialized] = useKV<boolean>('roadmap-initialized', false)

  if (!projects || projects.length === 0) {
    const sampleProjects: RoadmapProject[] = [
      {
        id: 'proj-sample-1',
        name: 'Digital Transformation Initiative',
        description: 'Modernize core business processes and customer touchpoints through digital-first approach',
        owner: 'Sarah Chen',
        status: 'on-track',
        priority: 'critical',
        startDate: '2024-01-15',
        endDate: '2024-12-31',
        progress: 45,
        budget: 2500000,
        actualSpend: 980000,
        dependencies: [],
        countermeasures: [
          {
            id: 'cm-sample-1',
            issue: 'Customer adoption rate below target for new digital channels',
            action: 'Launch targeted training program and incentive campaign to drive usage',
            owner: 'Marketing Team',
            dueDate: '2024-04-30',
            status: 'in-progress',
            createdAt: new Date('2024-03-15').toISOString()
          }
        ],
        objectives: [
          {
            id: 'obj-sample-1',
            projectId: 'proj-sample-1',
            category: 'breakthrough',
            description: 'Achieve 95% digital adoption across all customer touchpoints',
            owner: 'Sarah Chen',
            targetDate: '2024-12-31',
            status: 'on-track',
            metrics: [
              {
                id: 'metric-sample-1',
                name: 'Digital Channel Usage Rate',
                baseline: 45,
                current: 68,
                target: 95,
                unit: '%',
                frequency: 'monthly',
                lastUpdated: new Date().toISOString(),
                trend: 'improving'
              },
              {
                id: 'metric-sample-2',
                name: 'Customer Satisfaction Score',
                baseline: 72,
                current: 81,
                target: 90,
                unit: 'pts',
                frequency: 'quarterly',
                lastUpdated: new Date().toISOString(),
                trend: 'improving'
              }
            ]
          },
          {
            id: 'obj-sample-2',
            projectId: 'proj-sample-1',
            category: 'annual',
            description: 'Reduce manual processing time by 50% through automation',
            owner: 'Michael Torres',
            targetDate: '2024-09-30',
            status: 'at-risk',
            metrics: [
              {
                id: 'metric-sample-3',
                name: 'Process Automation Rate',
                baseline: 20,
                current: 35,
                target: 70,
                unit: '%',
                frequency: 'monthly',
                lastUpdated: new Date().toISOString(),
                trend: 'stable'
              }
            ]
          }
        ],
        metrics: [
          {
            id: 'metric-sample-4',
            name: 'Overall Project Completion',
            baseline: 0,
            current: 45,
            target: 100,
            unit: '%',
            frequency: 'weekly',
            lastUpdated: new Date().toISOString(),
            trend: 'improving'
          },
          {
            id: 'metric-sample-5',
            name: 'Budget Utilization',
            baseline: 0,
            current: 38,
            target: 100,
            unit: '%',
            frequency: 'monthly',
            lastUpdated: new Date().toISOString(),
            trend: 'improving'
          }
        ]
      },
      {
        id: 'proj-sample-2',
        name: 'Operational Excellence Program',
        description: 'Drive continuous improvement across manufacturing and supply chain operations',
        owner: 'James Wilson',
        status: 'on-track',
        priority: 'high',
        startDate: '2024-02-01',
        endDate: '2024-11-30',
        progress: 62,
        budget: 1200000,
        actualSpend: 720000,
        dependencies: [],
        countermeasures: [
          {
            id: 'cm-sample-2',
            issue: 'Equipment downtime exceeding targets in production line 3',
            action: 'Implement predictive maintenance system and increase preventive maintenance frequency',
            owner: 'James Wilson',
            dueDate: '2024-05-15',
            status: 'open',
            createdAt: new Date('2024-04-01').toISOString()
          }
        ],
        objectives: [
          {
            id: 'obj-sample-3',
            projectId: 'proj-sample-2',
            category: 'improvement',
            description: 'Reduce production cycle time by 25%',
            owner: 'James Wilson',
            targetDate: '2024-08-31',
            status: 'on-track',
            metrics: [
              {
                id: 'metric-sample-6',
                name: 'Average Cycle Time',
                baseline: 120,
                current: 95,
                target: 90,
                unit: 'hrs',
                frequency: 'weekly',
                lastUpdated: new Date().toISOString(),
                trend: 'improving'
              }
            ]
          }
        ],
        metrics: [
          {
            id: 'metric-sample-7',
            name: 'Overall Equipment Effectiveness',
            baseline: 72,
            current: 84,
            target: 85,
            unit: '%',
            frequency: 'daily',
            lastUpdated: new Date().toISOString(),
            trend: 'improving'
          },
          {
            id: 'metric-sample-8',
            name: 'Defect Rate',
            baseline: 5.2,
            current: 2.8,
            target: 2.0,
            unit: '%',
            frequency: 'weekly',
            lastUpdated: new Date().toISOString(),
            trend: 'improving'
          }
        ]
      }
    ]
    
    setProjects(() => sampleProjects)
    setHasInitialized(() => true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Strategic Roadmap</h2>
        <p className="text-muted-foreground mt-1">Hoshin Kanri planning and execution tracking</p>
      </div>

      {projects && projects.length > 0 && projects[0].id === 'proj-sample-1' && (
        <Card className="border-accent/50 bg-accent/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="bg-accent/20 p-2 rounded-lg">
                <Target size={24} className="text-accent" weight="bold" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1">Sample Projects Loaded</h3>
                <p className="text-sm text-muted-foreground">
                  We've added two sample projects to help you explore the Roadmap features. You can add objectives and metrics to projects, 
                  track progress, and visualize strategic alignment. Feel free to delete these and create your own!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 h-auto lg:h-14 bg-muted/50">
          <TabsTrigger value="projects" className="gap-2 text-sm lg:text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FolderOpen size={20} weight="bold" />
            <span className="hidden lg:inline">Projects</span>
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="gap-2 text-sm lg:text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Gauge size={20} weight="bold" />
            <span className="hidden lg:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-2 text-sm lg:text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <CalendarBlank size={20} weight="bold" />
            <span className="hidden lg:inline">Timeline</span>
          </TabsTrigger>
          <TabsTrigger value="objectives" className="gap-2 text-sm lg:text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Target size={20} weight="bold" />
            <span className="hidden lg:inline">Objectives</span>
          </TabsTrigger>
          <TabsTrigger value="metrics" className="gap-2 text-sm lg:text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <ChartBar size={20} weight="bold" />
            <span className="hidden lg:inline">Metrics</span>
          </TabsTrigger>
          <TabsTrigger value="bowling" className="gap-2 text-sm lg:text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <ListChecks size={20} weight="bold" />
            <span className="hidden lg:inline">Bowling</span>
          </TabsTrigger>
          <TabsTrigger value="xmatrix" className="gap-2 text-sm lg:text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <GridFour size={20} weight="bold" />
            <span className="hidden lg:inline">X-Matrix</span>
          </TabsTrigger>
          <TabsTrigger value="countermeasures" className="gap-2 text-sm lg:text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Lightning size={20} weight="bold" />
            <span className="hidden lg:inline">Actions</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="mt-6">
          <ProjectsView projects={projects || []} setProjects={setProjects} />
        </TabsContent>

        <TabsContent value="dashboard" className="mt-6">
          <DashboardView projects={projects || []} />
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <TimelineView projects={projects || []} />
        </TabsContent>

        <TabsContent value="objectives" className="mt-6">
          <ObjectivesView projects={projects || []} setProjects={setProjects} />
        </TabsContent>

        <TabsContent value="metrics" className="mt-6">
          <MetricsView projects={projects || []} setProjects={setProjects} />
        </TabsContent>

        <TabsContent value="bowling" className="mt-6">
          <BowlingChartView projects={projects || []} />
        </TabsContent>

        <TabsContent value="xmatrix" className="mt-6">
          <XMatrixView projects={projects || []} />
        </TabsContent>

        <TabsContent value="countermeasures" className="mt-6">
          <CountermeasuresView projects={projects || []} setProjects={setProjects} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
