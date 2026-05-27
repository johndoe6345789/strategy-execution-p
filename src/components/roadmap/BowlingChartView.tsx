import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ListChecks } from '@phosphor-icons/react'
import { bowlingStatusColors, bowlingStatusLabels, MONTHS } from '@/constants/roadmapColors'
import type { RoadmapProject, BowlingChartData } from '@/types'

function buildBowlingData(projects: RoadmapProject[]): BowlingChartData[] {
  const currentMonth = new Date().getMonth()
  return projects.flatMap(project =>
    project.objectives.map(obj => ({
      objective: obj.description,
      months: MONTHS.map((month, idx) => {
        const avgProgress = obj.metrics.length > 0
          ? obj.metrics.reduce((sum, m) => {
              const progress = ((m.current - m.baseline) / (m.target - m.baseline)) * 100
              return sum + progress
            }, 0) / obj.metrics.length
          : 0
        const isNotStarted = idx > currentMonth
        const targetProgress = ((idx + 1) / 12) * 100
        let status: 'green' | 'yellow' | 'red' | 'not-started' = 'not-started'
        if (!isNotStarted) {
          const diff = avgProgress - targetProgress
          if (diff >= -5) status = 'green'
          else if (diff >= -15) status = 'yellow'
          else status = 'red'
        }
        return { month, status, actual: isNotStarted ? 0 : Math.round(avgProgress), target: Math.round(targetProgress) }
      })
    }))
  )
}

interface Props {
  projects: RoadmapProject[]
}

export function BowlingChartView({ projects }: Props) {
  const bowlingData = buildBowlingData(projects)

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
                        className={`w-full aspect-square rounded-md ${bowlingStatusColors[month.status]} flex items-center justify-center text-xs font-bold ${month.status === 'not-started' ? 'text-muted-foreground' : 'text-white'}`}
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
            {(Object.entries(bowlingStatusLabels) as [keyof typeof bowlingStatusColors, string][]).map(([status, label]) => (
              <div key={status} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${bowlingStatusColors[status]}`} />
                <span className="text-sm text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
