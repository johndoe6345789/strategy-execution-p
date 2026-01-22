import { useKV } from '@github/spark/hooks'
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
import { Plus, ArrowsClockwise, CheckCircle, Circle, Lightning, CurrencyDollar, Truck, ShieldCheck, Smiley } from '@phosphor-icons/react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { PDCACycle, Initiative } from '@/types'

const categoryConfig = {
  quality: { label: 'Quality', icon: CheckCircle, color: 'bg-blue-500' },
  cost: { label: 'Cost', icon: CurrencyDollar, color: 'bg-green-500' },
  delivery: { label: 'Delivery', icon: Truck, color: 'bg-purple-500' },
  safety: { label: 'Safety', icon: ShieldCheck, color: 'bg-red-500' },
  morale: { label: 'Morale', icon: Smiley, color: 'bg-accent' }
}

const phaseConfig = {
  plan: { label: 'Plan', description: 'Identify the problem and plan the improvement', order: 1 },
  do: { label: 'Do', description: 'Implement the plan on a small scale', order: 2 },
  check: { label: 'Check', description: 'Study the results and measure effectiveness', order: 3 },
  act: { label: 'Act', description: 'Standardize and implement full-scale', order: 4 }
}

export default function PDCACycleTracking() {
  const [cycles, setCycles] = useKV<PDCACycle[]>('pdca-cycles', [])
  const [initiatives] = useKV<Initiative[]>('initiatives', [])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedCycle, setSelectedCycle] = useState<PDCACycle | null>(null)
  const [editingPhase, setEditingPhase] = useState<'plan' | 'do' | 'check' | 'act' | null>(null)
  const [newCycle, setNewCycle] = useState({
    title: '',
    description: '',
    category: 'quality' as const,
    owner: '',
    startDate: '',
    linkedInitiativeId: ''
  })
  const [phaseNotes, setPhaseNotes] = useState('')
  const [phaseFindings, setPhaseFindings] = useState('')

  const addCycle = () => {
    if (!newCycle.title.trim() || !newCycle.description.trim() || !newCycle.owner.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    const cycle: PDCACycle = {
      id: `pdca-${Date.now()}`,
      title: newCycle.title,
      description: newCycle.description,
      category: newCycle.category,
      currentPhase: 'plan',
      owner: newCycle.owner,
      startDate: newCycle.startDate || new Date().toISOString().split('T')[0],
      plan: { completed: false, notes: '', findings: '' },
      do: { completed: false, notes: '', findings: '' },
      check: { completed: false, notes: '', findings: '' },
      act: { completed: false, notes: '', findings: '' },
      status: 'on-track',
      linkedInitiativeId: newCycle.linkedInitiativeId || undefined
    }

    setCycles((current) => [...(current || []), cycle])
    setIsAddDialogOpen(false)
    setNewCycle({
      title: '',
      description: '',
      category: 'quality',
      owner: '',
      startDate: '',
      linkedInitiativeId: ''
    })
    toast.success('PDCA Cycle created!')
  }

  const updatePhase = (cycleId: string, phase: 'plan' | 'do' | 'check' | 'act') => {
    setCycles((current) =>
      (current || []).map(c => {
        if (c.id === cycleId) {
          const updatedPhase = {
            ...c[phase],
            completed: true,
            completedDate: new Date().toISOString().split('T')[0],
            notes: phaseNotes,
            findings: phaseFindings
          }
          
          const phaseOrder = ['plan', 'do', 'check', 'act']
          const currentIndex = phaseOrder.indexOf(phase)
          const nextPhase = currentIndex < 3 ? phaseOrder[currentIndex + 1] as 'plan' | 'do' | 'check' | 'act' : 'act'
          
          return {
            ...c,
            [phase]: updatedPhase,
            currentPhase: nextPhase,
            status: phase === 'act' ? 'completed' as const : c.status
          }
        }
        return c
      })
    )
    setEditingPhase(null)
    setPhaseNotes('')
    setPhaseFindings('')
    setSelectedCycle(null)
    toast.success(`${phaseConfig[phase].label} phase completed!`)
  }

  const getCycleProgress = (cycle: PDCACycle): number => {
    const phases = [cycle.plan, cycle.do, cycle.check, cycle.act]
    const completed = phases.filter(p => p.completed).length
    return (completed / 4) * 100
  }

  const activeCycles = (cycles || []).filter(c => c.status !== 'completed')
  const completedCycles = (cycles || []).filter(c => c.status === 'completed')

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">PDCA Cycle Tracking</h2>
          <p className="text-muted-foreground mt-2">
            Plan-Do-Check-Act continuous improvement cycles
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} weight="bold" />
              New PDCA Cycle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create PDCA Cycle</DialogTitle>
              <DialogDescription>
                Start a new Plan-Do-Check-Act continuous improvement cycle
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="cycle-title">Title</Label>
                <Input
                  id="cycle-title"
                  value={newCycle.title}
                  onChange={(e) => setNewCycle({ ...newCycle, title: e.target.value })}
                  placeholder="e.g., Reduce Manufacturing Defects"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cycle-description">Problem Statement</Label>
                <Textarea
                  id="cycle-description"
                  value={newCycle.description}
                  onChange={(e) => setNewCycle({ ...newCycle, description: e.target.value })}
                  placeholder="Describe the problem or opportunity for improvement..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="cycle-category">Category</Label>
                  <Select
                    value={newCycle.category}
                    onValueChange={(value: any) => setNewCycle({ ...newCycle, category: value })}
                  >
                    <SelectTrigger id="cycle-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cycle-owner">Owner</Label>
                  <Input
                    id="cycle-owner"
                    value={newCycle.owner}
                    onChange={(e) => setNewCycle({ ...newCycle, owner: e.target.value })}
                    placeholder="Name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="cycle-date">Start Date</Label>
                  <Input
                    id="cycle-date"
                    type="date"
                    value={newCycle.startDate}
                    onChange={(e) => setNewCycle({ ...newCycle, startDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cycle-initiative">Link to Initiative</Label>
                  <Select
                    value={newCycle.linkedInitiativeId}
                    onValueChange={(value) => setNewCycle({ ...newCycle, linkedInitiativeId: value })}
                  >
                    <SelectTrigger id="cycle-initiative">
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {(initiatives || []).map((initiative) => (
                        <SelectItem key={initiative.id} value={initiative.id}>
                          {initiative.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addCycle}>Create Cycle</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Cycles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{cycles?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Cycles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{activeCycles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed Cycles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{completedCycles.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active Cycles ({activeCycles.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedCycles.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeCycles.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No active PDCA cycles. Click "New PDCA Cycle" to get started.
              </CardContent>
            </Card>
          ) : (
            activeCycles.map((cycle) => {
              const config = categoryConfig[cycle.category]
              const Icon = config.icon
              const progress = getCycleProgress(cycle)
              const linkedInitiative = cycle.linkedInitiativeId 
                ? initiatives?.find(i => i.id === cycle.linkedInitiativeId)
                : null

              return (
                <Card key={cycle.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <div className={`${config.color} p-2 rounded-md`}>
                            <Icon size={20} weight="bold" className="text-white" />
                          </div>
                          <CardTitle>{cycle.title}</CardTitle>
                        </div>
                        <CardDescription>{cycle.description}</CardDescription>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">
                            Owner: <span className="font-medium text-foreground">{cycle.owner}</span>
                          </span>
                          <span className="text-muted-foreground">
                            Started: <span className="font-medium text-foreground">{new Date(cycle.startDate).toLocaleDateString()}</span>
                          </span>
                          {linkedInitiative && (
                            <Badge variant="secondary" className="gap-1">
                              <Lightning size={12} weight="fill" />
                              {linkedInitiative.title}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2 min-w-[120px]">
                        <Badge className={`${config.color} text-white`}>
                          {config.label}
                        </Badge>
                        <div className="text-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-muted-foreground text-xs">Progress</span>
                            <span className="font-bold text-accent">{Math.round(progress)}%</span>
                          </div>
                          <Progress value={progress} className="h-1.5" />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-3">
                      {(['plan', 'do', 'check', 'act'] as const).map((phase) => {
                        const phaseData = cycle[phase]
                        const isCurrent = cycle.currentPhase === phase
                        const canEdit = isCurrent && !phaseData.completed

                        return (
                          <Card key={phase} className={`${isCurrent ? 'border-accent' : ''}`}>
                            <CardHeader className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <CardTitle className="text-sm font-semibold uppercase">
                                  {phaseConfig[phase].label}
                                </CardTitle>
                                {phaseData.completed ? (
                                  <CheckCircle size={20} weight="fill" className="text-green-500" />
                                ) : isCurrent ? (
                                  <ArrowsClockwise size={20} weight="bold" className="text-accent" />
                                ) : (
                                  <Circle size={20} className="text-muted-foreground" />
                                )}
                              </div>
                              <CardDescription className="text-xs">
                                {phaseConfig[phase].description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 space-y-2">
                              {phaseData.completed && phaseData.completedDate && (
                                <div className="text-xs text-muted-foreground">
                                  Completed: {new Date(phaseData.completedDate).toLocaleDateString()}
                                </div>
                              )}
                              {phaseData.notes && (
                                <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                                  {phaseData.notes}
                                </div>
                              )}
                              {canEdit && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button 
                                      size="sm" 
                                      className="w-full text-xs h-7"
                                      onClick={() => {
                                        setSelectedCycle(cycle)
                                        setEditingPhase(phase)
                                      }}
                                    >
                                      Complete {phaseConfig[phase].label}
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Complete {phaseConfig[phase].label} Phase</DialogTitle>
                                      <DialogDescription>
                                        {cycle.title} - {phaseConfig[phase].description}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                      <div className="grid gap-2">
                                        <Label htmlFor="phase-notes">Notes</Label>
                                        <Textarea
                                          id="phase-notes"
                                          value={phaseNotes}
                                          onChange={(e) => setPhaseNotes(e.target.value)}
                                          placeholder="Document what was done in this phase..."
                                          rows={4}
                                        />
                                      </div>
                                      <div className="grid gap-2">
                                        <Label htmlFor="phase-findings">Key Findings / Results</Label>
                                        <Textarea
                                          id="phase-findings"
                                          value={phaseFindings}
                                          onChange={(e) => setPhaseFindings(e.target.value)}
                                          placeholder="What did you learn or observe?"
                                          rows={3}
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button
                                        variant="outline"
                                        onClick={() => {
                                          setEditingPhase(null)
                                          setPhaseNotes('')
                                          setPhaseFindings('')
                                          setSelectedCycle(null)
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                      <Button onClick={() => updatePhase(cycle.id, phase)}>
                                        Complete Phase
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedCycles.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No completed PDCA cycles yet.
              </CardContent>
            </Card>
          ) : (
            completedCycles.map((cycle) => {
              const config = categoryConfig[cycle.category]
              const Icon = config.icon
              const linkedInitiative = cycle.linkedInitiativeId 
                ? initiatives?.find(i => i.id === cycle.linkedInitiativeId)
                : null

              return (
                <Card key={cycle.id} className="bg-muted/30">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <div className={`${config.color} p-2 rounded-md`}>
                            <Icon size={20} weight="bold" className="text-white" />
                          </div>
                          <CardTitle>{cycle.title}</CardTitle>
                          <Badge variant="outline" className="border-green-500 text-green-600">
                            <CheckCircle size={14} weight="fill" className="mr-1" />
                            Completed
                          </Badge>
                        </div>
                        <CardDescription>{cycle.description}</CardDescription>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">
                            Owner: <span className="font-medium text-foreground">{cycle.owner}</span>
                          </span>
                          {linkedInitiative && (
                            <Badge variant="secondary" className="gap-1">
                              <Lightning size={12} weight="fill" />
                              {linkedInitiative.title}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {(['plan', 'do', 'check', 'act'] as const).map((phase) => {
                        const phaseData = cycle[phase]
                        return (
                          <div key={phase} className="space-y-1">
                            <div className="font-semibold flex items-center gap-2">
                              <CheckCircle size={16} weight="fill" className="text-green-500" />
                              {phaseConfig[phase].label}
                            </div>
                            {phaseData.notes && (
                              <p className="text-muted-foreground text-xs pl-6">{phaseData.notes}</p>
                            )}
                            {phaseData.findings && (
                              <p className="text-xs pl-6 text-foreground bg-muted p-2 rounded">
                                <span className="font-medium">Finding: </span>{phaseData.findings}
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
