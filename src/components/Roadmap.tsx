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
  PencilSimple
} from '@phosphor-icons/react'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import type { RoadmapProject, RoadmapObjective, RoadmapMetric, BowlingChartData, StatusType, PriorityType } from '@/types'

interface XMatrixItem {
  id: string
  type: 'objective' | 'strategy' | 'tactic' | 'metric'
  text: string
  relationships: string[]
}

function ProjectsView({ projects, setProjects }: { projects: RoadmapProject[], setProjects: (updater: (prev: RoadmapProject[]) => RoadmapProject[]) => void }) {
  const [isAddingProject, setIsAddingProject] = useState(false)
  const [editingProject, setEditingProject] = useState<RoadmapProject | null>(null)
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
    metrics: []
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
      metrics: []
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
      metrics: []
    })
    toast.success('Project created successfully')
  }

  const handleDeleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter(p => p.id !== projectId))
    toast.success('Project deleted')
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
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Objectives:</span>
                      <span className="ml-2 font-semibold">{project.objectives.length}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Metrics:</span>
                      <span className="ml-2 font-semibold">{project.metrics.length}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

const mockBowlingChart: BowlingChartData[] = [
  {
    objective: 'Revenue Growth 25%',
    months: [
      { month: 'Jan', status: 'green', actual: 102, target: 102 },
      { month: 'Feb', status: 'green', actual: 105, target: 104 },
      { month: 'Mar', status: 'yellow', actual: 107, target: 108 },
      { month: 'Apr', status: 'green', actual: 111, target: 110 },
      { month: 'May', status: 'green', actual: 115, target: 113 },
      { month: 'Jun', status: 'not-started', actual: 0, target: 116 },
      { month: 'Jul', status: 'not-started', actual: 0, target: 118 },
      { month: 'Aug', status: 'not-started', actual: 0, target: 120 },
      { month: 'Sep', status: 'not-started', actual: 0, target: 122 },
      { month: 'Oct', status: 'not-started', actual: 0, target: 123 },
      { month: 'Nov', status: 'not-started', actual: 0, target: 124 },
      { month: 'Dec', status: 'not-started', actual: 0, target: 125 }
    ]
  },
  {
    objective: 'Cost Reduction 15%',
    months: [
      { month: 'Jan', status: 'green', actual: 98, target: 98 },
      { month: 'Feb', status: 'yellow', actual: 96, target: 95 },
      { month: 'Mar', status: 'yellow', actual: 94, target: 92 },
      { month: 'Apr', status: 'red', actual: 93, target: 90 },
      { month: 'May', status: 'yellow', actual: 92, target: 88 },
      { month: 'Jun', status: 'not-started', actual: 0, target: 87 },
      { month: 'Jul', status: 'not-started', actual: 0, target: 86 },
      { month: 'Aug', status: 'not-started', actual: 0, target: 86 },
      { month: 'Sep', status: 'not-started', actual: 0, target: 85 },
      { month: 'Oct', status: 'not-started', actual: 0, target: 85 },
      { month: 'Nov', status: 'not-started', actual: 0, target: 85 },
      { month: 'Dec', status: 'not-started', actual: 0, target: 85 }
    ]
  },
  {
    objective: 'Customer Satisfaction 95%',
    months: [
      { month: 'Jan', status: 'green', actual: 75, target: 75 },
      { month: 'Feb', status: 'green', actual: 78, target: 77 },
      { month: 'Mar', status: 'green', actual: 81, target: 80 },
      { month: 'Apr', status: 'green', actual: 84, target: 83 },
      { month: 'May', status: 'green', actual: 87, target: 86 },
      { month: 'Jun', status: 'not-started', actual: 0, target: 89 },
      { month: 'Jul', status: 'not-started', actual: 0, target: 91 },
      { month: 'Aug', status: 'not-started', actual: 0, target: 92 },
      { month: 'Sep', status: 'not-started', actual: 0, target: 93 },
      { month: 'Oct', status: 'not-started', actual: 0, target: 94 },
      { month: 'Nov', status: 'not-started', actual: 0, target: 94 },
      { month: 'Dec', status: 'not-started', actual: 0, target: 95 }
    ]
  }
]

function ObjectivesView({ projects }: { projects: RoadmapProject[] }) {
  const allObjectives = projects.flatMap(p => p.objectives)

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

  if (allObjectives.length === 0) {
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
    <div className="space-y-4">
      {allObjectives.map((objective) => (
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
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Key Metrics</h4>
              {objective.metrics.map((metric) => {
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
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function MetricsView({ projects }: { projects: RoadmapProject[] }) {
  const allMetrics = projects.flatMap(project => 
    project.metrics.map(m => ({ ...m, projectName: project.name }))
  )

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
                    <Badge variant="outline" className="font-mono shrink-0">
                      {metric.frequency}
                    </Badge>
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
  )
}

function BowlingChartView() {
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bowling Chart - Monthly Tracking</CardTitle>
          <CardDescription>Visual month-by-month progress tracking for strategic objectives</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {mockBowlingChart.map((item, idx) => (
              <div key={idx} className="space-y-3">
                {idx > 0 && <Separator />}
                <h4 className="font-semibold">{item.objective}</h4>
                <div className="grid grid-cols-12 gap-2">
                  {item.months.map((month, monthIdx) => (
                    <div key={monthIdx} className="flex flex-col items-center gap-1">
                      <div 
                        className={`w-full aspect-square rounded-md ${statusColors[month.status]} flex items-center justify-center text-xs font-bold ${month.status === 'not-started' ? 'text-muted-foreground' : 'text-white'}`}
                        title={month.status !== 'not-started' ? `Actual: ${month.actual}, Target: ${month.target}` : 'Not Started'}
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

function XMatrixView() {
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
                  <div className="p-3 border-l-4 border-accent bg-accent/5 rounded text-sm">
                    25% Revenue Growth
                  </div>
                  <div className="p-3 border-l-4 border-accent bg-accent/5 rounded text-sm">
                    15% Cost Reduction
                  </div>
                  <div className="p-3 border-l-4 border-accent bg-accent/5 rounded text-sm">
                    95% Customer Satisfaction
                  </div>
                  <div className="p-3 border-l-4 border-accent bg-accent/5 rounded text-sm">
                    Launch 3 New Products
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">Strategic Initiatives</h4>
                <div className="space-y-2">
                  <div className="p-3 border-l-4 border-primary bg-primary/5 rounded text-sm">
                    Market Expansion Program
                  </div>
                  <div className="p-3 border-l-4 border-primary bg-primary/5 rounded text-sm">
                    Process Automation
                  </div>
                  <div className="p-3 border-l-4 border-primary bg-primary/5 rounded text-sm">
                    Customer Experience Transformation
                  </div>
                  <div className="p-3 border-l-4 border-primary bg-primary/5 rounded text-sm">
                    Innovation Pipeline
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-success uppercase tracking-wider">Key Metrics (KPIs)</h4>
                <div className="space-y-2">
                  <div className="p-3 border-l-4 border-success bg-success/5 rounded text-sm">
                    Monthly Revenue Growth Rate
                  </div>
                  <div className="p-3 border-l-4 border-success bg-success/5 rounded text-sm">
                    Operating Cost Ratio
                  </div>
                  <div className="p-3 border-l-4 border-success bg-success/5 rounded text-sm">
                    Net Promoter Score
                  </div>
                  <div className="p-3 border-l-4 border-success bg-success/5 rounded text-sm">
                    Time to Market
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="bg-muted/30 p-6 rounded-lg">
              <h4 className="font-semibold text-sm text-secondary uppercase tracking-wider mb-4">Improvement Tactics</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border-l-4 border-secondary bg-card rounded text-sm">
                  Digital Marketing Campaign (Q1-Q2)
                </div>
                <div className="p-3 border-l-4 border-secondary bg-card rounded text-sm">
                  Partnership Development (Q1-Q3)
                </div>
                <div className="p-3 border-l-4 border-secondary bg-card rounded text-sm">
                  RPA Implementation (Q2-Q3)
                </div>
                <div className="p-3 border-l-4 border-secondary bg-card rounded text-sm">
                  Lean Process Redesign (Q1-Q4)
                </div>
                <div className="p-3 border-l-4 border-secondary bg-card rounded text-sm">
                  CX Training Program (Q1-Q2)
                </div>
                <div className="p-3 border-l-4 border-secondary bg-card rounded text-sm">
                  Feedback System Redesign (Q2-Q3)
                </div>
                <div className="p-3 border-l-4 border-secondary bg-card rounded text-sm">
                  R&D Investment Plan (Q1-Q4)
                </div>
                <div className="p-3 border-l-4 border-secondary bg-card rounded text-sm">
                  Agile Product Development (Q2-Q4)
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-accent/5 border border-accent/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> The X-Matrix creates strategic alignment by connecting Annual Objectives → Strategic Initiatives → Improvement Tactics → Key Metrics. 
                Each connection represents a cause-and-effect relationship ensuring all activities drive toward strategic goals.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DashboardView({ projects }: { projects: RoadmapProject[] }) {
  const allObjectives = projects.flatMap(p => p.objectives)
  
  const overallHealth = {
    onTrack: allObjectives.filter(o => o.status === 'on-track').length,
    atRisk: allObjectives.filter(o => o.status === 'at-risk').length,
    offTrack: allObjectives.filter(o => o.status === 'blocked').length,
    notStarted: allObjectives.filter(o => o.status === 'not-started').length
  }

  const total = Object.values(overallHealth).reduce((a, b) => a + b, 0)
  const healthPercent = total > 0 ? Math.round((overallHealth.onTrack / total) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <CardDescription>Off Track</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-destructive">{overallHealth.offTrack}</div>
              <XCircle size={32} className="text-destructive" weight="fill" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Strategic Objectives Summary</CardTitle>
            <CardDescription>Progress across all strategic goals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {allObjectives.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No objectives to display</p>
            ) : (
              allObjectives.map((obj) => {
              const avgProgress = obj.metrics.reduce((sum, m) => {
                const progress = ((m.current - m.baseline) / (m.target - m.baseline)) * 100
                return sum + progress
              }, 0) / obj.metrics.length

              return (
                <div key={obj.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{obj.description}</span>
                    <Badge variant="outline" className="font-mono">
                      {Math.round(avgProgress)}%
                    </Badge>
                  </div>
                  <Progress value={avgProgress} className="h-2" />
                </div>
              )
            }))}
          </CardContent>
        </Card>

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
                  <Progress value={avgProgress} className="h-2" />
                </div>
              )
            })}
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Strategic Roadmap</h2>
        <p className="text-muted-foreground mt-1">Hoshin Kanri planning and execution tracking</p>
      </div>

      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid w-full grid-cols-6 h-14 bg-muted/50">
          <TabsTrigger value="projects" className="gap-2 text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FolderOpen size={20} weight="bold" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="gap-2 text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Gauge size={20} weight="bold" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="objectives" className="gap-2 text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Target size={20} weight="bold" />
            Objectives
          </TabsTrigger>
          <TabsTrigger value="metrics" className="gap-2 text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <ChartBar size={20} weight="bold" />
            Metrics
          </TabsTrigger>
          <TabsTrigger value="bowling" className="gap-2 text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <ListChecks size={20} weight="bold" />
            Bowling Chart
          </TabsTrigger>
          <TabsTrigger value="xmatrix" className="gap-2 text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <GridFour size={20} weight="bold" />
            X-Matrix
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="mt-6">
          <ProjectsView projects={projects || []} setProjects={setProjects} />
        </TabsContent>

        <TabsContent value="dashboard" className="mt-6">
          <DashboardView projects={projects || []} />
        </TabsContent>

        <TabsContent value="objectives" className="mt-6">
          <ObjectivesView projects={projects || []} />
        </TabsContent>

        <TabsContent value="metrics" className="mt-6">
          <MetricsView projects={projects || []} />
        </TabsContent>

        <TabsContent value="bowling" className="mt-6">
          <BowlingChartView />
        </TabsContent>

        <TabsContent value="xmatrix" className="mt-6">
          <XMatrixView />
        </TabsContent>
      </Tabs>
    </div>
  )
}
