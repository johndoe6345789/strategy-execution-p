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
import { Plus, Check, Circle } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface XMatrixObjective {
  id: string
  type: 'breakthrough' | 'annual'
  description: string
}

interface XMatrixMetric {
  id: string
  name: string
  target: number
  unit: string
}

interface XMatrixImprovement {
  id: string
  description: string
  owner: string
}

interface XMatrixRelationship {
  objectiveId: string
  metricId?: string
  improvementId?: string
  strength: 'strong' | 'medium' | 'weak'
}

export default function XMatrix() {
  const [breakthroughObjectives, setBreakthroughObjectives] = useKV<XMatrixObjective[]>('x-matrix-breakthrough', [])
  const [annualObjectives, setAnnualObjectives] = useKV<XMatrixObjective[]>('x-matrix-annual', [])
  const [metrics, setMetrics] = useKV<XMatrixMetric[]>('x-matrix-metrics', [])
  const [improvements, setImprovements] = useKV<XMatrixImprovement[]>('x-matrix-improvements', [])
  const [relationships, setRelationships] = useKV<XMatrixRelationship[]>('x-matrix-relationships', [])

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [addType, setAddType] = useState<'breakthrough' | 'annual' | 'metric' | 'improvement'>('breakthrough')

  const [formData, setFormData] = useState({
    description: '',
    name: '',
    target: 0,
    unit: '',
    owner: ''
  })

  const handleAdd = () => {
    if (addType === 'breakthrough' || addType === 'annual') {
      if (!formData.description) {
        toast.error('Please enter a description')
        return
      }
      const newObj: XMatrixObjective = {
        id: `obj-${Date.now()}`,
        type: addType,
        description: formData.description
      }
      if (addType === 'breakthrough') {
        setBreakthroughObjectives((current) => [...(current || []), newObj])
      } else {
        setAnnualObjectives((current) => [...(current || []), newObj])
      }
      toast.success(`${addType === 'breakthrough' ? 'Breakthrough' : 'Annual'} objective added`)
    } else if (addType === 'metric') {
      if (!formData.name || !formData.unit) {
        toast.error('Please fill in all fields')
        return
      }
      const newMetric: XMatrixMetric = {
        id: `metric-${Date.now()}`,
        name: formData.name,
        target: formData.target,
        unit: formData.unit
      }
      setMetrics((current) => [...(current || []), newMetric])
      toast.success('Metric added')
    } else if (addType === 'improvement') {
      if (!formData.description || !formData.owner) {
        toast.error('Please fill in all fields')
        return
      }
      const newImprovement: XMatrixImprovement = {
        id: `imp-${Date.now()}`,
        description: formData.description,
        owner: formData.owner
      }
      setImprovements((current) => [...(current || []), newImprovement])
      toast.success('Improvement action added')
    }

    setIsAddDialogOpen(false)
    setFormData({ description: '', name: '', target: 0, unit: '', owner: '' })
  }

  const toggleRelationship = (objId: string, targetId: string, targetType: 'metric' | 'improvement') => {
    setRelationships((current) => {
      const relationships = current || []
      const existing = relationships.find(r =>
        r.objectiveId === objId &&
        (targetType === 'metric' ? r.metricId === targetId : r.improvementId === targetId)
      )

      if (existing) {
        if (existing.strength === 'weak') {
          return relationships.filter(r => r !== existing)
        } else if (existing.strength === 'medium') {
          return relationships.map(r => r === existing ? { ...r, strength: 'weak' as const } : r)
        } else {
          return relationships.map(r => r === existing ? { ...r, strength: 'medium' as const } : r)
        }
      } else {
        const newRel: XMatrixRelationship = {
          objectiveId: objId,
          ...(targetType === 'metric' ? { metricId: targetId } : { improvementId: targetId }),
          strength: 'strong'
        }
        return [...relationships, newRel]
      }
    })
  }

  const getRelationshipStrength = (objId: string, targetId: string, targetType: 'metric' | 'improvement'): 'strong' | 'medium' | 'weak' | null => {
    const rel = (relationships || []).find(r =>
      r.objectiveId === objId &&
      (targetType === 'metric' ? r.metricId === targetId : r.improvementId === targetId)
    )
    return rel ? rel.strength : null
  }

  const RelationshipCell = ({ objId, targetId, targetType }: { objId: string; targetId: string; targetType: 'metric' | 'improvement' }) => {
    const strength = getRelationshipStrength(objId, targetId, targetType)
    return (
      <button
        onClick={() => toggleRelationship(objId, targetId, targetType)}
        className="w-full h-12 flex items-center justify-center border border-border hover:bg-muted/50 transition-colors"
      >
        {strength === 'strong' && <div className="w-6 h-6 rounded-full bg-accent" />}
        {strength === 'medium' && <div className="w-5 h-5 rounded-full bg-accent/60" />}
        {strength === 'weak' && <div className="w-3 h-3 rounded-full bg-accent/30" />}
        {!strength && <Circle size={16} className="text-muted-foreground/20" />}
      </button>
    )
  }

  const allBreakthrough = breakthroughObjectives || []
  const allAnnual = annualObjectives || []
  const allMetrics = metrics || []
  const allImprovements = improvements || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">X-Matrix</h2>
          <p className="text-muted-foreground mt-1">
            Hoshin Kanri strategic alignment matrix
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} weight="bold" />
              Add Element
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add X-Matrix Element</DialogTitle>
              <DialogDescription>Add objectives, metrics, or improvement actions</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Element Type</Label>
                <Select value={addType} onValueChange={(value: any) => setAddType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakthrough">Breakthrough Objective</SelectItem>
                    <SelectItem value="annual">Annual Objective</SelectItem>
                    <SelectItem value="metric">Metric</SelectItem>
                    <SelectItem value="improvement">Improvement Action</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(addType === 'breakthrough' || addType === 'annual' || addType === 'improvement') && (
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter description..."
                    rows={3}
                  />
                </div>
              )}

              {addType === 'metric' && (
                <>
                  <div className="space-y-2">
                    <Label>Metric Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Revenue Growth"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Target</Label>
                      <Input
                        type="number"
                        value={formData.target}
                        onChange={(e) => setFormData({ ...formData, target: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Unit</Label>
                      <Input
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        placeholder="e.g., %, $M"
                      />
                    </div>
                  </div>
                </>
              )}

              {addType === 'improvement' && (
                <div className="space-y-2">
                  <Label>Owner</Label>
                  <Input
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                    placeholder="Person responsible"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd}>Add</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {(allBreakthrough.length === 0 && allAnnual.length === 0 && allMetrics.length === 0 && allImprovements.length === 0) ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-6 mb-4">
              <Plus size={48} weight="duotone" className="text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Empty X-Matrix</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Start by adding breakthrough objectives, annual objectives, metrics, and improvement actions
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <Plus size={16} weight="bold" />
              Add First Element
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Breakthrough Objectives</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">{allBreakthrough.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Annual Objectives</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">{allAnnual.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">{allMetrics.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Improvement Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">{allImprovements.length}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Strategic Alignment Matrix</CardTitle>
              <CardDescription>
                Click cells to set relationship strength: ● Strong → ◐ Medium → ○ Weak → Empty
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                  <div className="grid gap-0 border" style={{ gridTemplateColumns: `200px repeat(${Math.max(allMetrics.length, allImprovements.length)}, 100px)` }}>
                    <div className="p-3 bg-primary text-primary-foreground font-semibold border-r border-b">
                      Breakthrough Objectives
                    </div>
                    {allMetrics.map((metric) => (
                      <div key={metric.id} className="p-2 bg-muted/50 border-r border-b">
                        <div className="text-xs font-semibold line-clamp-2">{metric.name}</div>
                        <div className="text-xs text-muted-foreground font-mono mt-1">
                          {metric.target}{metric.unit}
                        </div>
                      </div>
                    ))}

                    {allBreakthrough.map((obj) => (
                      <>
                        <div key={obj.id} className="p-3 border-r border-b bg-muted/30">
                          <div className="text-sm font-medium line-clamp-2">{obj.description}</div>
                        </div>
                        {allMetrics.map((metric) => (
                          <RelationshipCell
                            key={`${obj.id}-${metric.id}`}
                            objId={obj.id}
                            targetId={metric.id}
                            targetType="metric"
                          />
                        ))}
                      </>
                    ))}

                    <div className="p-3 bg-secondary text-secondary-foreground font-semibold border-r border-b mt-4">
                      Annual Objectives
                    </div>
                    {allImprovements.map((imp) => (
                      <div key={imp.id} className="p-2 bg-muted/50 border-r border-b mt-4">
                        <div className="text-xs font-semibold line-clamp-2">{imp.description}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {imp.owner}
                        </div>
                      </div>
                    ))}

                    {allAnnual.map((obj) => (
                      <>
                        <div key={obj.id} className="p-3 border-r border-b bg-muted/30">
                          <div className="text-sm font-medium line-clamp-2">{obj.description}</div>
                        </div>
                        {allImprovements.map((imp) => (
                          <RelationshipCell
                            key={`${obj.id}-${imp.id}`}
                            objId={obj.id}
                            targetId={imp.id}
                            targetType="improvement"
                          />
                        ))}
                      </>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Breakthrough Objectives</CardTitle>
                <CardDescription>3-5 year strategic objectives</CardDescription>
              </CardHeader>
              <CardContent>
                {allBreakthrough.length > 0 ? (
                  <ul className="space-y-2">
                    {allBreakthrough.map((obj, idx) => (
                      <li key={obj.id} className="flex items-start gap-2 text-sm">
                        <Badge variant="secondary" className="mt-0.5">{idx + 1}</Badge>
                        <span>{obj.description}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No breakthrough objectives yet</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Annual Objectives</CardTitle>
                <CardDescription>Current year objectives</CardDescription>
              </CardHeader>
              <CardContent>
                {allAnnual.length > 0 ? (
                  <ul className="space-y-2">
                    {allAnnual.map((obj, idx) => (
                      <li key={obj.id} className="flex items-start gap-2 text-sm">
                        <Badge variant="secondary" className="mt-0.5">{idx + 1}</Badge>
                        <span>{obj.description}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No annual objectives yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
