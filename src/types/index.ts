export type StatusType = 'not-started' | 'on-track' | 'at-risk' | 'blocked' | 'completed'
export type PriorityType = 'critical' | 'high' | 'medium' | 'low'
export type PortfolioType = 'operational-excellence' | 'ma' | 'financial-transformation' | 'esg' | 'innovation'

export interface StrategyCard {
  id: string
  title: string
  framework: string
  vision: string
  goals: string[]
  metrics: string[]
  assumptions: string[]
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
