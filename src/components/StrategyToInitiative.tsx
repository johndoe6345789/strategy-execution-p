import { useKV } from '@github/spark/hooks'
import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  ArrowRight, 
  CheckCircle, 
  Sparkle,
  Target,
  Lightning,
  ArrowsDownUp,
  CalendarBlank,
  CurrencyDollar,
  User
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { StrategyCard, Initiative, StatusType, PriorityType, PortfolioType } from '@/types'

interface InitiativeSuggestion {
  id: string
  title: string
  description: string
  rationale: string
  suggestedPriority: PriorityType
  suggestedPortfolio: PortfolioType
  linkedGoals: string[]
}

export default function StrategyToInitiative() {
  const [strategyCards] = useKV<StrategyCard[]>('strategy-cards', [])
  const [initiatives, setInitiatives] = useKV<Initiative[]>('initiatives', [])
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [suggestions, setSuggestions] = useState<InitiativeSuggestion[]>([])
  const [isCreatingInitiative, setIsCreatingInitiative] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState<InitiativeSuggestion | null>(null)
  
  const [newInitiative, setNewInitiative] = useState({
    title: '',
    description: '',
    owner: '',
    startDate: '',
    endDate: '',
    budget: 0,
    priority: 'medium' as PriorityType,
    portfolio: 'operational-excellence' as PortfolioType
  })

  const selectedStrategy = useMemo(() => 
    strategyCards?.find(s => s.id === selectedStrategyId), 
    [strategyCards, selectedStrategyId]
  )

  const linkedInitiatives = useMemo(() => 
    initiatives?.filter(i => i.strategyCardId === selectedStrategyId) || [],
    [initiatives, selectedStrategyId]
  )

  const generateSuggestions = async () => {
    if (!selectedStrategy) return

    setIsGenerating(true)
    
    try {
      const promptText = `You are a strategic planning expert. Based on the following strategy card, suggest 3-5 concrete initiatives that would help achieve the strategic goals.

Strategy Title: ${selectedStrategy.title}
Vision: ${selectedStrategy.vision}
Goals: ${selectedStrategy.goals.join(', ')}
Metrics: ${selectedStrategy.metrics.join(', ')}

For each initiative, provide:
1. A clear, actionable title
2. A detailed description explaining what needs to be done
3. Rationale explaining how this supports the strategy
4. Suggested priority (critical, high, medium, low)
5. Suggested portfolio type (operational-excellence, ma, financial-transformation, esg, innovation)
6. Which specific goals from the strategy it addresses

Return your response as a valid JSON object with a single property "suggestions" that contains an array of initiative objects. Each object should have: title, description, rationale, suggestedPriority, suggestedPortfolio, linkedGoals (array of goal strings).`

      const response = await window.spark.llm(promptText, 'gpt-4o', true)
      const parsed = JSON.parse(response)
      
      const generatedSuggestions: InitiativeSuggestion[] = parsed.suggestions.map((s: any, idx: number) => ({
        id: `suggestion-${Date.now()}-${idx}`,
        title: s.title,
        description: s.description,
        rationale: s.rationale,
        suggestedPriority: s.suggestedPriority as PriorityType,
        suggestedPortfolio: s.suggestedPortfolio as PortfolioType,
        linkedGoals: Array.isArray(s.linkedGoals) ? s.linkedGoals : []
      }))

      setSuggestions(generatedSuggestions)
      toast.success(`Generated ${generatedSuggestions.length} initiative suggestions`)
    } catch (error) {
      console.error('Error generating suggestions:', error)
      toast.error('Failed to generate suggestions. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSelectSuggestion = (suggestion: InitiativeSuggestion) => {
    setSelectedSuggestion(suggestion)
    setNewInitiative({
      title: suggestion.title,
      description: suggestion.description,
      owner: '',
      startDate: '',
      endDate: '',
      budget: 0,
      priority: suggestion.suggestedPriority,
      portfolio: suggestion.suggestedPortfolio
    })
    setIsCreatingInitiative(true)
  }

  const handleCreateInitiative = () => {
    if (!selectedStrategy || !newInitiative.title || !newInitiative.owner || !newInitiative.startDate || !newInitiative.endDate) {
      toast.error('Please fill in all required fields')
      return
    }

    const initiative: Initiative = {
      id: `init-${Date.now()}`,
      title: newInitiative.title,
      description: newInitiative.description,
      strategyCardId: selectedStrategy.id,
      owner: newInitiative.owner,
      status: 'not-started',
      priority: newInitiative.priority,
      portfolio: newInitiative.portfolio,
      progress: 0,
      startDate: newInitiative.startDate,
      endDate: newInitiative.endDate,
      budget: newInitiative.budget,
      kpis: []
    }

    setInitiatives((current) => [...(current || []), initiative])
    toast.success('Initiative created and linked to strategy')
    
    setIsCreatingInitiative(false)
    setSelectedSuggestion(null)
    setNewInitiative({
      title: '',
      description: '',
      owner: '',
      startDate: '',
      endDate: '',
      budget: 0,
      priority: 'medium',
      portfolio: 'operational-excellence'
    })
    
    if (selectedSuggestion) {
      setSuggestions(suggestions.filter(s => s.id !== selectedSuggestion.id))
    }
  }

  const strategyWithoutInitiatives = (strategyCards || []).filter(
    s => !(initiatives || []).some(i => i.strategyCardId === s.id)
  )

  const completionRate = selectedStrategy && linkedInitiatives.length > 0
    ? Math.round((linkedInitiatives.filter(i => i.status === 'completed').length / linkedInitiatives.length) * 100)
    : 0

  const priorityColors = {
    'critical': 'bg-destructive/10 text-destructive border-destructive/30',
    'high': 'bg-warning/10 text-warning border-warning/30',
    'medium': 'bg-primary/10 text-primary border-primary/30',
    'low': 'bg-muted text-muted-foreground'
  }

  const portfolioLabels = {
    'operational-excellence': 'Operational Excellence',
    'ma': 'M&A',
    'financial-transformation': 'Financial Transformation',
    'esg': 'ESG',
    'innovation': 'Innovation'
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Strategy-to-Initiative Translation</h2>
        <p className="text-muted-foreground mt-1">
          Convert strategic goals into executable initiatives with AI-powered suggestions
        </p>
      </div>

      {strategyWithoutInitiatives.length > 0 && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Lightning size={24} className="text-warning" weight="bold" />
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1">Strategies Without Initiatives</h3>
                <p className="text-sm text-muted-foreground">
                  {strategyWithoutInitiatives.length} {strategyWithoutInitiatives.length === 1 ? 'strategy has' : 'strategies have'} no linked initiatives. 
                  Select {strategyWithoutInitiatives.length === 1 ? 'it' : 'one'} below to generate execution plans.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Strategy</CardTitle>
            <CardDescription>Choose a strategy to translate into initiatives</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(strategyCards || []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No strategies yet. Create a strategy card first.
              </p>
            ) : (
              (strategyCards || []).map((strategy) => {
                const initCount = (initiatives || []).filter(i => i.strategyCardId === strategy.id).length
                const isSelected = selectedStrategyId === strategy.id
                
                return (
                  <Card
                    key={strategy.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? 'border-accent ring-2 ring-accent/20' : ''
                    }`}
                    onClick={() => setSelectedStrategyId(strategy.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-semibold text-sm">{strategy.title}</h4>
                        {isSelected && (
                          <CheckCircle size={20} weight="fill" className="text-accent shrink-0" />
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs mb-2">
                        {strategy.framework}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {initCount} {initCount === 1 ? 'initiative' : 'initiatives'}
                      </p>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          {selectedStrategy ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle>{selectedStrategy.title}</CardTitle>
                      <CardDescription className="mt-2">{selectedStrategy.vision}</CardDescription>
                    </div>
                    <Button
                      onClick={generateSuggestions}
                      disabled={isGenerating}
                      className="gap-2"
                    >
                      <Sparkle size={20} weight="bold" />
                      {isGenerating ? 'Generating...' : 'AI Suggestions'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Strategic Goals</h4>
                    <div className="space-y-1">
                      {selectedStrategy.goals.map((goal, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <Target size={16} className="text-accent shrink-0 mt-0.5" weight="bold" />
                          <span>{goal}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Linked Initiatives</h4>
                      <div className="text-2xl font-bold text-accent">{linkedInitiatives.length}</div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Completion Rate</h4>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-success">{completionRate}%</div>
                        <Progress value={completionRate} className="h-2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {suggestions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkle size={24} className="text-accent" weight="fill" />
                      AI-Generated Initiative Suggestions
                    </CardTitle>
                    <CardDescription>
                      Review and refine these suggestions, then create initiatives to execute your strategy
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {suggestions.map((suggestion) => (
                      <Card key={suggestion.id} className="border-accent/30">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h4 className="font-semibold mb-2">{suggestion.title}</h4>
                                <p className="text-sm text-muted-foreground mb-3">{suggestion.description}</p>
                                <div className="bg-accent/5 p-3 rounded-lg mb-3">
                                  <p className="text-xs font-semibold text-accent mb-1">Strategic Rationale:</p>
                                  <p className="text-sm text-muted-foreground">{suggestion.rationale}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge variant="outline" className={priorityColors[suggestion.suggestedPriority]}>
                                    {suggestion.suggestedPriority} priority
                                  </Badge>
                                  <Badge variant="outline">
                                    {portfolioLabels[suggestion.suggestedPortfolio]}
                                  </Badge>
                                  {suggestion.linkedGoals.length > 0 && (
                                    <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                                      {suggestion.linkedGoals.length} goal{suggestion.linkedGoals.length > 1 ? 's' : ''}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleSelectSuggestion(suggestion)}
                                className="gap-2 shrink-0"
                              >
                                <Plus size={16} weight="bold" />
                                Create
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              )}

              {linkedInitiatives.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Existing Initiatives</CardTitle>
                    <CardDescription>Initiatives already linked to this strategy</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {linkedInitiatives.map((initiative) => (
                      <div key={initiative.id} className="p-4 border border-border rounded-lg">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-1">{initiative.title}</h4>
                            <p className="text-xs text-muted-foreground mb-2">{initiative.description}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {initiative.status.replace('-', ' ')}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {initiative.owner}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {initiative.progress}% complete
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ArrowRight size={48} className="text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Select a strategy from the left to begin translating it into executable initiatives
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={isCreatingInitiative} onOpenChange={setIsCreatingInitiative}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Initiative from Strategy</DialogTitle>
            <DialogDescription>
              Fill in the details to create an executable initiative linked to "{selectedStrategy?.title}"
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="grid gap-4 py-4 pr-4">
              <div className="grid gap-2">
                <Label htmlFor="init-title">Initiative Title *</Label>
                <Input
                  id="init-title"
                  value={newInitiative.title}
                  onChange={(e) => setNewInitiative({ ...newInitiative, title: e.target.value })}
                  placeholder="e.g., Launch Customer Success Program"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="init-description">Description *</Label>
                <Textarea
                  id="init-description"
                  value={newInitiative.description}
                  onChange={(e) => setNewInitiative({ ...newInitiative, description: e.target.value })}
                  placeholder="Describe what this initiative will accomplish..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="init-owner">Owner *</Label>
                  <Input
                    id="init-owner"
                    value={newInitiative.owner}
                    onChange={(e) => setNewInitiative({ ...newInitiative, owner: e.target.value })}
                    placeholder="Initiative owner name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="init-priority">Priority</Label>
                  <Select
                    value={newInitiative.priority}
                    onValueChange={(value) => setNewInitiative({ ...newInitiative, priority: value as PriorityType })}
                  >
                    <SelectTrigger id="init-priority">
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
              <div className="grid gap-2">
                <Label htmlFor="init-portfolio">Portfolio</Label>
                <Select
                  value={newInitiative.portfolio}
                  onValueChange={(value) => setNewInitiative({ ...newInitiative, portfolio: value as PortfolioType })}
                >
                  <SelectTrigger id="init-portfolio">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational-excellence">Operational Excellence</SelectItem>
                    <SelectItem value="ma">M&A</SelectItem>
                    <SelectItem value="financial-transformation">Financial Transformation</SelectItem>
                    <SelectItem value="esg">ESG</SelectItem>
                    <SelectItem value="innovation">Innovation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="init-start">Start Date *</Label>
                  <Input
                    id="init-start"
                    type="date"
                    value={newInitiative.startDate}
                    onChange={(e) => setNewInitiative({ ...newInitiative, startDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="init-end">End Date *</Label>
                  <Input
                    id="init-end"
                    type="date"
                    value={newInitiative.endDate}
                    onChange={(e) => setNewInitiative({ ...newInitiative, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="init-budget">Budget ($)</Label>
                <Input
                  id="init-budget"
                  type="number"
                  value={newInitiative.budget}
                  onChange={(e) => setNewInitiative({ ...newInitiative, budget: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatingInitiative(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateInitiative}>
              Create Initiative
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
