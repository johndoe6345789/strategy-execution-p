import { renderHook, act } from '@testing-library/react'
import { toast } from 'sonner'
import { useProjectsView } from '@/hooks/useProjectsView'

const makeSetProjects = () => {
  let projects: any[] = []
  const setProjects = vi.fn((updater: (prev: any[]) => any[]) => {
    projects = updater(projects)
  })
  const getProjects = () => projects
  return { setProjects, getProjects }
}

describe('useProjectsView', () => {
  beforeEach(() => vi.clearAllMocks())

  it('initialises with all dialogs closed and empty form state', () => {
    const { setProjects } = makeSetProjects()
    const { result } = renderHook(() => useProjectsView(setProjects))

    expect(result.current.isAddingProject).toBe(false)
    expect(result.current.isAddingObjective).toBe(false)
    expect(result.current.isAddingMetric).toBe(false)
    expect(result.current.isAddingCountermeasure).toBe(false)
    expect(result.current.newProject.name).toBe('')
  })

  describe('handleAddProject', () => {
    it('shows error when required fields are missing', () => {
      const { setProjects } = makeSetProjects()
      const { result } = renderHook(() => useProjectsView(setProjects))
      act(() => { result.current.handleAddProject() })
      expect(toast.error).toHaveBeenCalledWith('Please fill in all required fields')
      expect(setProjects).not.toHaveBeenCalled()
    })

    it('adds a project and closes the dialog when all fields are filled', () => {
      const { setProjects, getProjects } = makeSetProjects()
      const { result } = renderHook(() => useProjectsView(setProjects))

      act(() => {
        result.current.setNewProject({
          ...result.current.newProject,
          name: 'Test Project',
          owner: 'Alice',
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        })
      })
      act(() => { result.current.handleAddProject() })

      expect(toast.success).toHaveBeenCalledWith('Project created successfully')
      expect(getProjects()).toHaveLength(1)
      expect(getProjects()[0].name).toBe('Test Project')
      expect(result.current.isAddingProject).toBe(false)
      expect(result.current.newProject.name).toBe('')
    })

    it('generates a unique id for the new project', () => {
      const { setProjects, getProjects } = makeSetProjects()
      const { result } = renderHook(() => useProjectsView(setProjects))
      act(() => {
        result.current.setNewProject({ ...result.current.newProject, name: 'P', owner: 'B', startDate: '2024-01-01', endDate: '2024-12-31' })
      })
      act(() => { result.current.handleAddProject() })
      expect(getProjects()[0].id).toMatch(/^proj-\d+$/)
    })
  })

  describe('handleDeleteProject', () => {
    it('removes the project with the given id', () => {
      const { setProjects, getProjects } = makeSetProjects()
      // Seed a project
      setProjects(() => [{ id: 'p1', name: 'Keep' }, { id: 'p2', name: 'Delete' }] as any)

      const { result } = renderHook(() => useProjectsView(setProjects))
      act(() => { result.current.handleDeleteProject('p2') })

      expect(getProjects()).toHaveLength(1)
      expect(getProjects()[0].id).toBe('p1')
      expect(toast.success).toHaveBeenCalledWith('Project deleted')
    })
  })

  describe('handleAddObjective', () => {
    it('shows error when required fields are missing', () => {
      const { setProjects } = makeSetProjects()
      const { result } = renderHook(() => useProjectsView(setProjects))
      act(() => { result.current.handleAddObjective() })
      expect(toast.error).toHaveBeenCalledWith('Please fill in all required fields')
    })

    it('adds objective to the selected project', () => {
      const { setProjects, getProjects } = makeSetProjects()
      setProjects(() => [{ id: 'p1', objectives: [], metrics: [], countermeasures: [] }] as any)

      const { result } = renderHook(() => useProjectsView(setProjects))
      act(() => {
        result.current.setSelectedProjectId('p1')
        result.current.setNewObjective({
          ...result.current.newObjective,
          description: 'Be awesome',
          owner: 'Team',
          targetDate: '2024-06-30'
        })
      })
      act(() => { result.current.handleAddObjective() })

      expect(getProjects()[0].objectives).toHaveLength(1)
      expect(getProjects()[0].objectives[0].description).toBe('Be awesome')
      expect(toast.success).toHaveBeenCalledWith('Objective added to project')
    })
  })

  describe('handleAddMetric', () => {
    it('shows error when name or unit is missing', () => {
      const { setProjects } = makeSetProjects()
      const { result } = renderHook(() => useProjectsView(setProjects))
      act(() => { result.current.handleAddMetric() })
      expect(toast.error).toHaveBeenCalledWith('Please fill in all required fields')
    })

    it('adds metric to the selected project', () => {
      const { setProjects, getProjects } = makeSetProjects()
      setProjects(() => [{ id: 'p1', objectives: [], metrics: [], countermeasures: [] }] as any)

      const { result } = renderHook(() => useProjectsView(setProjects))
      act(() => {
        result.current.setSelectedProjectId('p1')
        result.current.setNewMetric({ ...result.current.newMetric, name: 'NPS', unit: ' pts' })
      })
      act(() => { result.current.handleAddMetric() })

      expect(getProjects()[0].metrics).toHaveLength(1)
      expect(getProjects()[0].metrics[0].name).toBe('NPS')
      expect(toast.success).toHaveBeenCalledWith('Metric added to project')
    })
  })

  describe('handleAddCountermeasure', () => {
    it('shows error when required fields are missing', () => {
      const { setProjects } = makeSetProjects()
      const { result } = renderHook(() => useProjectsView(setProjects))
      act(() => { result.current.handleAddCountermeasure() })
      expect(toast.error).toHaveBeenCalledWith('Please fill in all required fields')
    })

    it('adds countermeasure to the selected project', () => {
      const { setProjects, getProjects } = makeSetProjects()
      setProjects(() => [{ id: 'p1', objectives: [], metrics: [], countermeasures: [] }] as any)

      const { result } = renderHook(() => useProjectsView(setProjects))
      act(() => {
        result.current.setSelectedProjectId('p1')
        result.current.setNewCountermeasure({
          issue: 'Bug', action: 'Fix it', owner: 'Dev', dueDate: '2024-03-01', status: 'open'
        })
      })
      act(() => { result.current.handleAddCountermeasure() })

      expect(getProjects()[0].countermeasures).toHaveLength(1)
      expect(getProjects()[0].countermeasures[0].issue).toBe('Bug')
      expect(toast.success).toHaveBeenCalledWith('Countermeasure added to project')
    })
  })

  describe('handleUpdateProjectProgress', () => {
    it('calculates average metric progress and updates project.progress', () => {
      const { setProjects, getProjects } = makeSetProjects()
      setProjects(() => [{
        id: 'p1', progress: 0, objectives: [], countermeasures: [],
        metrics: [
          { baseline: 0, current: 50, target: 100 },
          { baseline: 0, current: 100, target: 100 }
        ]
      }] as any)

      const { result } = renderHook(() => useProjectsView(setProjects))
      act(() => { result.current.handleUpdateProjectProgress('p1') })

      expect(getProjects()[0].progress).toBe(75)
    })

    it('skips projects with no metrics', () => {
      const { setProjects, getProjects } = makeSetProjects()
      setProjects(() => [{ id: 'p1', progress: 42, objectives: [], metrics: [], countermeasures: [] }] as any)

      const { result } = renderHook(() => useProjectsView(setProjects))
      act(() => { result.current.handleUpdateProjectProgress('p1') })

      expect(getProjects()[0].progress).toBe(42)
    })
  })
})
