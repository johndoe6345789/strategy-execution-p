import { useKV } from '@github/spark/hooks'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, ChartLine, TrendUp, TrendDown, Minus, Eye, EyeSlash, PencilSimple, Trash } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Initiative } from '@/types'

interface ScorecardMetric {
  id: string
  name: string
  description?: string
  category: string
  target: number
  current: number
  unit: string
  trend: 'up' | 'down' | 'flat'
  weight: number
  visible: boolean
}

interface Scorecard {
  id: string
  name: string
  description: string
  metrics: ScorecardMetric[]
  createdAt: number
  updatedAt: number
  isDefault: boolean
}

const defaultMetricCategories = [
  'Financial',
  'Customer',
  'Internal Process',
  'Learning & Growth',
  'Strategic',
  'Operational',
  'Quality',
  'Safety'
]

export default function CustomScorecard() {
  const [initiatives] = useKV<Initiative[]>('initiatives', [])
  const [scorecards, setScorecards] = useKV<Scorecard[]>('custom-scorecards', [])
  const [selectedScorecard, setSelectedScorecard] = useState<string>('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditMetricDialogOpen, setIsEditMetricDialogOpen] = useState(false)
  const [editingMetric, setEditingMetric] = useState<ScorecardMetric | null>(null)
  const [newScorecard, setNewScorecard] = useState({
    name: '',
    description: ''
  })
  const [newMetric, setNewMetric] = useState({
    name: '',
    description: '',
    category: 'Financial',
    target: 100,
    current: 0,
    unit: '%',
    trend: 'up' as const,
    weight: 1
  })

  const createScorecard = () => {
    if (!newScorecard.name.trim()) {
      toast.error('Please enter a scorecard name')
      return
    }

    const scorecard: Scorecard = {
      id: `scorecard-${Date.now()}`,
      name: newScorecard.name,
      description: newScorecard.description,
      metrics: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isDefault: (scorecards || []).length === 0
    }

    setScorecards((current) => [...(current || []), scorecard])
    setSelectedScorecard(scorecard.id)
    setIsCreateDialogOpen(false)
    setNewScorecard({ name: '', description: '' })
    toast.success('Scorecard created!')
  }

  const addMetric = () => {
    if (!selectedScorecard || !newMetric.name.trim()) {
      toast.error('Please enter a metric name')
      return
    }

    const metric: ScorecardMetric = {
      id: `metric-${Date.now()}`,
      name: newMetric.name,
      description: newMetric.description,
      category: newMetric.category,
      target: newMetric.target,
      current: newMetric.current,
      unit: newMetric.unit,
      trend: newMetric.trend,
      weight: newMetric.weight,
      visible: true
    }

    setScorecards((current) =>
      (current || []).map(s =>
        s.id === selectedScorecard
          ? { ...s, metrics: [...s.metrics, metric], updatedAt: Date.now() }
          : s
      )
    )

    setNewMetric({
      name: '',
      description: '',
      category: 'Financial',
      target: 100,
      current: 0,
      unit: '%',
      trend: 'up',
      weight: 1
    })
    toast.success('Metric added!')
  }

  const updateMetric = () => {
    if (!editingMetric || !selectedScorecard) return

    setScorecards((current) =>
      (current || []).map(s =>
        s.id === selectedScorecard
          ? {
              ...s,
              metrics: s.metrics.map(m => (m.id === editingMetric.id ? editingMetric : m)),
              updatedAt: Date.now()
            }
          : s
      )
    )

    setIsEditMetricDialogOpen(false)
    setEditingMetric(null)
    toast.success('Metric updated!')
  }

  const toggleMetricVisibility = (metricId: string) => {
    setScorecards((current) =>
      (current || []).map(s =>
        s.id === selectedScorecard
          ? {
              ...s,
              metrics: s.metrics.map(m =>
                m.id === metricId ? { ...m, visible: !m.visible } : m
              ),
              updatedAt: Date.now()
            }
          : s
      )
    )
  }

  const deleteMetric = (metricId: string) => {
    setScorecards((current) =>
      (current || []).map(s =>
        s.id === selectedScorecard
          ? {
              ...s,
              metrics: s.metrics.filter(m => m.id !== metricId),
              updatedAt: Date.now()
            }
          : s
      )
    )
    toast.success('Metric removed')
  }

  const deleteScorecard = (scorecardId: string) => {
    setScorecards((current) => (current || []).filter(s => s.id !== scorecardId))
    if (selectedScorecard === scorecardId) {
      setSelectedScorecard('')
    }
    toast.success('Scorecard deleted')
  }

  const calculateScore = (metric: ScorecardMetric): number => {
    if (metric.target === 0) return 0
    const percentage = (metric.current / metric.target) * 100
    return Math.min(Math.max(percentage, 0), 100)
  }

  const calculateOverallScore = (scorecard: Scorecard): number => {
    const visibleMetrics = scorecard.metrics.filter(m => m.visible)
    if (visibleMetrics.length === 0) return 0

    const totalWeight = visibleMetrics.reduce((sum, m) => sum + m.weight, 0)
    const weightedScore = visibleMetrics.reduce((sum, m) => {
      const score = calculateScore(m)
      return sum + score * m.weight
    }, 0)

    return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0
  }

  const currentScorecard = (scorecards || []).find(s => s.id === selectedScorecard)
  const visibleMetrics = currentScorecard?.metrics.filter(m => m.visible) || []
  const metricsGrouped = visibleMetrics.reduce((acc, metric) => {
    if (!acc[metric.category]) {
      acc[metric.category] = []
    }
    acc[metric.category].push(metric)
    return acc
  }, {} as Record<string, ScorecardMetric[]>)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Custom Scorecards</h2>
          <p className="text-muted-foreground mt-2">
            Create and manage configurable performance scorecards
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} weight="bold" />
              Create Scorecard
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Scorecard</DialogTitle>
              <DialogDescription>
                Build a custom scorecard with your own metrics and KPIs
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="scorecard-name">Scorecard Name</Label>
                <Input
                  id="scorecard-name"
                  value={newScorecard.name}
                  onChange={(e) => setNewScorecard({ ...newScorecard, name: e.target.value })}
                  placeholder="e.g., Executive Dashboard, Operational Metrics"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="scorecard-description">Description</Label>
                <Input
                  id="scorecard-description"
                  value={newScorecard.description}
                  onChange={(e) => setNewScorecard({ ...newScorecard, description: e.target.value })}
                  placeholder="What does this scorecard track?"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createScorecard}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {(scorecards || []).length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <ChartLine size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Scorecards Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first custom scorecard to track performance metrics
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
              <Plus size={16} weight="bold" />
              Create Your First Scorecard
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Label>Select Scorecard:</Label>
            <Select value={selectedScorecard} onValueChange={setSelectedScorecard}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Choose a scorecard" />
              </SelectTrigger>
              <SelectContent>
                {(scorecards || []).map((scorecard) => (
                  <SelectItem key={scorecard.id} value={scorecard.id}>
                    {scorecard.name}
                    {scorecard.isDefault && ' (Default)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedScorecard && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteScorecard(selectedScorecard)}
              >
                <Trash size={16} />
              </Button>
            )}
          </div>

          {currentScorecard && (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{currentScorecard.name}</CardTitle>
                      {currentScorecard.description && (
                        <CardDescription>{currentScorecard.description}</CardDescription>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-accent">
                        {calculateOverallScore(currentScorecard)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Overall Score</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={calculateOverallScore(currentScorecard)} className="h-3" />
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <span>{visibleMetrics.length} active metrics</span>
                    <span>Last updated: {new Date(currentScorecard.updatedAt).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Add Metric</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      <div className="grid gap-2">
                        <Label htmlFor="metric-name" className="text-xs">Metric Name</Label>
                        <Input
                          id="metric-name"
                          value={newMetric.name}
                          onChange={(e) => setNewMetric({ ...newMetric, name: e.target.value })}
                          placeholder="e.g., Revenue Growth"
                          className="h-9"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="metric-category" className="text-xs">Category</Label>
                        <Select
                          value={newMetric.category}
                          onValueChange={(value) => setNewMetric({ ...newMetric, category: value })}
                        >
                          <SelectTrigger id="metric-category" className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {defaultMetricCategories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="grid gap-2">
                          <Label htmlFor="metric-current" className="text-xs">Current</Label>
                          <Input
                            id="metric-current"
                            type="number"
                            value={newMetric.current}
                            onChange={(e) => setNewMetric({ ...newMetric, current: Number(e.target.value) })}
                            className="h-9"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="metric-target" className="text-xs">Target</Label>
                          <Input
                            id="metric-target"
                            type="number"
                            value={newMetric.target}
                            onChange={(e) => setNewMetric({ ...newMetric, target: Number(e.target.value) })}
                            className="h-9"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="grid gap-2">
                          <Label htmlFor="metric-unit" className="text-xs">Unit</Label>
                          <Input
                            id="metric-unit"
                            value={newMetric.unit}
                            onChange={(e) => setNewMetric({ ...newMetric, unit: e.target.value })}
                            placeholder="%"
                            className="h-9"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="metric-trend" className="text-xs">Trend</Label>
                          <Select
                            value={newMetric.trend}
                            onValueChange={(value: any) => setNewMetric({ ...newMetric, trend: value })}
                          >
                            <SelectTrigger id="metric-trend" className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="up">Up</SelectItem>
                              <SelectItem value="down">Down</SelectItem>
                              <SelectItem value="flat">Flat</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="metric-weight" className="text-xs">Weight</Label>
                          <Input
                            id="metric-weight"
                            type="number"
                            value={newMetric.weight}
                            onChange={(e) => setNewMetric({ ...newMetric, weight: Number(e.target.value) })}
                            min="1"
                            max="10"
                            className="h-9"
                          />
                        </div>
                      </div>
                      <Button onClick={addMetric} size="sm" className="gap-2 mt-2">
                        <Plus size={14} weight="bold" />
                        Add Metric
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Metric Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {currentScorecard.metrics.length === 0 ? (
                      <div className="text-center py-8 text-sm text-muted-foreground">
                        No metrics added yet
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[300px] overflow-auto">
                        {currentScorecard.metrics.map((metric) => (
                          <div
                            key={metric.id}
                            className="flex items-center gap-2 p-2 rounded-md border bg-card hover:bg-accent/5"
                          >
                            <Checkbox
                              checked={metric.visible}
                              onCheckedChange={() => toggleMetricVisibility(metric.id)}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{metric.name}</div>
                              <div className="text-xs text-muted-foreground">{metric.category}</div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingMetric(metric)
                                setIsEditMetricDialogOpen(true)
                              }}
                            >
                              <PencilSimple size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteMetric(metric.id)}
                            >
                              <Trash size={14} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue={Object.keys(metricsGrouped)[0] || 'all'} className="w-full">
                <TabsList>
                  <TabsTrigger value="all">All Metrics</TabsTrigger>
                  {Object.keys(metricsGrouped).map((category) => (
                    <TabsTrigger key={category} value={category}>
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="all" className="mt-4">
                  <div className="grid gap-4">
                    {Object.entries(metricsGrouped).map(([category, metrics]) => (
                      <div key={category}>
                        <h3 className="text-lg font-semibold mb-3">{category}</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {metrics.map((metric) => {
                            const score = calculateScore(metric)
                            const TrendIcon =
                              metric.trend === 'up' ? TrendUp : metric.trend === 'down' ? TrendDown : Minus
                            return (
                              <Card key={metric.id}>
                                <CardHeader className="pb-3">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <CardTitle className="text-sm">{metric.name}</CardTitle>
                                      {metric.description && (
                                        <CardDescription className="text-xs mt-1">
                                          {metric.description}
                                        </CardDescription>
                                      )}
                                    </div>
                                    <TrendIcon size={20} className="text-accent" weight="bold" />
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-3">
                                    <div className="flex items-baseline gap-2">
                                      <span className="text-3xl font-bold">
                                        {metric.current}
                                      </span>
                                      <span className="text-muted-foreground text-sm">
                                        / {metric.target} {metric.unit}
                                      </span>
                                    </div>
                                    <Progress value={score} className="h-2" />
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-muted-foreground">
                                        Score: {Math.round(score)}%
                                      </span>
                                      <Badge variant="secondary" className="text-xs">
                                        Weight: {metric.weight}
                                      </Badge>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {Object.entries(metricsGrouped).map(([category, metrics]) => (
                  <TabsContent key={category} value={category} className="mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      {metrics.map((metric) => {
                        const score = calculateScore(metric)
                        const TrendIcon =
                          metric.trend === 'up' ? TrendUp : metric.trend === 'down' ? TrendDown : Minus
                        return (
                          <Card key={metric.id}>
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-sm">{metric.name}</CardTitle>
                                  {metric.description && (
                                    <CardDescription className="text-xs mt-1">
                                      {metric.description}
                                    </CardDescription>
                                  )}
                                </div>
                                <TrendIcon size={20} className="text-accent" weight="bold" />
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div className="flex items-baseline gap-2">
                                  <span className="text-3xl font-bold">{metric.current}</span>
                                  <span className="text-muted-foreground text-sm">
                                    / {metric.target} {metric.unit}
                                  </span>
                                </div>
                                <Progress value={score} className="h-2" />
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">Score: {Math.round(score)}%</span>
                                  <Badge variant="secondary" className="text-xs">
                                    Weight: {metric.weight}
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </>
          )}
        </div>
      )}

      <Dialog open={isEditMetricDialogOpen} onOpenChange={setIsEditMetricDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Metric</DialogTitle>
            <DialogDescription>Update metric values and configuration</DialogDescription>
          </DialogHeader>
          {editingMetric && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Metric Name</Label>
                <Input
                  value={editingMetric.name}
                  onChange={(e) => setEditingMetric({ ...editingMetric, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Input
                  value={editingMetric.description || ''}
                  onChange={(e) => setEditingMetric({ ...editingMetric, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Current Value</Label>
                  <Input
                    type="number"
                    value={editingMetric.current}
                    onChange={(e) =>
                      setEditingMetric({ ...editingMetric, current: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Target Value</Label>
                  <Input
                    type="number"
                    value={editingMetric.target}
                    onChange={(e) =>
                      setEditingMetric({ ...editingMetric, target: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Unit</Label>
                  <Input
                    value={editingMetric.unit}
                    onChange={(e) => setEditingMetric({ ...editingMetric, unit: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Trend</Label>
                  <Select
                    value={editingMetric.trend}
                    onValueChange={(value: any) => setEditingMetric({ ...editingMetric, trend: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="up">Up</SelectItem>
                      <SelectItem value="down">Down</SelectItem>
                      <SelectItem value="flat">Flat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Weight</Label>
                  <Input
                    type="number"
                    value={editingMetric.weight}
                    onChange={(e) =>
                      setEditingMetric({ ...editingMetric, weight: Number(e.target.value) })
                    }
                    min="1"
                    max="10"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditMetricDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateMetric}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
