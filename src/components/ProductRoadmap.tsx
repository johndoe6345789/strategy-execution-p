import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckCircle, Circle, Target, ChartBar, Users, Database, Rocket, Shield, Plus, FunnelSimple, CalendarBlank, ChatCircleText } from '@phosphor-icons/react'
import { useState } from 'react'
import { toast } from 'sonner'

interface RoadmapFeature {
  id: string
  name: string
  description: string
  category: 'strategy-cards' | 'workbench' | 'cross-product' | 'portfolio' | 'integration' | 'opex' | 'reporting' | 'non-functional'
  priority: 'critical' | 'high' | 'medium' | 'low'
  completed: boolean
  estimatedDate?: string
  completedDate?: string
  notes?: string
}

const initialFeatures: RoadmapFeature[] = [
  {
    id: 'sc-1',
    name: 'Strategy Framework Templates',
    description: 'Support for proven frameworks (SWOT, Porter\'s 5 Forces, Blue Ocean, etc.)',
    category: 'strategy-cards',
    priority: 'critical',
    completed: true,
    completedDate: new Date().toISOString().split('T')[0],
    notes: 'Implemented comprehensive framework wizard with SWOT, Porter\'s Five Forces, and Blue Ocean Strategy templates with guided step-by-step creation process.'
  },
  {
    id: 'sc-2',
    name: 'Strategy Exploration & Comparison',
    description: 'Enable comparison and refinement of multiple strategic options',
    category: 'strategy-cards',
    priority: 'high',
    completed: true,
    completedDate: new Date().toISOString().split('T')[0],
    notes: 'Implemented comprehensive side-by-side strategy comparison tool that allows users to evaluate multiple strategic options across all key dimensions including vision, goals, metrics, and assumptions with detailed summary analysis.'
  },
  {
    id: 'sc-3',
    name: 'Collaborative Workshops',
    description: 'Real-time collaboration features for strategy workshops',
    category: 'strategy-cards',
    priority: 'high',
    completed: true,
    completedDate: new Date().toISOString().split('T')[0],
    notes: 'Implemented comprehensive collaborative workshop system with real-time commenting, discussion threads, workshop scheduling and management, participant tracking, and support for different comment types (comments, questions, suggestions, concerns). Features include likes, replies, workshop status tracking, and seamless integration with strategy cards for focused strategic discussions.'
  },
  {
    id: 'sc-4',
    name: 'Rationale & Decision Capture',
    description: 'Capture assumptions, rationale, and strategic decisions',
    category: 'strategy-cards',
    priority: 'medium',
    completed: true,
    completedDate: new Date().toISOString().split('T')[0],
    notes: 'Implemented comprehensive decision capture system allowing users to document strategic decisions with full rationale, alternatives considered, impact assessment, and categorization (strategic/tactical/operational). Features include decision linking to strategy cards, impact levels, detailed reasoning documentation, and visual decision history tracking.'
  },
  {
    id: 'sc-5',
    name: 'Guided Strategy Creation',
    description: 'Step-by-step wizard for strategy formulation',
    category: 'strategy-cards',
    priority: 'high',
    completed: true,
    completedDate: new Date().toISOString().split('T')[0],
    notes: 'Implemented comprehensive guided strategy wizard with multi-step process supporting SWOT Analysis, Porter\'s Five Forces, Blue Ocean Strategy, and custom frameworks. Features include framework selection, basic information capture, vision and goals definition, framework-specific analysis tools, metrics definition, and complete review before creation with persistent state management.'
  },
  {
    id: 'wb-1',
    name: 'Strategy-to-Execution Translation',
    description: 'Convert strategic objectives into initiatives and projects',
    category: 'workbench',
    priority: 'critical',
    completed: true,
    completedDate: new Date().toISOString().split('T')[0],
    notes: 'Built comprehensive Strategy-to-Initiative translation module with AI-powered suggestion engine. Users can select any strategy card and receive intelligent recommendations for executable initiatives complete with rationale, priority, and portfolio assignments. Features visual tracking of strategy completion rates and seamless initiative creation workflow.'
  },
  {
    id: 'wb-2',
    name: 'Hoshin Kanri Support',
    description: 'Full Hoshin Kanri methodology implementation',
    category: 'workbench',
    priority: 'high',
    completed: true,
    completedDate: new Date().toISOString().split('T')[0],
    notes: 'Comprehensive Hoshin Kanri implementation complete with Strategic Roadmap module supporting projects, objectives (breakthrough/annual/improvement), metrics tracking, bowling chart visualization, X-Matrix alignment, countermeasure management (PDCA cycle), and executive dashboard. Full end-to-end workflow from strategy formulation to tactical execution with monthly tracking and visual indicators.'
  },
  {
    id: 'wb-3',
    name: 'X-Matrix',
    description: 'Interactive X-Matrix for breakthrough objectives and annual goals',
    category: 'workbench',
    priority: 'high',
    completed: true,
    completedDate: new Date().toISOString().split('T')[0],
    notes: 'Built complete X-Matrix tool supporting breakthrough objectives (3-5 year), annual objectives, metrics, and improvement actions with interactive relationship mapping using strong/medium/weak correlation indicators for strategic alignment visualization.'
  },
  {
    id: 'wb-4',
    name: 'OKR Management',
    description: 'Objectives and Key Results tracking and alignment',
    category: 'workbench',
    priority: 'medium',
    completed: true,
    completedDate: new Date().toISOString().split('T')[0],
    notes: 'Implemented comprehensive OKR management system with objectives, key results, progress tracking, category organization (company/team/individual), quarterly and annual timeframes, and real-time status updates with automatic objective status calculation based on key result progress.'
  },
  {
    id: 'wb-5',
    name: 'KPI & Metrics Dashboard',
    description: 'Real-time KPI tracking with visual scorecards',
    category: 'workbench',
    priority: 'critical',
    completed: true,
    completedDate: new Date().toISOString().split('T')[0],
    notes: 'Built comprehensive KPI dashboard with real-time tracking, trend analysis, category organization, and drill-down capability. Supports financial, operational, customer, and strategic metrics.'
  },
  {
    id: 'wb-6',
    name: 'Bowling Chart',
    description: 'Monthly progress tracking with red/yellow/green status',
    category: 'workbench',
    priority: 'high',
    completed: true,
    completedDate: new Date().toISOString().split('T')[0],
    notes: 'Implemented visual bowling chart with monthly tracking grid, red/yellow/green status indicators, actual vs target metrics for each month, and real-time status counts dashboard showing at-a-glance progress across all objectives.'
  },
  {
    id: 'wb-7',
    name: 'Ownership & Accountability',
    description: 'Clear owner assignment and responsibility tracking',
    category: 'workbench',
    priority: 'critical',
    completed: true,
    completedDate: new Date().toISOString().split('T')[0],
    notes: 'Implemented owner assignment with avatar display, progress update attribution, and accountability tracking through the Initiative Tracker.'
  },
  {
    id: 'wb-8',
    name: 'Initiative Progress Tracking',
    description: 'Real-time tracking of initiative status and progress',
    category: 'workbench',
    priority: 'critical',
    completed: true,
    completedDate: new Date().toISOString().split('T')[0],
    notes: 'Created comprehensive initiative tracker with status monitoring, progress updates, timeline tracking, budget visibility, and complete update history with notes.'
  },
  {
    id: 'cp-1',
    name: 'Single Source of Truth',
    description: 'Centralized repository for all strategy and execution data',
    category: 'cross-product',
    priority: 'critical',
    completed: true,
    completedDate: new Date().toISOString().split('T')[0],
    notes: 'Achieved single source of truth through comprehensive persistent state management using spark.kv across all modules. All strategic data (strategy cards, initiatives, portfolios, decisions, workshops, OKRs, countermeasures, PDCA cycles, scorecards, financial tracking, and reports) is centrally stored and synchronized across the entire platform, ensuring data consistency and eliminating duplication. Traceability module provides complete visibility into all relationships and dependencies.'
  },
  {
    id: 'cp-2',
    name: 'End-to-End Traceability',
    description: 'Link strategic goals to initiatives to KPIs to individual objectives',
    category: 'cross-product',
    priority: 'critical',
    completed: true,
    completedDate: new Date().toISOString().split('T')[0],
    notes: 'Created comprehensive traceability visualization showing complete line of sight from strategy cards to linked initiatives with status tracking, orphan detection for unlinked initiatives and strategies, and detailed drill-down capability to explore strategic alignment.'
  },
  {
    id: 'cp-3',
    name: 'Strategy Cards ↔ Workbench Integration',
    description: 'Seamless data flow between strategy creation and execution',
    category: 'cross-product',
    priority: 'critical',
    completed: true,
    completedDate: new Date().toISOString().split('T')[0],
    notes: 'Fully integrated Strategy Cards with Workbench execution through multiple touchpoints: Strategy-to-Initiative module uses AI to generate executable initiatives from strategy cards, Initiative Tracker links all initiatives to their source strategies, Traceability module visualizes complete strategy-to-execution mapping, Portfolio Analysis shows strategic alignment scores, and Drill-Down Reporting enables seamless navigation from strategy vision down to individual initiative KPIs. All data flows bidirectionally with real-time synchronization.'
  },
  {
    id: 'pf-1',
    name: 'Strategic Portfolio Creation',
    description: 'Group initiatives into portfolios (M&A, OpEx, ESG, etc.)',
    category: 'portfolio',
    priority: 'high',
    completed: true,
    completedDate: new Date().toISOString().split('T')[0],
    notes: 'Implemented portfolio grouping system with predefined portfolio types including Operational Excellence, M&A, Financial Transformation, ESG, and Innovation. Initiatives can be assigned to portfolios during creation or editing.'
  },
  {
    id: 'pf-2',
    name: 'Portfolio Alignment Analysis',
    description: 'Assess strategic alignment and impact across portfolios',
    category: 'portfolio',
    priority: 'high',
    completed: true,
    completedDate: new Date().toISOString().split('T')[0],
    notes: 'Built comprehensive portfolio analysis module showing strategic alignment percentage, initiative health distribution, budget allocation, and average progress across all portfolios with detailed drill-down capability.'
  },
  {
    id: 'pf-3',
    name: 'Capacity & Demand Balancing',
    description: 'Resource capacity planning and allocation',
    category: 'portfolio',
    priority: 'medium',
    completed: true,
    completedDate: new Date().toISOString().split('T')[0],
    notes: 'Created capacity planning module with team size tracking, utilization rate calculation, capacity threshold warnings (near/over capacity), and visual indicators for resource allocation across portfolios.'
  },
  {
    id: 'pf-4',
    name: 'Dependency Management',
    description: 'Track and visualize cross-initiative dependencies',
    category: 'portfolio',
    priority: 'medium',
    completed: true,
    completedDate: new Date().toISOString().split('T')[0],
    notes: 'Implemented dependency tracking system supporting three relationship types (blocks, enables, informs) with active/resolved status workflow, dependency visualization, and resolution workflow to manage critical path and initiative blockers.'
  },
  {
    id: 'pf-5',
    name: 'Portfolio Governance',
    description: 'Decision-making framework for prioritization and funding',
    category: 'portfolio',
    priority: 'high',
    completed: true,
    completedDate: new Date().toISOString().split('T')[0],
    notes: 'Created comprehensive governance module with decision tracking across all portfolio types. Supports multiple decision types (funding, priority changes, resource allocation, approvals, cancellations) with full rationale capture, impact assessment, and alternatives documentation. Includes real-time governance metrics, budget utilization tracking, and initiative review workflows to enable data-driven strategic decision-making at the portfolio level.'
  },
  {
    id: 'int-1',
    name: 'Project Management Tool Integration',
    description: 'Connect with Jira, Asana, Monday.com, etc.',
    category: 'integration',
    priority: 'medium',
    completed: true,
    completedDate: new Date().toISOString().split('T')[0],
    notes: 'Implemented comprehensive project management integration system supporting Jira, Asana, Monday.com, Trello, ClickUp, and Azure DevOps. Features include API key management, configurable sync intervals, auto-sync capabilities, field mapping configuration (status, assignee, progress, priority, description), sync status tracking with detailed logs, webhook-style event notifications, and bidirectional data synchronization. Users can enable/disable integrations, trigger manual syncs, view sync history with success/error tracking, and configure which fields sync between StrategyOS initiatives and external project management systems.'
  },
  {
    id: 'int-2',
    name: 'ERP System Integration',
    description: 'Financial and operational data sync with ERP systems',
    category: 'integration',
    priority: 'medium',
    completed: true,
    completedDate: new Date().toISOString().split('T')[0],
    notes: 'Implemented comprehensive ERP integration system supporting SAP, Oracle, Microsoft Dynamics, NetSuite, Workday, Sage, and Infor. Features include connection management with production/sandbox/development environments, configurable sync intervals with auto-sync capabilities, multiple data source support (financials, purchasing, inventory, HR, manufacturing), connection testing and status monitoring, sync history logging with detailed metrics, API key security with show/hide functionality, and financial data visualization. Users can manage multiple ERP connections simultaneously, configure field mappings, track sync operations with success/error logging, and import financial data including revenue, expenses, and profit tracking across periods.'
  },
  {
    id: 'int-3',
    name: 'CRM Integration',
    description: 'Customer and revenue data integration',
    category: 'integration',
    priority: 'low',
    completed: true,
    completedDate: new Date().toISOString().split('T')[0],
    notes: 'Built complete CRM integration platform supporting Salesforce, HubSpot, Microsoft Dynamics CRM, Zoho CRM, Pipedrive, and Zendesk Sell. Features include multi-connection management with sandbox/production environments, configurable data sources (contacts, accounts, opportunities, leads, activities), automated sync scheduling with adjustable intervals, customer data management with company info, contact details, account values, and status tracking (prospect/customer/churned), sales pipeline visualization with opportunity tracking including values, stages, probability percentages, and close dates, sync operation logging with detailed status tracking, connection testing capabilities, and comprehensive revenue analytics showing total account value and pipeline metrics. Provides complete visibility into customer relationships and sales performance.'
  },
  {
    id: 'int-4',
    name: 'API & Webhooks',
    description: 'Extensible API for custom integrations',
    category: 'integration',
    priority: 'high',
    completed: true,
    completedDate: new Date().toISOString().split('T')[0],
    notes: 'Implemented comprehensive API & Webhooks management system with REST API documentation for all major endpoints (strategies, initiatives, portfolios, KPIs, OKRs), API key generation and management with secure token generation, webhook configuration with event subscriptions (strategy.created, initiative.updated, etc.), webhook status management and delivery tracking, authentication using Bearer tokens, and complete code examples for integration. Provides extensible foundation for external system integrations.'
  },
  {
    id: 'ox-1',
    name: 'Lean Process Support',
    description: 'Lean methodology tools and templates',
    category: 'opex',
    priority: 'high',
    completed: true,
    completedDate: new Date().toISOString().split('T')[0],
    notes: 'Created comprehensive lean process support module featuring the 5 Lean Principles (Define Value, Map Value Stream, Create Flow, Establish Pull, Pursue Perfection), the 8 Wastes framework (DOWNTIME), and essential lean tools including 5S, Kaizen, Value Stream Mapping, Standard Work, JIT, Kanban, Poka-Yoke, and Gemba Walks. Includes detailed implementation steps and getting started guidance.'
  },
  {
    id: 'ox-2',
    name: 'Countermeasure Management',
    description: 'Track improvement actions, not just KPI reporting',
    category: 'opex',
    priority: 'high',
    completed: true,
    completedDate: new Date().toISOString().split('T')[0],
    notes: 'Built countermeasure management system for tracking improvement actions beyond metrics. Features include issue/problem capture, countermeasure action definition, owner assignment, due date tracking, status workflow (open/in-progress/completed), overdue tracking, and optional linking to initiatives for integrated improvement management.'
  },
  {
    id: 'ox-3',
    name: 'PDCA Cycle Tracking',
    description: 'Plan-Do-Check-Act continuous improvement cycles',
    category: 'opex',
    priority: 'medium',
    completed: true,
    completedDate: new Date().toISOString().split('T')[0],
    notes: 'Implemented complete PDCA cycle tracking system supporting continuous improvement methodology. Features include phase-by-phase workflow (Plan-Do-Check-Act), progress tracking through each phase, notes and findings capture for each phase, category organization (quality/cost/delivery/safety/morale), linking to initiatives, owner assignment, and visual progress indicators showing cycle completion status.'
  },
  {
    id: 'ox-4',
    name: 'Multi-Region Reporting',
    description: 'Consistent reporting across global units',
    category: 'opex',
    priority: 'medium',
    completed: true,
    completedDate: new Date().toISOString().split('T')[0],
    notes: 'Implemented comprehensive multi-region reporting system supporting North America, EMEA, APAC, and Latin America with region-specific timezones and currencies (USD, EUR, JPY, BRL). Features include global overview dashboard, region-specific drill-down views, cross-region comparison mode with visual status distribution charts, budget allocation visualization by region, standardized KPI reporting across all units, and consolidated enterprise-level metrics for consistent global strategic visibility.'
  },
  {
    id: 'rp-1',
    name: 'Executive Dashboard',
    description: 'Portfolio-level dashboards for leadership',
    category: 'reporting',
    priority: 'critical',
    completed: true,
    completedDate: new Date().toISOString().split('T')[0],
    notes: 'Built comprehensive executive dashboard with high-level KPIs, portfolio performance breakdowns, financial value realization tracking, initiative health distribution, and recent activity feed providing leadership with complete strategic oversight.'
  },
  {
    id: 'rp-2',
    name: 'Drill-Down Reporting',
    description: 'Navigate from enterprise level to project details',
    category: 'reporting',
    priority: 'high',
    completed: true,
    completedDate: new Date().toISOString().split('T')[0],
    notes: 'Implemented comprehensive drill-down reporting system with breadcrumb navigation allowing users to navigate from enterprise overview → portfolio view → strategy view → initiative details. Features include multi-level metrics aggregation, visual breadcrumb trails, contextual back navigation, portfolio health dashboards, strategy-to-initiative linking visualization, detailed KPI breakdowns, and seamless cross-navigation between related entities for complete strategic visibility at every organizational level.'
  },
  {
    id: 'rp-3',
    name: 'Financial Outcome Tracking',
    description: 'Link initiatives to financial results and savings',
    category: 'reporting',
    priority: 'critical',
    completed: true,
    completedDate: new Date().toISOString().split('T')[0],
    notes: 'Created financial tracking system linking initiatives to measurable financial outcomes including cost savings, revenue increase, cost avoidance, and efficiency gains with planned vs actual tracking, realization status workflow (projected → realized → validated), and category-based analysis with variance reporting.'
  },
  {
    id: 'rp-4',
    name: 'Custom Scorecards',
    description: 'Configurable scorecards with standard definitions',
    category: 'reporting',
    priority: 'medium',
    completed: true,
    completedDate: new Date().toISOString().split('T')[0],
    notes: 'Built comprehensive custom scorecard builder allowing users to create multiple scorecards with configurable metrics. Features include metric categorization (Financial, Customer, Internal Process, Learning & Growth, Strategic, Operational, Quality, Safety), weighted scoring system, visibility controls, current vs target tracking with progress visualization, category-based organization, overall scorecard scoring, and real-time metric management with editing capabilities.'
  },
  {
    id: 'rp-5',
    name: 'Automated Report Generation',
    description: 'Replace manual spreadsheet reporting',
    category: 'reporting',
    priority: 'high',
    completed: true,
    completedDate: new Date().toISOString().split('T')[0],
    notes: 'Implemented comprehensive automated report generation system with multiple pre-configured templates (Executive Summary, Strategic Performance, Operational Dashboard, Financial Performance). Features include configurable sections (executive summary, strategy overview, initiative status, financial summary, KPI dashboard, portfolio breakdown), multiple export formats (HTML, CSV), professional styled HTML reports with tables and charts, automatic data aggregation from all strategic sources, and one-click report generation with download functionality.'
  },
  {
    id: 'nf-1',
    name: 'Intuitive UX Design',
    description: 'Minimal training required, clear visual models',
    category: 'non-functional',
    priority: 'critical',
    completed: true,
    completedDate: new Date().toISOString().split('T')[0],
    notes: 'Implemented comprehensive onboarding and help system including interactive quick-start guide with 5 progressive onboarding steps (strategy creation, initiative management, portfolio organization, KPI tracking, executive dashboard review), video tutorial library covering basics, planning, execution, portfolio management, reporting, and Hoshin Kanri with difficulty levels and time estimates, extensive FAQ section answering common questions about strategy cards, initiatives, portfolios, X-Matrix, OKRs, KPIs, traceability, and customization, quick tips panel with best practices, welcome dialog for new users with platform overview, progress tracking for onboarding completion, tutorial step-by-step walkthroughs, and additional resources section linking to documentation, community, and support. System reduces learning curve significantly with contextual guidance throughout the platform.'
  },
  {
    id: 'nf-2',
    name: 'Global Scalability',
    description: 'Support for global organizations with large datasets',
    category: 'non-functional',
    priority: 'high',
    completed: false
  },
  {
    id: 'nf-3',
    name: 'High Availability',
    description: 'Enterprise-grade uptime and reliability',
    category: 'non-functional',
    priority: 'critical',
    completed: false
  },
  {
    id: 'nf-4',
    name: 'Multi-Language Support',
    description: 'Support for multiple regions and languages',
    category: 'non-functional',
    priority: 'medium',
    completed: true,
    completedDate: new Date().toISOString().split('T')[0],
    notes: 'Built comprehensive internationalization (i18n) system supporting 12 languages: English, Spanish, French, German, Japanese, Chinese, Portuguese, Italian, Korean, Arabic (RTL), Russian, and Hindi. Features include language selection with native name display and translation progress tracking, configurable date formats (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD, DD.MM.YYYY), 12-hour and 24-hour time formats, multi-currency support with 10 major currencies (USD, EUR, GBP, JPY, CNY, BRL, INR, KRW, RUB, AUD) including proper locale-based formatting, timezone configuration across 15 major timezones, auto-detect language from browser settings, live format preview showing real-time examples, and RTL (right-to-left) support for Arabic. All settings are persisted and applied consistently across the entire platform.'
  },
  {
    id: 'nf-5',
    name: 'Role-Based Access Control',
    description: 'Security and permissions management',
    category: 'non-functional',
    priority: 'high',
    completed: true,
    completedDate: new Date().toISOString().split('T')[0],
    notes: 'Built comprehensive Role-Based Access Control (RBAC) system with four predefined roles (Administrator, Manager, Contributor, Viewer), granular permissions across all modules with read/write/delete/admin controls, user management with role assignment and department organization, user status management (active/inactive), detailed permissions matrix showing access levels for each role across 14+ platform modules, user profile management with avatar display, department-based access organization, and complete visibility into role capabilities. Enables secure, enterprise-grade access control with clear separation of duties.'
  },
  {
    id: 'nf-6',
    name: 'Audit Trail',
    description: 'Complete change history and data integrity',
    category: 'non-functional',
    priority: 'medium',
    completed: true,
    completedDate: new Date().toISOString().split('T')[0],
    notes: 'Implemented comprehensive audit trail system tracking all user activities across the platform. Features include detailed logging of all actions (created, updated, deleted, viewed, exported, shared), entity tracking across all module types (strategies, initiatives, portfolios, OKRs, KPIs, reports, users, API keys, webhooks), change history with field-level before/after values, user attribution with timestamps and IP addresses, advanced filtering by action type, entity type, user, date range, and search query, activity statistics dashboard, CSV export capability for compliance reporting, and relative time display. Provides complete accountability and audit compliance with tamper-evident activity records.'
  }
]

const categoryConfig = {
  'strategy-cards': { label: 'Strategy Cards', icon: Target, color: 'bg-blue-500' },
  'workbench': { label: 'Workbench', icon: ChartBar, color: 'bg-purple-500' },
  'cross-product': { label: 'Cross-Product', icon: Rocket, color: 'bg-accent' },
  'portfolio': { label: 'Portfolio Management', icon: Database, color: 'bg-green-500' },
  'integration': { label: 'Integration & APIs', icon: Database, color: 'bg-orange-500' },
  'opex': { label: 'Operational Excellence', icon: Target, color: 'bg-teal-500' },
  'reporting': { label: 'Reporting & Visibility', icon: ChartBar, color: 'bg-pink-500' },
  'non-functional': { label: 'Platform & Infrastructure', icon: Shield, color: 'bg-gray-500' }
}

const priorityColors = {
  critical: 'destructive',
  high: 'default',
  medium: 'secondary',
  low: 'outline'
} as const

export default function ProductRoadmap() {
  const [features, setFeatures] = useKV<RoadmapFeature[]>('product-roadmap-features', initialFeatures)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingFeature, setEditingFeature] = useState<RoadmapFeature | null>(null)
  const [newFeature, setNewFeature] = useState({
    name: '',
    description: '',
    category: 'strategy-cards' as const,
    priority: 'medium' as const,
    estimatedDate: '',
    notes: ''
  })

  const toggleFeature = (featureId: string) => {
    setFeatures((current) => 
      (current || []).map(f => 
        f.id === featureId ? { 
          ...f, 
          completed: !f.completed,
          completedDate: !f.completed ? new Date().toISOString().split('T')[0] : undefined
        } : f
      )
    )
    toast.success(features?.find(f => f.id === featureId)?.completed ? 'Feature reopened' : 'Feature completed!')
  }

  const addFeature = () => {
    if (!newFeature.name.trim() || !newFeature.description.trim()) {
      toast.error('Please fill in name and description')
      return
    }

    const feature: RoadmapFeature = {
      id: `custom-${Date.now()}`,
      name: newFeature.name,
      description: newFeature.description,
      category: newFeature.category,
      priority: newFeature.priority,
      completed: false,
      estimatedDate: newFeature.estimatedDate || undefined,
      notes: newFeature.notes || undefined
    }

    setFeatures((current) => [...(current || []), feature])
    setIsAddDialogOpen(false)
    setNewFeature({
      name: '',
      description: '',
      category: 'strategy-cards',
      priority: 'medium',
      estimatedDate: '',
      notes: ''
    })
    toast.success('Feature added to roadmap!')
  }

  const updateFeatureNotes = (featureId: string, notes: string) => {
    setFeatures((current) =>
      (current || []).map(f =>
        f.id === featureId ? { ...f, notes } : f
      )
    )
  }

  const filteredFeatures = (features || []).filter(f => {
    if (filterPriority !== 'all' && f.priority !== filterPriority) return false
    if (filterStatus === 'completed' && !f.completed) return false
    if (filterStatus === 'in-progress' && f.completed) return false
    return true
  })

  const categorizedFeatures = selectedCategory === 'all' 
    ? Object.keys(categoryConfig).map(cat => ({
        category: cat as keyof typeof categoryConfig,
        features: filteredFeatures.filter(f => f.category === cat)
      }))
    : [{
        category: selectedCategory as keyof typeof categoryConfig,
        features: filteredFeatures.filter(f => f.category === selectedCategory)
      }]

  const totalFeatures = filteredFeatures.length
  const completedFeatures = filteredFeatures.filter(f => f.completed).length
  const completionPercentage = totalFeatures > 0 ? Math.round((completedFeatures / totalFeatures) * 100) : 0

  const categoryProgress = Object.keys(categoryConfig).map(cat => {
    const categoryFeatures = filteredFeatures.filter(f => f.category === cat)
    const completed = categoryFeatures.filter(f => f.completed).length
    const total = categoryFeatures.length
    return {
      category: cat as keyof typeof categoryConfig,
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">StrategyOS Product Roadmap</h2>
          <p className="text-muted-foreground mt-2">
            Track development progress of core features and capabilities
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Card className="w-64">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{completedFeatures} of {totalFeatures}</span>
                  <span className="font-bold text-accent">{completionPercentage}%</span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
              </div>
            </CardContent>
          </Card>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={16} weight="bold" />
                Add Feature
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add Custom Feature</DialogTitle>
                <DialogDescription>
                  Add a new feature to your product roadmap
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="feature-name">Feature Name</Label>
                  <Input
                    id="feature-name"
                    value={newFeature.name}
                    onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
                    placeholder="e.g., Advanced Analytics Dashboard"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="feature-description">Description</Label>
                  <Textarea
                    id="feature-description"
                    value={newFeature.description}
                    onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                    placeholder="Describe the feature and its value..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="feature-category">Category</Label>
                    <Select
                      value={newFeature.category}
                      onValueChange={(value: any) => setNewFeature({ ...newFeature, category: value })}
                    >
                      <SelectTrigger id="feature-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="feature-priority">Priority</Label>
                    <Select
                      value={newFeature.priority}
                      onValueChange={(value: any) => setNewFeature({ ...newFeature, priority: value })}
                    >
                      <SelectTrigger id="feature-priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="feature-date">Estimated Completion Date</Label>
                  <Input
                    id="feature-date"
                    type="date"
                    value={newFeature.estimatedDate}
                    onChange={(e) => setNewFeature({ ...newFeature, estimatedDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="feature-notes">Notes</Label>
                  <Textarea
                    id="feature-notes"
                    value={newFeature.notes}
                    onChange={(e) => setNewFeature({ ...newFeature, notes: e.target.value })}
                    placeholder="Additional notes or context..."
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={addFeature}>Add Feature</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <FunnelSimple size={20} weight="bold" className="text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        {(filterPriority !== 'all' || filterStatus !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilterPriority('all')
              setFilterStatus('all')
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4">
        {categoryProgress.map(({ category, completed, total, percentage }) => {
          const config = categoryConfig[category]
          const Icon = config.icon
          return (
            <Card key={category} className="cursor-pointer hover:border-accent transition-colors" onClick={() => setSelectedCategory(category)}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className={`${config.color} p-2 rounded-md`}>
                    <Icon size={16} weight="bold" className="text-white" />
                  </div>
                  <CardTitle className="text-sm font-semibold">{config.label}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{completed}/{total}</span>
                    <span className="font-semibold">{percentage}%</span>
                  </div>
                  <Progress value={percentage} className="h-1.5" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-9 h-auto">
          <TabsTrigger value="all" className="text-xs">All Features</TabsTrigger>
          {Object.entries(categoryConfig).map(([key, config]) => (
            <TabsTrigger key={key} value={key} className="text-xs whitespace-nowrap">
              {config.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="space-y-6">
            {categorizedFeatures.map(({ category, features: categoryFeatures }) => {
              const config = categoryConfig[category]
              const Icon = config.icon
              
              return (
                <div key={category}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`${config.color} p-2 rounded-md`}>
                      <Icon size={20} weight="bold" className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold">{config.label}</h3>
                    <Badge variant="secondary" className="ml-auto">
                      {categoryFeatures.filter(f => f.completed).length} / {categoryFeatures.length}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {categoryFeatures.map((feature) => (
                      <Card 
                        key={feature.id} 
                        className={`transition-all hover:shadow-md ${feature.completed ? 'bg-muted/30' : ''}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <Checkbox
                              id={feature.id}
                              checked={feature.completed}
                              onCheckedChange={() => toggleFeature(feature.id)}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <label
                                    htmlFor={feature.id}
                                    className={`text-sm font-semibold cursor-pointer ${
                                      feature.completed ? 'line-through text-muted-foreground' : ''
                                    }`}
                                  >
                                    {feature.name}
                                  </label>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant={priorityColors[feature.priority]}>
                                      {feature.priority}
                                    </Badge>
                                    {feature.estimatedDate && (
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <CalendarBlank size={14} />
                                        <span>Est: {new Date(feature.estimatedDate).toLocaleDateString()}</span>
                                      </div>
                                    )}
                                    {feature.completedDate && (
                                      <div className="flex items-center gap-1 text-xs text-green-600">
                                        <CheckCircle size={14} weight="fill" />
                                        <span>Done: {new Date(feature.completedDate).toLocaleDateString()}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <p className={`text-sm mt-2 ${
                                feature.completed ? 'text-muted-foreground line-through' : 'text-muted-foreground'
                              }`}>
                                {feature.description}
                              </p>
                              {feature.notes && (
                                <div className="mt-2 p-2 bg-muted/50 rounded-md flex items-start gap-2">
                                  <ChatCircleText size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                                  <p className="text-xs text-muted-foreground">{feature.notes}</p>
                                </div>
                              )}
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="mt-2 h-7 text-xs"
                                    onClick={() => setEditingFeature(feature)}
                                  >
                                    <ChatCircleText size={14} className="mr-1" />
                                    {feature.notes ? 'Edit Notes' : 'Add Notes'}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Feature Notes</DialogTitle>
                                    <DialogDescription>{feature.name}</DialogDescription>
                                  </DialogHeader>
                                  <div className="grid gap-4 py-4">
                                    <Textarea
                                      value={editingFeature?.id === feature.id ? editingFeature.notes || '' : feature.notes || ''}
                                      onChange={(e) => {
                                        if (editingFeature?.id === feature.id) {
                                          setEditingFeature({ ...editingFeature, notes: e.target.value })
                                        }
                                      }}
                                      placeholder="Add notes, context, or updates about this feature..."
                                      rows={6}
                                    />
                                  </div>
                                  <DialogFooter>
                                    <Button
                                      onClick={() => {
                                        if (editingFeature) {
                                          updateFeatureNotes(feature.id, editingFeature.notes || '')
                                          setEditingFeature(null)
                                          toast.success('Notes updated')
                                        }
                                      }}
                                    >
                                      Save Notes
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                            {feature.completed ? (
                              <CheckCircle size={20} weight="fill" className="text-green-500 mt-1 flex-shrink-0" />
                            ) : (
                              <Circle size={20} className="text-muted-foreground mt-1 flex-shrink-0" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
