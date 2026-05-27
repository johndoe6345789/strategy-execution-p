import { useKV } from '@github/spark/hooks'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Target, ChartBar, GridFour, Gauge, ListChecks, FolderOpen, CalendarBlank, Lightning } from '@phosphor-icons/react'
import { sampleProjects } from '@/data/sampleProjects'
import { ProjectsView } from './roadmap/ProjectsView'
import { ObjectivesView } from './roadmap/ObjectivesView'
import { MetricsView } from './roadmap/MetricsView'
import { BowlingChartView } from './roadmap/BowlingChartView'
import { XMatrixView } from './roadmap/XMatrixView'
import { TimelineView } from './roadmap/TimelineView'
import { CountermeasuresView } from './roadmap/CountermeasuresView'
import { DashboardView } from './roadmap/DashboardView'
import type { RoadmapProject } from '@/types'

const TABS = [
  { value: 'projects',        label: 'Projects',       icon: <FolderOpen size={20} weight="bold" /> },
  { value: 'dashboard',       label: 'Dashboard',      icon: <Gauge size={20} weight="bold" /> },
  { value: 'timeline',        label: 'Timeline',       icon: <CalendarBlank size={20} weight="bold" /> },
  { value: 'objectives',      label: 'Objectives',     icon: <Target size={20} weight="bold" /> },
  { value: 'metrics',         label: 'Metrics',        icon: <ChartBar size={20} weight="bold" /> },
  { value: 'bowling',         label: 'Bowling',        icon: <ListChecks size={20} weight="bold" /> },
  { value: 'xmatrix',         label: 'X-Matrix',       icon: <GridFour size={20} weight="bold" /> },
  { value: 'countermeasures', label: 'Actions',        icon: <Lightning size={20} weight="bold" /> }
] as const

export default function Roadmap() {
  const [projects, setProjects] = useKV<RoadmapProject[]>('roadmap-projects', [])
  const [hasInitialized, setHasInitialized] = useKV<boolean>('roadmap-initialized', false)

  if ((!projects || projects.length === 0) && !hasInitialized) {
    setProjects(() => sampleProjects)
    setHasInitialized(() => true)
  }

  const safeProjects = projects || []
  const isSampleData = safeProjects.length > 0 && safeProjects[0].id === 'proj-strategyos-1'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">StrategyOS Product Roadmap</h2>
        <p className="text-muted-foreground mt-1">Internal product development roadmap using Hoshin Kanri methodology</p>
      </div>

      {isSampleData && (
        <Card className="border-accent/50 bg-accent/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="bg-accent/20 p-2 rounded-lg">
                <Target size={24} className="text-accent" weight="bold" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1">StrategyOS Product Roadmap Loaded</h3>
                <p className="text-sm text-muted-foreground">
                  This roadmap tracks the development of StrategyOS itself — Strategy Cards, Workbench, Enterprise Integrations,
                  Portfolio Management, and Financial Visibility. Explore the X-Matrix, Bowling Charts, and other Hoshin Kanri views!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 h-auto lg:h-14 bg-muted/50">
          {TABS.map(({ value, label, icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="gap-2 text-sm lg:text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {icon}
              <span className="hidden lg:inline">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="projects"        className="mt-6"><ProjectsView        projects={safeProjects} setProjects={setProjects} /></TabsContent>
        <TabsContent value="dashboard"       className="mt-6"><DashboardView       projects={safeProjects} /></TabsContent>
        <TabsContent value="timeline"        className="mt-6"><TimelineView        projects={safeProjects} /></TabsContent>
        <TabsContent value="objectives"      className="mt-6"><ObjectivesView      projects={safeProjects} setProjects={setProjects} /></TabsContent>
        <TabsContent value="metrics"         className="mt-6"><MetricsView         projects={safeProjects} setProjects={setProjects} /></TabsContent>
        <TabsContent value="bowling"         className="mt-6"><BowlingChartView    projects={safeProjects} /></TabsContent>
        <TabsContent value="xmatrix"         className="mt-6"><XMatrixView         projects={safeProjects} /></TabsContent>
        <TabsContent value="countermeasures" className="mt-6"><CountermeasuresView projects={safeProjects} setProjects={setProjects} /></TabsContent>
      </Tabs>
    </div>
  )
}
