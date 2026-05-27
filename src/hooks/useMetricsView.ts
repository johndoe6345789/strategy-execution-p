import { useState } from 'react'
import { toast } from 'sonner'
import type { RoadmapProject, RoadmapMetric } from '@/types'

type SetProjects = (updater: (prev: RoadmapProject[]) => RoadmapProject[]) => void

export function useMetricsView(projects: RoadmapProject[], setProjects: SetProjects) {
  const [editingMetric, setEditingMetric] = useState<(RoadmapMetric & { projectId: string }) | null>(null)
  const [isUpdatingMetric, setIsUpdatingMetric] = useState(false)
  const [newValue, setNewValue] = useState<number>(0)

  const allMetrics = projects.flatMap(project =>
    project.metrics.map(m => ({ ...m, projectName: project.name, projectId: project.id }))
  )

  const handleUpdateMetric = () => {
    if (!editingMetric) return
    setProjects((prev) => prev.map(p => {
      if (p.id !== editingMetric.projectId) return p
      return {
        ...p,
        metrics: p.metrics.map(m =>
          m.id === editingMetric.id
            ? { ...m, current: newValue, lastUpdated: new Date().toISOString() }
            : m
        )
      }
    }))
    setIsUpdatingMetric(false)
    setEditingMetric(null)
    toast.success('Metric updated successfully')
  }

  const openEdit = (metric: RoadmapMetric & { projectId: string }) => {
    setEditingMetric(metric)
    setNewValue(metric.current)
    setIsUpdatingMetric(true)
  }

  return {
    editingMetric,
    isUpdatingMetric, setIsUpdatingMetric,
    newValue, setNewValue,
    allMetrics,
    handleUpdateMetric,
    openEdit
  }
}
