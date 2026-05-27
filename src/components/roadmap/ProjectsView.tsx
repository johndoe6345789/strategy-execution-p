import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, FolderOpen, Trash, CurrencyDollar, Lightning } from '@phosphor-icons/react'
import { Progress } from '@/components/ui/progress'
import { MetricForm } from './MetricForm'
import { StatusSelect } from './StatusSelect'
import { statusColors, priorityColors } from '@/constants/roadmapColors'
import { useProjectsView } from '@/hooks/useProjectsView'
import type { RoadmapProject, PriorityType } from '@/types'

type SetProjects = (updater: (prev: RoadmapProject[]) => RoadmapProject[]) => void

interface Props {
  projects: RoadmapProject[]
  setProjects: SetProjects
}

export function ProjectsView({ projects, setProjects }: Props) {
  const vm = useProjectsView(setProjects)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Strategic Projects</h3>
          <p className="text-sm text-muted-foreground">Manage projects with objectives and metrics</p>
        </div>
        <Dialog open={vm.isAddingProject} onOpenChange={vm.setIsAddingProject}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus size={20} weight="bold" />Add Project</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>Add a strategic project to track on the roadmap</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input id="name" value={vm.newProject.name} onChange={(e) => vm.setNewProject({ ...vm.newProject, name: e.target.value })} placeholder="Enter project name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={vm.newProject.description} onChange={(e) => vm.setNewProject({ ...vm.newProject, description: e.target.value })} placeholder="Enter project description" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="owner">Owner *</Label>
                  <Input id="owner" value={vm.newProject.owner} onChange={(e) => vm.setNewProject({ ...vm.newProject, owner: e.target.value })} placeholder="Project owner" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={vm.newProject.priority} onValueChange={(v) => vm.setNewProject({ ...vm.newProject, priority: v as PriorityType })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                  <Input id="startDate" type="date" value={vm.newProject.startDate} onChange={(e) => vm.setNewProject({ ...vm.newProject, startDate: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input id="endDate" type="date" value={vm.newProject.endDate} onChange={(e) => vm.setNewProject({ ...vm.newProject, endDate: e.target.value })} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <StatusSelect value={vm.newProject.status} onValueChange={(v) => vm.setNewProject({ ...vm.newProject, status: v })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="budget">Budget ($)</Label>
                <Input id="budget" type="number" value={vm.newProject.budget} onChange={(e) => vm.setNewProject({ ...vm.newProject, budget: parseFloat(e.target.value) })} placeholder="0" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => vm.setIsAddingProject(false)}>Cancel</Button>
              <Button onClick={vm.handleAddProject}>Create Project</Button>
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
                      <Badge variant="outline" className={`${statusColors[project.status]} capitalize font-semibold`}>{project.status.replace('-', ' ')}</Badge>
                      <Badge variant="outline" className={`${priorityColors[project.priority]} capitalize font-semibold`}>{project.priority}</Badge>
                    </div>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    {project.description && <CardDescription className="mt-2">{project.description}</CardDescription>}
                    <CardDescription className="mt-2">
                      <div className="flex items-center gap-4 text-sm">
                        <span><strong>Owner:</strong> {project.owner}</span>
                        <span><strong>Timeline:</strong> {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}</span>
                      </div>
                    </CardDescription>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => vm.handleDeleteProject(project.id)}><Trash size={16} /></Button>
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
                          <CurrencyDollar size={16} weight="bold" className="text-accent" />Budget Utilization
                        </span>
                        <span className="text-sm font-mono">${(project.actualSpend || 0).toLocaleString()} / ${project.budget.toLocaleString()}</span>
                      </div>
                      <Progress value={((project.actualSpend || 0) / project.budget) * 100} className="h-2" />
                    </div>
                  )}

                  <Separator />

                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Objectives', count: project.objectives.length, key: 'objective', onAdd: () => { vm.setSelectedProjectId(project.id); vm.setIsAddingObjective(true) } },
                      { label: 'Metrics', count: project.metrics.length, key: 'metric', onAdd: () => { vm.setSelectedProjectId(project.id); vm.setIsAddingMetric(true) } },
                      { label: 'Countermeasures', count: project.countermeasures?.length || 0, key: 'countermeasure', onAdd: () => { vm.setSelectedProjectId(project.id); vm.setIsAddingCountermeasure(true) } }
                    ].map(({ label, count, key, onAdd }) => (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">{label}</span>
                          <span className="text-sm font-semibold">{count}</span>
                        </div>
                        <Button size="sm" variant="outline" className="w-full gap-2" onClick={onAdd}>
                          <Plus size={16} weight="bold" />Add {label.slice(0, -1)}
                        </Button>
                      </div>
                    ))}
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
                              <Badge variant="outline" className="shrink-0 text-xs capitalize">{obj.category}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">Owner: {obj.owner} • Target: {new Date(obj.targetDate).toLocaleDateString()}</p>
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
                                <Badge variant="outline" className="font-mono text-xs">{metric.current}{metric.unit} / {metric.target}{metric.unit}</Badge>
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
                          <Lightning size={16} weight="bold" className="text-warning" />Active Countermeasures
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
                              }`}>{cm.status.replace('-', ' ')}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">Owner: {cm.owner} • Due: {new Date(cm.dueDate).toLocaleDateString()}</p>
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

      {/* Add Objective Dialog */}
      <Dialog open={vm.isAddingObjective} onOpenChange={vm.setIsAddingObjective}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Objective to Project</DialogTitle>
            <DialogDescription>Create a strategic objective with measurable outcomes</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="obj-description">Objective Description *</Label>
              <Textarea id="obj-description" value={vm.newObjective.description} onChange={(e) => vm.setNewObjective({ ...vm.newObjective, description: e.target.value })} placeholder="e.g., Achieve 25% revenue growth in Q2" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="obj-category">Category</Label>
                <Select value={vm.newObjective.category} onValueChange={(v) => vm.setNewObjective({ ...vm.newObjective, category: v as 'breakthrough' | 'annual' | 'improvement' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakthrough">Breakthrough Goal</SelectItem>
                    <SelectItem value="annual">Annual Goal</SelectItem>
                    <SelectItem value="improvement">Improvement Goal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="obj-owner">Owner *</Label>
                <Input id="obj-owner" value={vm.newObjective.owner} onChange={(e) => vm.setNewObjective({ ...vm.newObjective, owner: e.target.value })} placeholder="Objective owner" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="obj-targetDate">Target Date *</Label>
                <Input id="obj-targetDate" type="date" value={vm.newObjective.targetDate} onChange={(e) => vm.setNewObjective({ ...vm.newObjective, targetDate: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="obj-status">Status</Label>
                <StatusSelect value={vm.newObjective.status} onValueChange={(v) => vm.setNewObjective({ ...vm.newObjective, status: v })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => vm.setIsAddingObjective(false)}>Cancel</Button>
            <Button onClick={vm.handleAddObjective}>Add Objective</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Metric Dialog */}
      <Dialog open={vm.isAddingMetric} onOpenChange={vm.setIsAddingMetric}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Metric to Project</DialogTitle>
            <DialogDescription>Define a measurable KPI to track progress</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <MetricForm metric={vm.newMetric} onChange={(updates) => vm.setNewMetric({ ...vm.newMetric, ...updates })} idPrefix="proj-metric" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => vm.setIsAddingMetric(false)}>Cancel</Button>
            <Button onClick={vm.handleAddMetric}>Add Metric</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Countermeasure Dialog */}
      <Dialog open={vm.isAddingCountermeasure} onOpenChange={vm.setIsAddingCountermeasure}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Countermeasure</DialogTitle>
            <DialogDescription>Define an action to address an issue or risk (Hoshin Kanri PDCA)</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cm-issue">Issue / Problem Statement *</Label>
              <Textarea id="cm-issue" value={vm.newCountermeasure.issue} onChange={(e) => vm.setNewCountermeasure({ ...vm.newCountermeasure, issue: e.target.value })} placeholder="Describe the problem or risk requiring countermeasures" rows={2} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cm-action">Countermeasure Action *</Label>
              <Textarea id="cm-action" value={vm.newCountermeasure.action} onChange={(e) => vm.setNewCountermeasure({ ...vm.newCountermeasure, action: e.target.value })} placeholder="Describe the specific action to resolve the issue" rows={3} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cm-owner">Owner *</Label>
                <Input id="cm-owner" value={vm.newCountermeasure.owner} onChange={(e) => vm.setNewCountermeasure({ ...vm.newCountermeasure, owner: e.target.value })} placeholder="Action owner" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cm-dueDate">Due Date *</Label>
                <Input id="cm-dueDate" type="date" value={vm.newCountermeasure.dueDate} onChange={(e) => vm.setNewCountermeasure({ ...vm.newCountermeasure, dueDate: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cm-status">Status</Label>
                <Select value={vm.newCountermeasure.status} onValueChange={(v) => vm.setNewCountermeasure({ ...vm.newCountermeasure, status: v as 'open' | 'in-progress' | 'completed' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
            <Button variant="outline" onClick={() => vm.setIsAddingCountermeasure(false)}>Cancel</Button>
            <Button onClick={vm.handleAddCountermeasure}>Add Countermeasure</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
