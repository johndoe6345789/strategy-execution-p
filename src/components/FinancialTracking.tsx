import { useKV } from '@github/spark/hooks'
import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Plus, CurrencyDollar, TrendUp, TrendDown, ChartLine, Target, Calendar, CheckCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Initiative } from '@/types'

interface FinancialOutcome {
  id: string
  initiativeId: string
  initiativeTitle: string
  category: 'cost-savings' | 'revenue-increase' | 'cost-avoidance' | 'efficiency-gain' | 'other'
  description: string
  plannedAmount: number
  actualAmount: number
  currency: string
  realizationDate: string
  status: 'projected' | 'realized' | 'validated'
  validatedBy?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

const categoryConfig = {
  'cost-savings': { label: 'Cost Savings', color: 'bg-green-500', icon: TrendDown },
  'revenue-increase': { label: 'Revenue Increase', color: 'bg-blue-500', icon: TrendUp },
  'cost-avoidance': { label: 'Cost Avoidance', color: 'bg-purple-500', icon: Target },
  'efficiency-gain': { label: 'Efficiency Gain', color: 'bg-orange-500', icon: ChartLine },
  'other': { label: 'Other', color: 'bg-gray-500', icon: CurrencyDollar }
}

export default function FinancialTracking() {
  const [outcomes, setOutcomes] = useKV<FinancialOutcome[]>('financial-outcomes', [])
  const [initiatives] = useKV<Initiative[]>('initiatives', [])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  const [newOutcome, setNewOutcome] = useState({
    initiativeId: '',
    category: 'cost-savings' as const,
    description: '',
    plannedAmount: 0,
    currency: 'USD',
    realizationDate: '',
    notes: ''
  })

  const addOutcome = () => {
    if (!newOutcome.initiativeId || !newOutcome.description || !newOutcome.plannedAmount) {
      toast.error('Please fill in required fields')
      return
    }

    const initiative = initiatives?.find(i => i.id === newOutcome.initiativeId)
    if (!initiative) {
      toast.error('Initiative not found')
      return
    }

    const outcome: FinancialOutcome = {
      id: `outcome-${Date.now()}`,
      initiativeId: newOutcome.initiativeId,
      initiativeTitle: initiative.title,
      category: newOutcome.category,
      description: newOutcome.description,
      plannedAmount: newOutcome.plannedAmount,
      actualAmount: 0,
      currency: newOutcome.currency,
      realizationDate: newOutcome.realizationDate,
      status: 'projected',
      notes: newOutcome.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setOutcomes((current) => [...(current || []), outcome])
    setIsAddDialogOpen(false)
    setNewOutcome({
      initiativeId: '',
      category: 'cost-savings',
      description: '',
      plannedAmount: 0,
      currency: 'USD',
      realizationDate: '',
      notes: ''
    })
    toast.success('Financial outcome tracked successfully')
  }

  const updateOutcomeStatus = (id: string, status: FinancialOutcome['status'], actualAmount?: number) => {
    setOutcomes((current) =>
      (current || []).map(o =>
        o.id === id
          ? {
              ...o,
              status,
              actualAmount: actualAmount !== undefined ? actualAmount : o.actualAmount,
              updatedAt: new Date().toISOString()
            }
          : o
      )
    )
    toast.success('Status updated')
  }

  const filteredOutcomes = (outcomes || []).filter(o => {
    if (selectedCategory !== 'all' && o.category !== selectedCategory) return false
    if (selectedStatus !== 'all' && o.status !== selectedStatus) return false
    return true
  })

  const stats = useMemo(() => {
    const all = outcomes || []
    return {
      totalPlanned: all.reduce((sum, o) => sum + o.plannedAmount, 0),
      totalRealized: all.filter(o => o.status === 'realized' || o.status === 'validated').reduce((sum, o) => sum + o.actualAmount, 0),
      totalProjected: all.filter(o => o.status === 'projected').reduce((sum, o) => sum + o.plannedAmount, 0),
      realizationRate: all.length > 0 ? (all.filter(o => o.status === 'realized' || o.status === 'validated').length / all.length) * 100 : 0
    }
  }, [outcomes])

  const categoryBreakdown = useMemo(() => {
    return Object.keys(categoryConfig).map(cat => {
      const categoryOutcomes = filteredOutcomes.filter(o => o.category === cat)
      return {
        category: cat,
        planned: categoryOutcomes.reduce((sum, o) => sum + o.plannedAmount, 0),
        realized: categoryOutcomes.filter(o => o.status === 'realized' || o.status === 'validated').reduce((sum, o) => sum + o.actualAmount, 0),
        count: categoryOutcomes.length
      }
    }).filter(c => c.count > 0)
  }, [filteredOutcomes])

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Financial Outcome Tracking</h2>
          <p className="text-muted-foreground mt-2">
            Link strategic initiatives to measurable financial results
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} weight="bold" />
              Track Outcome
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Track Financial Outcome</DialogTitle>
              <DialogDescription>
                Link a financial outcome to a strategic initiative
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="initiative">Initiative *</Label>
                <Select
                  value={newOutcome.initiativeId}
                  onValueChange={(value) => setNewOutcome({ ...newOutcome, initiativeId: value })}
                >
                  <SelectTrigger id="initiative">
                    <SelectValue placeholder="Select initiative" />
                  </SelectTrigger>
                  <SelectContent>
                    {(initiatives || []).map(init => (
                      <SelectItem key={init.id} value={init.id}>
                        {init.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Outcome Category *</Label>
                <Select
                  value={newOutcome.category}
                  onValueChange={(value: any) => setNewOutcome({ ...newOutcome, category: value })}
                >
                  <SelectTrigger id="category">
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
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  value={newOutcome.description}
                  onChange={(e) => setNewOutcome({ ...newOutcome, description: e.target.value })}
                  placeholder="e.g., Reduced operational costs through automation"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2 col-span-2">
                  <Label htmlFor="planned-amount">Planned Amount *</Label>
                  <Input
                    id="planned-amount"
                    type="number"
                    value={newOutcome.plannedAmount}
                    onChange={(e) => setNewOutcome({ ...newOutcome, plannedAmount: parseFloat(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={newOutcome.currency}
                    onValueChange={(value) => setNewOutcome({ ...newOutcome, currency: value })}
                  >
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="realization-date">Expected Realization Date</Label>
                <Input
                  id="realization-date"
                  type="date"
                  value={newOutcome.realizationDate}
                  onChange={(e) => setNewOutcome({ ...newOutcome, realizationDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={newOutcome.notes}
                  onChange={(e) => setNewOutcome({ ...newOutcome, notes: e.target.value })}
                  placeholder="Additional context..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addOutcome}>Track Outcome</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Planned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalPlanned)}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all initiatives</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Realized</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(stats.totalRealized)}</div>
            <p className="text-xs text-muted-foreground mt-1">Validated outcomes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Projected Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{formatCurrency(stats.totalProjected)}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending realization</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Realization Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.realizationRate)}%</div>
            <Progress value={stats.realizationRate} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Financial Impact by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryBreakdown.map(({ category, planned, realized, count }) => {
              const config = categoryConfig[category as keyof typeof categoryConfig]
              const Icon = config.icon
              const realizationPct = planned > 0 ? (realized / planned) * 100 : 0
              
              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`${config.color} p-2 rounded-md`}>
                        <Icon size={16} weight="bold" className="text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{config.label}</p>
                        <p className="text-xs text-muted-foreground">{count} outcome{count !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatCurrency(realized)} / {formatCurrency(planned)}</p>
                      <p className="text-xs text-muted-foreground">{Math.round(realizationPct)}% realized</p>
                    </div>
                  </div>
                  <Progress value={realizationPct} className="h-2" />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Label className="text-sm font-medium">Filters:</Label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(categoryConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="projected">Projected</SelectItem>
            <SelectItem value="realized">Realized</SelectItem>
            <SelectItem value="validated">Validated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filteredOutcomes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CurrencyDollar size={48} className="text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No financial outcomes tracked yet. Start linking initiatives to financial results.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOutcomes.map((outcome) => {
            const config = categoryConfig[outcome.category]
            const Icon = config.icon
            const variance = outcome.actualAmount - outcome.plannedAmount
            const variancePct = outcome.plannedAmount > 0 ? (variance / outcome.plannedAmount) * 100 : 0

            return (
              <Card key={outcome.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`${config.color} p-2 rounded-md`}>
                          <Icon size={20} weight="bold" className="text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{outcome.description}</h4>
                          <p className="text-sm text-muted-foreground">{outcome.initiativeTitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <Badge variant={
                          outcome.status === 'validated' ? 'default' :
                          outcome.status === 'realized' ? 'secondary' : 'outline'
                        }>
                          {outcome.status}
                        </Badge>
                        <Badge variant="outline">{config.label}</Badge>
                        {outcome.realizationDate && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar size={14} />
                            <span>{new Date(outcome.realizationDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      {outcome.notes && (
                        <p className="text-sm text-muted-foreground mt-2 italic">{outcome.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="space-y-1 mb-3">
                        <p className="text-xs text-muted-foreground">Planned</p>
                        <p className="text-xl font-bold">{formatCurrency(outcome.plannedAmount, outcome.currency)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Actual</p>
                        <p className="text-xl font-bold text-success">{formatCurrency(outcome.actualAmount, outcome.currency)}</p>
                      </div>
                      {outcome.status === 'realized' || outcome.status === 'validated' ? (
                        <div className={`text-xs mt-2 ${variance >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {variance >= 0 ? '+' : ''}{formatCurrency(variance, outcome.currency)} ({variancePct >= 0 ? '+' : ''}{Math.round(variancePct)}%)
                        </div>
                      ) : null}
                    </div>
                  </div>
                  {outcome.status === 'projected' && (
                    <div className="mt-4 pt-4 border-t flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Enter actual amount"
                        className="h-9"
                        id={`actual-${outcome.id}`}
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          const input = document.getElementById(`actual-${outcome.id}`) as HTMLInputElement
                          const actualAmount = parseFloat(input.value)
                          if (!isNaN(actualAmount)) {
                            updateOutcomeStatus(outcome.id, 'realized', actualAmount)
                          }
                        }}
                      >
                        Mark Realized
                      </Button>
                    </div>
                  )}
                  {outcome.status === 'realized' && (
                    <div className="mt-4 pt-4 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => updateOutcomeStatus(outcome.id, 'validated')}
                      >
                        <CheckCircle size={16} weight="fill" />
                        Validate Outcome
                      </Button>
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
