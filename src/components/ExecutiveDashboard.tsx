import { useKV } from '@github/spark/hooks'
import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  Target, 
  TrendUp, 
  TrendDown, 
  CheckCircle, 
  Warning, 
  CurrencyDollar,
  ChartBar,
  Users,
  Lightning,
  ArrowUp,
  ArrowDown
} from '@phosphor-icons/react'
import type { Initiative, StrategyCard } from '@/types'

interface FinancialOutcome {
  plannedAmount: number
  actualAmount: number
  status: string
}

export default function ExecutiveDashboard() {
  const [strategyCards] = useKV<StrategyCard[]>('strategy-cards', [])
  const [initiatives] = useKV<Initiative[]>('initiatives', [])
  const [financialOutcomes] = useKV<FinancialOutcome[]>('financial-outcomes', [])
  const [objectives] = useKV<any[]>('okr-objectives', [])

  const stats = useMemo(() => {
    const totalInitiatives = initiatives?.length || 0
    const completedInitiatives = initiatives?.filter(i => i.status === 'completed').length || 0
    const atRiskInitiatives = initiatives?.filter(i => i.status === 'at-risk' || i.status === 'blocked').length || 0
    const onTrackInitiatives = initiatives?.filter(i => i.status === 'on-track').length || 0

    const totalPlanned = financialOutcomes?.reduce((sum, o) => sum + o.plannedAmount, 0) || 0
    const totalRealized = financialOutcomes?.filter(o => o.status === 'realized' || o.status === 'validated')
      .reduce((sum, o) => sum + o.actualAmount, 0) || 0

    const avgProgress = initiatives?.length ? 
      initiatives.reduce((sum, i) => sum + i.progress, 0) / initiatives.length : 0

    const totalObjectives = objectives?.length || 0
    const achievedObjectives = objectives?.filter(o => o.status === 'achieved').length || 0

    return {
      strategies: strategyCards?.length || 0,
      initiatives: totalInitiatives,
      completedInitiatives,
      atRiskInitiatives,
      onTrackInitiatives,
      objectives: totalObjectives,
      achievedObjectives,
      avgProgress: Math.round(avgProgress),
      completionRate: totalInitiatives > 0 ? Math.round((completedInitiatives / totalInitiatives) * 100) : 0,
      financialPlanned: totalPlanned,
      financialRealized: totalRealized,
      financialRealizationRate: totalPlanned > 0 ? Math.round((totalRealized / totalPlanned) * 100) : 0
    }
  }, [strategyCards, initiatives, financialOutcomes, objectives])

  const portfolioBreakdown = useMemo(() => {
    const portfolios = initiatives?.reduce((acc, init) => {
      const key = init.portfolio
      if (!acc[key]) {
        acc[key] = {
          total: 0,
          completed: 0,
          atRisk: 0,
          onTrack: 0,
          budget: 0,
          progress: []
        }
      }
      acc[key].total++
      if (init.status === 'completed') acc[key].completed++
      if (init.status === 'at-risk' || init.status === 'blocked') acc[key].atRisk++
      if (init.status === 'on-track') acc[key].onTrack++
      acc[key].budget += init.budget || 0
      acc[key].progress.push(init.progress)
      return acc
    }, {} as Record<string, any>) || {}

    return Object.entries(portfolios).map(([name, data]) => ({
      name: name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      ...data,
      avgProgress: data.progress.length > 0 ? Math.round(data.progress.reduce((a: number, b: number) => a + b, 0) / data.progress.length) : 0
    }))
  }, [initiatives])

  const recentActivity = useMemo(() => {
    const items: any[] = []
    
    initiatives?.slice(-5).reverse().forEach(init => {
      items.push({
        type: 'initiative',
        title: init.title,
        status: init.status,
        date: init.startDate,
        priority: init.priority
      })
    })

    return items.slice(0, 8)
  }, [initiatives])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const portfolioColors: Record<string, string> = {
    'operational-excellence': 'bg-blue-500',
    'ma': 'bg-purple-500',
    'financial-transformation': 'bg-green-500',
    'esg': 'bg-teal-500',
    'innovation': 'bg-orange-500'
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Executive Dashboard</h2>
        <p className="text-muted-foreground mt-2">
          High-level view of strategic performance and progress
        </p>
      </div>

      <div className="grid grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Strategy Cards</CardTitle>
              <Target size={20} className="text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.strategies}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Initiatives</CardTitle>
              <Lightning size={20} className="text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.initiatives}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completedInitiatives} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">OKRs</CardTitle>
              <CheckCircle size={20} className="text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.objectives}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.achievedObjectives} achieved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Progress</CardTitle>
              <ChartBar size={20} className="text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.avgProgress}%</div>
            <Progress value={stats.avgProgress} className="h-1.5 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">On Track</CardTitle>
              <TrendUp size={20} className="text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{stats.onTrackInitiatives}</div>
            <p className="text-xs text-muted-foreground mt-1">initiatives</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">At Risk</CardTitle>
              <Warning size={20} className="text-at-risk" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-at-risk">{stats.atRiskInitiatives}</div>
            <p className="text-xs text-muted-foreground mt-1">need attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Financial Value Realization</CardTitle>
            <CardDescription>Planned vs actual financial outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Planned Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.financialPlanned)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Realized Value</p>
                  <p className="text-2xl font-bold text-success">{formatCurrency(stats.financialRealized)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Realization Rate</p>
                  <p className="text-2xl font-bold text-accent">{stats.financialRealizationRate}%</p>
                </div>
              </div>
              <Progress value={stats.financialRealizationRate} className="h-3" />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CurrencyDollar size={16} />
                <span>
                  {formatCurrency(stats.financialPlanned - stats.financialRealized)} remaining to realize
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Initiative Health</CardTitle>
            <CardDescription>Status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                  <span className="text-sm">On Track</span>
                </div>
                <span className="font-semibold">{stats.onTrackInitiatives}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-at-risk"></div>
                  <span className="text-sm">At Risk</span>
                </div>
                <span className="font-semibold">{stats.atRiskInitiatives}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent"></div>
                  <span className="text-sm">Completed</span>
                </div>
                <span className="font-semibold">{stats.completedInitiatives}</span>
              </div>
              <Separator className="my-3" />
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>Completion Rate</span>
                <span className="text-accent">{stats.completionRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
          <CardDescription>Progress and health by strategic portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {portfolioBreakdown.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No portfolio data available</p>
            ) : (
              portfolioBreakdown.map((portfolio) => (
                <div key={portfolio.name} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${portfolioColors[portfolio.name.toLowerCase().replace(/ /g, '-')] || 'bg-gray-500'}`}></div>
                      <h4 className="font-semibold">{portfolio.name}</h4>
                      <Badge variant="secondary">{portfolio.total} initiatives</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-right">
                        <p className="text-muted-foreground">Budget</p>
                        <p className="font-semibold">{formatCurrency(portfolio.budget)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">Progress</p>
                        <p className="font-semibold">{portfolio.avgProgress}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-success" weight="fill" />
                      <span>{portfolio.onTrack} on track</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Warning size={16} className="text-at-risk" weight="fill" />
                      <span>{portfolio.atRisk} at risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target size={16} className="text-accent" weight="fill" />
                      <span>{portfolio.completed} completed</span>
                    </div>
                  </div>
                  <Progress value={portfolio.avgProgress} className="h-2" />
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates across initiatives</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No recent activity</p>
            ) : (
              recentActivity.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      item.status === 'completed' ? 'bg-success' :
                      item.status === 'on-track' ? 'bg-accent' :
                      item.status === 'at-risk' || item.status === 'blocked' ? 'bg-at-risk' :
                      'bg-muted'
                    }`}></div>
                    <div>
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.type === 'initiative' ? 'Initiative' : 'Activity'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={
                      item.priority === 'critical' ? 'destructive' :
                      item.priority === 'high' ? 'default' : 'secondary'
                    }>
                      {item.priority}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
