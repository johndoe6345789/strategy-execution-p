import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Gavel, Lightning, BookOpen, Target } from '@phosphor-icons/react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { StrategyCard, Decision } from '@/types'

export default function RationaleDecisionCapture() {
  const [strategyCards, setStrategyCards] = useKV<StrategyCard[]>('strategy-cards', [])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedStrategyId, setSelectedStrategyId] = useState('')
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null)
  const [newDecision, setNewDecision] = useState({
    title: '',
    description: '',
    rationale: '',
    alternatives: '',
    decidedBy: '',
    impact: 'medium' as const,
    category: 'strategic' as const
  })

  const addDecision = () => {
    if (!newDecision.title.trim() || !newDecision.description.trim() || !newDecision.rationale.trim() || !selectedStrategyId) {
      toast.error('Please fill in all required fields and select a strategy')
      return
    }

    const decision: Decision = {
      id: `dec-${Date.now()}`,
      title: newDecision.title,
      description: newDecision.description,
      rationale: newDecision.rationale,
      alternatives: newDecision.alternatives.split('\n').filter(a => a.trim()),
      decidedBy: newDecision.decidedBy || 'Leadership Team',
      decidedAt: new Date().toISOString().split('T')[0],
      impact: newDecision.impact,
      category: newDecision.category
    }

    setStrategyCards((current) =>
      (current || []).map(card => {
        if (card.id === selectedStrategyId) {
          return {
            ...card,
            decisions: [...(card.decisions || []), decision]
          }
        }
        return card
      })
    )

    setIsAddDialogOpen(false)
    setNewDecision({
      title: '',
      description: '',
      rationale: '',
      alternatives: '',
      decidedBy: '',
      impact: 'medium',
      category: 'strategic'
    })
    setSelectedStrategyId('')
    toast.success('Decision captured!')
  }

  const allDecisions = (strategyCards || []).flatMap(card =>
    (card.decisions || []).map(decision => ({
      ...decision,
      strategyTitle: card.title,
      strategyId: card.id
    }))
  )

  const impactConfig = {
    high: { label: 'High Impact', color: 'destructive' },
    medium: { label: 'Medium Impact', color: 'default' },
    low: { label: 'Low Impact', color: 'secondary' }
  }

  const categoryConfig = {
    strategic: { label: 'Strategic', color: 'bg-purple-500' },
    tactical: { label: 'Tactical', color: 'bg-blue-500' },
    operational: { label: 'Operational', color: 'bg-green-500' }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Rationale & Decision Capture</h2>
          <p className="text-muted-foreground mt-2">
            Capture strategic decisions, assumptions, and rationale
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} weight="bold" />
              Capture Decision
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Capture Strategic Decision</DialogTitle>
              <DialogDescription>
                Document key decisions, rationale, and alternatives considered
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="dec-strategy">Link to Strategy Card</Label>
                  <Select
                    value={selectedStrategyId}
                    onValueChange={setSelectedStrategyId}
                  >
                    <SelectTrigger id="dec-strategy">
                      <SelectValue placeholder="Select a strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      {(strategyCards || []).map((card) => (
                        <SelectItem key={card.id} value={card.id}>
                          {card.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dec-title">Decision Title</Label>
                  <Input
                    id="dec-title"
                    value={newDecision.title}
                    onChange={(e) => setNewDecision({ ...newDecision, title: e.target.value })}
                    placeholder="e.g., Adopt cloud-first architecture"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dec-description">Decision Description</Label>
                  <Textarea
                    id="dec-description"
                    value={newDecision.description}
                    onChange={(e) => setNewDecision({ ...newDecision, description: e.target.value })}
                    placeholder="Describe the decision and its implications..."
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dec-rationale">Rationale & Reasoning</Label>
                  <Textarea
                    id="dec-rationale"
                    value={newDecision.rationale}
                    onChange={(e) => setNewDecision({ ...newDecision, rationale: e.target.value })}
                    placeholder="Explain why this decision was made, the data and analysis that supported it..."
                    rows={4}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dec-alternatives">Alternatives Considered (one per line)</Label>
                  <Textarea
                    id="dec-alternatives"
                    value={newDecision.alternatives}
                    onChange={(e) => setNewDecision({ ...newDecision, alternatives: e.target.value })}
                    placeholder="List alternative options that were evaluated..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="dec-category">Category</Label>
                    <Select
                      value={newDecision.category}
                      onValueChange={(value: any) => setNewDecision({ ...newDecision, category: value })}
                    >
                      <SelectTrigger id="dec-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="strategic">Strategic</SelectItem>
                        <SelectItem value="tactical">Tactical</SelectItem>
                        <SelectItem value="operational">Operational</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="dec-impact">Impact Level</Label>
                    <Select
                      value={newDecision.impact}
                      onValueChange={(value: any) => setNewDecision({ ...newDecision, impact: value })}
                    >
                      <SelectTrigger id="dec-impact">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High Impact</SelectItem>
                        <SelectItem value="medium">Medium Impact</SelectItem>
                        <SelectItem value="low">Low Impact</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="dec-decidedby">Decided By</Label>
                    <Input
                      id="dec-decidedby"
                      value={newDecision.decidedBy}
                      onChange={(e) => setNewDecision({ ...newDecision, decidedBy: e.target.value })}
                      placeholder="Leadership Team"
                    />
                  </div>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addDecision}>Capture Decision</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Decisions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{allDecisions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Strategic</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {allDecisions.filter(d => d.category === 'strategic').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tactical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {allDecisions.filter(d => d.category === 'tactical').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">High Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">
              {allDecisions.filter(d => d.impact === 'high').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {(strategyCards || []).length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Target size={48} className="mx-auto mb-4 text-muted-foreground/50" />
            <p>No strategy cards yet. Create a strategy card first to capture decisions.</p>
          </CardContent>
        </Card>
      ) : allDecisions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Gavel size={48} className="mx-auto mb-4 text-muted-foreground/50" />
            <p>No decisions captured yet. Click "Capture Decision" to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Decisions ({allDecisions.length})</TabsTrigger>
            <TabsTrigger value="strategic">Strategic ({allDecisions.filter(d => d.category === 'strategic').length})</TabsTrigger>
            <TabsTrigger value="tactical">Tactical ({allDecisions.filter(d => d.category === 'tactical').length})</TabsTrigger>
            <TabsTrigger value="operational">Operational ({allDecisions.filter(d => d.category === 'operational').length})</TabsTrigger>
          </TabsList>

          {(['all', 'strategic', 'tactical', 'operational'] as const).map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              {allDecisions
                .filter(d => tab === 'all' || d.category === tab)
                .map((decision) => {
                  const catConfig = categoryConfig[decision.category]
                  const impConfig = impactConfig[decision.impact]
                  return (
                    <Card key={decision.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={`${catConfig.color} text-white`}>
                                {catConfig.label}
                              </Badge>
                              <Badge variant={impConfig.color as any}>
                                {impConfig.label}
                              </Badge>
                            </div>
                            <CardTitle className="text-xl">{decision.title}</CardTitle>
                            <CardDescription className="mt-2 flex items-center gap-2">
                              <Lightning size={14} weight="fill" />
                              Linked to: {decision.strategyTitle}
                            </CardDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedDecision(decision)}
                          >
                            <BookOpen size={20} weight="bold" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="text-sm font-semibold mb-1">Decision</div>
                          <p className="text-sm text-muted-foreground">{decision.description}</p>
                        </div>
                        <div>
                          <div className="text-sm font-semibold mb-1">Rationale</div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{decision.rationale}</p>
                        </div>
                        {decision.alternatives.length > 0 && (
                          <div>
                            <div className="text-sm font-semibold mb-1">Alternatives Considered</div>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {decision.alternatives.slice(0, 2).map((alt, idx) => (
                                <li key={idx}>• {alt}</li>
                              ))}
                              {decision.alternatives.length > 2 && (
                                <li className="italic">+{decision.alternatives.length - 2} more</li>
                              )}
                            </ul>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm border-t pt-4">
                          <span className="text-muted-foreground">
                            Decided by: <span className="font-medium text-foreground">{decision.decidedBy}</span>
                          </span>
                          <span className="text-muted-foreground">
                            {new Date(decision.decidedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
            </TabsContent>
          ))}
        </Tabs>
      )}

      {selectedDecision && (
        <Dialog open={!!selectedDecision} onOpenChange={() => setSelectedDecision(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedDecision.title}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-2">
                <Badge className={`${categoryConfig[selectedDecision.category].color} text-white`}>
                  {categoryConfig[selectedDecision.category].label}
                </Badge>
                <Badge variant={impactConfig[selectedDecision.impact].color as any}>
                  {impactConfig[selectedDecision.impact].label}
                </Badge>
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="space-y-6 py-4">
                <div>
                  <h4 className="font-semibold mb-2">Decision Description</h4>
                  <p className="text-foreground">{selectedDecision.description}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Rationale & Reasoning</h4>
                  <p className="text-foreground">{selectedDecision.rationale}</p>
                </div>
                {selectedDecision.alternatives.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Alternatives Considered</h4>
                    <ul className="space-y-2">
                      {selectedDecision.alternatives.map((alt, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="text-accent font-bold">•</span>
                          <span className="text-foreground">{alt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="border-t pt-4 flex items-center justify-between text-sm">
                  <div>
                    <span className="text-muted-foreground">Decided by: </span>
                    <span className="font-semibold">{selectedDecision.decidedBy}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date: </span>
                    <span className="font-semibold">{new Date(selectedDecision.decidedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Lightning size={14} weight="fill" />
                    Linked to strategy: <span className="font-semibold text-foreground">{(selectedDecision as any).strategyTitle}</span>
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
