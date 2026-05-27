import { renderHook, act } from '@testing-library/react'
import { toast } from 'sonner'
import { useMetricsView } from '@/hooks/useMetricsView'
import type { RoadmapProject, RoadmapMetric } from '@/types'

const baseMetric = (overrides: Partial<RoadmapMetric> = {}): RoadmapMetric => ({
  id: 'm1',
  name: 'NPS',
  baseline: 0,
  current: 50,
  target: 100,
  unit: ' pts',
  frequency: 'monthly',
  lastUpdated: '2024-01-01T00:00:00.000Z',
  trend: 'improving',
  ...overrides
})

const baseProject = (metrics: RoadmapMetric[]): RoadmapProject => ({
  id: 'p1',
  name: 'Project A',
  description: '',
  owner: 'Team',
  status: 'on-track',
  priority: 'medium',
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  progress: 0,
  objectives: [],
  metrics,
  countermeasures: []
})

const makeSetProjects = (initial: RoadmapProject[]) => {
  let projects = [...initial]
  const setProjects = vi.fn((updater: (prev: RoadmapProject[]) => RoadmapProject[]) => {
    projects = updater(projects)
  })
  return { setProjects, getProjects: () => projects }
}

describe('useMetricsView', () => {
  beforeEach(() => vi.clearAllMocks())

  it('aggregates metrics from all projects with projectName and projectId', () => {
    const projects = [
      baseProject([baseMetric({ id: 'm1', name: 'NPS' })]),
      { ...baseProject([baseMetric({ id: 'm2', name: 'MRR', unit: '$' })]), id: 'p2', name: 'Project B' }
    ]
    const { setProjects } = makeSetProjects(projects)
    const { result } = renderHook(() => useMetricsView(projects, setProjects))

    expect(result.current.allMetrics).toHaveLength(2)
    expect(result.current.allMetrics[0].projectName).toBe('Project A')
    expect(result.current.allMetrics[1].projectName).toBe('Project B')
  })

  describe('openEdit', () => {
    it('sets editingMetric, newValue, and opens the dialog', () => {
      const metric = baseMetric({ current: 72 })
      const projects = [baseProject([metric])]
      const { setProjects } = makeSetProjects(projects)
      const { result } = renderHook(() => useMetricsView(projects, setProjects))

      act(() => { result.current.openEdit({ ...metric, projectId: 'p1' }) })

      expect(result.current.editingMetric?.id).toBe('m1')
      expect(result.current.newValue).toBe(72)
      expect(result.current.isUpdatingMetric).toBe(true)
    })
  })

  describe('handleUpdateMetric', () => {
    it('does nothing if editingMetric is null', () => {
      const { setProjects } = makeSetProjects([])
      const { result } = renderHook(() => useMetricsView([], setProjects))
      act(() => { result.current.handleUpdateMetric() })
      expect(setProjects).not.toHaveBeenCalled()
    })

    it('updates the metric current value and lastUpdated', () => {
      const metric = baseMetric({ id: 'm1', current: 50 })
      const projects = [baseProject([metric])]
      const { setProjects, getProjects } = makeSetProjects(projects)
      const { result } = renderHook(() => useMetricsView(projects, setProjects))

      act(() => { result.current.openEdit({ ...metric, projectId: 'p1' }) })
      act(() => { result.current.setNewValue(85) })
      act(() => { result.current.handleUpdateMetric() })

      const updated = getProjects()[0].metrics[0]
      expect(updated.current).toBe(85)
      expect(updated.lastUpdated).not.toBe('2024-01-01T00:00:00.000Z')
      expect(toast.success).toHaveBeenCalledWith('Metric updated successfully')
    })

    it('closes the dialog and clears editingMetric after update', () => {
      const metric = baseMetric()
      const projects = [baseProject([metric])]
      const { setProjects } = makeSetProjects(projects)
      const { result } = renderHook(() => useMetricsView(projects, setProjects))

      act(() => { result.current.openEdit({ ...metric, projectId: 'p1' }) })
      act(() => { result.current.handleUpdateMetric() })

      expect(result.current.isUpdatingMetric).toBe(false)
      expect(result.current.editingMetric).toBeNull()
    })
  })
})
