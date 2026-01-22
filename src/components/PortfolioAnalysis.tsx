import { useKV } from '@github/spark/hooks'
import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Plus, Users, TrendUp, Warning, CheckCircle, ArrowRight, GitBranch, Clock } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Initiative } from '@/types'

interface Dependency {
  id: string
  fromInitiativeId: string
  fromInitiativeTitle: string
  toInitiativeId: string
  toInitiativeTitle: string
  type: 'blocks' | 'enables' | 'informs'
  description: string
  status: 'active' | 'resolved'
  createdAt: string
}

interface CapacityAllocation {
  portfolioType: string
  totalCapacity: number
  allocatedCapacity: number
  teamSize: number
  utilizationRate: number
}

export default function PortfolioAnalysis() {
  const [initiatives] = useKV<Initiative[]>('initiatives', [])
  const [dependencies, setDependencies] = useKV<Dependency[]>('portfolio-dependencies', [])
  const [isAddDependencyOpen, setIsAddDependencyOpen] = useState(false)

  const [newDependency, setNewDependency] = useState({
    fromInitiativeId: '',
    toInitiativeId: '',
    type: 'blocks' as const,
    description: ''
  })

  const portfolios = [
    { type: 'operational-excellence', name: 'Operational Excellence', capacity: 100, teamSize: 12 },
    { type: 'ma', name: 'M&A', capacity: 80, teamSize: 8 },
    { type: 'financial-transformation', name: 'Financial Transformation', capacity: 120, teamSize: 15 },
    { type: 'esg', name: 'ESG', capacity: 60, teamSize: 6 },
    { type: 'innovation', name: 'Innovation', capacity: 90, teamSize: 10 }
  ]

  const addDependency = () => {
    if (!newDependency.fromInitiativeId || !newDependency.toInitiativeId || !newDependency.description) {
      toast.error('Please fill in all fields')
      return
    }

    if (newDependency.fromInitiativeId === newDependency.toInitiativeId) {
      toast.error('Cannot create dependency to the same initiative')
      return
    }

    const fromInit = initiatives?.find(i => i.id === newDependency.fromInitiativeId)
    const toInit = initiatives?.find(i => i.id === newDependency.toInitiativeId)

    if (!fromInit || !toInit) {
      toast.error('Initiatives not found')
      return
    }

    const dependency: Dependency = {
      id: `dep-${Date.now()}`,
      fromInitiativeId: newDependency.fromInitiativeId,
      fromInitiativeTitle: fromInit.title,
      toInitiativeId: newDependency.toInitiativeId,
      toInitiativeTitle: toInit.title,
      type: newDependency.type,
      description: newDependency.description,
      status: 'active',
      createdAt: new Date().toISOString()
    }

    setDependencies((current) => [...(current || []), dependency])
    setIsAddDependencyOpen(false)
    setNewDependency({
      fromInitiativeId: '',
      toInitiativeId: '',
      type: 'blocks',
      description: ''
    })
    toast.success('Dependency added')
  }

  const resolveDependency = (id: string) => {
    setDependencies((current) =>
      (current || []).map(d => d.id === id ? { ...d, status: 'resolved' } : d)
    )
    toast.success('Dependency resolved')
  }

  const capacityData: CapacityAllocation[] = useMemo(() => {
    return portfolios.map(portfolio => {
      const portfolioInits = initiatives?.filter(i => i.portfolio === portfolio.type) || []
      const allocatedCapacity = portfolioInits.length * 15
      const utilizationRate = portfolio.capacity > 0 ? (allocatedCapacity / portfolio.capacity) * 100 : 0

      return {
        portfolioType: portfolio.type,
        totalCapacity: portfolio.capacity,
        allocatedCapacity: Math.min(allocatedCapacity, portfolio.capacity),
        teamSize: portfolio.teamSize,
        utilizationRate: Math.min(utilizationRate, 100)
      }
    })
  }, [initiatives])

  const alignmentAnalysis = useMemo(() => {
    return portfolios.map(portfolio => {
      const portfolioInits = initiatives?.filter(i => i.portfolio === portfolio.type) || []
      const totalBudget = portfolioInits.reduce((sum, i) => sum + (i.budget || 0), 0)
      const avgProgress = portfolioInits.length > 0
        ? portfolioInits.reduce((sum, i) => sum + i.progress, 0) / portfolioInits.length
        : 0

      const health = {
        onTrack: portfolioInits.filter(i => i.status === 'on-track').length,
        atRisk: portfolioInits.filter(i => i.status === 'at-risk').length,
        blocked: portfolioInits.filter(i => i.status === 'blocked').length,
        completed: portfolioInits.filter(i => i.status === 'completed').length
      }

      const strategicAlignment = portfolioInits.filter(i => i.strategyCardId).length / Math.max(portfolioInits.length, 1) * 100

      return {
        portfolio: portfolio.name,
        type: portfolio.type,
        count: portfolioInits.length,
        totalBudget,
        avgProgress: Math.round(avgProgress),
        health,
        strategicAlignment: Math.round(strategicAlignment)
      }
    })
  }, [initiatives])

  const riskAnalysis = useMemo(() => {
    const blockedInitiatives = initiatives?.filter(i => i.status === 'blocked') || []
    const atRiskInitiatives = initiatives?.filter(i => i.status === 'at-risk') || []
    const activeDependencies = dependencies?.filter(d => d.status === 'active') || []
    const blockingDeps = activeDependencies.filter(d => d.type === 'blocks')

    return {
      blockedCount: blockedInitiatives.length,
      atRiskCount: atRiskInitiatives.length,
      activeDependencyCount: activeDependencies.length,
      blockingDependencyCount: blockingDeps.length
    }
  }, [initiatives, dependencies])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getDependencyTypeColor = (type: string) => {
    switch (type) {
      case 'blocks': return 'destructive'
      case 'enables': return 'default'
      case 'informs': return 'secondary'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Portfolio Analysis</h2>
          <p className="text-muted-foreground mt-2">
            Strategic alignment, capacity planning, and dependency management
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Blocked Initiatives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{riskAnalysis.blockedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Need resolution</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">At Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-at-risk">{riskAnalysis.atRiskCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Attention needed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Dependencies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{riskAnalysis.activeDependencyCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Cross-initiative links</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Blocking Dependencies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{riskAnalysis.blockingDependencyCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Critical path items</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alignment" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alignment">Strategic Alignment</TabsTrigger>
          <TabsTrigger value="capacity">Capacity Planning</TabsTrigger>
          <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
        </TabsList>

        <TabsContent value="alignment" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Strategic Alignment</CardTitle>
              <CardDescription>Initiative alignment, health, and budget by portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {alignmentAnalysis.map((portfolio) => (
                  <div key={portfolio.type}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{portfolio.portfolio}</h4>
                        <p className="text-sm text-muted-foreground">
                          {portfolio.count} initiatives • {formatCurrency(portfolio.totalBudget)} budget
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground mb-1">Strategic Alignment</div>
                        <Badge variant={portfolio.strategicAlignment >= 80 ? 'default' : portfolio.strategicAlignment >= 50 ? 'secondary' : 'destructive'}>
                          {portfolio.strategicAlignment}%
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-3 mb-3">
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <div className="text-xs text-muted-foreground mb-1">On Track</div>
                        <div className="text-lg font-semibold text-success">{portfolio.health.onTrack}</div>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <div className="text-xs text-muted-foreground mb-1">At Risk</div>
                        <div className="text-lg font-semibold text-at-risk">{portfolio.health.atRisk}</div>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <div className="text-xs text-muted-foreground mb-1">Blocked</div>
                        <div className="text-lg font-semibold text-destructive">{portfolio.health.blocked}</div>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <div className="text-xs text-muted-foreground mb-1">Completed</div>
                        <div className="text-lg font-semibold text-accent">{portfolio.health.completed}</div>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <div className="text-xs text-muted-foreground mb-1">Avg Progress</div>
                        <div className="text-lg font-semibold">{portfolio.avgProgress}%</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Overall Progress</span>
                        <span className="font-semibold">{portfolio.avgProgress}%</span>
                      </div>
                      <Progress value={portfolio.avgProgress} className="h-2" />
                    </div>

                    <Separator className="mt-6" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capacity" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Capacity & Resource Planning</CardTitle>
              <CardDescription>Team capacity utilization across portfolios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {capacityData.map((capacity) => {
                  const portfolio = portfolios.find(p => p.type === capacity.portfolioType)
                  const isOverCapacity = capacity.utilizationRate >= 90
                  const isNearCapacity = capacity.utilizationRate >= 75 && capacity.utilizationRate < 90
                  
                  return (
                    <div key={capacity.portfolioType}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Users size={20} className="text-primary" weight="bold" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{portfolio?.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Team Size: {capacity.teamSize} members
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{Math.round(capacity.utilizationRate)}%</div>
                          <p className="text-xs text-muted-foreground">Utilization</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {capacity.allocatedCapacity} / {capacity.totalCapacity} capacity points
                          </span>
                          {isOverCapacity && (
                            <Badge variant="destructive" className="gap-1">
                              <Warning size={12} weight="fill" />
                              Over Capacity
                            </Badge>
                          )}
                          {isNearCapacity && (
                            <Badge variant="outline" className="gap-1 border-at-risk text-at-risk">
                              <Warning size={12} weight="fill" />
                              Near Capacity
                            </Badge>
                          )}
                        </div>
                        <Progress 
                          value={capacity.utilizationRate} 
                          className={`h-3 ${isOverCapacity ? '[&>div]:bg-destructive' : isNearCapacity ? '[&>div]:bg-at-risk' : ''}`}
                        />
                      </div>

                      <Separator className="mt-6" />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dependencies" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Initiative Dependencies</CardTitle>
                  <CardDescription>Track cross-initiative dependencies and blockers</CardDescription>
                </div>
                <Dialog open={isAddDependencyOpen} onOpenChange={setIsAddDependencyOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus size={16} weight="bold" />
                      Add Dependency
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Initiative Dependency</DialogTitle>
                      <DialogDescription>
                        Define a dependency relationship between two initiatives
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="from-initiative">From Initiative</Label>
                        <Select
                          value={newDependency.fromInitiativeId}
                          onValueChange={(value) => setNewDependency({ ...newDependency, fromInitiativeId: value })}
                        >
                          <SelectTrigger id="from-initiative">
                            <SelectValue placeholder="Select initiative" />
                          </SelectTrigger>
                          <SelectContent>
                            {(initiatives || []).map(init => (
                              <SelectItem key={init.id} value={init.id}>
                                {init.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="dependency-type">Dependency Type</Label>
                        <Select
                          value={newDependency.type}
                          onValueChange={(value: any) => setNewDependency({ ...newDependency, type: value })}
                        >
                          <SelectTrigger id="dependency-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="blocks">Blocks (prevents progress)</SelectItem>
                            <SelectItem value="enables">Enables (allows to proceed)</SelectItem>
                            <SelectItem value="informs">Informs (provides info)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="to-initiative">To Initiative</Label>
                        <Select
                          value={newDependency.toInitiativeId}
                          onValueChange={(value) => setNewDependency({ ...newDependency, toInitiativeId: value })}
                        >
                          <SelectTrigger id="to-initiative">
                            <SelectValue placeholder="Select initiative" />
                          </SelectTrigger>
                          <SelectContent>
                            {(initiatives || []).map(init => (
                              <SelectItem key={init.id} value={init.id}>
                                {init.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          value={newDependency.description}
                          onChange={(e) => setNewDependency({ ...newDependency, description: e.target.value })}
                          placeholder="Describe the dependency..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddDependencyOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={addDependency}>Add Dependency</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(dependencies || []).length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <GitBranch size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No dependencies tracked yet. Add dependencies to map initiative relationships.</p>
                  </div>
                ) : (
                  (dependencies || []).map((dep) => (
                    <Card key={dep.id} className={dep.status === 'resolved' ? 'opacity-60' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={getDependencyTypeColor(dep.type)}>
                                {dep.type}
                              </Badge>
                              <Badge variant={dep.status === 'active' ? 'default' : 'outline'}>
                                {dep.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium">{dep.fromInitiativeTitle}</span>
                              <ArrowRight size={16} className="text-muted-foreground" />
                              <span className="font-medium">{dep.toInitiativeTitle}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">{dep.description}</p>
                            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                              <Clock size={12} />
                              Created {new Date(dep.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {dep.status === 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => resolveDependency(dep.id)}
                              className="gap-2"
                            >
                              <CheckCircle size={16} />
                              Resolve
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
