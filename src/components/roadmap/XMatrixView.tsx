import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { GridFour } from '@phosphor-icons/react'
import type { RoadmapProject } from '@/types'

interface Props {
  projects: RoadmapProject[]
}

export function XMatrixView({ projects }: Props) {
  const allObjectives = projects.flatMap(p => p.objectives)
  const annualObjectives = allObjectives.filter(o => o.category === 'annual')
  const breakthroughObjectives = allObjectives.filter(o => o.category === 'breakthrough')
  const improvementObjectives = allObjectives.filter(o => o.category === 'improvement')
  const topMetrics = projects.flatMap(p => p.metrics).slice(0, 4)

  if (projects.length === 0 || (annualObjectives.length === 0 && breakthroughObjectives.length === 0)) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <GridFour size={48} className="text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">No data for X-Matrix. Add projects with objectives to see strategic alignment.</p>
        </CardContent>
      </Card>
    )
  }

  const primaryObjectives = annualObjectives.length > 0 ? annualObjectives : breakthroughObjectives

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
                  {primaryObjectives.slice(0, 4).map((obj) => (
                    <div key={obj.id} className="p-3 border-l-4 border-accent bg-accent/5 rounded text-sm">{obj.description}</div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">Strategic Projects</h4>
                <div className="space-y-2">
                  {projects.slice(0, 4).map((project) => (
                    <div key={project.id} className="p-3 border-l-4 border-primary bg-primary/5 rounded text-sm">{project.name}</div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-success uppercase tracking-wider">Key Metrics (KPIs)</h4>
                <div className="space-y-2">
                  {topMetrics.length > 0 ? (
                    topMetrics.map((metric) => (
                      <div key={metric.id} className="p-3 border-l-4 border-success bg-success/5 rounded text-sm">{metric.name}</div>
                    ))
                  ) : (
                    <div className="p-3 border-l-4 border-muted bg-muted/5 rounded text-sm text-muted-foreground">No metrics defined yet</div>
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
                    <div key={obj.id} className="p-3 border-l-4 border-secondary bg-card rounded text-sm">{obj.description}</div>
                  ))
                ) : (
                  <>
                    <div className="p-3 border-l-4 border-muted bg-card rounded text-sm text-muted-foreground">Add improvement objectives to projects</div>
                    <div className="p-3 border-l-4 border-muted bg-card rounded text-sm text-muted-foreground">Tactics will appear here</div>
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
