import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CalendarBlank } from '@phosphor-icons/react'
import { statusColorsBg, priorityBorders } from '@/constants/roadmapColors'
import type { RoadmapProject } from '@/types'

function getProjectPosition(startDate: string, endDate: string, minDate: Date, totalDays: number) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const startOffset = Math.ceil((start.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))
  const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return {
    left: `${(startOffset / totalDays) * 100}%`,
    width: `${(duration / totalDays) * 100}%`
  }
}

interface Props {
  projects: RoadmapProject[]
}

export function TimelineView({ projects }: Props) {
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
              <span className="font-semibold">Timeline: {minDate.toLocaleDateString()} - {maxDate.toLocaleDateString()}</span>
              <span className="font-mono">{monthsInRange} months</span>
            </div>

            <div className="space-y-4">
              {projects.map((project) => {
                const position = getProjectPosition(project.startDate, project.endDate, minDate, totalDays)
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
                  {(Object.entries(statusColorsBg) as [keyof typeof statusColorsBg, string][]).map(([status, color]) => (
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
                  {(Object.entries(priorityBorders) as [keyof typeof priorityBorders, string][]).map(([priority, border]) => (
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
