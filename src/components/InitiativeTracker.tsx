import { useKV } from '@github/spark/hooks'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, User, CheckCircle, Warning, XCircle, Clock, TrendUp, CurrencyDollar, ChatCircleText, Plus } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Initiative, StrategyCard, StatusType } from '@/types'

interface ProgressUpdate {
  id: string
  initiativeId: string
  date: string
  progress: number
  status: StatusType
  notes: string
  author: string
}

const statusConfig = {
  'not-started': { label: 'Not Started', color: 'bg-muted text-muted-foreground', icon: Clock },
  'on-track': { label: 'On Track', color: 'bg-success text-white', icon: CheckCircle },
  'at-risk': { label: 'At Risk', color: 'bg-at-risk text-white', icon: Warning },
  'blocked': { label: 'Blocked', color: 'bg-destructive text-white', icon: XCircle },
  'completed': { label: 'Completed', color: 'bg-primary text-primary-foreground', icon: CheckCircle },
}

export default function InitiativeTracker() {
  const [initiatives, setInitiatives] = useKV<Initiative[]>('initiatives', [])
  const [strategyCards] = useKV<StrategyCard[]>('strategy-cards', [])
  const [progressUpdates, setProgressUpdates] = useKV<ProgressUpdate[]>('progress-updates', [])
  const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(null)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  
  const [updateForm, setUpdateForm] = useState({
    progress: 0,
    status: 'on-track' as StatusType,
    notes: '',
    author: ''
  })

  const getOwnerInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const today = new Date()
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const getStatusHealth = (status: StatusType, progress: number, endDate: string) => {
    const daysRemaining = getDaysRemaining(endDate)
    
    if (status === 'completed') return 'healthy'
    if (status === 'blocked') return 'critical'
    if (status === 'at-risk') return 'warning'
    
    if (daysRemaining < 0) return 'critical'
    if (daysRemaining < 30 && progress < 70) return 'warning'
    if (progress >= 90) return 'healthy'
    
    return 'normal'
  }

  const handleAddUpdate = () => {
    if (!selectedInitiative || !updateForm.author) {
      toast.error('Please fill in all required fields')
      return
    }

    const update: ProgressUpdate = {
      id: `update-${Date.now()}`,
      initiativeId: selectedInitiative.id,
      date: new Date().toISOString(),
      progress: updateForm.progress,
      status: updateForm.status,
      notes: updateForm.notes,
      author: updateForm.author
    }

    setProgressUpdates((current) => [...(current || []), update])

    setInitiatives((current) =>
      (current || []).map(init =>
        init.id === selectedInitiative.id
          ? { ...init, progress: updateForm.progress, status: updateForm.status }
          : init
      )
    )

    toast.success('Progress update added')
    setIsUpdateDialogOpen(false)
    setUpdateForm({ progress: 0, status: 'on-track', notes: '', author: '' })
  }

  const getInitiativeUpdates = (initiativeId: string) => {
    return (progressUpdates || [])
      .filter(update => update.initiativeId === initiativeId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const filteredInitiatives = filterStatus === 'all'
    ? (initiatives || [])
    : (initiatives || []).filter(init => init.status === filterStatus)

  const statusBreakdown = {
    'not-started': (initiatives || []).filter(i => i.status === 'not-started').length,
    'on-track': (initiatives || []).filter(i => i.status === 'on-track').length,
    'at-risk': (initiatives || []).filter(i => i.status === 'at-risk').length,
    'blocked': (initiatives || []).filter(i => i.status === 'blocked').length,
    'completed': (initiatives || []).filter(i => i.status === 'completed').length,
  }

  const totalBudget = (initiatives || []).reduce((sum, i) => sum + i.budget, 0)
  const avgProgress = (initiatives || []).length > 0
    ? Math.round((initiatives || []).reduce((sum, i) => sum + i.progress, 0) / (initiatives || []).length)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Initiative Progress Tracking</h2>
          <p className="text-muted-foreground mt-2">
            Real-time monitoring of initiative status, progress, and accountability
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs uppercase tracking-wider">Total Initiatives</CardDescription>
            <CardTitle className="text-4xl font-bold font-mono text-accent">{(initiatives || []).length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} weight="fill" className="text-success" />
              <span className="text-muted-foreground">{statusBreakdown['on-track']} on track</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs uppercase tracking-wider">Average Progress</CardDescription>
            <CardTitle className="text-4xl font-bold font-mono text-accent">{avgProgress}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={avgProgress} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs uppercase tracking-wider">Total Investment</CardDescription>
            <CardTitle className="text-4xl font-bold font-mono text-accent">
              ${(totalBudget / 1000000).toFixed(1)}M
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <CurrencyDollar size={16} weight="fill" className="text-accent" />
              <span className="text-muted-foreground">Across all portfolios</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs uppercase tracking-wider">Needs Attention</CardDescription>
            <CardTitle className="text-4xl font-bold font-mono text-at-risk">
              {statusBreakdown['at-risk'] + statusBreakdown['blocked']}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <Warning size={16} weight="fill" className="text-at-risk" />
              <span className="text-muted-foreground">
                {statusBreakdown['blocked']} blocked
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={filterStatus} onValueChange={setFilterStatus} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All ({(initiatives || []).length})</TabsTrigger>
          <TabsTrigger value="on-track" className="data-[state=active]:bg-success">
            On Track ({statusBreakdown['on-track']})
          </TabsTrigger>
          <TabsTrigger value="at-risk" className="data-[state=active]:bg-at-risk">
            At Risk ({statusBreakdown['at-risk']})
          </TabsTrigger>
          <TabsTrigger value="blocked" className="data-[state=active]:bg-destructive">
            Blocked ({statusBreakdown['blocked']})
          </TabsTrigger>
          <TabsTrigger value="not-started">
            Not Started ({statusBreakdown['not-started']})
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-primary">
            Completed ({statusBreakdown['completed']})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filterStatus} className="mt-6">
          <div className="grid gap-4">
            {filteredInitiatives.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <TrendUp size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No initiatives in this status</p>
                </CardContent>
              </Card>
            ) : (
              filteredInitiatives.map((initiative) => {
                const config = statusConfig[initiative.status]
                const StatusIcon = config.icon
                const strategyCard = strategyCards?.find(card => card.id === initiative.strategyCardId)
                const daysRemaining = getDaysRemaining(initiative.endDate)
                const health = getStatusHealth(initiative.status, initiative.progress, initiative.endDate)
                const updates = getInitiativeUpdates(initiative.id)

                return (
                  <Card 
                    key={initiative.id}
                    className={`hover:shadow-lg transition-all border-l-4 ${
                      health === 'critical' ? 'border-l-destructive' :
                      health === 'warning' ? 'border-l-at-risk' :
                      health === 'healthy' ? 'border-l-success' :
                      'border-l-border'
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-accent text-accent-foreground font-semibold">
                                  {getOwnerInitials(initiative.owner)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold mb-1">{initiative.title}</h3>
                                <p className="text-sm text-muted-foreground mb-2">{initiative.description}</p>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge className={config.color}>
                                    <StatusIcon size={12} weight="fill" className="mr-1" />
                                    {config.label}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {initiative.priority}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {initiative.portfolio.replace('-', ' ')}
                                  </Badge>
                                  {strategyCard && (
                                    <Badge variant="secondary" className="text-xs">
                                      {strategyCard.title}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold font-mono mb-1">
                              {initiative.progress}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {daysRemaining >= 0 ? `${daysRemaining} days left` : `${Math.abs(daysRemaining)} days overdue`}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Progress value={initiative.progress} className="h-2" />
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {new Date(initiative.startDate).toLocaleDateString()} - {new Date(initiative.endDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1 font-mono">
                              <CurrencyDollar size={12} />
                              ${(initiative.budget / 1000000).toFixed(2)}M
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-1">
                            <User size={14} />
                            <span>Owner: {initiative.owner}</span>
                          </div>
                          <Dialog 
                            open={isUpdateDialogOpen && selectedInitiative?.id === initiative.id}
                            onOpenChange={(open) => {
                              setIsUpdateDialogOpen(open)
                              if (open) {
                                setSelectedInitiative(initiative)
                                setUpdateForm({
                                  progress: initiative.progress,
                                  status: initiative.status,
                                  notes: '',
                                  author: initiative.owner
                                })
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="gap-2">
                                <Plus size={14} weight="bold" />
                                Add Update
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                              <DialogHeader>
                                <DialogTitle>Add Progress Update</DialogTitle>
                                <DialogDescription>{initiative.title}</DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="update-progress">Progress (%)</Label>
                                    <Input
                                      id="update-progress"
                                      type="number"
                                      min="0"
                                      max="100"
                                      value={updateForm.progress}
                                      onChange={(e) => setUpdateForm({ ...updateForm, progress: parseInt(e.target.value) || 0 })}
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="update-status">Status</Label>
                                    <Select
                                      value={updateForm.status}
                                      onValueChange={(value: StatusType) => setUpdateForm({ ...updateForm, status: value })}
                                    >
                                      <SelectTrigger id="update-status">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {Object.entries(statusConfig).map(([key, config]) => (
                                          <SelectItem key={key} value={key}>
                                            {config.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="update-author">Update Author</Label>
                                  <Input
                                    id="update-author"
                                    value={updateForm.author}
                                    onChange={(e) => setUpdateForm({ ...updateForm, author: e.target.value })}
                                    placeholder="Your name"
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="update-notes">Notes</Label>
                                  <Textarea
                                    id="update-notes"
                                    value={updateForm.notes}
                                    onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })}
                                    placeholder="What's changed? Any blockers or risks?"
                                    rows={4}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleAddUpdate}>Save Update</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          
                          {updates.length > 0 && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="gap-2">
                                  <ChatCircleText size={14} />
                                  View History ({updates.length})
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Progress History</DialogTitle>
                                  <DialogDescription>{initiative.title}</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  {updates.map((update) => {
                                    const updateConfig = statusConfig[update.status]
                                    const UpdateIcon = updateConfig.icon
                                    return (
                                      <div key={update.id} className="border-l-2 border-border pl-4 pb-4">
                                        <div className="flex items-start gap-3">
                                          <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-muted text-xs">
                                              {getOwnerInitials(update.author)}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="font-semibold text-sm">{update.author}</span>
                                              <span className="text-xs text-muted-foreground">
                                                {new Date(update.date).toLocaleDateString()} at {new Date(update.date).toLocaleTimeString()}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-2 mb-2">
                                              <Badge className={`${updateConfig.color} text-xs`}>
                                                <UpdateIcon size={10} weight="fill" className="mr-1" />
                                                {updateConfig.label}
                                              </Badge>
                                              <Badge variant="secondary" className="text-xs font-mono">
                                                {update.progress}%
                                              </Badge>
                                            </div>
                                            {update.notes && (
                                              <p className="text-sm text-muted-foreground">{update.notes}</p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
