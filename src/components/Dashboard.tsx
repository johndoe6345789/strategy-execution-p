import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Target, TrendUp, TrendDown, Minus, CheckCircle, Warning, Link as LinkIcon } from '@phosphor-icons/react'
import type { Initiative, StrategyCard } from '@/types'

export default function Dashboard() {
  const [initiatives] = useKV<Initiative[]>('initiatives', [])
  const [strategyCards] = useKV<StrategyCard[]>('strategy-cards', [])

  const totalInitiatives = initiatives?.length || 0
  const totalBudget = initiatives?.reduce((sum, i) => sum + i.budget, 0) || 0
  const avgProgress = totalInitiatives > 0
    ? Math.round((initiatives?.reduce((sum, i) => sum + i.progress, 0) || 0) / totalInitiatives)
    : 0

  const statusBreakdown = {
    onTrack: initiatives?.filter(i => i.status === 'on-track').length || 0,
    atRisk: initiatives?.filter(i => i.status === 'at-risk').length || 0,
    blocked: initiatives?.filter(i => i.status === 'blocked').length || 0,
    notStarted: initiatives?.filter(i => i.status === 'not-started').length || 0,
    completed: initiatives?.filter(i => i.status === 'completed').length || 0,
  }

  const strategicAlignment = strategyCards?.map(card => {
    const linkedInitiatives = initiatives?.filter(i => i.strategyCardId === card.id) || []
    const totalLinkedBudget = linkedInitiatives.reduce((sum, i) => sum + i.budget, 0)
    const avgLinkedProgress = linkedInitiatives.length > 0
      ? Math.round(linkedInitiatives.reduce((sum, i) => sum + i.progress, 0) / linkedInitiatives.length)
      : 0

    return {
      card,
      initiativeCount: linkedInitiatives.length,
      totalBudget: totalLinkedBudget,
      avgProgress: avgLinkedProgress,
    }
  }) || []

  const kpiMockData = [
    { name: 'Cost Reduction', current: 8.2, target: 10, unit: 'M USD', trend: 'up' as const },
    { name: 'Cycle Time Improvement', current: 18, target: 25, unit: '%', trend: 'up' as const },
    { name: 'Customer Satisfaction', current: 87, target: 90, unit: 'NPS', trend: 'up' as const },
    { name: 'Revenue Growth', current: 12.5, target: 15, unit: '%', trend: 'up' as const },
  ]

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendUp
      case 'down': return TrendDown
      default: return Minus
    }
  }

  const getKPIProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Executive Dashboard</h2>
        <p className="text-muted-foreground mt-1">Real-time view of strategic execution</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs uppercase tracking-wider">Total Initiatives</CardDescription>
            <CardTitle className="text-4xl font-bold font-mono text-accent">{totalInitiatives}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <Badge className="bg-success text-white text-xs">{statusBreakdown.onTrack} On Track</Badge>
              {statusBreakdown.atRisk > 0 && (
                <Badge className="bg-at-risk text-white text-xs">{statusBreakdown.atRisk} At Risk</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs uppercase tracking-wider">Total Investment</CardDescription>
            <CardTitle className="text-4xl font-bold font-mono text-accent">
              ${(totalBudget / 1000000).toFixed(1)}M
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Across {strategyCards?.length || 0} strategic themes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs uppercase tracking-wider">Average Progress</CardDescription>
            <CardTitle className="text-4xl font-bold font-mono text-accent">{avgProgress}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={avgProgress} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs uppercase tracking-wider">Completion Rate</CardDescription>
            <CardTitle className="text-4xl font-bold font-mono text-accent">
              {totalInitiatives > 0 ? Math.round((statusBreakdown.completed / totalInitiatives) * 100) : 0}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {statusBreakdown.completed} of {totalInitiatives} completed
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle size={20} weight="fill" className="text-accent" />
              Initiative Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">On Track</span>
                <div className="flex items-center gap-3">
                  <Progress value={totalInitiatives > 0 ? (statusBreakdown.onTrack / totalInitiatives) * 100 : 0} className="w-32 h-2" />
                  <span className="font-mono font-semibold text-success w-8">{statusBreakdown.onTrack}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">At Risk</span>
                <div className="flex items-center gap-3">
                  <Progress value={totalInitiatives > 0 ? (statusBreakdown.atRisk / totalInitiatives) * 100 : 0} className="w-32 h-2" />
                  <span className="font-mono font-semibold text-at-risk w-8">{statusBreakdown.atRisk}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Blocked</span>
                <div className="flex items-center gap-3">
                  <Progress value={totalInitiatives > 0 ? (statusBreakdown.blocked / totalInitiatives) * 100 : 0} className="w-32 h-2" />
                  <span className="font-mono font-semibold text-destructive w-8">{statusBreakdown.blocked}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Not Started</span>
                <div className="flex items-center gap-3">
                  <Progress value={totalInitiatives > 0 ? (statusBreakdown.notStarted / totalInitiatives) * 100 : 0} className="w-32 h-2" />
                  <span className="font-mono font-semibold text-muted-foreground w-8">{statusBreakdown.notStarted}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completed</span>
                <div className="flex items-center gap-3">
                  <Progress value={totalInitiatives > 0 ? (statusBreakdown.completed / totalInitiatives) * 100 : 0} className="w-32 h-2" />
                  <span className="font-mono font-semibold text-primary w-8">{statusBreakdown.completed}</span>
                </div>
              </div>
            </div>

            {statusBreakdown.atRisk + statusBreakdown.blocked > 0 && (
              <>
                <Separator />
                <div className="flex items-center gap-2 text-sm text-warning">
                  <Warning size={16} weight="fill" />
                  <span className="font-medium">
                    {statusBreakdown.atRisk + statusBreakdown.blocked} {statusBreakdown.atRisk + statusBreakdown.blocked === 1 ? 'initiative requires' : 'initiatives require'} attention
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target size={20} weight="fill" className="text-accent" />
              Key Performance Indicators
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {kpiMockData.map((kpi) => {
              const TrendIcon = getTrendIcon(kpi.trend)
              const progress = getKPIProgress(kpi.current, kpi.target)
              const isOnTarget = progress >= 80

              return (
                <div key={kpi.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{kpi.name}</span>
                    <div className="flex items-center gap-2">
                      <TrendIcon size={16} weight="bold" className={isOnTarget ? 'text-success' : 'text-muted-foreground'} />
                      <span className="font-mono text-sm font-semibold">
                        {kpi.current} / {kpi.target} {kpi.unit}
                      </span>
                    </div>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon size={20} weight="fill" className="text-accent" />
            Strategic Alignment & Traceability
          </CardTitle>
          <CardDescription>
            View how initiatives map to strategic goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          {strategicAlignment.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Create strategy cards to view strategic alignment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {strategicAlignment.map(({ card, initiativeCount, totalBudget, avgProgress }) => (
                <div key={card.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{card.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {card.framework.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </p>
                    </div>
                    <Badge variant="outline" className="font-mono">
                      {initiativeCount} {initiativeCount === 1 ? 'Initiative' : 'Initiatives'}
                    </Badge>
                  </div>

                  {initiativeCount > 0 ? (
                    <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Investment</p>
                        <p className="font-mono font-semibold text-accent">
                          ${(totalBudget / 1000000).toFixed(2)}M
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Avg Progress</p>
                        <p className="font-mono font-semibold text-accent">{avgProgress}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Goals Defined</p>
                        <p className="font-mono font-semibold">{card.goals.length}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-3 border-t">
                      <p className="text-sm text-muted-foreground italic">
                        No initiatives linked yet - create initiatives in the Workbench
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
