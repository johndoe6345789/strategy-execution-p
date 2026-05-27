import { useState } from 'react'
import { toast } from 'sonner'
import { EMPTY_METRIC } from '@/constants/roadmapColors'
import type { RoadmapProject, RoadmapObjective, RoadmapMetric, Countermeasure, StatusType, PriorityType } from '@/types'

type SetProjects = (updater: (prev: RoadmapProject[]) => RoadmapProject[]) => void

const EMPTY_PROJECT: Partial<RoadmapProject> = {
  name: '',
  description: '',
  owner: '',
  status: 'not-started',
  priority: 'medium',
  startDate: '',
  endDate: '',
  progress: 0,
  objectives: [],
  metrics: [],
  budget: 0,
  actualSpend: 0,
  dependencies: [],
  countermeasures: []
}

const EMPTY_OBJECTIVE: Partial<RoadmapObjective> = {
  category: 'annual',
  description: '',
  owner: '',
  targetDate: '',
  status: 'not-started',
  metrics: []
}

const EMPTY_COUNTERMEASURE: Partial<Countermeasure> = {
  issue: '',
  action: '',
  owner: '',
  dueDate: '',
  status: 'open'
}

export function useProjectsView(setProjects: SetProjects) {
  const [isAddingProject, setIsAddingProject] = useState(false)
  const [editingProject, setEditingProject] = useState<RoadmapProject | null>(null)
  const [isAddingObjective, setIsAddingObjective] = useState(false)
  const [isAddingMetric, setIsAddingMetric] = useState(false)
  const [isAddingCountermeasure, setIsAddingCountermeasure] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [newProject, setNewProject] = useState<Partial<RoadmapProject>>(EMPTY_PROJECT)
  const [newCountermeasure, setNewCountermeasure] = useState<Partial<Countermeasure>>(EMPTY_COUNTERMEASURE)
  const [newObjective, setNewObjective] = useState<Partial<RoadmapObjective>>(EMPTY_OBJECTIVE)
  const [newMetric, setNewMetric] = useState<Partial<RoadmapMetric>>(EMPTY_METRIC)

  const handleAddProject = () => {
    if (!newProject.name || !newProject.owner || !newProject.startDate || !newProject.endDate) {
      toast.error('Please fill in all required fields')
      return
    }
    const project: RoadmapProject = {
      id: `proj-${Date.now()}`,
      name: newProject.name,
      description: newProject.description || '',
      owner: newProject.owner,
      status: newProject.status as StatusType,
      priority: newProject.priority as PriorityType,
      startDate: newProject.startDate,
      endDate: newProject.endDate,
      progress: 0,
      objectives: [],
      metrics: [],
      budget: newProject.budget || 0,
      actualSpend: 0,
      dependencies: [],
      countermeasures: []
    }
    setProjects((prev) => [...prev, project])
    setIsAddingProject(false)
    setNewProject(EMPTY_PROJECT)
    toast.success('Project created successfully')
  }

  const handleDeleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter(p => p.id !== projectId))
    toast.success('Project deleted')
  }

  const handleAddObjective = () => {
    if (!newObjective.description || !newObjective.owner || !newObjective.targetDate) {
      toast.error('Please fill in all required fields')
      return
    }
    const objective: RoadmapObjective = {
      id: `obj-${Date.now()}`,
      projectId: selectedProjectId,
      category: newObjective.category as RoadmapObjective['category'],
      description: newObjective.description,
      owner: newObjective.owner,
      targetDate: newObjective.targetDate,
      status: newObjective.status as StatusType,
      metrics: []
    }
    setProjects((prev) => prev.map(p =>
      p.id === selectedProjectId ? { ...p, objectives: [...p.objectives, objective] } : p
    ))
    setIsAddingObjective(false)
    setNewObjective(EMPTY_OBJECTIVE)
    toast.success('Objective added to project')
  }

  const handleAddMetric = () => {
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
    setProjects((prev) => prev.map(p =>
      p.id === selectedProjectId ? { ...p, metrics: [...p.metrics, metric] } : p
    ))
    setIsAddingMetric(false)
    setNewMetric(EMPTY_METRIC)
    toast.success('Metric added to project')
  }

  const handleAddCountermeasure = () => {
    if (!newCountermeasure.issue || !newCountermeasure.action || !newCountermeasure.owner || !newCountermeasure.dueDate) {
      toast.error('Please fill in all required fields')
      return
    }
    const countermeasure: Countermeasure = {
      id: `cm-${Date.now()}`,
      issue: newCountermeasure.issue,
      action: newCountermeasure.action,
      owner: newCountermeasure.owner,
      dueDate: newCountermeasure.dueDate,
      status: newCountermeasure.status as Countermeasure['status'],
      createdAt: new Date().toISOString()
    }
    setProjects((prev) => prev.map(p =>
      p.id === selectedProjectId
        ? { ...p, countermeasures: [...(p.countermeasures || []), countermeasure] }
        : p
    ))
    setIsAddingCountermeasure(false)
    setNewCountermeasure(EMPTY_COUNTERMEASURE)
    toast.success('Countermeasure added to project')
  }

  const handleUpdateProjectProgress = (projectId: string) => {
    setProjects((prev) => prev.map(p => {
      if (p.id !== projectId) return p
      if (p.metrics.length === 0) return p
      const totalProgress = p.metrics.reduce((sum, metric) => {
        const progress = ((metric.current - metric.baseline) / (metric.target - metric.baseline)) * 100
        return sum + Math.max(0, Math.min(100, progress))
      }, 0)
      return { ...p, progress: Math.round(totalProgress / p.metrics.length) }
    }))
  }

  return {
    isAddingProject, setIsAddingProject,
    editingProject, setEditingProject,
    isAddingObjective, setIsAddingObjective,
    isAddingMetric, setIsAddingMetric,
    isAddingCountermeasure, setIsAddingCountermeasure,
    selectedProjectId, setSelectedProjectId,
    newProject, setNewProject,
    newCountermeasure, setNewCountermeasure,
    newObjective, setNewObjective,
    newMetric, setNewMetric,
    handleAddProject,
    handleDeleteProject,
    handleAddObjective,
    handleAddMetric,
    handleAddCountermeasure,
    handleUpdateProjectProgress
  }
}
