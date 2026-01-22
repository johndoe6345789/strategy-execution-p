import { useKV } from '@github/spark/hooks'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  ChartLine, 
  Target, 
  Rocket, 
  TrendUp, 
  ChartBar,
  FolderOpen,
  CurrencyDollar,
  Calendar,
  Users
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { StrategyCard, Initiative, PortfolioType } from '../types'

type ViewLevel = 'enterprise' | 'portfolio' | 'strategy' | 'initiative'

interface BreadcrumbItem {
  level: ViewLevel
  label: string
  id?: string
}

export default function DrillDownReporting() {
  const [strategyCards] = useKV<StrategyCard[]>('strategy-cards', [])
  const [initiatives] = useKV<Initiative[]>('initiatives', [])
  
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { level: 'enterprise', label: 'Enterprise Overview' }
  ])

  const currentLevel = breadcrumbs[breadcrumbs.length - 1].level
  const currentId = breadcrumbs[breadcrumbs.length - 1].id

  const navigateTo = (level: ViewLevel, label: string, id?: string) => {
    const existingIndex = breadcrumbs.findIndex(b => b.level === level && b.id === id)
    if (existingIndex >= 0) {
      setBreadcrumbs(breadcrumbs.slice(0, existingIndex + 1))
    } else {
      setBreadcrumbs([...breadcrumbs, { level, label, id }])
    }
  }

  const goBack = () => {
    if (breadcrumbs.length > 1) {
      setBreadcrumbs(breadcrumbs.slice(0, -1))
    }
  }

  const portfolios: { type: PortfolioType; name: string; color: string }[] = [
    { type: 'operational-excellence', name: 'Operational Excellence', color: 'bg-blue-500' },
    { type: 'ma', name: 'M&A Integration', color: 'bg-purple-500' },
    { type: 'financial-transformation', name: 'Financial Transformation', color: 'bg-green-500' },
    { type: 'esg', name: 'ESG Initiatives', color: 'bg-teal-500' },
    { type: 'innovation', name: 'Innovation & Growth', color: 'bg-orange-500' }
  ]

  const getPortfolioInitiatives = (portfolioType: PortfolioType) => {
    return (initiatives || []).filter(i => i.portfolio === portfolioType)
  }

  const getStrategyInitiatives = (strategyId: string) => {
    return (initiatives || []).filter(i => i.strategyCardId === strategyId)
  }

  const calculatePortfolioMetrics = (portfolioType: PortfolioType) => {
    const portfolioInitiatives = getPortfolioInitiatives(portfolioType)
    const totalBudget = portfolioInitiatives.reduce((sum, i) => sum + (i.budget || 0), 0)
    const avgProgress = portfolioInitiatives.length > 0
      ? portfolioInitiatives.reduce((sum, i) => sum + i.progress, 0) / portfolioInitiatives.length
      : 0
    const onTrack = portfolioInitiatives.filter(i => i.status === 'on-track').length
    const atRisk = portfolioInitiatives.filter(i => i.status === 'at-risk').length
    const blocked = portfolioInitiatives.filter(i => i.status === 'blocked').length

    return {
      total: portfolioInitiatives.length,
      totalBudget,
      avgProgress,
      onTrack,
      atRisk,
      blocked
    }
  }

  const calculateStrategyMetrics = (strategyId: string) => {
    const strategyInitiatives = getStrategyInitiatives(strategyId)
    const totalBudget = strategyInitiatives.reduce((sum, i) => sum + (i.budget || 0), 0)
    const avgProgress = strategyInitiatives.length > 0
      ? strategyInitiatives.reduce((sum, i) => sum + i.progress, 0) / strategyInitiatives.length
      : 0

    return {
      total: strategyInitiatives.length,
      totalBudget,
      avgProgress,
      statusBreakdown: {
        'on-track': strategyInitiatives.filter(i => i.status === 'on-track').length,
        'at-risk': strategyInitiatives.filter(i => i.status === 'at-risk').length,
        'blocked': strategyInitiatives.filter(i => i.status === 'blocked').length,
        'completed': strategyInitiatives.filter(i => i.status === 'completed').length,
        'not-started': strategyInitiatives.filter(i => i.status === 'not-started').length
      }
    }
  }

  const renderEnterpriseView = () => {
    const totalInitiatives = (initiatives || []).length
    const totalStrategies = (strategyCards || []).length
    const totalBudget = (initiatives || []).reduce((sum, i) => sum + (i.budget || 0), 0)
    const avgProgress = totalInitiatives > 0
      ? (initiatives || []).reduce((sum, i) => sum + i.progress, 0) / totalInitiatives
      : 0

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold">Enterprise Overview</h3>
          <p className="text-muted-foreground mt-1">
            Complete view of all strategic initiatives across the organization
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Target size={16} />
                <CardDescription>Strategies</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalStrategies}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Rocket size={16} />
                <CardDescription>Initiatives</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalInitiatives}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CurrencyDollar size={16} />
                <CardDescription>Total Budget</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${(totalBudget / 1000000).toFixed(1)}M</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendUp size={16} />
                <CardDescription>Avg Progress</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{Math.round(avgProgress)}%</div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Portfolios</h4>
          <div className="grid grid-cols-2 gap-4">
            {portfolios.map((portfolio) => {
              const metrics = calculatePortfolioMetrics(portfolio.type)
              return (
                <Card
                  key={portfolio.type}
                  className="cursor-pointer transition-all hover:shadow-lg hover:border-accent"
                  onClick={() => navigateTo('portfolio', portfolio.name, portfolio.type)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`${portfolio.color} p-3 rounded-lg`}>
                        <FolderOpen size={20} weight="bold" className="text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">{portfolio.name}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {metrics.total} initiatives • ${(metrics.totalBudget / 1000000).toFixed(1)}M budget
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold">{Math.round(metrics.avgProgress)}%</span>
                      </div>
                      <Progress value={metrics.avgProgress} className="h-2" />
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant="default" className="bg-green-500">{metrics.onTrack} On Track</Badge>
                        <Badge variant="default" className="bg-warning">{metrics.atRisk} At Risk</Badge>
                        <Badge variant="destructive">{metrics.blocked} Blocked</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Strategy Cards</h4>
          <div className="grid grid-cols-3 gap-4">
            {(strategyCards || []).map((strategy) => {
              const metrics = calculateStrategyMetrics(strategy.id)
              return (
                <Card
                  key={strategy.id}
                  className="cursor-pointer transition-all hover:shadow-lg hover:border-accent"
                  onClick={() => navigateTo('strategy', strategy.title, strategy.id)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{strategy.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {strategy.framework} • {metrics.total} initiatives
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold">{Math.round(metrics.avgProgress)}%</span>
                      </div>
                      <Progress value={metrics.avgProgress} className="h-1.5" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const renderPortfolioView = () => {
    const portfolioType = currentId as PortfolioType
    const portfolio = portfolios.find(p => p.type === portfolioType)
    const portfolioInitiatives = getPortfolioInitiatives(portfolioType)
    const metrics = calculatePortfolioMetrics(portfolioType)

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className={`${portfolio?.color} p-4 rounded-lg`}>
            <FolderOpen size={32} weight="bold" className="text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">{portfolio?.name}</h3>
            <p className="text-muted-foreground">
              {metrics.total} initiatives • ${(metrics.totalBudget / 1000000).toFixed(1)}M budget
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Initiatives</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Avg Progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{Math.round(metrics.avgProgress)}%</div>
              <Progress value={metrics.avgProgress} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Budget</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${(metrics.totalBudget / 1000000).toFixed(1)}M</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Health Status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-green-600">On Track</span>
                  <span className="font-semibold">{metrics.onTrack}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-orange-600">At Risk</span>
                  <span className="font-semibold">{metrics.atRisk}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-red-600">Blocked</span>
                  <span className="font-semibold">{metrics.blocked}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Initiatives</h4>
          <div className="space-y-3">
            {portfolioInitiatives.map((initiative) => (
              <Card
                key={initiative.id}
                className="cursor-pointer transition-all hover:shadow-md hover:border-accent"
                onClick={() => navigateTo('initiative', initiative.title, initiative.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h5 className="font-semibold">{initiative.title}</h5>
                        <Badge variant={
                          initiative.status === 'on-track' ? 'default' :
                          initiative.status === 'at-risk' ? 'secondary' :
                          initiative.status === 'blocked' ? 'destructive' :
                          initiative.status === 'completed' ? 'default' : 'outline'
                        }>
                          {initiative.status}
                        </Badge>
                        <Badge variant="outline">{initiative.priority}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{initiative.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          <span>{initiative.owner}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{new Date(initiative.startDate).toLocaleDateString()} - {new Date(initiative.endDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CurrencyDollar size={14} />
                          <span>${(initiative.budget / 1000000).toFixed(1)}M</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-accent mb-1">{initiative.progress}%</div>
                      <Progress value={initiative.progress} className="h-2 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderStrategyView = () => {
    const strategy = (strategyCards || []).find(s => s.id === currentId)
    if (!strategy) return <div>Strategy not found</div>

    const strategyInitiatives = getStrategyInitiatives(strategy.id)
    const metrics = calculateStrategyMetrics(strategy.id)

    return (
      <div className="space-y-6">
        <Card className="border-2 border-accent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target size={24} weight="bold" className="text-accent" />
                  <CardTitle className="text-2xl">{strategy.title}</CardTitle>
                </div>
                <Badge>{strategy.framework}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="goals">Goals</TabsTrigger>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold">Vision</Label>
                  <p className="text-sm text-muted-foreground mt-1">{strategy.vision}</p>
                </div>
              </TabsContent>
              <TabsContent value="goals" className="space-y-2">
                {strategy.goals.map((goal, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="mt-1 w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-semibold">
                      {index + 1}
                    </div>
                    <p className="text-sm flex-1">{goal}</p>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="metrics" className="space-y-2">
                {strategy.metrics.map((metric, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <ChartLine size={16} className="text-accent" />
                    <p className="text-sm">{metric}</p>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Linked Initiatives</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Avg Progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{Math.round(metrics.avgProgress)}%</div>
              <Progress value={metrics.avgProgress} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Investment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${(metrics.totalBudget / 1000000).toFixed(1)}M</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Status Distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>On Track</span>
                  <span className="font-semibold">{metrics.statusBreakdown['on-track']}</span>
                </div>
                <div className="flex justify-between">
                  <span>At Risk</span>
                  <span className="font-semibold">{metrics.statusBreakdown['at-risk']}</span>
                </div>
                <div className="flex justify-between">
                  <span>Blocked</span>
                  <span className="font-semibold">{metrics.statusBreakdown.blocked}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Initiative Details</h4>
          <div className="space-y-3">
            {strategyInitiatives.map((initiative) => (
              <Card
                key={initiative.id}
                className="cursor-pointer transition-all hover:shadow-md hover:border-accent"
                onClick={() => navigateTo('initiative', initiative.title, initiative.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h5 className="font-semibold">{initiative.title}</h5>
                        <Badge variant={
                          initiative.status === 'on-track' ? 'default' :
                          initiative.status === 'at-risk' ? 'secondary' :
                          initiative.status === 'blocked' ? 'destructive' :
                          initiative.status === 'completed' ? 'default' : 'outline'
                        }>
                          {initiative.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{initiative.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          <span>{initiative.owner}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FolderOpen size={14} />
                          <span>{portfolios.find(p => p.type === initiative.portfolio)?.name}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-accent mb-1">{initiative.progress}%</div>
                      <Progress value={initiative.progress} className="h-2 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderInitiativeView = () => {
    const initiative = (initiatives || []).find(i => i.id === currentId)
    if (!initiative) return <div>Initiative not found</div>

    const strategy = (strategyCards || []).find(s => s.id === initiative.strategyCardId)
    const portfolio = portfolios.find(p => p.type === initiative.portfolio)

    return (
      <div className="space-y-6">
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Rocket size={32} weight="bold" className="text-accent" />
              <CardTitle className="text-2xl">{initiative.title}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={
                initiative.status === 'on-track' ? 'default' :
                initiative.status === 'at-risk' ? 'secondary' :
                initiative.status === 'blocked' ? 'destructive' :
                initiative.status === 'completed' ? 'default' : 'outline'
              }>
                {initiative.status}
              </Badge>
              <Badge variant="outline">{initiative.priority} priority</Badge>
              <Badge className={portfolio?.color}>{portfolio?.name}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-sm font-semibold">Description</Label>
              <p className="text-sm text-muted-foreground mt-1">{initiative.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-semibold">Linked Strategy</Label>
                {strategy ? (
                  <Button
                    variant="outline"
                    className="w-full mt-2 justify-start"
                    onClick={() => navigateTo('strategy', strategy.title, strategy.id)}
                  >
                    <Target size={16} className="mr-2" />
                    {strategy.title}
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">No strategy linked</p>
                )}
              </div>

              <div>
                <Label className="text-sm font-semibold">Portfolio</Label>
                {portfolio && (
                  <Button
                    variant="outline"
                    className="w-full mt-2 justify-start"
                    onClick={() => navigateTo('portfolio', portfolio.name, portfolio.type)}
                  >
                    <FolderOpen size={16} className="mr-2" />
                    {portfolio.name}
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs">Progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{initiative.progress}%</div>
                  <Progress value={initiative.progress} className="h-2 mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs">Owner</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Users size={20} className="text-muted-foreground" />
                    <span className="text-sm font-medium">{initiative.owner}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs">Timeline</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xs">
                    <div>{new Date(initiative.startDate).toLocaleDateString()}</div>
                    <div className="text-muted-foreground">to</div>
                    <div>{new Date(initiative.endDate).toLocaleDateString()}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs">Budget</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">${(initiative.budget / 1000000).toFixed(1)}M</div>
                </CardContent>
              </Card>
            </div>

            {initiative.kpis && initiative.kpis.length > 0 && (
              <div>
                <Label className="text-sm font-semibold mb-3 block">Key Performance Indicators</Label>
                <div className="grid grid-cols-2 gap-3">
                  {initiative.kpis.map((kpi) => (
                    <Card key={kpi.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="text-sm font-medium">{kpi.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">Current:</span>
                              <span className="text-sm font-semibold">{kpi.current} {kpi.unit}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Target:</span>
                              <span className="text-sm">{kpi.target} {kpi.unit}</span>
                            </div>
                          </div>
                          <Badge variant={kpi.trend === 'up' ? 'default' : kpi.trend === 'down' ? 'destructive' : 'secondary'}>
                            {kpi.trend}
                          </Badge>
                        </div>
                        <Progress value={(kpi.current / kpi.target) * 100} className="h-2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Drill-Down Reporting</h2>
        <p className="text-muted-foreground mt-2">
          Navigate from enterprise level to detailed project information
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChartBar size={20} weight="bold" className="text-accent" />
              <CardTitle className="text-base">Navigation</CardTitle>
            </div>
            {breadcrumbs.length > 1 && (
              <Button variant="outline" size="sm" onClick={goBack} className="gap-2">
                <ArrowLeft size={16} />
                Back
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 flex-wrap">
            {breadcrumbs.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                {index > 0 && <span className="text-muted-foreground">/</span>}
                <Button
                  variant={index === breadcrumbs.length - 1 ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    if (index < breadcrumbs.length - 1) {
                      setBreadcrumbs(breadcrumbs.slice(0, index + 1))
                    }
                  }}
                >
                  {item.label}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {currentLevel === 'enterprise' && renderEnterpriseView()}
      {currentLevel === 'portfolio' && renderPortfolioView()}
      {currentLevel === 'strategy' && renderStrategyView()}
      {currentLevel === 'initiative' && renderInitiativeView()}
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("text-sm font-medium", className)}>{children}</div>
}
