import { useKV } from '@github/spark/hooks'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Strategy, 
  ChartBar, 
  FolderOpen, 
  Target, 
  MapTrifold, 
  Rocket, 
  ChartLine, 
  TrendUp, 
  ArrowsLeftRight, 
  Tree, 
  GridFour, 
  Circle,
  House,
  CaretDown
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import StrategyCards from './components/StrategyCards'
import Workbench from './components/Workbench'
import Portfolios from './components/Portfolios'
import Dashboard from './components/Dashboard'
import Roadmap from './components/Roadmap'
import ProductRoadmap from './components/ProductRoadmap'
import KPIDashboard from './components/KPIDashboard'
import InitiativeTracker from './components/InitiativeTracker'
import StrategyComparison from './components/StrategyComparison'
import StrategyTraceability from './components/StrategyTraceability'
import XMatrix from './components/XMatrix'
import BowlingChart from './components/BowlingChart'
import type { StrategyCard, Initiative } from './types'

type NavigationItem = {
  id: string
  label: string
  icon: React.ElementType
  component: React.ComponentType
}

type NavigationSection = {
  id: string
  label: string
  items: NavigationItem[]
}

const navigationSections: NavigationSection[] = [
  {
    id: 'planning',
    label: 'Planning',
    items: [
      { id: 'strategy', label: 'Strategy Cards', icon: Strategy, component: StrategyCards },
      { id: 'comparison', label: 'Compare', icon: ArrowsLeftRight, component: StrategyComparison },
      { id: 'traceability', label: 'Traceability', icon: Tree, component: StrategyTraceability },
    ]
  },
  {
    id: 'execution',
    label: 'Execution',
    items: [
      { id: 'workbench', label: 'Workbench', icon: ChartBar, component: Workbench },
      { id: 'tracker', label: 'Initiative Tracker', icon: TrendUp, component: InitiativeTracker },
      { id: 'portfolios', label: 'Portfolios', icon: FolderOpen, component: Portfolios },
    ]
  },
  {
    id: 'hoshin',
    label: 'Hoshin Kanri',
    items: [
      { id: 'x-matrix', label: 'X-Matrix', icon: GridFour, component: XMatrix },
      { id: 'bowling', label: 'Bowling Chart', icon: Circle, component: BowlingChart },
    ]
  },
  {
    id: 'roadmaps',
    label: 'Roadmaps',
    items: [
      { id: 'roadmap', label: 'Strategic Roadmap', icon: MapTrifold, component: Roadmap },
      { id: 'product-roadmap', label: 'Product Roadmap', icon: Rocket, component: ProductRoadmap },
    ]
  },
  {
    id: 'reporting',
    label: 'Reporting',
    items: [
      { id: 'dashboard', label: 'Executive Dashboard', icon: Target, component: Dashboard },
      { id: 'kpi', label: 'KPI Scorecard', icon: ChartLine, component: KPIDashboard },
    ]
  }
]

function App() {
  const [strategyCards] = useKV<StrategyCard[]>('strategy-cards', [])
  const [initiatives] = useKV<Initiative[]>('initiatives', [])
  const [activeView, setActiveView] = useState('strategy')
  const [showHome, setShowHome] = useState(true)
  const [collapsedSections, setCollapsedSections] = useKV<string[]>('sidebar-collapsed-sections', [])

  const handleNavigate = (viewId: string) => {
    setActiveView(viewId)
    setShowHome(false)
  }

  const handleHomeClick = () => {
    setShowHome(true)
  }

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((current) => {
      const sections = current || []
      if (sections.includes(sectionId)) {
        return sections.filter(id => id !== sectionId)
      }
      return [...sections, sectionId]
    })
  }

  const activeItem = navigationSections
    .flatMap(section => section.items)
    .find(item => item.id === activeView)

  const ActiveComponent = activeItem?.component

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                StrategyOS
              </h1>
              <p className="text-sm text-muted-foreground mt-1 font-medium tracking-wide uppercase">
                Strategy Management Platform
              </p>
            </div>
            <div className="flex items-center gap-6 font-mono text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider">Cards</span>
                <span className="text-accent font-semibold text-base">{strategyCards?.length || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider">Initiatives</span>
                <span className="text-accent font-semibold text-base">{initiatives?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-104px)]">
        <aside className="w-64 border-r border-border bg-card">
          <nav className="p-4 space-y-6">
            <button
              onClick={handleHomeClick}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all",
                "hover:bg-accent hover:text-accent-foreground",
                showHome && "bg-primary text-primary-foreground shadow-sm"
              )}
            >
              <House size={20} weight="bold" />
              <span className="font-semibold text-sm">Home</span>
            </button>

            {navigationSections.map(section => {
              const isCollapsed = collapsedSections?.includes(section.id)
              return (
                <div key={section.id} className="space-y-1">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent/50"
                  >
                    <span>{section.label}</span>
                    <CaretDown 
                      size={14} 
                      weight="bold"
                      className={cn(
                        "transition-transform duration-200",
                        isCollapsed && "-rotate-90"
                      )}
                    />
                  </button>
                  <div 
                    className={cn(
                      "space-y-1 overflow-hidden transition-all duration-200",
                      isCollapsed ? "max-h-0 opacity-0" : "max-h-[500px] opacity-100"
                    )}
                  >
                    {section.items.map(item => {
                      const Icon = item.icon
                      const isActive = activeView === item.id && !showHome
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavigate(item.id)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2.5 rounded-md transition-all text-left",
                            "hover:bg-accent hover:text-accent-foreground",
                            isActive && "bg-primary text-primary-foreground shadow-sm"
                          )}
                        >
                          <Icon size={18} weight={isActive ? "fill" : "regular"} />
                          <span className="font-medium text-sm">{item.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </nav>
        </aside>

        <main className="flex-1 overflow-auto">
          {showHome ? (
            <div className="container mx-auto px-8 py-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Welcome to StrategyOS
                </h2>
                <p className="text-muted-foreground">
                  Select a module from the navigation to begin managing your strategic initiatives
                </p>
              </div>

              <div className="grid gap-6">
                {navigationSections.map(section => (
                  <div key={section.id} className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground uppercase tracking-wide">
                      {section.label}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {section.items.map(item => {
                        const Icon = item.icon
                        return (
                          <Card
                            key={item.id}
                            className="cursor-pointer transition-all hover:shadow-lg hover:border-accent group"
                            onClick={() => handleNavigate(item.id)}
                          >
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                                  <Icon size={24} weight="bold" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-foreground mb-1">
                                    {item.label}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {getModuleDescription(item.id)}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="container mx-auto px-8 py-8">
              {ActiveComponent && <ActiveComponent />}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function getModuleDescription(moduleId: string): string {
  const descriptions: Record<string, string> = {
    'strategy': 'Create and manage strategic frameworks using proven methodologies',
    'comparison': 'Compare multiple strategic options side-by-side',
    'traceability': 'Map relationships from goals to initiatives',
    'workbench': 'Execute and track strategic initiatives',
    'tracker': 'Monitor initiative progress with real-time status',
    'portfolios': 'Organize initiatives into strategic portfolios',
    'x-matrix': 'Align objectives using Hoshin Kanri methodology',
    'bowling': 'Track monthly progress with visual indicators',
    'roadmap': 'Visualize strategic timeline and milestones',
    'product-roadmap': 'Plan and track product development initiatives',
    'dashboard': 'Executive-level view of strategic performance',
    'kpi': 'Monitor key performance indicators and metrics',
  }
  return descriptions[moduleId] || 'Manage your strategic initiatives'
}

export default App
