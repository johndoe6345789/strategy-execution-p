export type StatusType = 'not-started' | 'on-track' | 'at-risk' | 'blocked' | 'completed'
export type PriorityType = 'critical' | 'high' | 'medium' | 'low'
export type PortfolioType = 'operational-excellence' | 'ma' | 'financial-transformation' | 'esg' | 'innovation'

export interface Decision {
  id: string
  title: string
  description: string
  rationale: string
  alternatives: string[]
  decidedBy: string
  decidedAt: string
  impact: 'high' | 'medium' | 'low'
  category: 'strategic' | 'tactical' | 'operational'
}

export interface StrategyCard {
  id: string
  title: string
  framework: string
  vision: string
  goals: string[]
  metrics: string[]
  assumptions: string[]
  decisions?: Decision[]
  createdAt: number
  updatedAt: number
}

export interface Initiative {
  id: string
  title: string
  description: string
  strategyCardId: string
  owner: string
  status: StatusType
  priority: PriorityType
  portfolio: PortfolioType
  progress: number
  startDate: string
  endDate: string
  budget: number
  kpis: KPI[]
}

export interface KPI {
  id: string
  name: string
  current: number
  target: number
  unit: string
  trend: 'up' | 'down' | 'flat'
}

export interface Portfolio {
  type: PortfolioType
  name: string
  description: string
  capacity: number
  utilized: number
}

export interface RoadmapProject {
  id: string
  name: string
  description: string
  owner: string
  status: StatusType
  priority: PriorityType
  startDate: string
  endDate: string
  progress: number
  objectives: RoadmapObjective[]
  metrics: RoadmapMetric[]
  budget?: number
  actualSpend?: number
  dependencies?: string[]
  countermeasures?: Countermeasure[]
  capacity?: ProjectCapacity
}

export interface Countermeasure {
  id: string
  issue: string
  action: string
  owner: string
  dueDate: string
  status: 'open' | 'in-progress' | 'completed'
  createdAt: string
}

export interface ProjectCapacity {
  totalHours: number
  allocatedHours: number
  team: TeamMember[]
}

export interface TeamMember {
  id: string
  name: string
  role: string
  allocation: number
}

export interface RoadmapObjective {
  id: string
  projectId: string
  category: 'breakthrough' | 'annual' | 'improvement'
  description: string
  owner: string
  targetDate: string
  status: StatusType
  metrics: RoadmapMetric[]
}

export interface RoadmapMetric {
  id: string
  name: string
  baseline: number
  current: number
  target: number
  unit: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual'
  lastUpdated: string
  trend: 'improving' | 'stable' | 'declining'
}

export interface BowlingChartData {
  objective: string
  months: MonthStatus[]
}

export interface MonthStatus {
  month: string
  status: 'green' | 'yellow' | 'red' | 'not-started'
  actual: number
  target: number
}

export interface PDCACycle {
  id: string
  title: string
  description: string
  category: 'quality' | 'cost' | 'delivery' | 'safety' | 'morale'
  currentPhase: 'plan' | 'do' | 'check' | 'act'
  owner: string
  startDate: string
  plan: PDCAPhase
  do: PDCAPhase
  check: PDCAPhase
  act: PDCAPhase
  status: StatusType
  linkedInitiativeId?: string
}

export interface PDCAPhase {
  completed: boolean
  completedDate?: string
  notes: string
  attachments?: string[]
  findings?: string
}
