import { useState } from 'react'
import { toast } from 'sonner'
import { EMPTY_METRIC } from '@/constants/roadmapColors'
import type { RoadmapProject, RoadmapMetric } from '@/types'

type SetProjects = (updater: (prev: RoadmapProject[]) => RoadmapProject[]) => void

export function useObjectivesView(projects: RoadmapProject[], setProjects: SetProjects) {
  const [isAddingMetricToObjective, setIsAddingMetricToObjective] = useState(false)
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string>('')
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [newMetric, setNewMetric] = useState<Partial<RoadmapMetric>>(EMPTY_METRIC)

  const allObjectivesWithProject = projects.flatMap(p =>
    p.objectives.map(obj => ({ ...obj, projectName: p.name, projectId: p.id }))
  )

  const handleAddMetricToObjective = () => {
    if (!newMetric.name || !newMetric.unit) {
      toast.error('Please fill in all required fields')
      return
    }
    const metric: RoadmapMetric = {
      id: `metric-${Date.now()}`,
      name: newMetric.name || '',
      baseline: newMetric.baseline || 0,
      current: newMetric.current || 0,
      target: newMetric.target || 0,
      unit: newMetric.unit || '',
      frequency: newMetric.frequency as RoadmapMetric['frequency'],
      lastUpdated: new Date().toISOString(),
      trend: newMetric.trend as RoadmapMetric['trend']
    }
    setProjects((prev) => prev.map(p => {
      if (p.id !== selectedProjectId) return p
      return {
        ...p,
        objectives: p.objectives.map(obj =>
          obj.id === selectedObjectiveId
            ? { ...obj, metrics: [...obj.metrics, metric] }
            : obj
        )
      }
    }))
    setIsAddingMetricToObjective(false)
    setNewMetric(EMPTY_METRIC)
    toast.success('Metric added to objective')
  }

  return {
    isAddingMetricToObjective, setIsAddingMetricToObjective,
    selectedObjectiveId, setSelectedObjectiveId,
    selectedProjectId, setSelectedProjectId,
    newMetric, setNewMetric,
    allObjectivesWithProject,
    handleAddMetricToObjective
  }
}
