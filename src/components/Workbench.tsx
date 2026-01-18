import { useKV } from '@github/spark/hooks'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Plus, User, Calendar, CurrencyDollar, CheckCircle, Warning, XCircle, Clock } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Initiative, StrategyCard, StatusType, PriorityType, PortfolioType } from '@/types'

const statusConfig = {
  'not-started': { label: 'Not Started', color: 'bg-muted text-muted-foreground', icon: Clock },
  'on-track': { label: 'On Track', color: 'bg-success text-white', icon: CheckCircle },
  'at-risk': { label: 'At Risk', color: 'bg-at-risk text-white', icon: Warning },
  'blocked': { label: 'Blocked', color: 'bg-destructive text-white', icon: XCircle },
  'completed': { label: 'Completed', color: 'bg-primary text-primary-foreground', icon: CheckCircle },
}

const priorityConfig = {
  'critical': { label: 'Critical', color: 'bg-destructive text-destructive-foreground' },
  'high': { label: 'High', color: 'bg-at-risk text-white' },
  'medium': { label: 'Medium', color: 'bg-secondary text-secondary-foreground' },
  'low': { label: 'Low', color: 'bg-muted text-muted-foreground' },
}

const portfolioOptions = [
  { value: 'operational-excellence', label: 'Operational Excellence' },
  { value: 'ma', label: 'M&A' },
  { value: 'financial-transformation', label: 'Financial Transformation' },
  { value: 'esg', label: 'ESG' },
  { value: 'innovation', label: 'Innovation' },
]

export default function Workbench() {
  const [initiatives, setInitiatives] = useKV<Initiative[]>('initiatives', [])
  const [strategyCards] = useKV<StrategyCard[]>('strategy-cards', [])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    strategyCardId: '',
    owner: '',
    status: 'not-started' as StatusType,
    priority: 'medium' as PriorityType,
    portfolio: 'operational-excellence' as PortfolioType,
    progress: 0,
    startDate: '',
    endDate: '',
    budget: 0,
  })

  const handleCreate = () => {
    if (!formData.title || !formData.strategyCardId || !formData.owner) {
      toast.error('Please fill in required fields')
      return
    }

    const newInitiative: Initiative = {
      id: `init-${Date.now()}`,
      ...formData,
      kpis: [],
    }

    setInitiatives((current) => [...(current || []), newInitiative])
    toast.success('Initiative created successfully')
    setIsDialogOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      strategyCardId: '',
      owner: '',
      status: 'not-started',
      priority: 'medium',
      portfolio: 'operational-excellence',
      progress: 0,
      startDate: '',
      endDate: '',
      budget: 0,
    })
  }

  const getOwnerInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Workbench</h2>
          <p className="text-muted-foreground mt-1">Execute and track strategic initiatives</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary hover:bg-accent hover:text-accent-foreground transition-colors" disabled={!strategyCards || strategyCards.length === 0}>
              <Plus size={18} weight="bold" />
              Create Initiative
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-2xl">Create New Initiative</DialogTitle>
              <DialogDescription>
                Link this initiative to a strategy card and define execution details
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Initiative Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Implement Cloud Infrastructure"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the initiative..."
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="strategyCard">Link to Strategy Card *</Label>
                  <Select value={formData.strategyCardId} onValueChange={(value) => setFormData({ ...formData, strategyCardId: value })}>
                    <SelectTrigger id="strategyCard">
                      <SelectValue placeholder="Select a strategy card" />
                    </SelectTrigger>
                    <SelectContent>
                      {strategyCards?.map((card) => (
                        <SelectItem key={card.id} value={card.id}>
                          {card.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="portfolio">Portfolio</Label>
                    <Select value={formData.portfolio} onValueChange={(value) => setFormData({ ...formData, portfolio: value as PortfolioType })}>
                      <SelectTrigger id="portfolio">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {portfolioOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as PriorityType })}>
                      <SelectTrigger id="priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="owner">Initiative Owner *</Label>
                  <Input
                    id="owner"
                    placeholder="e.g., Sarah Johnson"
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (USD)</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="0"
                    value={formData.budget || ''}
                    onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </ScrollArea>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} className="bg-primary hover:bg-accent hover:text-accent-foreground">Create Initiative</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!strategyCards || strategyCards.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-6 mb-4">
              <Warning size={48} weight="duotone" className="text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Create a Strategy Card First</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Initiatives must be linked to a Strategy Card. Go to the Strategy Cards tab to create one.
            </p>
          </CardContent>
        </Card>
      ) : (!initiatives || initiatives.length === 0) ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-6 mb-4">
              <CheckCircle size={48} weight="duotone" className="text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Initiatives Yet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Start executing your strategy by creating your first initiative
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus size={18} weight="bold" />
              Create Your First Initiative
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {initiatives.map((initiative) => {
            const status = statusConfig[initiative.status]
            const priority = priorityConfig[initiative.priority]
            const StatusIcon = status.icon
            const linkedCard = strategyCards?.find(c => c.id === initiative.strategyCardId)

            return (
              <Card 
                key={initiative.id}
                className="hover:shadow-lg hover:border-accent/50 transition-all cursor-pointer group"
                onClick={() => setSelectedInitiative(initiative)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl group-hover:text-accent transition-colors">
                          {initiative.title}
                        </CardTitle>
                        <Badge className={priority.color}>{priority.label}</Badge>
                      </div>
                      {linkedCard && (
                        <CardDescription className="flex items-center gap-2">
                          <span className="text-xs uppercase tracking-wider font-medium">Linked to:</span>
                          <Badge variant="outline">{linkedCard.title}</Badge>
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`${status.color} gap-1.5`}>
                        <StatusIcon size={14} weight="fill" />
                        {status.label}
                      </Badge>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">
                          {getOwnerInitials(initiative.owner)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {initiative.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{initiative.description}</p>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground font-medium">Progress</span>
                      <span className="font-mono font-semibold text-accent">{initiative.progress}%</span>
                    </div>
                    <Progress value={initiative.progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wide">
                        <User size={14} />
                        <span>Owner</span>
                      </div>
                      <p className="text-sm font-medium">{initiative.owner}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wide">
                        <Calendar size={14} />
                        <span>Timeline</span>
                      </div>
                      <p className="text-sm font-medium font-mono">
                        {initiative.startDate && initiative.endDate 
                          ? `${new Date(initiative.startDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })} - ${new Date(initiative.endDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}`
                          : 'Not set'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wide">
                        <CurrencyDollar size={14} />
                        <span>Budget</span>
                      </div>
                      <p className="text-sm font-medium font-mono">
                        ${initiative.budget.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <Badge variant="secondary" className="text-xs">
                      {portfolioOptions.find(p => p.value === initiative.portfolio)?.label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {selectedInitiative && (
        <Dialog open={!!selectedInitiative} onOpenChange={() => setSelectedInitiative(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <DialogTitle className="text-2xl">{selectedInitiative.title}</DialogTitle>
                  <DialogDescription className="mt-2 flex items-center gap-2">
                    {strategyCards?.find(c => c.id === selectedInitiative.strategyCardId) && (
                      <>
                        <span className="text-xs uppercase tracking-wider font-medium">Linked to:</span>
                        <Badge variant="outline">
                          {strategyCards.find(c => c.id === selectedInitiative.strategyCardId)?.title}
                        </Badge>
                      </>
                    )}
                  </DialogDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={priorityConfig[selectedInitiative.priority].color}>
                    {priorityConfig[selectedInitiative.priority].label}
                  </Badge>
                  <Badge className={statusConfig[selectedInitiative.status].color}>
                    {statusConfig[selectedInitiative.status].label}
                  </Badge>
                </div>
              </div>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="space-y-6 py-4">
                {selectedInitiative.description && (
                  <div>
                    <h4 className="font-semibold text-sm uppercase tracking-wide mb-2">Description</h4>
                    <p className="text-foreground">{selectedInitiative.description}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm uppercase tracking-wide">Progress</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Overall Completion</span>
                      <span className="font-mono font-semibold text-lg text-accent">{selectedInitiative.progress}%</span>
                    </div>
                    <Progress value={selectedInitiative.progress} className="h-3" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm uppercase tracking-wide">Owner</h4>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold text-lg">
                          {getOwnerInitials(selectedInitiative.owner)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedInitiative.owner}</p>
                        <p className="text-xs text-muted-foreground">Initiative Owner</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm uppercase tracking-wide">Portfolio</h4>
                    <Badge variant="secondary" className="text-sm">
                      {portfolioOptions.find(p => p.value === selectedInitiative.portfolio)?.label}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm uppercase tracking-wide">Timeline</h4>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Start Date</span>
                        <span className="font-mono font-medium">
                          {selectedInitiative.startDate ? new Date(selectedInitiative.startDate).toLocaleDateString() : 'Not set'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">End Date</span>
                        <span className="font-mono font-medium">
                          {selectedInitiative.endDate ? new Date(selectedInitiative.endDate).toLocaleDateString() : 'Not set'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm uppercase tracking-wide">Budget</h4>
                    <p className="text-2xl font-bold font-mono text-accent">
                      ${selectedInitiative.budget.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
