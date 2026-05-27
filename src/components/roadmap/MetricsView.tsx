import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ChartBar, TrendUp, PencilSimple } from '@phosphor-icons/react'
import { Progress } from '@/components/ui/progress'
import { useMetricsView } from '@/hooks/useMetricsView'
import type { RoadmapProject } from '@/types'

type SetProjects = (updater: (prev: RoadmapProject[]) => RoadmapProject[]) => void

const trendIcons = {
  improving: <TrendUp size={16} className="text-success" weight="bold" />,
  stable:    <span className="text-warning text-xs">→</span>,
  declining: <TrendUp size={16} className="text-destructive rotate-180" weight="bold" />
}

interface Props {
  projects: RoadmapProject[]
  setProjects: SetProjects
}

export function MetricsView({ projects, setProjects }: Props) {
  const vm = useMetricsView(projects, setProjects)

  if (vm.allMetrics.length === 0) {
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
              {vm.allMetrics.map((metric) => {
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
                        <Badge variant="outline" className="font-mono shrink-0">{metric.frequency}</Badge>
                        <Button size="sm" variant="outline" onClick={() => vm.openEdit(metric)}>
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

      <Dialog open={vm.isUpdatingMetric} onOpenChange={vm.setIsUpdatingMetric}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Metric Value</DialogTitle>
            <DialogDescription>Enter the new current value for {vm.editingMetric?.name}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-value">Current Value</Label>
              <Input id="new-value" type="number" value={vm.newValue} onChange={(e) => vm.setNewValue(parseFloat(e.target.value))} placeholder="Enter new value" />
            </div>
            {vm.editingMetric && (
              <div className="grid grid-cols-3 gap-4 text-sm p-3 bg-muted/30 rounded">
                <div>
                  <div className="text-muted-foreground text-xs mb-1">Baseline</div>
                  <div className="font-semibold font-mono">{vm.editingMetric.baseline}{vm.editingMetric.unit}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-1">New Value</div>
                  <div className="font-semibold font-mono text-accent">{vm.newValue}{vm.editingMetric.unit}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-1">Target</div>
                  <div className="font-semibold font-mono">{vm.editingMetric.target}{vm.editingMetric.unit}</div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => vm.setIsUpdatingMetric(false)}>Cancel</Button>
            <Button onClick={vm.handleUpdateMetric}>Update Value</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
