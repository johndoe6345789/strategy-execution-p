import { useKV } from '@github/spark/hooks'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FilePdf, FileText, FileCsv, Download, Calendar, TrendUp, Rocket, CheckCircle, CurrencyDollar, Target } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Initiative, StrategyCard } from '@/types'

interface ReportTemplate {
  id: string
  name: string
  description: string
  sections: ReportSection[]
}

interface ReportSection {
  id: string
  name: string
  type: 'executive-summary' | 'strategy-overview' | 'initiative-status' | 'financial-summary' | 'kpi-dashboard' | 'portfolio-breakdown'
  enabled: boolean
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'executive',
    name: 'Executive Summary',
    description: 'High-level overview for leadership',
    sections: [
      { id: 'exec-1', name: 'Executive Summary', type: 'executive-summary', enabled: true },
      { id: 'exec-2', name: 'Key Initiatives', type: 'initiative-status', enabled: true },
      { id: 'exec-3', name: 'Financial Overview', type: 'financial-summary', enabled: true }
    ]
  },
  {
    id: 'strategic',
    name: 'Strategic Performance Report',
    description: 'Comprehensive strategy and execution review',
    sections: [
      { id: 'strat-1', name: 'Strategy Overview', type: 'strategy-overview', enabled: true },
      { id: 'strat-2', name: 'Initiative Status', type: 'initiative-status', enabled: true },
      { id: 'strat-3', name: 'KPI Dashboard', type: 'kpi-dashboard', enabled: true },
      { id: 'strat-4', name: 'Portfolio Breakdown', type: 'portfolio-breakdown', enabled: true }
    ]
  },
  {
    id: 'operational',
    name: 'Operational Dashboard',
    description: 'Detailed operational metrics and progress',
    sections: [
      { id: 'ops-1', name: 'Initiative Status', type: 'initiative-status', enabled: true },
      { id: 'ops-2', name: 'KPI Dashboard', type: 'kpi-dashboard', enabled: true },
      { id: 'ops-3', name: 'Portfolio Breakdown', type: 'portfolio-breakdown', enabled: true }
    ]
  },
  {
    id: 'financial',
    name: 'Financial Performance Report',
    description: 'Budget, spending, and financial outcomes',
    sections: [
      { id: 'fin-1', name: 'Financial Summary', type: 'financial-summary', enabled: true },
      { id: 'fin-2', name: 'Portfolio Breakdown', type: 'portfolio-breakdown', enabled: true },
      { id: 'fin-3', name: 'Initiative Status', type: 'initiative-status', enabled: true }
    ]
  }
]

export default function AutomatedReportGeneration() {
  const [strategyCards] = useKV<StrategyCard[]>('strategy-cards', [])
  const [initiatives] = useKV<Initiative[]>('initiatives', [])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('executive')
  const [customSections, setCustomSections] = useState<ReportSection[]>([])
  const [reportFormat, setReportFormat] = useState<'pdf' | 'html' | 'csv'>('html')
  const [isGenerating, setIsGenerating] = useState(false)

  const generateReport = async () => {
    setIsGenerating(true)
    
    const template = reportTemplates.find(t => t.id === selectedTemplate)
    if (!template) {
      toast.error('Please select a report template')
      setIsGenerating(false)
      return
    }

    await new Promise(resolve => setTimeout(resolve, 1500))

    const reportContent = buildReportContent(template)
    
    if (reportFormat === 'html') {
      downloadHTMLReport(reportContent, template.name)
    } else if (reportFormat === 'csv') {
      downloadCSVReport(template.name)
    } else {
      toast.info('PDF generation would require a PDF library (not included in this demo)')
    }

    setIsGenerating(false)
    toast.success(`${template.name} generated successfully!`)
  }

  const buildReportContent = (template: ReportTemplate): string => {
    const enabledSections = template.sections.filter(s => s.enabled)
    
    let html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${template.name} - ${new Date().toLocaleDateString()}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #1a1a1a; background: #fff; padding: 40px; max-width: 1200px; margin: 0 auto; }
          h1 { font-family: 'Outfit', sans-serif; font-size: 32px; font-weight: 700; margin-bottom: 8px; color: #1a1a1a; }
          h2 { font-family: 'Outfit', sans-serif; font-size: 24px; font-weight: 600; margin: 32px 0 16px; color: #1a1a1a; padding-bottom: 8px; border-bottom: 2px solid #e5e5e5; }
          h3 { font-family: 'Outfit', sans-serif; font-size: 18px; font-weight: 600; margin: 24px 0 12px; color: #1a1a1a; }
          .header { margin-bottom: 40px; padding-bottom: 24px; border-bottom: 3px solid #e5e5e5; }
          .meta { font-size: 14px; color: #666; margin-top: 8px; }
          .section { margin-bottom: 40px; }
          .card { background: #fafafa; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin-bottom: 16px; }
          .card-title { font-weight: 600; font-size: 16px; margin-bottom: 8px; }
          .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin: 20px 0; }
          .stat { background: #fff; border: 1px solid #e5e5e5; border-radius: 6px; padding: 16px; }
          .stat-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
          .stat-value { font-size: 28px; font-weight: 700; color: #1a1a1a; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 500; margin-right: 8px; }
          .badge-success { background: #d4edda; color: #155724; }
          .badge-warning { background: #fff3cd; color: #856404; }
          .badge-danger { background: #f8d7da; color: #721c24; }
          .badge-info { background: #d1ecf1; color: #0c5460; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          th { background: #f5f5f5; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e5e5; }
          td { padding: 12px; border-bottom: 1px solid #e5e5e5; }
          tr:last-child td { border-bottom: none; }
          .footer { margin-top: 60px; padding-top: 24px; border-top: 2px solid #e5e5e5; text-align: center; color: #666; font-size: 12px; }
          @media print { body { padding: 20px; } .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${template.name}</h1>
          <div class="meta">
            <strong>Generated:</strong> ${new Date().toLocaleString()} | 
            <strong>Period:</strong> ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
        </div>
    `

    enabledSections.forEach(section => {
      html += generateSectionContent(section)
    })

    html += `
        <div class="footer">
          <p>Generated by StrategyOS - Strategy Management Platform</p>
          <p>© ${new Date().getFullYear()} - Confidential and Proprietary</p>
        </div>
      </body>
      </html>
    `

    return html
  }

  const generateSectionContent = (section: ReportSection): string => {
    switch (section.type) {
      case 'executive-summary':
        return generateExecutiveSummary()
      case 'strategy-overview':
        return generateStrategyOverview()
      case 'initiative-status':
        return generateInitiativeStatus()
      case 'financial-summary':
        return generateFinancialSummary()
      case 'kpi-dashboard':
        return generateKPIDashboard()
      case 'portfolio-breakdown':
        return generatePortfolioBreakdown()
      default:
        return ''
    }
  }

  const generateExecutiveSummary = (): string => {
    const totalStrategies = (strategyCards || []).length
    const totalInitiatives = (initiatives || []).length
    const completedInitiatives = (initiatives || []).filter(i => i.status === 'completed').length
    const onTrackInitiatives = (initiatives || []).filter(i => i.status === 'on-track').length
    const atRiskInitiatives = (initiatives || []).filter(i => i.status === 'at-risk').length
    const blockedInitiatives = (initiatives || []).filter(i => i.status === 'blocked').length

    return `
      <div class="section">
        <h2>Executive Summary</h2>
        <div class="grid">
          <div class="stat">
            <div class="stat-label">Active Strategies</div>
            <div class="stat-value">${totalStrategies}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Total Initiatives</div>
            <div class="stat-value">${totalInitiatives}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Completed</div>
            <div class="stat-value">${completedInitiatives}</div>
          </div>
          <div class="stat">
            <div class="stat-label">On Track</div>
            <div class="stat-value">${onTrackInitiatives}</div>
          </div>
        </div>
        <div class="card">
          <div class="card-title">Health Overview</div>
          <p><span class="badge badge-success">Completed: ${completedInitiatives}</span> <span class="badge badge-info">On Track: ${onTrackInitiatives}</span> <span class="badge badge-warning">At Risk: ${atRiskInitiatives}</span> <span class="badge badge-danger">Blocked: ${blockedInitiatives}</span></p>
        </div>
      </div>
    `
  }

  const generateStrategyOverview = (): string => {
    return `
      <div class="section">
        <h2>Strategy Overview</h2>
        ${(strategyCards || []).map(card => `
          <div class="card">
            <div class="card-title">${card.title}</div>
            <p><strong>Framework:</strong> ${card.framework}</p>
            <p><strong>Vision:</strong> ${card.vision}</p>
            <p><strong>Goals:</strong> ${card.goals.length} strategic goals defined</p>
            <p><strong>Metrics:</strong> ${card.metrics.length} success metrics tracked</p>
          </div>
        `).join('')}
      </div>
    `
  }

  const generateInitiativeStatus = (): string => {
    return `
      <div class="section">
        <h2>Initiative Status</h2>
        <table>
          <thead>
            <tr>
              <th>Initiative</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Priority</th>
              <th>Budget</th>
            </tr>
          </thead>
          <tbody>
            ${(initiatives || []).map(init => `
              <tr>
                <td>${init.title}</td>
                <td>${init.owner}</td>
                <td><span class="badge badge-${getStatusBadgeClass(init.status)}">${init.status}</span></td>
                <td>${init.progress}%</td>
                <td><span class="badge badge-${getPriorityBadgeClass(init.priority)}">${init.priority}</span></td>
                <td>$${init.budget.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `
  }

  const generateFinancialSummary = (): string => {
    const totalBudget = (initiatives || []).reduce((sum, i) => sum + i.budget, 0)
    const avgProgress = (initiatives || []).reduce((sum, i) => sum + i.progress, 0) / (initiatives || []).length || 0

    return `
      <div class="section">
        <h2>Financial Summary</h2>
        <div class="grid">
          <div class="stat">
            <div class="stat-label">Total Budget Allocated</div>
            <div class="stat-value">$${totalBudget.toLocaleString()}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Average Progress</div>
            <div class="stat-value">${Math.round(avgProgress)}%</div>
          </div>
          <div class="stat">
            <div class="stat-label">Active Initiatives</div>
            <div class="stat-value">${(initiatives || []).filter(i => i.status !== 'completed').length}</div>
          </div>
        </div>
      </div>
    `
  }

  const generateKPIDashboard = (): string => {
    return `
      <div class="section">
        <h2>KPI Dashboard</h2>
        <div class="card">
          <div class="card-title">Key Performance Indicators</div>
          ${(initiatives || []).slice(0, 5).map(init => `
            <p><strong>${init.title}:</strong> ${init.kpis.length} KPIs tracked</p>
          `).join('')}
        </div>
      </div>
    `
  }

  const generatePortfolioBreakdown = (): string => {
    const portfolios = ['operational-excellence', 'ma', 'financial-transformation', 'esg', 'innovation']
    
    return `
      <div class="section">
        <h2>Portfolio Breakdown</h2>
        <table>
          <thead>
            <tr>
              <th>Portfolio</th>
              <th>Initiatives</th>
              <th>Budget</th>
              <th>Avg Progress</th>
            </tr>
          </thead>
          <tbody>
            ${portfolios.map(portfolio => {
              const portInitiatives = (initiatives || []).filter(i => i.portfolio === portfolio)
              const portBudget = portInitiatives.reduce((sum, i) => sum + i.budget, 0)
              const portProgress = portInitiatives.reduce((sum, i) => sum + i.progress, 0) / portInitiatives.length || 0
              
              return `
                <tr>
                  <td>${portfolio.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</td>
                  <td>${portInitiatives.length}</td>
                  <td>$${portBudget.toLocaleString()}</td>
                  <td>${Math.round(portProgress)}%</td>
                </tr>
              `
            }).join('')}
          </tbody>
        </table>
      </div>
    `
  }

  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'completed': return 'success'
      case 'on-track': return 'info'
      case 'at-risk': return 'warning'
      case 'blocked': return 'danger'
      default: return 'info'
    }
  }

  const getPriorityBadgeClass = (priority: string): string => {
    switch (priority) {
      case 'critical': return 'danger'
      case 'high': return 'warning'
      case 'medium': return 'info'
      case 'low': return 'success'
      default: return 'info'
    }
  }

  const downloadHTMLReport = (content: string, templateName: string) => {
    const blob = new Blob([content], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${templateName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadCSVReport = (templateName: string) => {
    const csvRows = [
      ['Initiative', 'Owner', 'Status', 'Progress', 'Priority', 'Budget', 'Portfolio', 'Start Date', 'End Date'],
      ...(initiatives || []).map(init => [
        init.title,
        init.owner,
        init.status,
        `${init.progress}%`,
        init.priority,
        `$${init.budget}`,
        init.portfolio,
        init.startDate,
        init.endDate
      ])
    ]

    const csvContent = csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${templateName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const currentTemplate = reportTemplates.find(t => t.id === selectedTemplate)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Automated Report Generation</h2>
          <p className="text-muted-foreground mt-2">
            Generate comprehensive reports from your strategic data
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target size={20} className="text-accent" />
              Strategies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{(strategyCards || []).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Rocket size={20} className="text-accent" />
              Initiatives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{(initiatives || []).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle size={20} className="text-accent" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(initiatives || []).filter(i => i.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Report Templates</CardTitle>
            <CardDescription>Choose a pre-configured report</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reportTemplates.map((template) => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate === template.id ? 'border-accent shadow-md' : ''
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-sm mb-1">{template.name}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{template.description}</p>
                    <Badge variant="secondary" className="text-xs">
                      {template.sections.length} sections
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Report Configuration</CardTitle>
              <CardDescription>
                {currentTemplate ? currentTemplate.name : 'Select a template'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentTemplate ? (
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Report Sections</Label>
                    <div className="space-y-2">
                      {currentTemplate.sections.map((section) => (
                        <div
                          key={section.id}
                          className="flex items-center gap-2 p-3 rounded-md border bg-card"
                        >
                          <Checkbox checked={section.enabled} disabled />
                          <div className="flex-1">
                            <div className="text-sm font-medium">{section.name}</div>
                            <div className="text-xs text-muted-foreground capitalize">
                              {section.type.replace(/-/g, ' ')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block">Export Format</Label>
                    <Select value={reportFormat} onValueChange={(value: any) => setReportFormat(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="html">
                          <div className="flex items-center gap-2">
                            <FileText size={16} />
                            HTML Report
                          </div>
                        </SelectItem>
                        <SelectItem value="csv">
                          <div className="flex items-center gap-2">
                            <FileCsv size={16} />
                            CSV Data Export
                          </div>
                        </SelectItem>
                        <SelectItem value="pdf">
                          <div className="flex items-center gap-2">
                            <FilePdf size={16} />
                            PDF Report (Demo)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Select a report template to configure
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Generate Report</CardTitle>
              <CardDescription>Export your configured report</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">
                      {currentTemplate ? currentTemplate.name : 'No template selected'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Format: {reportFormat.toUpperCase()} • 
                      Generated: {new Date().toLocaleDateString()}
                    </div>
                  </div>
                  <Button
                    onClick={generateReport}
                    disabled={!currentTemplate || isGenerating}
                    className="gap-2"
                  >
                    {isGenerating ? (
                      <>Generating...</>
                    ) : (
                      <>
                        <Download size={16} weight="bold" />
                        Generate & Download
                      </>
                    )}
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p className="mb-2"><strong>Report includes:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>{(strategyCards || []).length} strategic frameworks</li>
                    <li>{(initiatives || []).length} initiatives and projects</li>
                    <li>Financial data and budget allocation</li>
                    <li>Performance metrics and KPIs</li>
                    <li>Portfolio breakdowns and analysis</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
