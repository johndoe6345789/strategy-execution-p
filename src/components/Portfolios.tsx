import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { FolderOpen, ChartBar, Warning, TrendUp } from '@phosphor-icons/react'
import type { Initiative, Portfolio as PortfolioType } from '@/types'

const portfolioDefinitions: PortfolioType[] = [
  {
    type: 'operational-excellence',
    name: 'Operational Excellence',
    description: 'Lean, Hoshin Kanri, and continuous improvement initiatives',
    capacity: 100,
    utilized: 0,
  },
  {
    type: 'ma',
    name: 'M&A',
    description: 'Merger and acquisition integration programs',
    capacity: 100,
    utilized: 0,
  },
  {
    type: 'financial-transformation',
    name: 'Financial Transformation',
    description: 'Finance operations and systems modernization',
    capacity: 100,
    utilized: 0,
  },
  {
    type: 'esg',
    name: 'ESG',
    description: 'Environmental, Social, and Governance programs',
    capacity: 100,
    utilized: 0,
  },
  {
    type: 'innovation',
    name: 'Innovation',
    description: 'New products, services, and business models',
    capacity: 100,
    utilized: 0,
  },
]

export default function Portfolios() {
  const [initiatives] = useKV<Initiative[]>('initiatives', [])

  const getPortfolioMetrics = (portfolioType: string) => {
    const portfolioInitiatives = initiatives?.filter(i => i.portfolio === portfolioType) || []
    const totalBudget = portfolioInitiatives.reduce((sum, i) => sum + i.budget, 0)
    const avgProgress = portfolioInitiatives.length > 0
      ? portfolioInitiatives.reduce((sum, i) => sum + i.progress, 0) / portfolioInitiatives.length
      : 0
    
    const statusCounts = {
      onTrack: portfolioInitiatives.filter(i => i.status === 'on-track').length,
      atRisk: portfolioInitiatives.filter(i => i.status === 'at-risk').length,
      blocked: portfolioInitiatives.filter(i => i.status === 'blocked').length,
    }

    const capacityUsed = portfolioInitiatives.length * 20

    return {
      count: portfolioInitiatives.length,
      totalBudget,
      avgProgress: Math.round(avgProgress),
      statusCounts,
      capacityUsed: Math.min(capacityUsed, 100),
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Portfolio Management</h2>
          <p className="text-muted-foreground mt-1">Strategic portfolio analysis and governance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {portfolioDefinitions.map((portfolio) => {
          const metrics = getPortfolioMetrics(portfolio.type)
          const hasRisks = metrics.statusCounts.atRisk > 0 || metrics.statusCounts.blocked > 0

          return (
            <Card 
              key={portfolio.type}
              className={`hover:shadow-lg transition-all ${hasRisks ? 'border-l-4 border-l-warning' : ''}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="rounded-lg bg-primary/10 p-3">
                        <FolderOpen size={24} weight="fill" className="text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{portfolio.name}</CardTitle>
                        <CardDescription className="mt-1">{portfolio.description}</CardDescription>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline" className="font-mono text-base px-3 py-1">
                      {metrics.count} {metrics.count === 1 ? 'Initiative' : 'Initiatives'}
                    </Badge>
                    {hasRisks && (
                      <Badge className="bg-warning text-white gap-1.5">
                        <Warning size={14} weight="fill" />
                        Attention Required
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wide">
                      <ChartBar size={14} />
                      <span>Total Budget</span>
                    </div>
                    <p className="text-2xl font-bold font-mono text-accent">
                      ${(metrics.totalBudget / 1000000).toFixed(1)}M
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wide">
                      <TrendUp size={14} />
                      <span>Avg Progress</span>
                    </div>
                    <p className="text-2xl font-bold font-mono text-accent">
                      {metrics.avgProgress}%
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Status Summary</p>
                    <div className="flex gap-2">
                      {metrics.statusCounts.onTrack > 0 && (
                        <Badge className="bg-success text-white text-xs">
                          {metrics.statusCounts.onTrack} On Track
                        </Badge>
                      )}
                      {metrics.statusCounts.atRisk > 0 && (
                        <Badge className="bg-at-risk text-white text-xs">
                          {metrics.statusCounts.atRisk} At Risk
                        </Badge>
                      )}
                      {metrics.statusCounts.blocked > 0 && (
                        <Badge className="bg-destructive text-white text-xs">
                          {metrics.statusCounts.blocked} Blocked
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Capacity</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-mono font-semibold">
                          {metrics.capacityUsed}%
                        </span>
                        <span className={`text-xs font-medium ${metrics.capacityUsed > 80 ? 'text-warning' : 'text-muted-foreground'}`}>
                          {metrics.capacityUsed > 80 ? 'High utilization' : 'Available'}
                        </span>
                      </div>
                      <Progress value={metrics.capacityUsed} className="h-2" />
                    </div>
                  </div>
                </div>

                {metrics.count === 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No initiatives in this portfolio yet
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg">Portfolio Governance Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-foreground">
          <div className="flex items-start gap-3">
            <span className="text-accent font-bold">•</span>
            <p><span className="font-semibold">Capacity Planning:</span> Each portfolio shows utilization based on active initiatives (estimated 20% capacity per initiative)</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-accent font-bold">•</span>
            <p><span className="font-semibold">Risk Flags:</span> Portfolios with at-risk or blocked initiatives receive attention markers</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-accent font-bold">•</span>
            <p><span className="font-semibold">Resource Balancing:</span> Monitor capacity utilization to avoid portfolio overload and ensure delivery success</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
