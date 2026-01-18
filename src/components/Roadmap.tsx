import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, Circle, Target, ChartBar, Link as LinkIcon, Package, Wrench, ChartLine } from '@phosphor-icons/react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface RoadmapPhase {
  id: string
  phase: string
  status: 'completed' | 'in-progress' | 'planned'
  quarter: string
  capabilities: RoadmapCapability[]
}

interface RoadmapCapability {
  title: string
  description: string
  category: 'strategy' | 'execution' | 'integration' | 'analytics'
  requirements: string[]
}

const roadmapData: RoadmapPhase[] = [
  {
    id: 'phase-1',
    phase: 'Foundation',
    status: 'in-progress',
    quarter: 'Q1 2025',
    capabilities: [
      {
        title: 'Strategy Cards Core',
        description: 'Enable structured strategy creation using proven frameworks',
        category: 'strategy',
        requirements: [
          'Support SWOT, Hoshin Kanri, OKR, and Value Disciplines frameworks',
          'Capture vision, goals, metrics, and assumptions',
          'Enable collaborative strategy formulation',
          'Reduce reliance on slides and spreadsheets'
        ]
      },
      {
        title: 'Workbench Foundations',
        description: 'Basic initiative tracking and execution capabilities',
        category: 'execution',
        requirements: [
          'Create and manage initiatives linked to strategy',
          'Track progress, status, and ownership',
          'Support priority and portfolio assignment',
          'Enable KPI definition and tracking'
        ]
      },
      {
        title: 'Portfolio Structure',
        description: 'Organize initiatives into strategic portfolios',
        category: 'execution',
        requirements: [
          'Support M&A, OpEx, Financial, ESG, and Innovation portfolios',
          'Enable custom portfolio definitions',
          'Track capacity and utilization per portfolio',
          'Visual portfolio grouping and filtering'
        ]
      }
    ]
  },
  {
    id: 'phase-2',
    phase: 'Alignment & Traceability',
    status: 'planned',
    quarter: 'Q2 2025',
    capabilities: [
      {
        title: 'Strategy-to-Execution Linking',
        description: 'End-to-end traceability from strategy to delivery',
        category: 'integration',
        requirements: [
          'Link initiatives directly to strategy card goals',
          'Visual impact mapping and alignment views',
          'Trace KPIs back to strategic objectives',
          'Identify alignment gaps and orphaned work'
        ]
      },
      {
        title: 'Dashboard & Reporting',
        description: 'Real-time visibility and executive reporting',
        category: 'analytics',
        requirements: [
          'Portfolio-level dashboards with drill-down',
          'Scorecard management with consistent definitions',
          'Real-time status and progress tracking',
          'Executive summary views'
        ]
      },
      {
        title: 'Governance & Accountability',
        description: 'Clear ownership and decision-making support',
        category: 'execution',
        requirements: [
          'Define and track initiative ownership',
          'Support portfolio-level prioritization',
          'Enable impact and capacity assessment',
          'Decision history and rationale capture'
        ]
      }
    ]
  },
  {
    id: 'phase-3',
    phase: 'Advanced Execution',
    status: 'planned',
    quarter: 'Q3 2025',
    capabilities: [
      {
        title: 'Multi-Methodology Support',
        description: 'Support diverse execution approaches',
        category: 'execution',
        requirements: [
          'Strategic Portfolio Management workflows',
          'Hoshin Kanri policy deployment',
          'Operational Excellence and Lean methods',
          'OKR cascading and alignment'
        ]
      },
      {
        title: 'Financial Integration',
        description: 'Link strategy to financial outcomes',
        category: 'analytics',
        requirements: [
          'Budget tracking and allocation by initiative',
          'Savings and value realization tracking',
          'ROI and financial impact analysis',
          'Shared visibility between Ops and Finance'
        ]
      },
      {
        title: 'Dependency & Risk Management',
        description: 'Identify and manage cross-initiative dependencies',
        category: 'execution',
        requirements: [
          'Map dependencies between initiatives',
          'Track delivery risks and blockers',
          'Impact analysis for changes',
          'Automated risk identification'
        ]
      }
    ]
  },
  {
    id: 'phase-4',
    phase: 'Enterprise Scale',
    status: 'planned',
    quarter: 'Q4 2025',
    capabilities: [
      {
        title: 'External Integrations',
        description: 'Connect with enterprise systems',
        category: 'integration',
        requirements: [
          'Project management tool integrations',
          'ERP system connectivity',
          'CRM data integration',
          'Automated data sync and reconciliation'
        ]
      },
      {
        title: 'Advanced Analytics',
        description: 'Predictive insights and recommendations',
        category: 'analytics',
        requirements: [
          'Capacity vs demand forecasting',
          'Predictive delivery risk scoring',
          'Resource optimization recommendations',
          'Trend analysis and pattern detection'
        ]
      },
      {
        title: 'Global Operations',
        description: 'Support for multi-region, multi-language organizations',
        category: 'integration',
        requirements: [
          'Multi-language support',
          'Regional customization and branding',
          'Organizational hierarchy modeling',
          'Distributed team collaboration'
        ]
      }
    ]
  }
]

const categoryIcons = {
  strategy: Target,
  execution: CheckCircle,
  integration: LinkIcon,
  analytics: ChartLine
}

const categoryColors = {
  strategy: 'bg-accent/10 text-accent border-accent/30',
  execution: 'bg-success/10 text-success border-success/30',
  integration: 'bg-primary/10 text-primary border-primary/30',
  analytics: 'bg-secondary/10 text-secondary border-secondary/30'
}

function PhaseTimeline() {
  return (
    <div className="relative">
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />
      <div className="space-y-8">
        {roadmapData.map((phase, index) => {
          const StatusIcon = phase.status === 'completed' ? CheckCircle : phase.status === 'in-progress' ? Circle : Circle
          const statusColor = phase.status === 'completed' ? 'text-success' : phase.status === 'in-progress' ? 'text-accent' : 'text-muted-foreground'
          const statusBg = phase.status === 'completed' ? 'bg-success' : phase.status === 'in-progress' ? 'bg-accent' : 'bg-muted'
          
          return (
            <div key={phase.id} className="relative pl-20">
              <div className={`absolute left-6 -translate-x-1/2 w-4 h-4 rounded-full ${statusBg} border-4 border-background`} />
              
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <StatusIcon size={24} weight={phase.status === 'completed' ? 'fill' : 'bold'} className={statusColor} />
                        <CardTitle className="text-xl">Phase {index + 1}: {phase.phase}</CardTitle>
                      </div>
                      <CardDescription className="flex items-center gap-3">
                        <Badge variant="outline" className="font-mono font-semibold">
                          {phase.quarter}
                        </Badge>
                        <Badge 
                          variant="secondary" 
                          className={
                            phase.status === 'completed' 
                              ? 'bg-success/10 text-success border-success/30' 
                              : phase.status === 'in-progress' 
                              ? 'bg-accent/10 text-accent border-accent/30' 
                              : 'bg-muted text-muted-foreground'
                          }
                        >
                          {phase.status === 'completed' ? 'Completed' : phase.status === 'in-progress' ? 'In Progress' : 'Planned'}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {phase.capabilities.map((capability, capIndex) => {
                    const Icon = categoryIcons[capability.category]
                    return (
                      <div key={capIndex} className="space-y-3">
                        {capIndex > 0 && <Separator />}
                        <div>
                          <div className="flex items-start gap-3 mb-2">
                            <Badge variant="outline" className={`${categoryColors[capability.category]} capitalize`}>
                              <Icon size={12} weight="bold" className="mr-1" />
                              {capability.category}
                            </Badge>
                            <div className="flex-1">
                              <h4 className="font-semibold text-base">{capability.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{capability.description}</p>
                            </div>
                          </div>
                          <ul className="ml-9 space-y-1.5">
                            {capability.requirements.map((req, reqIndex) => (
                              <li key={reqIndex} className="text-sm text-foreground flex items-start gap-2">
                                <span className="text-accent mt-0.5">•</span>
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CapabilityMatrix() {
  const categories = ['strategy', 'execution', 'integration', 'analytics'] as const
  
  const capabilitiesByCategory = categories.map(category => ({
    category,
    capabilities: roadmapData.flatMap(phase => 
      phase.capabilities
        .filter(cap => cap.category === category)
        .map(cap => ({
          ...cap,
          phase: phase.phase,
          quarter: phase.quarter,
          status: phase.status
        }))
    )
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {capabilitiesByCategory.map(({ category, capabilities }) => {
        const Icon = categoryIcons[category]
        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 capitalize">
                <Icon size={24} weight="bold" className="text-accent" />
                {category}
              </CardTitle>
              <CardDescription>
                {capabilities.length} {capabilities.length === 1 ? 'capability' : 'capabilities'} planned
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {capabilities.map((cap, index) => (
                    <div key={index} className="space-y-2">
                      {index > 0 && <Separator />}
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-semibold text-sm">{cap.title}</h4>
                          <Badge variant="outline" className="font-mono text-xs shrink-0">
                            {cap.quarter}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{cap.description}</p>
                        <div className="text-xs text-muted-foreground">
                          <span className="font-semibold">Phase:</span> {cap.phase}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default function Roadmap() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Product Roadmap</h2>
        <p className="text-muted-foreground mt-1">Strategic development plan for StrategyOS platform</p>
      </div>

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/50">
          <TabsTrigger value="timeline" className="gap-2 text-base font-semibold">
            <ChartBar size={18} weight="bold" />
            Timeline View
          </TabsTrigger>
          <TabsTrigger value="matrix" className="gap-2 text-base font-semibold">
            <Package size={18} weight="bold" />
            Capability Matrix
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-6">
          <PhaseTimeline />
        </TabsContent>

        <TabsContent value="matrix" className="mt-6">
          <CapabilityMatrix />
        </TabsContent>
      </Tabs>
    </div>
  )
}
