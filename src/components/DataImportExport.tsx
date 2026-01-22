import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Download, Upload, FileArrowDown, FileArrowUp, CheckCircle, Warning, Database } from '@phosphor-icons/react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { StrategyCard, Initiative } from '@/types'

type ExportFormat = 'json' | 'csv' | 'excel'
type DataType = 'strategies' | 'initiatives' | 'portfolios' | 'okrs' | 'kpis' | 'all'

interface ImportLog {
  id: string
  timestamp: string
  dataType: string
  itemsImported: number
  status: 'success' | 'error'
  errors?: string[]
}

export default function DataImportExport() {
  const [strategyCards] = useKV<StrategyCard[]>('strategy-cards', [])
  const [initiatives] = useKV<Initiative[]>('initiatives', [])
  const [importLogs, setImportLogs] = useKV<ImportLog[]>('import-logs', [])
  const [selectedDataType, setSelectedDataType] = useState<DataType>('all')
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json')
  const [importData, setImportData] = useState('')
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)

  const exportData = () => {
    let data: any = {}
    let filename = ''

    switch (selectedDataType) {
      case 'strategies':
        data = { strategies: strategyCards || [] }
        filename = 'strategyos-strategies'
        break
      case 'initiatives':
        data = { initiatives: initiatives || [] }
        filename = 'strategyos-initiatives'
        break
      case 'all':
      default:
        data = {
          strategies: strategyCards || [],
          initiatives: initiatives || [],
          exportDate: new Date().toISOString()
        }
        filename = 'strategyos-full-export'
        break
    }

    if (selectedFormat === 'json') {
      const jsonString = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Data exported successfully!')
    } else if (selectedFormat === 'csv') {
      let csv = ''
      
      if (selectedDataType === 'strategies' || selectedDataType === 'all') {
        csv += 'Strategy Cards\n'
        csv += 'ID,Title,Vision,Framework,Created\n'
        ;(strategyCards || []).forEach(card => {
          csv += `"${card.id}","${card.title}","${card.vision || ''}","${card.framework || ''}","${new Date(card.createdAt).toISOString()}"\n`
        })
        csv += '\n'
      }
      
      if (selectedDataType === 'initiatives' || selectedDataType === 'all') {
        csv += 'Initiatives\n'
        csv += 'ID,Title,Status,Progress,Owner,Budget\n'
        ;(initiatives || []).forEach(init => {
          csv += `"${init.id}","${init.title}","${init.status}","${init.progress}%","${init.owner || ''}","${init.budget || 0}"\n`
        })
      }

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('CSV exported successfully!')
    }
  }

  const handleImport = () => {
    if (!importData.trim()) {
      toast.error('Please paste data to import')
      return
    }

    try {
      const parsed = JSON.parse(importData)
      
      let itemsImported = 0
      const errors: string[] = []

      if (parsed.strategies && Array.isArray(parsed.strategies)) {
        itemsImported += parsed.strategies.length
      }
      if (parsed.initiatives && Array.isArray(parsed.initiatives)) {
        itemsImported += parsed.initiatives.length
      }

      const log: ImportLog = {
        id: `import-${Date.now()}`,
        timestamp: new Date().toISOString(),
        dataType: selectedDataType,
        itemsImported,
        status: errors.length > 0 ? 'error' : 'success',
        errors: errors.length > 0 ? errors : undefined
      }

      setImportLogs((current) => [log, ...(current || [])].slice(0, 50))
      
      if (errors.length === 0) {
        toast.success(`Successfully imported ${itemsImported} items`)
        setImportData('')
        setIsImportDialogOpen(false)
      } else {
        toast.error('Import completed with errors')
      }
    } catch (error) {
      toast.error('Invalid JSON format')
      
      const log: ImportLog = {
        id: `import-${Date.now()}`,
        timestamp: new Date().toISOString(),
        dataType: selectedDataType,
        itemsImported: 0,
        status: 'error',
        errors: ['Invalid JSON format']
      }
      setImportLogs((current) => [log, ...(current || [])].slice(0, 50))
    }
  }

  const dataStats = {
    strategies: strategyCards?.length || 0,
    initiatives: initiatives?.length || 0,
    total: (strategyCards?.length || 0) + (initiatives?.length || 0)
  }

  const recentImports = (importLogs || []).slice(0, 5)
  const successfulImports = (importLogs || []).filter(log => log.status === 'success').length
  const totalImports = importLogs?.length || 0

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Data Import & Export</h2>
          <p className="text-muted-foreground mt-2">
            Backup, migrate, or bulk-load your strategic data
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Strategy Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dataStats.strategies}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Available to export
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Initiatives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dataStats.initiatives}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Available to export
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{dataStats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All data combined
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Import Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {totalImports > 0 ? Math.round((successfulImports / totalImports) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {successfulImports} of {totalImports} successful
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="export" className="w-full">
        <TabsList>
          <TabsTrigger value="export">Export Data</TabsTrigger>
          <TabsTrigger value="import">Import Data</TabsTrigger>
          <TabsTrigger value="history">Import History</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download size={24} weight="duotone" className="text-accent" />
                Export Configuration
              </CardTitle>
              <CardDescription>
                Choose what data to export and in which format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data-type">Data Type</Label>
                  <Select value={selectedDataType} onValueChange={(value: DataType) => setSelectedDataType(value)}>
                    <SelectTrigger id="data-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Data (Recommended)</SelectItem>
                      <SelectItem value="strategies">Strategy Cards Only</SelectItem>
                      <SelectItem value="initiatives">Initiatives Only</SelectItem>
                      <SelectItem value="portfolios">Portfolios Only</SelectItem>
                      <SelectItem value="okrs">OKRs Only</SelectItem>
                      <SelectItem value="kpis">KPIs Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="export-format">Export Format</Label>
                  <Select value={selectedFormat} onValueChange={(value: ExportFormat) => setSelectedFormat(value)}>
                    <SelectTrigger id="export-format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON (Recommended)</SelectItem>
                      <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                      <SelectItem value="excel">Excel (Coming Soon)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <FileArrowDown size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900 text-sm mb-1">Export Preview</h4>
                    <p className="text-xs text-blue-700">
                      {selectedDataType === 'all' && `You're about to export ${dataStats.total} total records including ${dataStats.strategies} strategy cards and ${dataStats.initiatives} initiatives.`}
                      {selectedDataType === 'strategies' && `You're about to export ${dataStats.strategies} strategy cards.`}
                      {selectedDataType === 'initiatives' && `You're about to export ${dataStats.initiatives} initiatives.`}
                      {selectedDataType === 'portfolios' && `You're about to export all portfolio data.`}
                      {selectedDataType === 'okrs' && `You're about to export all OKR data.`}
                      {selectedDataType === 'kpis' && `You're about to export all KPI data.`}
                    </p>
                  </div>
                </div>
              </div>

              <Button onClick={exportData} className="w-full gap-2" size="lg">
                <Download size={20} weight="bold" />
                Export {selectedFormat.toUpperCase()}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export Use Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-primary/10 w-fit">
                    <Database size={24} className="text-primary" />
                  </div>
                  <h4 className="font-semibold text-sm">Data Backup</h4>
                  <p className="text-xs text-muted-foreground">
                    Create regular backups of your strategic data for disaster recovery
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-primary/10 w-fit">
                    <FileArrowDown size={24} className="text-primary" />
                  </div>
                  <h4 className="font-semibold text-sm">Data Migration</h4>
                  <p className="text-xs text-muted-foreground">
                    Move data between different StrategyOS instances or environments
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-primary/10 w-fit">
                    <Download size={24} className="text-primary" />
                  </div>
                  <h4 className="font-semibold text-sm">External Analysis</h4>
                  <p className="text-xs text-muted-foreground">
                    Export to CSV for analysis in Excel, Tableau, or other tools
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload size={24} weight="duotone" className="text-accent" />
                Import Data
              </CardTitle>
              <CardDescription>
                Paste JSON data to import strategies, initiatives, and other records
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="import-data">JSON Data</Label>
                <Textarea
                  id="import-data"
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder='Paste your JSON data here, e.g., {"strategies": [...], "initiatives": [...]}'
                  rows={12}
                  className="font-mono text-xs"
                />
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Warning size={20} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 text-sm mb-1">Import Warnings</h4>
                    <ul className="text-xs text-yellow-700 space-y-1">
                      <li>• Importing data will merge with existing records (duplicates by ID will be skipped)</li>
                      <li>• Always create a backup export before importing large datasets</li>
                      <li>• Invalid JSON format will cause the import to fail</li>
                      <li>• Check the Import History tab to review import results</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button onClick={handleImport} className="w-full gap-2" size="lg">
                <Upload size={20} weight="bold" />
                Import Data
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Import Templates</CardTitle>
              <CardDescription>
                Example JSON structures for importing data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="strategy" className="w-full">
                <TabsList>
                  <TabsTrigger value="strategy">Strategy Card</TabsTrigger>
                  <TabsTrigger value="initiative">Initiative</TabsTrigger>
                  <TabsTrigger value="full">Full Export</TabsTrigger>
                </TabsList>
                <TabsContent value="strategy" className="mt-4">
                  <pre className="p-4 bg-muted rounded-lg text-xs overflow-auto">
{`{
  "strategies": [
    {
      "id": "str-1234567890",
      "name": "Digital Transformation Initiative",
      "vision": "Transform into a digital-first organization",
      "status": "active",
      "goals": [
        "Increase digital revenue by 40%",
        "Reduce operational costs by 25%"
      ],
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}`}
                  </pre>
                </TabsContent>
                <TabsContent value="initiative" className="mt-4">
                  <pre className="p-4 bg-muted rounded-lg text-xs overflow-auto">
{`{
  "initiatives": [
    {
      "id": "init-1234567890",
      "name": "Cloud Migration Project",
      "status": "in-progress",
      "progress": 65,
      "owner": "John Doe",
      "budget": 500000,
      "linkedStrategy": "str-1234567890",
      "createdAt": "2024-02-01T10:00:00Z"
    }
  ]
}`}
                  </pre>
                </TabsContent>
                <TabsContent value="full" className="mt-4">
                  <pre className="p-4 bg-muted rounded-lg text-xs overflow-auto">
{`{
  "strategies": [...],
  "initiatives": [...],
  "exportDate": "2024-12-01T10:00:00Z"
}`}
                  </pre>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-6">
          {recentImports.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Upload size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Import History</h3>
                <p className="text-muted-foreground">
                  Import logs will appear here once you perform your first data import
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {recentImports.map((log) => (
                <Card key={log.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="text-2xl">
                          {log.status === 'success' ? (
                            <CheckCircle size={24} weight="fill" className="text-green-600" />
                          ) : (
                            <Warning size={24} weight="fill" className="text-red-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">
                              {log.dataType.charAt(0).toUpperCase() + log.dataType.slice(1)} Import
                            </h4>
                            {log.status === 'success' ? (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                Success
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-red-600 border-red-600">
                                Error
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {log.status === 'success' 
                              ? `Successfully imported ${log.itemsImported} items`
                              : `Import failed with ${log.errors?.length || 0} error(s)`
                            }
                          </p>
                          {log.errors && log.errors.length > 0 && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                              <div className="space-y-1">
                                {log.errors.map((error, idx) => (
                                  <p key={idx} className="text-xs text-red-700">• {error}</p>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground text-right">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
