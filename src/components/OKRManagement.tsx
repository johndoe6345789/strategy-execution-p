import { useKV } from '@github/spark/hooks'
import { useState } from 'react'
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
import { Plus, Target, CheckCircle, TrendUp, TrendDown, User, Calendar, ArrowRight, Trash } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface KeyResult {
  id: string
  description: string
  startValue: number
  currentValue: number
  targetValue: number
  unit: string
  progress: number
  status: 'on-track' | 'at-risk' | 'behind' | 'achieved'
  lastUpdated: string
}

interface Objective {
  id: string
  title: string
  description: string
  owner: string
  category: 'company' | 'team' | 'individual'
  timeframe: 'quarterly' | 'annual'
  quarter?: string
  year: string
  status: 'active' | 'achieved' | 'at-risk' | 'abandoned'
  keyResults: KeyResult[]
  linkedInitiatives: string[]
  createdAt: string
  updatedAt: string
}

export default function OKRManagement() {
  const [objectives, setObjectives] = useKV<Objective[]>('okr-objectives', [])
  const [initiatives] = useKV<any[]>('initiatives', [])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isAddKRDialogOpen, setIsAddKRDialogOpen] = useState(false)
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'company' | 'team' | 'individual'>('all')
  const [selectedTimeframe, setSelectedTimeframe] = useState<'all' | 'quarterly' | 'annual'>('all')

  const [newObjective, setNewObjective] = useState({
    title: '',
    description: '',
    owner: '',
    category: 'team' as const,
    timeframe: 'quarterly' as const,
    quarter: 'Q1',
    year: new Date().getFullYear().toString()
  })

  const [newKeyResult, setNewKeyResult] = useState({
    description: '',
    startValue: 0,
    targetValue: 100,
    unit: '%'
  })

  const addObjective = () => {
    if (!newObjective.title || !newObjective.owner) {
      toast.error('Please fill in required fields')
      return
    }

    const objective: Objective = {
      id: `obj-${Date.now()}`,
      title: newObjective.title,
      description: newObjective.description,
      owner: newObjective.owner,
      category: newObjective.category,
      timeframe: newObjective.timeframe,
      quarter: newObjective.timeframe === 'quarterly' ? newObjective.quarter : undefined,
      year: newObjective.year,
      status: 'active',
      keyResults: [],
      linkedInitiatives: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setObjectives((current) => [...(current || []), objective])
    setIsAddDialogOpen(false)
    setNewObjective({
      title: '',
      description: '',
      owner: '',
      category: 'team',
      timeframe: 'quarterly',
      quarter: 'Q1',
      year: new Date().getFullYear().toString()
    })
    toast.success('Objective created successfully')
  }

  const addKeyResult = () => {
    if (!selectedObjective || !newKeyResult.description) {
      toast.error('Please fill in required fields')
      return
    }

    const keyResult: KeyResult = {
      id: `kr-${Date.now()}`,
      description: newKeyResult.description,
      startValue: newKeyResult.startValue,
      currentValue: newKeyResult.startValue,
      targetValue: newKeyResult.targetValue,
      unit: newKeyResult.unit,
      progress: 0,
      status: 'on-track',
      lastUpdated: new Date().toISOString()
    }

    setObjectives((current) =>
      (current || []).map(obj =>
        obj.id === selectedObjective.id
          ? { ...obj, keyResults: [...obj.keyResults, keyResult], updatedAt: new Date().toISOString() }
          : obj
      )
    )

    setIsAddKRDialogOpen(false)
    setNewKeyResult({
      description: '',
      startValue: 0,
      targetValue: 100,
      unit: '%'
    })
    toast.success('Key Result added successfully')
  }

  const updateKeyResultProgress = (objectiveId: string, krId: string, newValue: number) => {
    setObjectives((current) =>
      (current || []).map(obj => {
        if (obj.id === objectiveId) {
          const updatedKRs = obj.keyResults.map(kr => {
            if (kr.id === krId) {
              const range = kr.targetValue - kr.startValue
              const progress = Math.min(100, Math.max(0, ((newValue - kr.startValue) / range) * 100))
              let status: KeyResult['status'] = 'on-track'
              if (progress >= 100) status = 'achieved'
              else if (progress >= 70) status = 'on-track'
              else if (progress >= 40) status = 'at-risk'
              else status = 'behind'

              return {
                ...kr,
                currentValue: newValue,
                progress,
                status,
                lastUpdated: new Date().toISOString()
              }
            }
            return kr
          })

          const avgProgress = updatedKRs.reduce((sum, kr) => sum + kr.progress, 0) / updatedKRs.length
          let objStatus: Objective['status'] = 'active'
          if (avgProgress >= 100) objStatus = 'achieved'
          else if (avgProgress < 50) objStatus = 'at-risk'

          return { ...obj, keyResults: updatedKRs, status: objStatus, updatedAt: new Date().toISOString() }
        }
        return obj
      })
    )
    toast.success('Progress updated')
  }

  const deleteObjective = (id: string) => {
    setObjectives((current) => (current || []).filter(obj => obj.id !== id))
    toast.success('Objective deleted')
  }

  const deleteKeyResult = (objectiveId: string, krId: string) => {
    setObjectives((current) =>
      (current || []).map(obj =>
        obj.id === objectiveId
          ? { ...obj, keyResults: obj.keyResults.filter(kr => kr.id !== krId) }
          : obj
      )
    )
    toast.success('Key Result deleted')
  }

  const filteredObjectives = (objectives || []).filter(obj => {
    if (selectedCategory !== 'all' && obj.category !== selectedCategory) return false
    if (selectedTimeframe !== 'all' && obj.timeframe !== selectedTimeframe) return false
    return true
  })

  const calculateObjectiveProgress = (obj: Objective) => {
    if (obj.keyResults.length === 0) return 0
    return obj.keyResults.reduce((sum, kr) => sum + kr.progress, 0) / obj.keyResults.length
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'achieved': return 'bg-success text-white'
      case 'on-track': return 'bg-success text-white'
      case 'at-risk': return 'bg-at-risk text-white'
      case 'behind': return 'bg-destructive text-white'
      case 'abandoned': return 'bg-muted text-muted-foreground'
      default: return 'bg-secondary'
    }
  }

  const stats = {
    total: filteredObjectives.length,
    achieved: filteredObjectives.filter(o => o.status === 'achieved').length,
    active: filteredObjectives.filter(o => o.status === 'active').length,
    atRisk: filteredObjectives.filter(o => o.status === 'at-risk').length
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">OKR Management</h2>
          <p className="text-muted-foreground mt-2">
            Define and track Objectives and Key Results across the organization
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} weight="bold" />
              New Objective
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Objective</DialogTitle>
              <DialogDescription>
                Define a new objective. You'll add key results in the next step.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Objective Title *</Label>
                <Input
                  id="title"
                  value={newObjective.title}
                  onChange={(e) => setNewObjective({ ...newObjective, title: e.target.value })}
                  placeholder="e.g., Become the market leader in customer satisfaction"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newObjective.description}
                  onChange={(e) => setNewObjective({ ...newObjective, description: e.target.value })}
                  placeholder="Describe the objective and its strategic importance..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={newObjective.category}
                    onValueChange={(value: any) => setNewObjective({ ...newObjective, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="company">Company</SelectItem>
                      <SelectItem value="team">Team</SelectItem>
                      <SelectItem value="individual">Individual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="owner">Owner *</Label>
                  <Input
                    id="owner"
                    value={newObjective.owner}
                    onChange={(e) => setNewObjective({ ...newObjective, owner: e.target.value })}
                    placeholder="Owner name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="timeframe">Timeframe *</Label>
                  <Select
                    value={newObjective.timeframe}
                    onValueChange={(value: any) => setNewObjective({ ...newObjective, timeframe: value })}
                  >
                    <SelectTrigger id="timeframe">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newObjective.timeframe === 'quarterly' && (
                  <div className="grid gap-2">
                    <Label htmlFor="quarter">Quarter</Label>
                    <Select
                      value={newObjective.quarter}
                      onValueChange={(value) => setNewObjective({ ...newObjective, quarter: value })}
                    >
                      <SelectTrigger id="quarter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Q1">Q1</SelectItem>
                        <SelectItem value="Q2">Q2</SelectItem>
                        <SelectItem value="Q3">Q3</SelectItem>
                        <SelectItem value="Q4">Q4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={newObjective.year}
                    onChange={(e) => setNewObjective({ ...newObjective, year: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addObjective}>Create Objective</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Objectives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Achieved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{stats.achieved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">At Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-at-risk">{stats.atRisk}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <Label className="text-sm font-medium">Filters:</Label>
        <Select value={selectedCategory} onValueChange={(value: any) => setSelectedCategory(value)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="company">Company</SelectItem>
            <SelectItem value="team">Team</SelectItem>
            <SelectItem value="individual">Individual</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedTimeframe} onValueChange={(value: any) => setSelectedTimeframe(value)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Timeframes</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="annual">Annual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredObjectives.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target size={48} className="text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No objectives yet. Create your first objective to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredObjectives.map((objective) => {
            const progress = calculateObjectiveProgress(objective)
            return (
              <Card key={objective.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{objective.title}</CardTitle>
                        <Badge className={getStatusColor(objective.status)}>
                          {objective.status}
                        </Badge>
                        <Badge variant="outline">
                          {objective.category}
                        </Badge>
                        <Badge variant="secondary">
                          {objective.timeframe === 'quarterly' ? `${objective.quarter} ${objective.year}` : objective.year}
                        </Badge>
                      </div>
                      {objective.description && (
                        <CardDescription className="text-sm mt-1">
                          {objective.description}
                        </CardDescription>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User size={16} />
                          <span>{objective.owner}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={16} />
                          <span>Updated {new Date(objective.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteObjective(objective.id)}
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Overall Progress</span>
                      <span className="font-semibold">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <CheckCircle size={20} weight="bold" className="text-accent" />
                      Key Results ({objective.keyResults.length})
                    </h4>
                    <Dialog open={isAddKRDialogOpen && selectedObjective?.id === objective.id} onOpenChange={(open) => {
                      setIsAddKRDialogOpen(open)
                      if (open) setSelectedObjective(objective)
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Plus size={14} weight="bold" />
                          Add Key Result
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Key Result</DialogTitle>
                          <DialogDescription>
                            Define a measurable key result for this objective
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="kr-description">Key Result Description *</Label>
                            <Textarea
                              id="kr-description"
                              value={newKeyResult.description}
                              onChange={(e) => setNewKeyResult({ ...newKeyResult, description: e.target.value })}
                              placeholder="e.g., Increase NPS score from 45 to 70"
                              rows={2}
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="start-value">Start Value</Label>
                              <Input
                                id="start-value"
                                type="number"
                                value={newKeyResult.startValue}
                                onChange={(e) => setNewKeyResult({ ...newKeyResult, startValue: parseFloat(e.target.value) })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="target-value">Target Value</Label>
                              <Input
                                id="target-value"
                                type="number"
                                value={newKeyResult.targetValue}
                                onChange={(e) => setNewKeyResult({ ...newKeyResult, targetValue: parseFloat(e.target.value) })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="unit">Unit</Label>
                              <Input
                                id="unit"
                                value={newKeyResult.unit}
                                onChange={(e) => setNewKeyResult({ ...newKeyResult, unit: e.target.value })}
                                placeholder="%"
                              />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddKRDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={addKeyResult}>Add Key Result</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {objective.keyResults.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                      No key results yet. Add key results to track progress.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {objective.keyResults.map((kr) => (
                        <div key={kr.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{kr.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span>{kr.startValue} {kr.unit} <ArrowRight size={12} className="inline" /> {kr.targetValue} {kr.unit}</span>
                                <Badge variant="outline" className={getStatusColor(kr.status)}>
                                  {kr.status}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteKeyResult(objective.id, kr.id)}
                            >
                              <Trash size={14} />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Current: {kr.currentValue} {kr.unit}</span>
                              <span className="font-semibold">{Math.round(kr.progress)}%</span>
                            </div>
                            <Progress value={kr.progress} className="h-2" />
                            <div className="flex items-center gap-2 mt-3">
                              <Input
                                type="number"
                                placeholder="Update value"
                                className="h-8 text-sm"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const input = e.target as HTMLInputElement
                                    updateKeyResultProgress(objective.id, kr.id, parseFloat(input.value))
                                    input.value = ''
                                  }
                                }}
                              />
                              <span className="text-xs text-muted-foreground whitespace-nowrap">Press Enter to update</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
