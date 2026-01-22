import { useKV } from '@github/spark/hooks'
import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  Plus, 
  Gavel, 
  CheckCircle, 
  XCircle,
  Clock,
  Target,
  TrendUp,
  CurrencyDollar,
  Users,
  ArrowUp,
  ArrowDown,
  Minus,
  ChartBar
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Initiative, PortfolioType } from '@/types'

interface GovernanceDecision {
  id: string
  initiativeId: string
  initiativeTitle: string
  decisionType: 'funding' | 'priority-change' | 'resource-allocation' | 'cancellation' | 'approval'
  decision: 'approved' | 'rejected' | 'deferred' | 'pending'
  rationale: string
  decidedBy: string
  decidedAt: string
  impactAssessment: string
  alternatives?: string
}

interface PortfolioGovernanceMetrics {
  portfolioType: PortfolioType
  totalBudget: number
  allocatedBudget: number
  pendingDecisions: number
  approvedInitiatives: number
  rejectedInitiatives: number
  avgRoi: number
}

export default function PortfolioGovernance() {
  const [initiatives] = useKV<Initiative[]>('initiatives', [])
  const [decisions, setDecisions] = useKV<GovernanceDecision[]>('governance-decisions', [])
  const [isAddingDecision, setIsAddingDecision] = useState(false)
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>('all')
  const [selectedInitiativeId, setSelectedInitiativeId] = useState<string>('')

  const [newDecision, setNewDecision] = useState({
    decisionType: 'approval' as const,
    decision: 'pending' as const,
    rationale: '',
    decidedBy: '',
    impactAssessment: '',
    alternatives: ''
  })

  const portfolios: Array<{ value: PortfolioType | 'all', label: string }> = [
    { value: 'all', label: 'All Portfolios' },
    { value: 'operational-excellence', label: 'Operational Excellence' },
    { value: 'ma', label: 'M&A' },
    { value: 'financial-transformation', label: 'Financial Transformation' },
    { value: 'esg', label: 'ESG' },
    { value: 'innovation', label: 'Innovation' }
  ]

  const portfolioMetrics = useMemo(() => {
    const metrics: Record<string, PortfolioGovernanceMetrics> = {}

    portfolios.forEach(({ value }) => {
      if (value === 'all') return

      const portfolioInitiatives = (initiatives || []).filter(i => i.portfolio === value)
      const portfolioDecisions = (decisions || []).filter(d => {
        const init = initiatives?.find(i => i.id === d.initiativeId)
        return init?.portfolio === value
      })

      metrics[value] = {
        portfolioType: value as PortfolioType,
        totalBudget: 10000000,
        allocatedBudget: portfolioInitiatives.reduce((sum, i) => sum + (i.budget || 0), 0),
        pendingDecisions: portfolioDecisions.filter(d => d.decision === 'pending').length,
        approvedInitiatives: portfolioDecisions.filter(d => d.decision === 'approved').length,
        rejectedInitiatives: portfolioDecisions.filter(d => d.decision === 'rejected').length,
        avgRoi: 0
      }
    })

    return metrics
  }, [initiatives, decisions])

  const filteredInitiatives = useMemo(() => {
    if (selectedPortfolio === 'all') return initiatives || []
    return (initiatives || []).filter(i => i.portfolio === selectedPortfolio)
  }, [initiatives, selectedPortfolio])

  const filteredDecisions = useMemo(() => {
    if (selectedPortfolio === 'all') return decisions || []
    return (decisions || []).filter(d => {
      const init = initiatives?.find(i => i.id === d.initiativeId)
      return init?.portfolio === selectedPortfolio
    })
  }, [decisions, initiatives, selectedPortfolio])

  const handleAddDecision = () => {
    if (!selectedInitiativeId || !newDecision.rationale || !newDecision.decidedBy) {
      toast.error('Please fill in all required fields')
      return
    }

    const initiative = initiatives?.find(i => i.id === selectedInitiativeId)
    if (!initiative) {
      toast.error('Initiative not found')
      return
    }

    const decision: GovernanceDecision = {
      id: `decision-${Date.now()}`,
      initiativeId: selectedInitiativeId,
      initiativeTitle: initiative.title,
      decisionType: newDecision.decisionType,
      decision: newDecision.decision,
      rationale: newDecision.rationale,
      decidedBy: newDecision.decidedBy,
      decidedAt: new Date().toISOString(),
      impactAssessment: newDecision.impactAssessment,
      alternatives: newDecision.alternatives
    }

    setDecisions((current) => [...(current || []), decision])
    toast.success('Governance decision recorded')
    
    setIsAddingDecision(false)
    setSelectedInitiativeId('')
    setNewDecision({
      decisionType: 'approval',
      decision: 'pending',
      rationale: '',
      decidedBy: '',
      impactAssessment: '',
      alternatives: ''
    })
  }

  const handleUpdateDecision = (decisionId: string, newStatus: 'approved' | 'rejected' | 'deferred' | 'pending') => {
    setDecisions((current) =>
      (current || []).map(d =>
        d.id === decisionId ? { ...d, decision: newStatus } : d
      )
    )
    toast.success('Decision status updated')
  }

  const decisionTypeConfig = {
    'funding': { label: 'Funding Request', icon: CurrencyDollar, color: 'bg-green-500' },
    'priority-change': { label: 'Priority Change', icon: ArrowUp, color: 'bg-blue-500' },
    'resource-allocation': { label: 'Resource Allocation', icon: Users, color: 'bg-purple-500' },
    'cancellation': { label: 'Cancellation', icon: XCircle, color: 'bg-red-500' },
    'approval': { label: 'Approval', icon: CheckCircle, color: 'bg-accent' }
  }

  const decisionStatusConfig = {
    'approved': { label: 'Approved', color: 'bg-success/10 text-success border-success/30', icon: CheckCircle },
    'rejected': { label: 'Rejected', color: 'bg-destructive/10 text-destructive border-destructive/30', icon: XCircle },
    'deferred': { label: 'Deferred', color: 'bg-warning/10 text-warning border-warning/30', icon: Clock },
    'pending': { label: 'Pending', color: 'bg-muted text-muted-foreground', icon: Clock }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Portfolio Governance</h2>
          <p className="text-muted-foreground mt-1">
            Strategic decision-making framework for prioritization, funding, and resource allocation
          </p>
        </div>
        <Dialog open={isAddingDecision} onOpenChange={setIsAddingDecision}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={20} weight="bold" />
              New Decision
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Record Governance Decision</DialogTitle>
              <DialogDescription>
                Document a strategic decision about an initiative
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="decision-initiative">Initiative *</Label>
                <Select
                  value={selectedInitiativeId}
                  onValueChange={setSelectedInitiativeId}
                >
                  <SelectTrigger id="decision-initiative">
                    <SelectValue placeholder="Select an initiative" />
                  </SelectTrigger>
                  <SelectContent>
                    {(initiatives || []).map((init) => (
                      <SelectItem key={init.id} value={init.id}>
                        {init.title} - {init.portfolio}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="decision-type">Decision Type *</Label>
                  <Select
                    value={newDecision.decisionType}
                    onValueChange={(value: any) => setNewDecision({ ...newDecision, decisionType: value })}
                  >
                    <SelectTrigger id="decision-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(decisionTypeConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="decision-status">Status *</Label>
                  <Select
                    value={newDecision.decision}
                    onValueChange={(value: any) => setNewDecision({ ...newDecision, decision: value })}
                  >
                    <SelectTrigger id="decision-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(decisionStatusConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="decision-rationale">Rationale *</Label>
                <Textarea
                  id="decision-rationale"
                  value={newDecision.rationale}
                  onChange={(e) => setNewDecision({ ...newDecision, rationale: e.target.value })}
                  placeholder="Explain the reasoning behind this decision..."
                  rows={4}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="decision-impact">Impact Assessment</Label>
                <Textarea
                  id="decision-impact"
                  value={newDecision.impactAssessment}
                  onChange={(e) => setNewDecision({ ...newDecision, impactAssessment: e.target.value })}
                  placeholder="What are the expected impacts of this decision?"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="decision-alternatives">Alternatives Considered</Label>
                <Textarea
                  id="decision-alternatives"
                  value={newDecision.alternatives}
                  onChange={(e) => setNewDecision({ ...newDecision, alternatives: e.target.value })}
                  placeholder="What other options were evaluated?"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="decision-by">Decided By *</Label>
                <Input
                  id="decision-by"
                  value={newDecision.decidedBy}
                  onChange={(e) => setNewDecision({ ...newDecision, decidedBy: e.target.value })}
                  placeholder="Name or role of decision maker"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingDecision(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddDecision}>
                Record Decision
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={selectedPortfolio} onValueChange={setSelectedPortfolio} className="w-full">
        <TabsList className="grid w-full grid-cols-6 h-auto">
          {portfolios.map(({ value, label }) => (
            <TabsTrigger key={value} value={value} className="text-xs lg:text-sm">
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedPortfolio} className="mt-6 space-y-6">
          {selectedPortfolio !== 'all' && portfolioMetrics[selectedPortfolio] && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Budget Utilization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <div className="text-2xl font-bold">
                        {Math.round((portfolioMetrics[selectedPortfolio].allocatedBudget / portfolioMetrics[selectedPortfolio].totalBudget) * 100)}%
                      </div>
                      <CurrencyDollar size={24} className="text-accent" weight="bold" />
                    </div>
                    <Progress 
                      value={(portfolioMetrics[selectedPortfolio].allocatedBudget / portfolioMetrics[selectedPortfolio].totalBudget) * 100} 
                      className="h-2" 
                    />
                    <p className="text-xs text-muted-foreground">
                      ${portfolioMetrics[selectedPortfolio].allocatedBudget.toLocaleString()} / 
                      ${portfolioMetrics[selectedPortfolio].totalBudget.toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Pending Decisions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-bold text-warning">
                      {portfolioMetrics[selectedPortfolio].pendingDecisions}
                    </div>
                    <Clock size={32} className="text-warning" weight="bold" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Approved</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-bold text-success">
                      {portfolioMetrics[selectedPortfolio].approvedInitiatives}
                    </div>
                    <CheckCircle size={32} className="text-success" weight="fill" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Rejected</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-bold text-destructive">
                      {portfolioMetrics[selectedPortfolio].rejectedInitiatives}
                    </div>
                    <XCircle size={32} className="text-destructive" weight="fill" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Governance Decisions</CardTitle>
                <CardDescription>
                  Strategic decisions for {selectedPortfolio === 'all' ? 'all portfolios' : selectedPortfolio}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredDecisions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Gavel size={48} className="text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground text-center">
                      No governance decisions recorded yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredDecisions.slice().reverse().map((decision) => {
                      const typeConfig = decisionTypeConfig[decision.decisionType]
                      const statusConfig = decisionStatusConfig[decision.decision]
                      const TypeIcon = typeConfig.icon
                      const StatusIcon = statusConfig.icon

                      return (
                        <Card key={decision.id} className="border-l-4" style={{ borderLeftColor: typeConfig.color.replace('bg-', '') }}>
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className={`${typeConfig.color} p-1.5 rounded`}>
                                      <TypeIcon size={16} weight="bold" className="text-white" />
                                    </div>
                                    <span className="text-sm font-semibold">{typeConfig.label}</span>
                                  </div>
                                  <h4 className="font-semibold text-sm mb-1">{decision.initiativeTitle}</h4>
                                  <p className="text-sm text-muted-foreground mb-2">{decision.rationale}</p>
                                  {decision.impactAssessment && (
                                    <div className="bg-muted/30 p-2 rounded text-xs mb-2">
                                      <strong>Impact:</strong> {decision.impactAssessment}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span><strong>By:</strong> {decision.decidedBy}</span>
                                    <span>•</span>
                                    <span>{new Date(decision.decidedAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2 shrink-0">
                                  <Badge variant="outline" className={`${statusConfig.color} justify-center`}>
                                    {statusConfig.label}
                                  </Badge>
                                  {decision.decision === 'pending' && (
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 px-2"
                                        onClick={() => handleUpdateDecision(decision.id, 'approved')}
                                      >
                                        <CheckCircle size={14} />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 px-2"
                                        onClick={() => handleUpdateDecision(decision.id, 'rejected')}
                                      >
                                        <XCircle size={14} />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Initiatives Requiring Review</CardTitle>
                <CardDescription>
                  Initiatives that may need governance decisions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredInitiatives.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Target size={48} className="text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground text-center">
                      No initiatives in this portfolio
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredInitiatives.map((initiative) => {
                      const hasDecision = decisions?.some(d => d.initiativeId === initiative.id)
                      const needsAttention = initiative.status === 'at-risk' || initiative.status === 'blocked'
                      
                      return (
                        <Card 
                          key={initiative.id} 
                          className={`${needsAttention ? 'border-warning/50 bg-warning/5' : ''} ${!hasDecision ? 'border-accent/50' : ''}`}
                        >
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-sm mb-1">{initiative.title}</h4>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="outline" className="text-xs capitalize">
                                      {initiative.priority}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs capitalize">
                                      {initiative.status.replace('-', ' ')}
                                    </Badge>
                                    {!hasDecision && (
                                      <Badge variant="outline" className="text-xs bg-accent/10 text-accent border-accent/30">
                                        No decision
                                      </Badge>
                                    )}
                                    {needsAttention && (
                                      <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/30">
                                        Needs attention
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{initiative.owner}</span>
                                <span>Budget: ${(initiative.budget || 0).toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Progress value={initiative.progress} className="h-1.5 flex-1" />
                                <span className="text-xs font-mono">{initiative.progress}%</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
