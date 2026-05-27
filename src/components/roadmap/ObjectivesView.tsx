import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Target, CheckCircle, WarningCircle, XCircle, Circle } from '@phosphor-icons/react'
import { Progress } from '@/components/ui/progress'
import { MetricForm } from './MetricForm'
import { categoryColors } from '@/constants/roadmapColors'
import { useObjectivesView } from '@/hooks/useObjectivesView'
import type { RoadmapProject, StatusType } from '@/types'

type SetProjects = (updater: (prev: RoadmapProject[]) => RoadmapProject[]) => void

const statusIcons: Record<StatusType, React.ReactNode> = {
  'on-track':    <CheckCircle size={20} weight="fill" className="text-success" />,
  'at-risk':     <WarningCircle size={20} weight="fill" className="text-warning" />,
  'blocked':     <XCircle size={20} weight="fill" className="text-destructive" />,
  'completed':   <CheckCircle size={20} weight="fill" className="text-success" />,
  'not-started': <Circle size={20} className="text-muted-foreground" />
}

interface Props {
  projects: RoadmapProject[]
  setProjects: SetProjects
}

export function ObjectivesView({ projects, setProjects }: Props) {
  const vm = useObjectivesView(projects, setProjects)

  if (vm.allObjectivesWithProject.length === 0) {
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
        {vm.allObjectivesWithProject.map((objective) => (
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
                      vm.setSelectedObjectiveId(objective.id)
                      vm.setSelectedProjectId(objective.projectId)
                      vm.setIsAddingMetricToObjective(true)
                    }}
                  >
                    <Plus size={16} weight="bold" />Add Metric
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
                            <span className="text-xs text-muted-foreground">{metric.current}{metric.unit} / {metric.target}{metric.unit}</span>
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

      <Dialog open={vm.isAddingMetricToObjective} onOpenChange={vm.setIsAddingMetricToObjective}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Metric to Objective</DialogTitle>
            <DialogDescription>Define a measurable KPI to track objective progress</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <MetricForm metric={vm.newMetric} onChange={(updates) => vm.setNewMetric({ ...vm.newMetric, ...updates })} idPrefix="obj-metric" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => vm.setIsAddingMetricToObjective(false)}>Cancel</Button>
            <Button onClick={vm.handleAddMetricToObjective}>Add Metric</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
