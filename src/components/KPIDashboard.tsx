import { useKV } from '@github/spark/hooks'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendUp, TrendDown, Minus, Target, Plus, Warning, CheckCircle, ArrowRight, ChartBar } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Initiative, StrategyCard } from '@/types'

interface KPIMetric {
  id: string
  name: string
  category: 'financial' | 'operational' | 'customer' | 'strategic'
  current: number
  target: number
  baseline: number
  unit: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual'
  owner: string
  linkedInitiatives: string[]
  trend: 'up' | 'down' | 'flat'
  status: 'on-track' | 'at-risk' | 'off-track'
  lastUpdated: string
}

const categoryConfig = {
  financial: { label: 'Financial', color: 'bg-accent', icon: Target },
  operational: { label: 'Operational', color: 'bg-primary', icon: ChartBar },
  customer: { label: 'Customer', color: 'bg-success', icon: CheckCircle },
  strategic: { label: 'Strategic', color: 'bg-secondary', icon: Target }
}

export default function KPIDashboard() {
  const [kpis, setKPIs] = useKV<KPIMetric[]>('kpi-metrics', [])
  const [initiatives] = useKV<Initiative[]>('initiatives', [])
  const [strategyCards] = useKV<StrategyCard[]>('strategy-cards', [])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedKPI, setSelectedKPI] = useState<KPIMetric | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'operational' as const,
    current: 0,
    target: 0,
    baseline: 0,
    unit: '',
    frequency: 'monthly' as const,
    owner: ''
  })

  const calculateProgress = (baseline: number, current: number, target: number) => {
    if (baseline === target) return 0
    const progress = ((current - baseline) / (target - baseline)) * 100
    return Math.max(0, Math.min(100, progress))
  }

  const getKPIStatus = (current: number, target: number, trend: string): 'on-track' | 'at-risk' | 'off-track' => {
    const progress = (current / target) * 100
    if (progress >= 90) return 'on-track'
    if (progress >= 70) return 'at-risk'
    return 'off-track'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendUp
      case 'down': return TrendDown
      default: return Minus
    }
  }

  const handleAddKPI = () => {
    if (!formData.name || !formData.unit || !formData.owner) {
      toast.error('Please fill in all required fields')
      return
    }

    const trend = formData.current > formData.baseline ? 'up' : formData.current < formData.baseline ? 'down' : 'flat'
    const status = getKPIStatus(formData.current, formData.target, trend)

    const newKPI: KPIMetric = {
      id: `kpi-${Date.now()}`,
      ...formData,
      linkedInitiatives: [],
      trend: trend as 'up' | 'down' | 'flat',
      status,
      lastUpdated: new Date().toISOString()
    }

    setKPIs((current) => [...(current || []), newKPI])
    toast.success('KPI added successfully')
    setIsAddDialogOpen(false)
    resetForm()
  }

  const handleUpdateKPICurrent = (kpiId: string, newValue: number) => {
    setKPIs((current) =>
      (current || []).map(kpi => {
        if (kpi.id === kpiId) {
          const trend = newValue > kpi.current ? 'up' : newValue < kpi.current ? 'down' : 'flat'
          const status = getKPIStatus(newValue, kpi.target, trend)
          return {
            ...kpi,
            current: newValue,
            trend: trend as 'up' | 'down' | 'flat',
            status,
            lastUpdated: new Date().toISOString()
          }
        }
        return kpi
      })
    )
    toast.success('KPI updated')
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'operational',
      current: 0,
      target: 0,
      baseline: 0,
      unit: '',
      frequency: 'monthly',
      owner: ''
    })
  }

  const filteredKPIs = selectedCategory === 'all'
    ? (kpis || [])
    : (kpis || []).filter(kpi => kpi.category === selectedCategory)

  const categoryStats = Object.keys(categoryConfig).map(cat => {
    const categoryKPIs = (kpis || []).filter(kpi => kpi.category === cat)
    const onTrack = categoryKPIs.filter(kpi => kpi.status === 'on-track').length
    const total = categoryKPIs.length
    return {
      category: cat,
      total,
      onTrack,
      percentage: total > 0 ? Math.round((onTrack / total) * 100) : 0
    }
  })

  const overallOnTrack = (kpis || []).filter(kpi => kpi.status === 'on-track').length
  const overallAtRisk = (kpis || []).filter(kpi => kpi.status === 'at-risk').length
  const overallOffTrack = (kpis || []).filter(kpi => kpi.status === 'off-track').length

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">KPI & Metrics Dashboard</h2>
          <p className="text-muted-foreground mt-2">
            Real-time tracking of key performance indicators across all strategic initiatives
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} weight="bold" />
              Add KPI
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New KPI</DialogTitle>
              <DialogDescription>
                Define a new key performance indicator to track
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="kpi-name">KPI Name *</Label>
                <Input
                  id="kpi-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Cost Reduction"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="kpi-category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger id="kpi-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="kpi-frequency">Frequency</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value: any) => setFormData({ ...formData, frequency: value })}
                  >
                    <SelectTrigger id="kpi-frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="kpi-baseline">Baseline</Label>
                  <Input
                    id="kpi-baseline"
                    type="number"
                    step="0.01"
                    value={formData.baseline}
                    onChange={(e) => setFormData({ ...formData, baseline: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="kpi-current">Current</Label>
                  <Input
                    id="kpi-current"
                    type="number"
                    step="0.01"
                    value={formData.current}
                    onChange={(e) => setFormData({ ...formData, current: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="kpi-target">Target</Label>
                  <Input
                    id="kpi-target"
                    type="number"
                    step="0.01"
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="kpi-unit">Unit *</Label>
                  <Input
                    id="kpi-unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g., %, $M, NPS, days"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="kpi-owner">Owner *</Label>
                  <Input
                    id="kpi-owner"
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                    placeholder="e.g., Jane Smith"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddKPI}>Add KPI</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs uppercase tracking-wider">Total KPIs</CardDescription>
            <CardTitle className="text-4xl font-bold font-mono text-accent">{(kpis || []).length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Across {Object.keys(categoryConfig).length} categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs uppercase tracking-wider">On Track</CardDescription>
            <CardTitle className="text-4xl font-bold font-mono text-success">{overallOnTrack}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} weight="fill" className="text-success" />
              <span className="text-sm text-muted-foreground">Meeting targets</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs uppercase tracking-wider">At Risk</CardDescription>
            <CardTitle className="text-4xl font-bold font-mono text-at-risk">{overallAtRisk}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Warning size={16} weight="fill" className="text-at-risk" />
              <span className="text-sm text-muted-foreground">Needs attention</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs uppercase tracking-wider">Off Track</CardDescription>
            <CardTitle className="text-4xl font-bold font-mono text-destructive">{overallOffTrack}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Target size={16} weight="fill" className="text-destructive" />
              <span className="text-sm text-muted-foreground">Requires action</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {categoryStats.map(({ category, total, onTrack, percentage }) => {
          const config = categoryConfig[category as keyof typeof categoryConfig]
          const Icon = config.icon
          return (
            <Card 
              key={category}
              className="cursor-pointer hover:border-accent transition-colors"
              onClick={() => setSelectedCategory(category)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className={`${config.color} p-2 rounded-md`}>
                    <Icon size={16} weight="bold" className="text-white" />
                  </div>
                  <CardTitle className="text-sm font-semibold">{config.label}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{onTrack}/{total} on track</span>
                    <span className="font-semibold">{percentage}%</span>
                  </div>
                  <Progress value={percentage} className="h-1.5" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All KPIs</TabsTrigger>
          {Object.entries(categoryConfig).map(([key, config]) => (
            <TabsTrigger key={key} value={key} className="text-xs">
              {config.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid gap-4">
            {filteredKPIs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Target size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No KPIs defined yet</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                    Add Your First KPI
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredKPIs.map((kpi) => {
                const TrendIcon = getTrendIcon(kpi.trend)
                const progress = calculateProgress(kpi.baseline, kpi.current, kpi.target)
                const config = categoryConfig[kpi.category]
                
                return (
                  <Card key={kpi.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold">{kpi.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {config.label}
                                </Badge>
                                <Badge variant="outline" className="text-xs font-mono">
                                  {kpi.frequency}
                                </Badge>
                                <Badge
                                  className={`text-xs ${
                                    kpi.status === 'on-track' ? 'bg-success text-white' :
                                    kpi.status === 'at-risk' ? 'bg-at-risk text-white' :
                                    'bg-destructive text-white'
                                  }`}
                                >
                                  {kpi.status.replace('-', ' ')}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2 justify-end mb-1">
                                <span className="text-3xl font-bold font-mono">{kpi.current}</span>
                                <span className="text-sm text-muted-foreground">{kpi.unit}</span>
                                <TrendIcon 
                                  size={24} 
                                  weight="bold"
                                  className={
                                    kpi.trend === 'up' ? 'text-success' :
                                    kpi.trend === 'down' ? 'text-destructive' :
                                    'text-muted-foreground'
                                  }
                                />
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Target: {kpi.target} {kpi.unit}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Progress to Target</span>
                              <span className="font-semibold font-mono">{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Baseline: {kpi.baseline} {kpi.unit}</span>
                              <span>Owner: {kpi.owner}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setSelectedKPI(kpi)}>
                                  Update Value
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Update KPI Value</DialogTitle>
                                  <DialogDescription>{kpi.name}</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="update-current">Current Value</Label>
                                    <Input
                                      id="update-current"
                                      type="number"
                                      step="0.01"
                                      defaultValue={kpi.current}
                                      onBlur={(e) => {
                                        const newValue = parseFloat(e.target.value) || 0
                                        if (newValue !== kpi.current) {
                                          handleUpdateKPICurrent(kpi.id, newValue)
                                        }
                                      }}
                                    />
                                  </div>
                                  <div className="text-sm text-muted-foreground space-y-1">
                                    <p>Target: {kpi.target} {kpi.unit}</p>
                                    <p>Baseline: {kpi.baseline} {kpi.unit}</p>
                                    <p className="text-xs">Last updated: {new Date(kpi.lastUpdated).toLocaleDateString()}</p>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            {kpi.linkedInitiatives.length > 0 && (
                              <Button variant="ghost" size="sm" className="gap-2">
                                <ArrowRight size={14} />
                                View {kpi.linkedInitiatives.length} Linked Initiative{kpi.linkedInitiatives.length > 1 ? 's' : ''}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
