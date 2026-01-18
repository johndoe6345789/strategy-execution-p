import { useKV } from '@github/spark/hooks'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ArrowRight, Target, CheckCircle, Warning, XCircle, Clock, Tree, Link as LinkIcon } from '@phosphor-icons/react'
import type { StrategyCard, Initiative, StatusType } from '@/types'

const statusConfig = {
  'not-started': { label: 'Not Started', color: 'bg-muted text-muted-foreground', icon: Clock },
  'on-track': { label: 'On Track', color: 'bg-success text-white', icon: CheckCircle },
  'at-risk': { label: 'At Risk', color: 'bg-at-risk text-white', icon: Warning },
  'blocked': { label: 'Blocked', color: 'bg-destructive text-white', icon: XCircle },
  'completed': { label: 'Completed', color: 'bg-primary text-primary-foreground', icon: CheckCircle },
}

export default function StrategyTraceability() {
  const [strategyCards] = useKV<StrategyCard[]>('strategy-cards', [])
  const [initiatives] = useKV<Initiative[]>('initiatives', [])
  const [selectedCardId, setSelectedCardId] = useState<string>('')
  const [viewMode, setViewMode] = useState<'tree' | 'network'>('tree')

  const selectedCard = strategyCards?.find(c => c.id === selectedCardId)
  const linkedInitiatives = initiatives?.filter(i => i.strategyCardId === selectedCardId) || []

  const allCards = strategyCards || []
  const allInitiatives = initiatives || []

  const orphanedInitiatives = allInitiatives.filter(
    init => !allCards.some(card => card.id === init.strategyCardId)
  )

  const cardsWithoutInitiatives = allCards.filter(
    card => !allInitiatives.some(init => init.strategyCardId === card.id)
  )

  if (allCards.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Tree size={48} weight="duotone" className="text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Strategy Cards Yet</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Create strategy cards first to view traceability
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Strategy Traceability</h2>
          <p className="text-muted-foreground mt-1">
            Visualize connections between strategic goals and execution initiatives
          </p>
        </div>
      </div>

      {(orphanedInitiatives.length > 0 || cardsWithoutInitiatives.length > 0) && (
        <div className="grid grid-cols-2 gap-4">
          {orphanedInitiatives.length > 0 && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Warning size={18} weight="fill" className="text-destructive" />
                  Orphaned Initiatives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-2">
                  {orphanedInitiatives.length} initiative{orphanedInitiatives.length !== 1 ? 's' : ''} not linked to any strategy card
                </p>
                <ul className="space-y-1">
                  {orphanedInitiatives.slice(0, 3).map(init => (
                    <li key={init.id} className="text-xs text-foreground">• {init.title}</li>
                  ))}
                  {orphanedInitiatives.length > 3 && (
                    <li className="text-xs text-muted-foreground italic">+{orphanedInitiatives.length - 3} more</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          )}

          {cardsWithoutInitiatives.length > 0 && (
            <Card className="border-warning/50 bg-warning/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Warning size={18} weight="fill" className="text-warning" />
                  Strategy Cards Without Initiatives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-2">
                  {cardsWithoutInitiatives.length} strategy card{cardsWithoutInitiatives.length !== 1 ? 's' : ''} with no linked initiatives
                </p>
                <ul className="space-y-1">
                  {cardsWithoutInitiatives.slice(0, 3).map(card => (
                    <li key={card.id} className="text-xs text-foreground">• {card.title}</li>
                  ))}
                  {cardsWithoutInitiatives.length > 3 && (
                    <li className="text-xs text-muted-foreground italic">+{cardsWithoutInitiatives.length - 3} more</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Select Strategy Card</CardTitle>
              <CardDescription>View all initiatives linked to this strategy</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Select value={selectedCardId} onValueChange={setSelectedCardId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a strategy card to explore" />
            </SelectTrigger>
            <SelectContent>
              {allCards.map(card => {
                const count = allInitiatives.filter(i => i.strategyCardId === card.id).length
                return (
                  <SelectItem key={card.id} value={card.id}>
                    {card.title} ({count} initiative{count !== 1 ? 's' : ''})
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedCard && (
        <div className="space-y-6">
          <Card className="border-2 border-accent/30 bg-accent/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-accent rounded-lg">
                  <Target size={24} weight="fill" className="text-accent-foreground" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl">{selectedCard.title}</CardTitle>
                  <CardDescription className="mt-1">
                    <Badge variant="outline">{selectedCard.framework}</Badge>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Vision
                  </h4>
                  <p className="text-sm">{selectedCard.vision}</p>
                </div>

                {selectedCard.goals.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                      Strategic Goals ({selectedCard.goals.length})
                    </h4>
                    <ul className="space-y-1">
                      {selectedCard.goals.map((goal, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <span className="text-accent font-bold">{idx + 1}.</span>
                          <span>{goal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedCard.metrics.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                      Key Metrics ({selectedCard.metrics.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCard.metrics.map((metric, idx) => (
                        <Badge key={idx} variant="secondary">
                          {metric}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center py-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ArrowRight size={24} weight="bold" className="text-accent" />
              <span className="text-sm font-semibold uppercase tracking-wide">Links To</span>
              <ArrowRight size={24} weight="bold" className="text-accent" />
            </div>
          </div>

          {linkedInitiatives.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <LinkIcon size={48} weight="duotone" className="text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Linked Initiatives</h3>
                <p className="text-muted-foreground text-center max-w-md text-sm">
                  This strategy card doesn't have any initiatives linked to it yet. Create initiatives in the Workbench and link them to this strategy.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  Linked Initiatives ({linkedInitiatives.length})
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle size={14} weight="fill" />
                    {linkedInitiatives.filter(i => i.status === 'completed').length} Completed
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Clock size={14} weight="fill" />
                    {linkedInitiatives.filter(i => i.status === 'on-track').length} On Track
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Warning size={14} weight="fill" />
                    {linkedInitiatives.filter(i => i.status === 'at-risk' || i.status === 'blocked').length} At Risk
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4">
                {linkedInitiatives.map((initiative) => {
                  const StatusIcon = statusConfig[initiative.status].icon
                  return (
                    <Card key={initiative.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg ${statusConfig[initiative.status].color}`}>
                            <StatusIcon size={20} weight="fill" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold mb-1">{initiative.title}</h4>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {initiative.description}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={statusConfig[initiative.status].color}>
                                {statusConfig[initiative.status].label}
                              </Badge>
                              <Badge variant="outline">
                                {initiative.priority}
                              </Badge>
                              <Badge variant="secondary">
                                {initiative.portfolio.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                              </Badge>
                              <span className="text-xs text-muted-foreground font-mono">
                                Progress: {initiative.progress}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {!selectedCard && allCards.length > 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Tree size={48} weight="duotone" className="text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select a Strategy Card</h3>
            <p className="text-muted-foreground text-center max-w-md text-sm">
              Choose a strategy card above to view its complete traceability map
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-sm">Traceability Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-accent">{allCards.length}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Strategy Cards</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">{allInitiatives.length}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Total Initiatives</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">
                {allCards.length > 0 ? (allInitiatives.length / allCards.length).toFixed(1) : '0'}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Avg Initiatives/Card</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
