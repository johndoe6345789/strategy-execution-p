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
  CaretDown,
  CurrencyDollar,
  CheckCircle,
  ChartLineUp,
  GitBranch,
  ArrowsDownUp,
  Gavel,
  Users,
  Presentation,
  FileText,
  ArrowsClockwise,
  BookOpen,
  Recycle,
  Sparkle,
  GlobeHemisphereWest,
  Shield,
  Translate,
  Link as LinkIcon,
  Question,
  FileArrowDown,
  Database,
  Storefront
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import StrategyCards from './components/StrategyCards'
import Workbench from './components/Workbench'
import Portfolios from './components/Portfolios'
import PortfolioAnalysis from './components/PortfolioAnalysis'
import Dashboard from './components/Dashboard'
import Roadmap from './components/Roadmap'
import ProductRoadmap from './components/ProductRoadmap'
import KPIDashboard from './components/KPIDashboard'
import InitiativeTracker from './components/InitiativeTracker'
import StrategyComparison from './components/StrategyComparison'
import StrategyTraceability from './components/StrategyTraceability'
import XMatrix from './components/XMatrix'
import BowlingChart from './components/BowlingChart'
import OKRManagement from './components/OKRManagement'
import FinancialTracking from './components/FinancialTracking'
import ExecutiveDashboard from './components/ExecutiveDashboard'
import StrategyToInitiative from './components/StrategyToInitiative'
import PortfolioGovernance from './components/PortfolioGovernance'
import CollaborativeWorkshops from './components/CollaborativeWorkshops'
import CustomScorecard from './components/CustomScorecard'
import AutomatedReportGeneration from './components/AutomatedReportGeneration'
import PDCACycleTracking from './components/PDCACycleTracking'
import CountermeasureManagement from './components/CountermeasureManagement'
import RationaleDecisionCapture from './components/RationaleDecisionCapture'
import LeanProcessSupport from './components/LeanProcessSupport'
import StrategyFrameworkWizard from './components/StrategyFrameworkWizard'
import DrillDownReporting from './components/DrillDownReporting'
import MultiRegionReporting from './components/MultiRegionReporting'
import APIWebhooks from './components/APIWebhooks'
import RoleBasedAccess from './components/RoleBasedAccess'
import AuditTrail from './components/AuditTrail'
import ProjectIntegrations from './components/ProjectIntegrations'
import LanguageSettings from './components/LanguageSettings'
import OnboardingHelp from './components/OnboardingHelp'
import DataImportExport from './components/DataImportExport'
import ERPIntegration from './components/ERPIntegration'
import CRMIntegration from './components/CRMIntegration'
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
      { id: 'guided-strategy', label: 'Guided Strategy Creation', icon: Sparkle, component: StrategyFrameworkWizard },
      { id: 'comparison', label: 'Compare', icon: ArrowsLeftRight, component: StrategyComparison },
      { id: 'traceability', label: 'Traceability', icon: Tree, component: StrategyTraceability },
      { id: 'strategy-to-initiative', label: 'Strategy to Initiative', icon: ArrowsDownUp, component: StrategyToInitiative },
      { id: 'rationale-decisions', label: 'Decisions & Rationale', icon: BookOpen, component: RationaleDecisionCapture },
      { id: 'workshops', label: 'Collaborative Workshops', icon: Users, component: CollaborativeWorkshops },
    ]
  },
  {
    id: 'execution',
    label: 'Execution',
    items: [
      { id: 'workbench', label: 'Workbench', icon: ChartBar, component: Workbench },
      { id: 'tracker', label: 'Initiative Tracker', icon: TrendUp, component: InitiativeTracker },
      { id: 'okr', label: 'OKR Management', icon: CheckCircle, component: OKRManagement },
      { id: 'portfolios', label: 'Portfolios', icon: FolderOpen, component: Portfolios },
      { id: 'portfolio-analysis', label: 'Portfolio Analysis', icon: GitBranch, component: PortfolioAnalysis },
      { id: 'portfolio-governance', label: 'Portfolio Governance', icon: Gavel, component: PortfolioGovernance },
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
    id: 'opex',
    label: 'Operational Excellence',
    items: [
      { id: 'lean-process', label: 'Lean Process Support', icon: Recycle, component: LeanProcessSupport },
      { id: 'countermeasures', label: 'Countermeasure Management', icon: Target, component: CountermeasureManagement },
      { id: 'pdca', label: 'PDCA Cycle Tracking', icon: ArrowsClockwise, component: PDCACycleTracking },
      { id: 'multi-region', label: 'Multi-Region Reporting', icon: GlobeHemisphereWest, component: MultiRegionReporting },
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
      { id: 'executive-dashboard', label: 'Executive Dashboard', icon: ChartLineUp, component: ExecutiveDashboard },
      { id: 'drill-down', label: 'Drill-Down Reporting', icon: ChartBar, component: DrillDownReporting },
      { id: 'dashboard', label: 'Performance Dashboard', icon: Target, component: Dashboard },
      { id: 'kpi', label: 'KPI Scorecard', icon: ChartLine, component: KPIDashboard },
      { id: 'custom-scorecard', label: 'Custom Scorecards', icon: Presentation, component: CustomScorecard },
      { id: 'financial', label: 'Financial Tracking', icon: CurrencyDollar, component: FinancialTracking },
      { id: 'automated-reports', label: 'Automated Reports', icon: FileText, component: AutomatedReportGeneration },
    ]
  },
  {
    id: 'platform',
    label: 'Platform',
    items: [
      { id: 'onboarding-help', label: 'Getting Started & Help', icon: Question, component: OnboardingHelp },
      { id: 'data-import-export', label: 'Data Import & Export', icon: FileArrowDown, component: DataImportExport },
      { id: 'api-webhooks', label: 'API & Webhooks', icon: GitBranch, component: APIWebhooks },
      { id: 'project-integrations', label: 'Project Management', icon: LinkIcon, component: ProjectIntegrations },
      { id: 'erp-integration', label: 'ERP Integration', icon: Database, component: ERPIntegration },
      { id: 'crm-integration', label: 'CRM Integration', icon: Storefront, component: CRMIntegration },
      { id: 'language-settings', label: 'Language & Regional', icon: Translate, component: LanguageSettings },
      { id: 'rbac', label: 'Access Control', icon: Shield, component: RoleBasedAccess },
      { id: 'audit-trail', label: 'Audit Trail', icon: BookOpen, component: AuditTrail },
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
    'guided-strategy': 'Step-by-step wizard for comprehensive strategy formulation',
    'comparison': 'Compare multiple strategic options side-by-side',
    'traceability': 'Map relationships from goals to initiatives',
    'strategy-to-initiative': 'AI-powered translation of strategy into executable initiatives',
    'rationale-decisions': 'Capture strategic decisions, assumptions, and rationale',
    'workshops': 'Real-time collaboration and discussion on strategic initiatives',
    'workbench': 'Execute and track strategic initiatives',
    'tracker': 'Monitor initiative progress with real-time status',
    'okr': 'Define and track Objectives and Key Results',
    'portfolios': 'Organize initiatives into strategic portfolios',
    'portfolio-analysis': 'Strategic alignment, capacity & dependency analysis',
    'portfolio-governance': 'Decision framework for prioritization and resource allocation',
    'x-matrix': 'Align objectives using Hoshin Kanri methodology',
    'bowling': 'Track monthly progress with visual indicators',
    'lean-process': 'Lean methodology principles, tools and templates',
    'countermeasures': 'Track improvement actions beyond KPI reporting',
    'pdca': 'Plan-Do-Check-Act continuous improvement cycles',
    'multi-region': 'Consistent reporting and analytics across global units',
    'roadmap': 'Visualize strategic timeline and milestones',
    'product-roadmap': 'Plan and track product development initiatives',
    'executive-dashboard': 'Executive-level strategic performance overview',
    'drill-down': 'Navigate from enterprise level to detailed project information',
    'dashboard': 'Real-time performance metrics and insights',
    'kpi': 'Monitor key performance indicators and metrics',
    'custom-scorecard': 'Create and manage configurable performance scorecards',
    'financial': 'Track financial outcomes and value realization',
    'automated-reports': 'Generate comprehensive reports from your strategic data',
    'onboarding-help': 'Tutorials, guides, and help resources to master StrategyOS',
    'data-import-export': 'Backup, migrate, or bulk-load strategic data',
    'api-webhooks': 'Integrate with external systems via REST API and webhooks',
    'project-integrations': 'Connect Jira, Asana, Monday.com and other PM tools',
    'erp-integration': 'Sync financial and operational data from ERP systems',
    'crm-integration': 'Import customer and revenue data from CRM platforms',
    'language-settings': 'Configure language, currency, and regional preferences',
    'rbac': 'Manage user roles, permissions, and access control',
    'audit-trail': 'Complete activity tracking and change history',
  }
  return descriptions[moduleId] || 'Manage your strategic initiatives'
}

export default App
