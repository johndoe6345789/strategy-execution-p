import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Gauge, CheckCircle, WarningCircle, CurrencyDollar, Lightning, TrendUp } from '@phosphor-icons/react'
import { Progress } from '@/components/ui/progress'
import { statusColors } from '@/constants/roadmapColors'
import type { RoadmapProject } from '@/types'

const OBJECTIVE_CATEGORIES = ['breakthrough', 'annual', 'improvement'] as const

interface Props {
  projects: RoadmapProject[]
}

export function DashboardView({ projects }: Props) {
  const allObjectives = projects.flatMap(p => p.objectives)
  const allCountermeasures = projects.flatMap(p => p.countermeasures || [])

  const onTrack = allObjectives.filter(o => o.status === 'on-track').length
  const atRisk = allObjectives.filter(o => o.status === 'at-risk').length
  const total = allObjectives.length
  const healthPercent = total > 0 ? Math.round((onTrack / total) * 100) : 0

  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0)
  const totalSpend = projects.reduce((sum, p) => sum + (p.actualSpend || 0), 0)
  const budgetUtilization = totalBudget > 0 ? Math.round((totalSpend / totalBudget) * 100) : 0
  const openCountermeasures = allCountermeasures.filter(cm => cm.status !== 'completed').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Overall Health', value: `${healthPercent}%`, icon: <Gauge size={32} className="text-accent" weight="bold" />, className: 'text-accent' },
          { label: 'On Track', value: onTrack, icon: <CheckCircle size={32} className="text-success" weight="fill" />, className: 'text-success' },
          { label: 'At Risk', value: atRisk, icon: <WarningCircle size={32} className="text-warning" weight="fill" />, className: 'text-warning' },
          { label: 'Budget Used', value: `${budgetUtilization}%`, icon: <CurrencyDollar size={32} className="text-primary" weight="bold" />, className: 'text-primary', sub: `$${totalSpend.toLocaleString()} / $${totalBudget.toLocaleString()}` },
          { label: 'Active Actions', value: openCountermeasures, icon: <Lightning size={32} className="text-warning" weight="bold" />, className: 'text-warning' }
        ].map(({ label, value, icon, className, sub }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-2">{label}</p>
              <div className="flex items-center gap-3">
                <div className={`text-3xl font-bold ${className}`}>{value}</div>
                {icon}
              </div>
              {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
            </CardContent>
          </Card>
        ))}
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
                  ? obj.metrics.reduce((sum, m) => sum + ((m.current - m.baseline) / (m.target - m.baseline)) * 100, 0) / obj.metrics.length
                  : 0
                return (
                  <div key={obj.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate flex-1">{obj.description}</span>
                      <Badge variant="outline" className="font-mono shrink-0 ml-2">{Math.round(avgProgress)}%</Badge>
                    </div>
                    <Progress value={Math.max(0, Math.min(100, avgProgress))} className="h-2" />
                  </div>
                )
              })
            )}
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
            {OBJECTIVE_CATEGORIES.map((category) => {
              const objectives = allObjectives.filter(obj => obj.category === category)
              const categoryMetrics = objectives.flatMap(obj => obj.metrics)
              const avgProgress = categoryMetrics.length > 0
                ? categoryMetrics.reduce((sum, m) => sum + ((m.current - m.baseline) / (m.target - m.baseline)) * 100, 0) / categoryMetrics.length
                : 0
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{category} Goals</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{categoryMetrics.length} metrics</span>
                      <Badge variant="outline" className="font-mono">{Math.round(avgProgress)}%</Badge>
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
                  <Badge variant="outline" className={`capitalize ${statusColors[proj.status]}`}>
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
