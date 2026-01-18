import { useKV } from '@github/spark/hooks'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, CheckCircle, Warning, XCircle, Circle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { BowlingChartData, MonthStatus } from '@/types'

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const statusColors = {
  'green': 'bg-success',
  'yellow': 'bg-warning',
  'red': 'bg-destructive',
  'not-started': 'bg-muted'
}

const statusLabels = {
  'green': 'On Track',
  'yellow': 'At Risk',
  'red': 'Blocked',
  'not-started': 'Not Started'
}

export default function BowlingChart() {
  const [bowlingData, setBowlingData] = useKV<BowlingChartData[]>('bowling-chart-data', [])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingData, setEditingData] = useState<{ objectiveId: string; month: string } | null>(null)

  const [newObjective, setNewObjective] = useState('')
  const [editStatus, setEditStatus] = useState<'green' | 'yellow' | 'red' | 'not-started'>('not-started')
  const [editActual, setEditActual] = useState(0)
  const [editTarget, setEditTarget] = useState(0)

  const handleAddObjective = () => {
    if (!newObjective.trim()) {
      toast.error('Please enter an objective')
      return
    }

    const newData: BowlingChartData = {
      objective: newObjective,
      months: months.map(month => ({
        month,
        status: 'not-started',
        actual: 0,
        target: 0
      }))
    }

    setBowlingData((current) => [...(current || []), newData])
    toast.success('Objective added')
    setIsAddDialogOpen(false)
    setNewObjective('')
  }

  const handleUpdateMonth = () => {
    if (!editingData) return

    setBowlingData((current) => {
      return (current || []).map(obj => {
        if (obj.objective === editingData.objectiveId) {
          return {
            ...obj,
            months: obj.months.map(m => {
              if (m.month === editingData.month) {
                return {
                  ...m,
                  status: editStatus,
                  actual: editActual,
                  target: editTarget
                }
              }
              return m
            })
          }
        }
        return obj
      })
    })

    toast.success('Month status updated')
    setEditingData(null)
  }

  const openEditDialog = (objectiveId: string, month: string) => {
    const objective = (bowlingData || []).find(o => o.objective === objectiveId)
    const monthData = objective?.months.find(m => m.month === month)
    
    if (monthData) {
      setEditStatus(monthData.status)
      setEditActual(monthData.actual)
      setEditTarget(monthData.target)
      setEditingData({ objectiveId, month })
    }
  }

  const allData = bowlingData || []

  const getStatusCounts = () => {
    const counts = { green: 0, yellow: 0, red: 0, 'not-started': 0 }
    allData.forEach(obj => {
      obj.months.forEach(m => {
        counts[m.status]++
      })
    })
    return counts
  }

  const statusCounts = getStatusCounts()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Bowling Chart</h2>
          <p className="text-muted-foreground mt-1">
            Monthly progress tracking with red/yellow/green status indicators
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} weight="bold" />
              Add Objective
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Objective</DialogTitle>
              <DialogDescription>Create a new objective to track monthly</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Objective Description</Label>
                <Input
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  placeholder="e.g., Increase customer satisfaction score"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddObjective}>Add Objective</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="border-success/50 bg-success/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle size={24} weight="fill" className="text-success" />
              <div>
                <div className="text-2xl font-bold">{statusCounts.green}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">On Track</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Warning size={24} weight="fill" className="text-warning" />
              <div>
                <div className="text-2xl font-bold">{statusCounts.yellow}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">At Risk</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <XCircle size={24} weight="fill" className="text-destructive" />
              <div>
                <div className="text-2xl font-bold">{statusCounts.red}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Blocked</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Circle size={24} weight="fill" className="text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{statusCounts['not-started']}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Not Started</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {allData.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-6 mb-4">
              <Plus size={48} weight="duotone" className="text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Objectives Added</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Start by adding objectives you want to track on a monthly basis
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <Plus size={16} weight="bold" />
              Add First Objective
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Status Tracking</CardTitle>
            <CardDescription>Click on any month cell to update its status and metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-3 text-left border bg-muted font-semibold">Objective</th>
                    {months.map(month => (
                      <th key={month} className="p-3 text-center border bg-muted font-semibold text-sm">
                        {month}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allData.map((obj) => (
                    <tr key={obj.objective} className="hover:bg-muted/30">
                      <td className="p-3 border font-medium text-sm max-w-xs">
                        <div className="line-clamp-2">{obj.objective}</div>
                      </td>
                      {obj.months.map((monthData) => (
                        <td key={monthData.month} className="p-1 border">
                          <button
                            onClick={() => openEditDialog(obj.objective, monthData.month)}
                            className={`w-full h-16 rounded transition-colors hover:opacity-80 relative group ${statusColors[monthData.status]}`}
                          >
                            {monthData.status !== 'not-started' && (
                              <div className="absolute inset-0 flex flex-col items-center justify-center text-xs text-white font-mono">
                                <span className="font-semibold">{monthData.actual}</span>
                                <span className="text-[10px] opacity-75">/ {monthData.target}</span>
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 text-white text-xs">
                              Edit
                            </div>
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-4 mt-6 pt-6 border-t">
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Legend:</span>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-success" />
                <span className="text-xs">On Track</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-warning" />
                <span className="text-xs">At Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-destructive" />
                <span className="text-xs">Blocked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-muted" />
                <span className="text-xs">Not Started</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!editingData} onOpenChange={() => setEditingData(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Month Status</DialogTitle>
            <DialogDescription>
              {editingData && `${editingData.month} - ${editingData.objectiveId}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editStatus} onValueChange={(value: any) => setEditStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="green">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-success" />
                      On Track
                    </div>
                  </SelectItem>
                  <SelectItem value="yellow">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-warning" />
                      At Risk
                    </div>
                  </SelectItem>
                  <SelectItem value="red">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-destructive" />
                      Blocked
                    </div>
                  </SelectItem>
                  <SelectItem value="not-started">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-muted" />
                      Not Started
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Actual Value</Label>
                <Input
                  type="number"
                  value={editActual}
                  onChange={(e) => setEditActual(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Target Value</Label>
                <Input
                  type="number"
                  value={editTarget}
                  onChange={(e) => setEditTarget(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingData(null)}>Cancel</Button>
            <Button onClick={handleUpdateMonth}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
