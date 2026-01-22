import { useKV } from '@github/spark/hooks'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  GlobeHemisphereWest,
  ChartBar,
  TrendUp,
  CurrencyDollar,
  Users,
  Target,
  ArrowsLeftRight,
  Check
} from '@phosphor-icons/react'
import type { Initiative, StrategyCard } from '../types'

interface Region {
  id: string
  name: string
  code: string
  timezone: string
  currency: string
  color: string
}

const regions: Region[] = [
  { id: 'na', name: 'North America', code: 'NA', timezone: 'America/New_York', currency: 'USD', color: 'bg-blue-500' },
  { id: 'emea', name: 'Europe, Middle East & Africa', code: 'EMEA', timezone: 'Europe/London', currency: 'EUR', color: 'bg-purple-500' },
  { id: 'apac', name: 'Asia Pacific', code: 'APAC', timezone: 'Asia/Tokyo', currency: 'JPY', color: 'bg-green-500' },
  { id: 'latam', name: 'Latin America', code: 'LATAM', timezone: 'America/Sao_Paulo', currency: 'BRL', color: 'bg-orange-500' },
  { id: 'global', name: 'Global', code: 'GLOBAL', timezone: 'UTC', currency: 'USD', color: 'bg-accent' }
]

interface RegionalInitiative extends Initiative {
  region: string
}

export default function MultiRegionReporting() {
  const [initiatives] = useKV<Initiative[]>('initiatives', [])
  const [strategyCards] = useKV<StrategyCard[]>('strategy-cards', [])
  const [selectedRegion, setSelectedRegion] = useState<string>('all')
  const [comparisonMode, setComparisonMode] = useState(false)

  const regionalInitiatives = (initiatives || []).map(initiative => ({
    ...initiative,
    region: regions[Math.floor(Math.random() * (regions.length - 1))].id
  } as RegionalInitiative))

  const getRegionalMetrics = (regionId: string) => {
    const regionInits = regionId === 'all' 
      ? regionalInitiatives 
      : regionalInitiatives.filter(i => i.region === regionId)

    const totalBudget = regionInits.reduce((sum, i) => sum + (i.budget || 0), 0)
    const avgProgress = regionInits.length > 0
      ? regionInits.reduce((sum, i) => sum + i.progress, 0) / regionInits.length
      : 0
    
    return {
      total: regionInits.length,
      totalBudget,
      avgProgress,
      onTrack: regionInits.filter(i => i.status === 'on-track').length,
      atRisk: regionInits.filter(i => i.status === 'at-risk').length,
      blocked: regionInits.filter(i => i.status === 'blocked').length,
      completed: regionInits.filter(i => i.status === 'completed').length,
      notStarted: regionInits.filter(i => i.status === 'not-started').length
    }
  }

  const renderRegionOverview = (region: Region) => {
    const metrics = getRegionalMetrics(region.id)
    
    return (
      <Card key={region.id} className="hover:shadow-lg transition-all">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`${region.color} p-3 rounded-lg`}>
              <GlobeHemisphereWest size={24} weight="bold" className="text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base">{region.name}</CardTitle>
              <CardDescription className="text-xs mt-1">
                {region.code} • {region.timezone} • {region.currency}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-muted-foreground">Initiatives</div>
              <div className="text-2xl font-bold">{metrics.total}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Budget ({region.currency})</div>
              <div className="text-2xl font-bold">
                {region.currency === 'USD' && '$'}
                {region.currency === 'EUR' && '€'}
                {region.currency === 'JPY' && '¥'}
                {region.currency === 'BRL' && 'R$'}
                {(metrics.totalBudget / 1000000).toFixed(1)}M
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Avg Progress</span>
              <span className="font-semibold">{Math.round(metrics.avgProgress)}%</span>
            </div>
            <Progress value={metrics.avgProgress} className="h-2" />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="default" className="bg-green-500 text-xs">
              {metrics.onTrack} On Track
            </Badge>
            <Badge variant="default" className="bg-warning text-xs">
              {metrics.atRisk} At Risk
            </Badge>
            <Badge variant="destructive" className="text-xs">
              {metrics.blocked} Blocked
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderComparisonView = () => {
    const regionData = regions.slice(0, -1).map(region => ({
      region,
      metrics: getRegionalMetrics(region.id)
    }))

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold mb-2">Cross-Region Comparison</h3>
          <p className="text-sm text-muted-foreground">
            Compare performance metrics across all regional units
          </p>
        </div>

        <div className="grid grid-cols-5 gap-4">
          {regionData.map(({ region, metrics }) => (
            <Card key={region.id}>
              <CardHeader className="pb-3">
                <div className={`${region.color} p-2 rounded-md inline-flex w-fit mb-2`}>
                  <GlobeHemisphereWest size={20} weight="bold" className="text-white" />
                </div>
                <CardTitle className="text-sm">{region.code}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Initiatives</span>
                    <span className="font-semibold">{metrics.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">{Math.round(metrics.avgProgress)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">On Track</span>
                    <span className="font-semibold text-green-600">{metrics.onTrack}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">At Risk</span>
                    <span className="font-semibold text-orange-600">{metrics.atRisk}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Initiative Distribution by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {regionData.map(({ region, metrics }) => (
                <div key={region.id}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`${region.color} px-2 py-1 rounded text-white text-xs font-semibold`}>
                      {region.code}
                    </div>
                    <span className="text-sm font-medium">{region.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{metrics.total} initiatives</span>
                  </div>
                  <div className="flex gap-1 h-8">
                    <div 
                      className="bg-green-500 rounded flex items-center justify-center text-xs text-white font-semibold"
                      style={{ width: `${(metrics.onTrack / metrics.total) * 100}%` }}
                    >
                      {metrics.onTrack > 0 && metrics.onTrack}
                    </div>
                    <div 
                      className="bg-warning rounded flex items-center justify-center text-xs text-white font-semibold"
                      style={{ width: `${(metrics.atRisk / metrics.total) * 100}%` }}
                    >
                      {metrics.atRisk > 0 && metrics.atRisk}
                    </div>
                    <div 
                      className="bg-destructive rounded flex items-center justify-center text-xs text-white font-semibold"
                      style={{ width: `${(metrics.blocked / metrics.total) * 100}%` }}
                    >
                      {metrics.blocked > 0 && metrics.blocked}
                    </div>
                    <div 
                      className="bg-primary rounded flex items-center justify-center text-xs text-white font-semibold"
                      style={{ width: `${(metrics.completed / metrics.total) * 100}%` }}
                    >
                      {metrics.completed > 0 && metrics.completed}
                    </div>
                    <div 
                      className="bg-muted rounded flex items-center justify-center text-xs text-muted-foreground font-semibold"
                      style={{ width: `${(metrics.notStarted / metrics.total) * 100}%` }}
                    >
                      {metrics.notStarted > 0 && metrics.notStarted}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Budget Allocation by Region</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {regionData.map(({ region, metrics }) => (
                <div key={region.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`${region.color} w-3 h-3 rounded-full`}></div>
                      <span className="text-sm font-medium">{region.name}</span>
                    </div>
                    <span className="text-sm font-semibold">
                      {region.currency === 'USD' && '$'}
                      {region.currency === 'EUR' && '€'}
                      {region.currency === 'JPY' && '¥'}
                      {region.currency === 'BRL' && 'R$'}
                      {(metrics.totalBudget / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <Progress 
                    value={(metrics.totalBudget / Math.max(...regionData.map(r => r.metrics.totalBudget))) * 100} 
                    className="h-2" 
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderRegionalView = () => {
    const region = regions.find(r => r.id === selectedRegion)
    if (!region) return null

    const metrics = getRegionalMetrics(region.id)
    const regionInits = regionalInitiatives.filter(i => i.region === region.id)

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className={`${region.color} p-4 rounded-lg`}>
            <GlobeHemisphereWest size={32} weight="bold" className="text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">{region.name}</h3>
            <p className="text-muted-foreground">
              {region.code} • {region.timezone} • Currency: {region.currency}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Target size={16} />
                <CardDescription>Total Initiatives</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CurrencyDollar size={16} />
                <CardDescription>Budget ({region.currency})</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {region.currency === 'USD' && '$'}
                {region.currency === 'EUR' && '€'}
                {region.currency === 'JPY' && '¥'}
                {region.currency === 'BRL' && 'R$'}
                {(metrics.totalBudget / 1000000).toFixed(1)}M
              </div>
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
              <div className="text-3xl font-bold">{Math.round(metrics.avgProgress)}%</div>
              <Progress value={metrics.avgProgress} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ChartBar size={16} />
                <CardDescription>Status Breakdown</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-green-600">On Track</span>
                  <span className="font-semibold">{metrics.onTrack}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-600">At Risk</span>
                  <span className="font-semibold">{metrics.atRisk}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">Blocked</span>
                  <span className="font-semibold">{metrics.blocked}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Regional Initiatives</CardTitle>
            <CardDescription>All initiatives operating in {region.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {regionInits.map((initiative) => (
                <Card key={initiative.id} className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-semibold text-sm">{initiative.title}</h5>
                          <Badge variant={
                            initiative.status === 'on-track' ? 'default' :
                            initiative.status === 'at-risk' ? 'secondary' :
                            initiative.status === 'blocked' ? 'destructive' :
                            initiative.status === 'completed' ? 'default' : 'outline'
                          } className="text-xs">
                            {initiative.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{initiative.description}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users size={12} />
                            <span>{initiative.owner}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CurrencyDollar size={12} />
                            <span>
                              {region.currency === 'USD' && '$'}
                              {region.currency === 'EUR' && '€'}
                              {region.currency === 'JPY' && '¥'}
                              {region.currency === 'BRL' && 'R$'}
                              {(initiative.budget / 1000000).toFixed(1)}M
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-xl font-bold text-accent">{initiative.progress}%</div>
                        <Progress value={initiative.progress} className="h-2 w-20 mt-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderGlobalView = () => {
    const globalMetrics = getRegionalMetrics('all')

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold mb-2">Global Overview</h3>
          <p className="text-muted-foreground">
            Consolidated view of all initiatives across all regions
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <GlobeHemisphereWest size={16} />
                <CardDescription>Total Regions</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{regions.length - 1}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Target size={16} />
                <CardDescription>Global Initiatives</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{globalMetrics.total}</div>
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
              <div className="text-3xl font-bold">{Math.round(globalMetrics.avgProgress)}%</div>
              <Progress value={globalMetrics.avgProgress} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Check size={16} />
                <CardDescription>Health Score</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {Math.round((globalMetrics.onTrack / globalMetrics.total) * 100)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">On Track Rate</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {regions.slice(0, -1).map(region => renderRegionOverview(region))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Multi-Region Reporting</h2>
        <p className="text-muted-foreground mt-2">
          Consistent reporting and analytics across global organizational units
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <GlobeHemisphereWest size={16} />
                <span>Global View</span>
              </div>
            </SelectItem>
            {regions.slice(0, -1).map(region => (
              <SelectItem key={region.id} value={region.id}>
                {region.name} ({region.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={comparisonMode ? 'default' : 'outline'}
          onClick={() => setComparisonMode(!comparisonMode)}
          className="gap-2"
        >
          <ArrowsLeftRight size={16} />
          Compare Regions
        </Button>
      </div>

      {comparisonMode ? renderComparisonView() : (
        selectedRegion === 'all' ? renderGlobalView() : renderRegionalView()
      )}
    </div>
  )
}
