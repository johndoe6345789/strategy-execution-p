import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Lightning, Trash } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { countermeasureStatusColors } from '@/constants/roadmapColors'
import type { RoadmapProject } from '@/types'

type SetProjects = (updater: (prev: RoadmapProject[]) => RoadmapProject[]) => void
type CMStatus = 'open' | 'in-progress' | 'completed'

interface Props {
  projects: RoadmapProject[]
  setProjects: SetProjects
}

export function CountermeasuresView({ projects, setProjects }: Props) {
  const allCountermeasures = projects.flatMap(project =>
    (project.countermeasures || []).map(cm => ({ ...cm, projectName: project.name, projectId: project.id }))
  )

  const handleUpdateStatus = (projectId: string, countermeasureId: string, newStatus: CMStatus) => {
    setProjects((prev) => prev.map(p => {
      if (p.id !== projectId) return p
      return {
        ...p,
        countermeasures: (p.countermeasures || []).map(cm =>
          cm.id === countermeasureId ? { ...cm, status: newStatus } : cm
        )
      }
    }))
    toast.success('Countermeasure status updated')
  }

  const handleDeleteCountermeasure = (projectId: string, countermeasureId: string) => {
    setProjects((prev) => prev.map(p => {
      if (p.id !== projectId) return p
      return { ...p, countermeasures: (p.countermeasures || []).filter(cm => cm.id !== countermeasureId) }
    }))
    toast.success('Countermeasure deleted')
  }

  if (allCountermeasures.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Lightning size={48} className="text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">No countermeasures defined. Add countermeasures to projects to track corrective actions.</p>
        </CardContent>
      </Card>
    )
  }

  const openCount = allCountermeasures.filter(cm => cm.status === 'open').length
  const inProgressCount = allCountermeasures.filter(cm => cm.status === 'in-progress').length
  const completedCount = allCountermeasures.filter(cm => cm.status === 'completed').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Open', count: openCount, className: 'text-muted-foreground' },
          { label: 'In Progress', count: inProgressCount, className: 'text-primary' },
          { label: 'Completed', count: completedCount, className: 'text-success' }
        ].map(({ label, count, className }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">{label}</p>
              <div className={`text-3xl font-bold ${className}`}>{count}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Countermeasures (PDCA Actions)</CardTitle>
          <CardDescription>Track corrective and preventive actions across all projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allCountermeasures.map((cm) => {
              const isOverdue = new Date(cm.dueDate) < new Date() && cm.status !== 'completed'
              return (
                <div key={cm.id} className={`p-4 border rounded-lg ${isOverdue ? 'border-destructive/50 bg-destructive/5' : 'border-border bg-card'}`}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className={`${countermeasureStatusColors[cm.status]} capitalize font-semibold`}>
                          {cm.status.replace('-', ' ')}
                        </Badge>
                        <Badge variant="outline" className="text-xs">{cm.projectName}</Badge>
                        {isOverdue && (
                          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-xs">Overdue</Badge>
                        )}
                      </div>
                      <h4 className="font-semibold mb-2">{cm.issue}</h4>
                      <p className="text-sm text-muted-foreground mb-3"><strong>Action:</strong> {cm.action}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span><strong>Owner:</strong> {cm.owner}</span>
                        <span><strong>Due:</strong> {new Date(cm.dueDate).toLocaleDateString()}</span>
                        <span><strong>Created:</strong> {new Date(cm.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Select value={cm.status} onValueChange={(v) => handleUpdateStatus(cm.projectId, cm.id, v as CMStatus)}>
                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteCountermeasure(cm.projectId, cm.id)}>
                        <Trash size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
