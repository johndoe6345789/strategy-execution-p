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
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Target, Lightbulb, ChartLineUp } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { StrategyCard } from '@/types'

const frameworks = [
  { value: 'swot', label: 'SWOT Analysis', description: 'Strengths, Weaknesses, Opportunities, Threats' },
  { value: 'value-disciplines', label: 'Value Disciplines', description: 'Operational Excellence, Product Leadership, Customer Intimacy' },
  { value: 'strategic-pillars', label: 'Strategic Pillars', description: 'Core strategic themes and priorities' },
  { value: 'hoshin-kanri', label: 'Hoshin Kanri', description: 'Policy deployment and strategic alignment' },
  { value: 'okr', label: 'OKR Framework', description: 'Objectives and Key Results' },
]

export default function StrategyCards() {
  const [strategyCards, setStrategyCards] = useKV<StrategyCard[]>('strategy-cards', [])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState<StrategyCard | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    framework: '',
    vision: '',
    goals: '',
    metrics: '',
    assumptions: '',
  })

  const handleCreate = () => {
    if (!formData.title || !formData.framework || !formData.vision) {
      toast.error('Please fill in required fields')
      return
    }

    const newCard: StrategyCard = {
      id: `card-${Date.now()}`,
      title: formData.title,
      framework: formData.framework,
      vision: formData.vision,
      goals: formData.goals.split('\n').filter(g => g.trim()),
      metrics: formData.metrics.split('\n').filter(m => m.trim()),
      assumptions: formData.assumptions.split('\n').filter(a => a.trim()),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    setStrategyCards((current) => [...(current || []), newCard])
    toast.success('Strategy Card created successfully')
    setIsDialogOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      title: '',
      framework: '',
      vision: '',
      goals: '',
      metrics: '',
      assumptions: '',
    })
  }

  const handleCardClick = (card: StrategyCard) => {
    setSelectedCard(card)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Strategy Cards</h2>
          <p className="text-muted-foreground mt-1">Create and manage strategic frameworks</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={18} weight="bold" />
                Create Strategy Card
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-2xl">Create New Strategy Card</DialogTitle>
              <DialogDescription>
                Use a proven framework to structure your strategic thinking
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Strategy Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Digital Transformation 2025"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="framework">Framework *</Label>
                  <Select value={formData.framework} onValueChange={(value) => setFormData({ ...formData, framework: value })}>
                    <SelectTrigger id="framework">
                      <SelectValue placeholder="Select a strategic framework" />
                    </SelectTrigger>
                    <SelectContent>
                      {frameworks.map((fw) => (
                        <SelectItem key={fw.value} value={fw.value}>
                          <div>
                            <div className="font-semibold">{fw.label}</div>
                            <div className="text-xs text-muted-foreground">{fw.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="vision">Vision Statement *</Label>
                  <Textarea
                    id="vision"
                    placeholder="Describe the future state you want to achieve..."
                    rows={3}
                    value={formData.vision}
                    onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goals">Strategic Goals (one per line)</Label>
                  <Textarea
                    id="goals"
                    placeholder="Enter strategic goals, one per line..."
                    rows={4}
                    value={formData.goals}
                    onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metrics">Key Metrics (one per line)</Label>
                  <Textarea
                    id="metrics"
                    placeholder="Enter metrics to track, one per line..."
                    rows={4}
                    value={formData.metrics}
                    onChange={(e) => setFormData({ ...formData, metrics: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assumptions">Key Assumptions (one per line)</Label>
                  <Textarea
                    id="assumptions"
                    placeholder="Enter assumptions, one per line..."
                    rows={4}
                    value={formData.assumptions}
                    onChange={(e) => setFormData({ ...formData, assumptions: e.target.value })}
                  />
                </div>
              </div>
            </ScrollArea>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} className="bg-primary hover:bg-accent hover:text-accent-foreground">Create Card</Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {(!strategyCards || strategyCards.length === 0) ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-6 mb-4">
              <Target size={48} weight="duotone" className="text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Strategy Cards Yet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Start by creating your first strategy card using a proven framework
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus size={18} weight="bold" />
              Create Strategy Card
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {strategyCards.map((card) => (
            <Card 
              key={card.id} 
              className="cursor-pointer hover:shadow-lg hover:border-accent/50 transition-all group"
              onClick={() => handleCardClick(card)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl group-hover:text-accent transition-colors">{card.title}</CardTitle>
                    <CardDescription className="mt-2">
                      <Badge variant="outline" className="font-medium">
                        {frameworks.find(f => f.value === card.framework)?.label || card.framework}
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb size={16} weight="fill" className="text-accent" />
                    <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Vision</span>
                  </div>
                  <p className="text-sm text-foreground line-clamp-2">{card.vision}</p>
                </div>

                {card.goals.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Target size={16} weight="fill" className="text-accent" />
                      <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Goals</span>
                    </div>
                    <ul className="text-sm space-y-1">
                      {card.goals.slice(0, 2).map((goal, idx) => (
                        <li key={idx} className="text-foreground line-clamp-1">• {goal}</li>
                      ))}
                      {card.goals.length > 2 && (
                        <li className="text-muted-foreground italic">+{card.goals.length - 2} more</li>
                      )}
                    </ul>
                  </div>
                )}

                {card.metrics.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ChartLineUp size={16} weight="fill" className="text-accent" />
                      <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Metrics</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {card.metrics.slice(0, 3).map((metric, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {metric}
                        </Badge>
                      ))}
                      {card.metrics.length > 3 && (
                        <Badge variant="secondary" className="text-xs">+{card.metrics.length - 3}</Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t text-xs text-muted-foreground font-mono">
                  Created {new Date(card.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedCard && (
        <Dialog open={!!selectedCard} onOpenChange={() => setSelectedCard(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedCard.title}</DialogTitle>
              <DialogDescription>
                <Badge variant="outline" className="mt-2">
                  {frameworks.find(f => f.value === selectedCard.framework)?.label}
                </Badge>
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="space-y-6 py-4">
                <div>
                  <h4 className="font-semibold text-sm uppercase tracking-wide mb-2 flex items-center gap-2">
                    <Lightbulb size={16} weight="fill" className="text-accent" />
                    Vision Statement
                  </h4>
                  <p className="text-foreground">{selectedCard.vision}</p>
                </div>

                <Separator />

                {selectedCard.goals.length > 0 && (
                  <>
                    <div>
                      <h4 className="font-semibold text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                        <Target size={16} weight="fill" className="text-accent" />
                        Strategic Goals
                      </h4>
                      <ul className="space-y-2">
                        {selectedCard.goals.map((goal, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span className="text-accent font-bold font-mono text-sm mt-0.5">{idx + 1}.</span>
                            <span className="text-foreground">{goal}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Separator />
                  </>
                )}

                {selectedCard.metrics.length > 0 && (
                  <>
                    <div>
                      <h4 className="font-semibold text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                        <ChartLineUp size={16} weight="fill" className="text-accent" />
                        Key Metrics
                      </h4>
                      <ul className="space-y-2">
                        {selectedCard.metrics.map((metric, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span className="text-accent font-bold font-mono text-sm mt-0.5">•</span>
                            <span className="text-foreground">{metric}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Separator />
                  </>
                )}

                {selectedCard.assumptions.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm uppercase tracking-wide mb-3">Key Assumptions</h4>
                    <ul className="space-y-2">
                      {selectedCard.assumptions.map((assumption, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm">
                          <span className="text-muted-foreground">•</span>
                          <span className="text-foreground">{assumption}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
