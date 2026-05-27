import { renderHook, act } from '@testing-library/react'
import { toast } from 'sonner'
import { useObjectivesView } from '@/hooks/useObjectivesView'
import type { RoadmapProject } from '@/types'

const baseProject = (overrides: Partial<RoadmapProject> = {}): RoadmapProject => ({
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
  metrics: [],
  countermeasures: [],
  ...overrides
})

const makeSetProjects = (initial: RoadmapProject[]) => {
  let projects = [...initial]
  const setProjects = vi.fn((updater: (prev: RoadmapProject[]) => RoadmapProject[]) => {
    projects = updater(projects)
  })
  return { setProjects, getProjects: () => projects }
}

describe('useObjectivesView', () => {
  beforeEach(() => vi.clearAllMocks())

  it('flattens objectives across all projects', () => {
    const projects = [
      baseProject({ objectives: [{ id: 'o1', projectId: 'p1', category: 'annual', description: 'Obj1', owner: 'X', targetDate: '2024-06-30', status: 'on-track', metrics: [] }] }),
      baseProject({ id: 'p2', name: 'Project B', objectives: [{ id: 'o2', projectId: 'p2', category: 'breakthrough', description: 'Obj2', owner: 'Y', targetDate: '2024-09-30', status: 'not-started', metrics: [] }] })
    ]
    const { setProjects } = makeSetProjects(projects)
    const { result } = renderHook(() => useObjectivesView(projects, setProjects))

    expect(result.current.allObjectivesWithProject).toHaveLength(2)
    expect(result.current.allObjectivesWithProject[0].projectName).toBe('Project A')
    expect(result.current.allObjectivesWithProject[1].projectName).toBe('Project B')
  })

  describe('handleAddMetricToObjective', () => {
    it('shows error when name or unit is missing', () => {
      const { setProjects } = makeSetProjects([])
      const { result } = renderHook(() => useObjectivesView([], setProjects))
      act(() => { result.current.handleAddMetricToObjective() })
      expect(toast.error).toHaveBeenCalledWith('Please fill in all required fields')
    })

    it('adds metric to the correct objective', () => {
      const objective = { id: 'o1', projectId: 'p1', category: 'annual' as const, description: 'D', owner: 'X', targetDate: '2024-06-30', status: 'on-track' as const, metrics: [] }
      const projects = [baseProject({ objectives: [objective] })]
      const { setProjects, getProjects } = makeSetProjects(projects)

      const { result } = renderHook(() => useObjectivesView(projects, setProjects))
      act(() => {
        result.current.setSelectedProjectId('p1')
        result.current.setSelectedObjectiveId('o1')
        result.current.setNewMetric({ ...result.current.newMetric, name: 'Revenue', unit: '$' })
      })
      act(() => { result.current.handleAddMetricToObjective() })

      const updatedObjective = getProjects()[0].objectives[0]
      expect(updatedObjective.metrics).toHaveLength(1)
      expect(updatedObjective.metrics[0].name).toBe('Revenue')
      expect(toast.success).toHaveBeenCalledWith('Metric added to objective')
    })

    it('resets form state after adding', () => {
      const objective = { id: 'o1', projectId: 'p1', category: 'annual' as const, description: 'D', owner: 'X', targetDate: '2024-06-30', status: 'on-track' as const, metrics: [] }
      const projects = [baseProject({ objectives: [objective] })]
      const { setProjects } = makeSetProjects(projects)

      const { result } = renderHook(() => useObjectivesView(projects, setProjects))
      act(() => {
        result.current.setSelectedProjectId('p1')
        result.current.setSelectedObjectiveId('o1')
        result.current.setNewMetric({ ...result.current.newMetric, name: 'Revenue', unit: '$' })
      })
      act(() => { result.current.handleAddMetricToObjective() })

      expect(result.current.isAddingMetricToObjective).toBe(false)
      expect(result.current.newMetric.name).toBe('')
    })
  })
})
