import { useKV } from '@github/spark/hooks'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Target, Lightbulb, ChartLineUp, ArrowsLeftRight, Check, X } from '@phosphor-icons/react'
import type { StrategyCard } from '@/types'

export default function StrategyComparison() {
  const [strategyCards] = useKV<StrategyCard[]>('strategy-cards', [])
  const [card1Id, setCard1Id] = useState<string>('')
  const [card2Id, setCard2Id] = useState<string>('')

  const card1 = strategyCards?.find(c => c.id === card1Id)
  const card2 = strategyCards?.find(c => c.id === card2Id)

  const availableCards = strategyCards || []

  if (availableCards.length < 2) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-6 mb-4">
            <ArrowsLeftRight size={48} weight="duotone" className="text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Not Enough Strategy Cards</h3>
          <p className="text-muted-foreground text-center max-w-md">
            You need at least 2 strategy cards to compare them. Create more cards first.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Strategy Comparison</h2>
          <p className="text-muted-foreground mt-1">Compare and evaluate multiple strategic options</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">Strategy Option A</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={card1Id} onValueChange={setCard1Id}>
              <SelectTrigger>
                <SelectValue placeholder="Select first strategy card" />
              </SelectTrigger>
              <SelectContent>
                {availableCards.map(card => (
                  <SelectItem key={card.id} value={card.id} disabled={card.id === card2Id}>
                    {card.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">Strategy Option B</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={card2Id} onValueChange={setCard2Id}>
              <SelectTrigger>
                <SelectValue placeholder="Select second strategy card" />
              </SelectTrigger>
              <SelectContent>
                {availableCards.map(card => (
                  <SelectItem key={card.id} value={card.id} disabled={card.id === card1Id}>
                    {card.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {card1 && card2 && (
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <ArrowsLeftRight size={24} weight="bold" className="text-accent" />
              <CardTitle>Strategic Comparison Analysis</CardTitle>
            </div>
            <CardDescription>Side-by-side comparison of key strategic elements</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{card1.title}</h3>
                    <Badge variant="outline">{card1.framework}</Badge>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{card2.title}</h3>
                    <Badge variant="outline">{card2.framework}</Badge>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb size={20} weight="fill" className="text-accent" />
                    <h4 className="text-lg font-semibold">Vision Statement</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <Card className="bg-muted/30">
                      <CardContent className="pt-6">
                        <p className="text-sm leading-relaxed">{card1.vision}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/30">
                      <CardContent className="pt-6">
                        <p className="text-sm leading-relaxed">{card2.vision}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Target size={20} weight="fill" className="text-accent" />
                    <h4 className="text-lg font-semibold">Strategic Goals</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <Card className="bg-muted/30">
                      <CardContent className="pt-6">
                        {card1.goals.length > 0 ? (
                          <ul className="space-y-2">
                            {card1.goals.map((goal, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <Check size={16} weight="bold" className="text-success mt-0.5 flex-shrink-0" />
                                <span>{goal}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No goals defined</p>
                        )}
                        <div className="mt-4 pt-4 border-t">
                          <span className="text-xs text-muted-foreground font-mono">
                            {card1.goals.length} goal{card1.goals.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/30">
                      <CardContent className="pt-6">
                        {card2.goals.length > 0 ? (
                          <ul className="space-y-2">
                            {card2.goals.map((goal, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <Check size={16} weight="bold" className="text-success mt-0.5 flex-shrink-0" />
                                <span>{goal}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No goals defined</p>
                        )}
                        <div className="mt-4 pt-4 border-t">
                          <span className="text-xs text-muted-foreground font-mono">
                            {card2.goals.length} goal{card2.goals.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <ChartLineUp size={20} weight="fill" className="text-accent" />
                    <h4 className="text-lg font-semibold">Key Metrics</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <Card className="bg-muted/30">
                      <CardContent className="pt-6">
                        {card1.metrics.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {card1.metrics.map((metric, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {metric}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No metrics defined</p>
                        )}
                        <div className="mt-4 pt-4 border-t">
                          <span className="text-xs text-muted-foreground font-mono">
                            {card1.metrics.length} metric{card1.metrics.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/30">
                      <CardContent className="pt-6">
                        {card2.metrics.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {card2.metrics.map((metric, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {metric}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No metrics defined</p>
                        )}
                        <div className="mt-4 pt-4 border-t">
                          <span className="text-xs text-muted-foreground font-mono">
                            {card2.metrics.length} metric{card2.metrics.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h4 className="text-lg font-semibold">Key Assumptions</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <Card className="bg-muted/30">
                      <CardContent className="pt-6">
                        {card1.assumptions.length > 0 ? (
                          <ul className="space-y-2">
                            {card1.assumptions.map((assumption, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <span className="text-muted-foreground">•</span>
                                <span>{assumption}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No assumptions defined</p>
                        )}
                        <div className="mt-4 pt-4 border-t">
                          <span className="text-xs text-muted-foreground font-mono">
                            {card1.assumptions.length} assumption{card1.assumptions.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/30">
                      <CardContent className="pt-6">
                        {card2.assumptions.length > 0 ? (
                          <ul className="space-y-2">
                            {card2.assumptions.map((assumption, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <span className="text-muted-foreground">•</span>
                                <span>{assumption}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No assumptions defined</p>
                        )}
                        <div className="mt-4 pt-4 border-t">
                          <span className="text-xs text-muted-foreground font-mono">
                            {card2.assumptions.length} assumption{card2.assumptions.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-lg font-semibold mb-4">Summary Comparison</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Metric</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">{card1.title}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">{card2.title}</p>
                    </div>

                    <div className="text-sm font-medium">Goals Defined</div>
                    <div className="text-center font-mono text-sm font-bold">{card1.goals.length}</div>
                    <div className="text-center font-mono text-sm font-bold">{card2.goals.length}</div>

                    <div className="text-sm font-medium">Metrics Tracked</div>
                    <div className="text-center font-mono text-sm font-bold">{card1.metrics.length}</div>
                    <div className="text-center font-mono text-sm font-bold">{card2.metrics.length}</div>

                    <div className="text-sm font-medium">Assumptions Listed</div>
                    <div className="text-center font-mono text-sm font-bold">{card1.assumptions.length}</div>
                    <div className="text-center font-mono text-sm font-bold">{card2.assumptions.length}</div>

                    <div className="text-sm font-medium">Created</div>
                    <div className="text-center text-xs text-muted-foreground">
                      {new Date(card1.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-center text-xs text-muted-foreground">
                      {new Date(card2.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
