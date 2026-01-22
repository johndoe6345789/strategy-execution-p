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
import { Plus, CheckCircle, Clock, Warning, Lightning } from '@phosphor-icons/react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { Countermeasure, Initiative } from '@/types'

export default function CountermeasureManagement() {
  const [countermeasures, setCountermeasures] = useKV<Countermeasure[]>('countermeasures', [])
  const [initiatives] = useKV<Initiative[]>('initiatives', [])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [linkedInitiativeId, setLinkedInitiativeId] = useState('')
  const [newCountermeasure, setNewCountermeasure] = useState({
    issue: '',
    action: '',
    owner: '',
    dueDate: ''
  })

  const addCountermeasure = () => {
    if (!newCountermeasure.issue.trim() || !newCountermeasure.action.trim() || !newCountermeasure.owner.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    const countermeasure: Countermeasure = {
      id: `cm-${Date.now()}`,
      issue: newCountermeasure.issue,
      action: newCountermeasure.action,
      owner: newCountermeasure.owner,
      dueDate: newCountermeasure.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'open',
      createdAt: new Date().toISOString()
    }

    setCountermeasures((current) => [...(current || []), countermeasure])
    
    if (linkedInitiativeId) {
      toast.success(`Countermeasure added and linked to initiative`)
    } else {
      toast.success('Countermeasure created!')
    }

    setIsAddDialogOpen(false)
    setNewCountermeasure({ issue: '', action: '', owner: '', dueDate: '' })
    setLinkedInitiativeId('')
  }

  const updateCountermeasureStatus = (id: string, status: 'open' | 'in-progress' | 'completed') => {
    setCountermeasures((current) =>
      (current || []).map(cm => cm.id === id ? { ...cm, status } : cm)
    )
    toast.success(`Countermeasure marked as ${status}`)
  }

  const openCountermeasures = (countermeasures || []).filter(cm => cm.status === 'open')
  const inProgressCountermeasures = (countermeasures || []).filter(cm => cm.status === 'in-progress')
  const completedCountermeasures = (countermeasures || []).filter(cm => cm.status === 'completed')

  const getOverdueCount = () => {
    const now = new Date()
    return openCountermeasures.filter(cm => new Date(cm.dueDate) < now).length +
           inProgressCountermeasures.filter(cm => new Date(cm.dueDate) < now).length
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Countermeasure Management</h2>
          <p className="text-muted-foreground mt-2">
            Track improvement actions beyond KPI reporting
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} weight="bold" />
              New Countermeasure
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Countermeasure</DialogTitle>
              <DialogDescription>
                Define an improvement action to address an issue or opportunity
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="cm-issue">Issue / Problem Statement</Label>
                <Textarea
                  id="cm-issue"
                  value={newCountermeasure.issue}
                  onChange={(e) => setNewCountermeasure({ ...newCountermeasure, issue: e.target.value })}
                  placeholder="Describe the problem or gap that needs to be addressed..."
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cm-action">Countermeasure Action</Label>
                <Textarea
                  id="cm-action"
                  value={newCountermeasure.action}
                  onChange={(e) => setNewCountermeasure({ ...newCountermeasure, action: e.target.value })}
                  placeholder="Describe the specific action to be taken..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="cm-owner">Owner</Label>
                  <Input
                    id="cm-owner"
                    value={newCountermeasure.owner}
                    onChange={(e) => setNewCountermeasure({ ...newCountermeasure, owner: e.target.value })}
                    placeholder="Responsible person"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cm-date">Due Date</Label>
                  <Input
                    id="cm-date"
                    type="date"
                    value={newCountermeasure.dueDate}
                    onChange={(e) => setNewCountermeasure({ ...newCountermeasure, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cm-initiative">Link to Initiative (Optional)</Label>
                <Select
                  value={linkedInitiativeId}
                  onValueChange={setLinkedInitiativeId}
                >
                  <SelectTrigger id="cm-initiative">
                    <SelectValue placeholder="Select an initiative" />
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
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addCountermeasure}>Create Countermeasure</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Countermeasures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{countermeasures?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{openCountermeasures.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{inProgressCountermeasures.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{getOverdueCount()}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="open" className="w-full">
        <TabsList>
          <TabsTrigger value="open">
            Open ({openCountermeasures.length})
          </TabsTrigger>
          <TabsTrigger value="in-progress">
            In Progress ({inProgressCountermeasures.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedCountermeasures.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="space-y-3">
          {openCountermeasures.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No open countermeasures. All issues are being addressed or resolved.
              </CardContent>
            </Card>
          ) : (
            openCountermeasures.map((cm) => (
              <Card key={cm.id} className={isOverdue(cm.dueDate) ? 'border-destructive' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="border-blue-500 text-blue-600">
                          <Clock size={14} weight="bold" className="mr-1" />
                          Open
                        </Badge>
                        {isOverdue(cm.dueDate) && (
                          <Badge variant="destructive">
                            <Warning size={14} weight="fill" className="mr-1" />
                            Overdue
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base">Issue</CardTitle>
                      <CardDescription className="mt-1">{cm.issue}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm font-semibold mb-1">Countermeasure Action</div>
                    <p className="text-sm text-muted-foreground">{cm.action}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm border-t pt-4">
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">
                        Owner: <span className="font-medium text-foreground">{cm.owner}</span>
                      </span>
                      <span className="text-muted-foreground">
                        Due: <span className={`font-medium ${isOverdue(cm.dueDate) ? 'text-destructive' : 'text-foreground'}`}>
                          {new Date(cm.dueDate).toLocaleDateString()}
                        </span>
                      </span>
                      <span className="text-muted-foreground text-xs">
                        Created: {new Date(cm.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => updateCountermeasureStatus(cm.id, 'in-progress')}
                    >
                      Start Working
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="in-progress" className="space-y-3">
          {inProgressCountermeasures.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No countermeasures in progress.
              </CardContent>
            </Card>
          ) : (
            inProgressCountermeasures.map((cm) => (
              <Card key={cm.id} className={`border-accent ${isOverdue(cm.dueDate) ? 'border-destructive' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-accent text-accent-foreground">
                          <Lightning size={14} weight="fill" className="mr-1" />
                          In Progress
                        </Badge>
                        {isOverdue(cm.dueDate) && (
                          <Badge variant="destructive">
                            <Warning size={14} weight="fill" className="mr-1" />
                            Overdue
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base">Issue</CardTitle>
                      <CardDescription className="mt-1">{cm.issue}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm font-semibold mb-1">Countermeasure Action</div>
                    <p className="text-sm text-muted-foreground">{cm.action}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm border-t pt-4">
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">
                        Owner: <span className="font-medium text-foreground">{cm.owner}</span>
                      </span>
                      <span className="text-muted-foreground">
                        Due: <span className={`font-medium ${isOverdue(cm.dueDate) ? 'text-destructive' : 'text-foreground'}`}>
                          {new Date(cm.dueDate).toLocaleDateString()}
                        </span>
                      </span>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => updateCountermeasureStatus(cm.id, 'completed')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle size={16} weight="fill" className="mr-1" />
                      Mark Complete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3">
          {completedCountermeasures.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No completed countermeasures yet.
              </CardContent>
            </Card>
          ) : (
            completedCountermeasures.map((cm) => (
              <Card key={cm.id} className="bg-muted/30">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="border-green-500 text-green-600">
                          <CheckCircle size={14} weight="fill" className="mr-1" />
                          Completed
                        </Badge>
                      </div>
                      <CardTitle className="text-base">Issue</CardTitle>
                      <CardDescription className="mt-1">{cm.issue}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm font-semibold mb-1">Countermeasure Action</div>
                    <p className="text-sm text-muted-foreground">{cm.action}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm border-t pt-4">
                    <span className="text-muted-foreground">
                      Owner: <span className="font-medium text-foreground">{cm.owner}</span>
                    </span>
                    <span className="text-muted-foreground">
                      Created: {new Date(cm.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
