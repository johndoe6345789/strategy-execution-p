import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Database, 
  CheckCircle, 
  Warning, 
  XCircle, 
  ArrowsClockwise,
  Plus,
  Trash,
  Eye,
  EyeSlash,
  Link as LinkIcon,
  CurrencyDollar,
  ChartBar,
  Users
} from '@phosphor-icons/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type ERPSystem = 'SAP' | 'Oracle' | 'Microsoft Dynamics' | 'NetSuite' | 'Workday' | 'Sage' | 'Infor'

interface ERPConnection {
  id: string
  name: string
  system: ERPSystem
  environment: 'Production' | 'Sandbox' | 'Development'
  baseUrl: string
  apiKey: string
  enabled: boolean
  status: 'connected' | 'disconnected' | 'error'
  lastSync?: string
  syncInterval: number
  autoSync: boolean
  dataSources: {
    financials: boolean
    purchasing: boolean
    inventory: boolean
    humanResources: boolean
    manufacturing: boolean
  }
}

interface SyncLog {
  id: string
  connectionId: string
  timestamp: string
  status: 'success' | 'error' | 'warning'
  recordsSynced: number
  dataType: string
  message: string
  duration: number
}

interface FinancialData {
  id: string
  source: string
  period: string
  revenue: number
  expenses: number
  profit: number
  currency: string
  syncedAt: string
}

const erpSystems: ERPSystem[] = ['SAP', 'Oracle', 'Microsoft Dynamics', 'NetSuite', 'Workday', 'Sage', 'Infor']

const generateSampleFinancials = (connectionName: string): FinancialData[] => {
  const months = ['Jan 2024', 'Feb 2024', 'Mar 2024', 'Apr 2024', 'May 2024', 'Jun 2024']
  return months.map((month, i) => ({
    id: `fin-${i}`,
    source: connectionName,
    period: month,
    revenue: Math.floor(Math.random() * 500000) + 1000000,
    expenses: Math.floor(Math.random() * 300000) + 600000,
    profit: 0,
    currency: 'USD',
    syncedAt: new Date().toISOString()
  })).map(d => ({ ...d, profit: d.revenue - d.expenses }))
}

export default function ERPIntegration() {
  const [connections, setConnections] = useKV<ERPConnection[]>('erp-connections', [])
  const [syncLogs, setSyncLogs] = useKV<SyncLog[]>('erp-sync-logs', [])
  const [financialData, setFinancialData] = useKV<FinancialData[]>('erp-financial-data', [])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({})
  const [selectedConnection, setSelectedConnection] = useState<ERPConnection | null>(null)
  
  const [newConnection, setNewConnection] = useState({
    name: '',
    system: 'SAP' as ERPSystem,
    environment: 'Sandbox' as const,
    baseUrl: '',
    apiKey: '',
    syncInterval: 60,
    autoSync: true,
    dataSources: {
      financials: true,
      purchasing: false,
      inventory: false,
      humanResources: false,
      manufacturing: false
    }
  })

  const addConnection = () => {
    if (!newConnection.name || !newConnection.baseUrl || !newConnection.apiKey) {
      toast.error('Please fill in all required fields')
      return
    }

    const connection: ERPConnection = {
      id: `erp-${Date.now()}`,
      name: newConnection.name,
      system: newConnection.system,
      environment: newConnection.environment,
      baseUrl: newConnection.baseUrl,
      apiKey: newConnection.apiKey,
      enabled: true,
      status: 'connected',
      syncInterval: newConnection.syncInterval,
      autoSync: newConnection.autoSync,
      dataSources: newConnection.dataSources
    }

    setConnections((current) => [...(current || []), connection])
    setIsAddDialogOpen(false)
    setNewConnection({
      name: '',
      system: 'SAP',
      environment: 'Sandbox',
      baseUrl: '',
      apiKey: '',
      syncInterval: 60,
      autoSync: true,
      dataSources: {
        financials: true,
        purchasing: false,
        inventory: false,
        humanResources: false,
        manufacturing: false
      }
    })
    toast.success('ERP connection added successfully')
  }

  const deleteConnection = (id: string) => {
    setConnections((current) => (current || []).filter(c => c.id !== id))
    setSyncLogs((current) => (current || []).filter(log => log.connectionId !== id))
    toast.success('Connection removed')
  }

  const toggleConnection = (id: string) => {
    setConnections((current) =>
      (current || []).map(c =>
        c.id === id ? { ...c, enabled: !c.enabled, status: !c.enabled ? 'connected' : 'disconnected' as const } : c
      )
    )
  }

  const testConnection = (connection: ERPConnection) => {
    toast.loading('Testing connection...', { id: 'test-connection' })
    
    setTimeout(() => {
      const success = Math.random() > 0.2
      
      if (success) {
        setConnections((current) =>
          (current || []).map(c =>
            c.id === connection.id ? { ...c, status: 'connected' as const } : c
          )
        )
        toast.success('Connection test successful', { id: 'test-connection' })
      } else {
        setConnections((current) =>
          (current || []).map(c =>
            c.id === connection.id ? { ...c, status: 'error' as const } : c
          )
        )
        toast.error('Connection test failed', { id: 'test-connection' })
      }
    }, 1500)
  }

  const syncData = (connection: ERPConnection) => {
    toast.loading('Syncing data...', { id: 'sync-data' })
    
    setTimeout(() => {
      const recordsSynced = Math.floor(Math.random() * 1000) + 100
      const duration = Math.floor(Math.random() * 5000) + 1000
      
      const log: SyncLog = {
        id: `log-${Date.now()}`,
        connectionId: connection.id,
        timestamp: new Date().toISOString(),
        status: 'success',
        recordsSynced,
        dataType: 'Financial Data',
        message: `Successfully synced ${recordsSynced} records from ${connection.system}`,
        duration
      }

      setSyncLogs((current) => [log, ...(current || [])])
      
      setConnections((current) =>
        (current || []).map(c =>
          c.id === connection.id ? { ...c, lastSync: new Date().toISOString() } : c
        )
      )

      if (connection.dataSources.financials) {
        const newFinancials = generateSampleFinancials(connection.name)
        setFinancialData((current) => {
          const filtered = (current || []).filter(d => d.source !== connection.name)
          return [...filtered, ...newFinancials]
        })
      }

      toast.success('Data synchronized successfully', { id: 'sync-data' })
    }, 2000)
  }

  const getStatusColor = (status: ERPConnection['status']) => {
    switch (status) {
      case 'connected': return 'text-green-600'
      case 'disconnected': return 'text-gray-500'
      case 'error': return 'text-red-600'
    }
  }

  const getStatusIcon = (status: ERPConnection['status']) => {
    switch (status) {
      case 'connected': return <CheckCircle size={20} weight="fill" className="text-green-600" />
      case 'disconnected': return <XCircle size={20} className="text-gray-500" />
      case 'error': return <Warning size={20} weight="fill" className="text-red-600" />
    }
  }

  const totalSynced = syncLogs?.filter(log => log.status === 'success').length || 0
  const totalErrors = syncLogs?.filter(log => log.status === 'error').length || 0
  const activeConnections = connections?.filter(c => c.enabled).length || 0

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">ERP System Integration</h2>
          <p className="text-muted-foreground mt-2">
            Connect and sync financial and operational data from your ERP systems
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} weight="bold" />
              Add ERP Connection
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add ERP Connection</DialogTitle>
              <DialogDescription>
                Configure a new connection to your ERP system
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="conn-name">Connection Name</Label>
                <Input
                  id="conn-name"
                  value={newConnection.name}
                  onChange={(e) => setNewConnection({ ...newConnection, name: e.target.value })}
                  placeholder="e.g., SAP Production"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="conn-system">ERP System</Label>
                  <Select
                    value={newConnection.system}
                    onValueChange={(value: ERPSystem) => setNewConnection({ ...newConnection, system: value })}
                  >
                    <SelectTrigger id="conn-system">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {erpSystems.map(system => (
                        <SelectItem key={system} value={system}>{system}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="conn-env">Environment</Label>
                  <Select
                    value={newConnection.environment}
                    onValueChange={(value: any) => setNewConnection({ ...newConnection, environment: value })}
                  >
                    <SelectTrigger id="conn-env">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Production">Production</SelectItem>
                      <SelectItem value="Sandbox">Sandbox</SelectItem>
                      <SelectItem value="Development">Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="conn-url">Base URL</Label>
                <Input
                  id="conn-url"
                  value={newConnection.baseUrl}
                  onChange={(e) => setNewConnection({ ...newConnection, baseUrl: e.target.value })}
                  placeholder="https://api.yourerp.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="conn-key">API Key</Label>
                <Input
                  id="conn-key"
                  type="password"
                  value={newConnection.apiKey}
                  onChange={(e) => setNewConnection({ ...newConnection, apiKey: e.target.value })}
                  placeholder="Enter your API key"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="conn-interval">Sync Interval (minutes)</Label>
                  <Input
                    id="conn-interval"
                    type="number"
                    value={newConnection.syncInterval}
                    onChange={(e) => setNewConnection({ ...newConnection, syncInterval: parseInt(e.target.value) })}
                  />
                </div>
                <div className="flex items-center justify-between pt-6">
                  <Label htmlFor="conn-auto">Auto-sync</Label>
                  <Switch
                    id="conn-auto"
                    checked={newConnection.autoSync}
                    onCheckedChange={(checked) => setNewConnection({ ...newConnection, autoSync: checked })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Data Sources</Label>
                <div className="space-y-2 border rounded-md p-3">
                  {Object.entries(newConnection.dataSources).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label htmlFor={`source-${key}`} className="text-sm capitalize cursor-pointer">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <Switch
                        id={`source-${key}`}
                        checked={value}
                        onCheckedChange={(checked) => setNewConnection({
                          ...newConnection,
                          dataSources: { ...newConnection.dataSources, [key]: checked }
                        })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addConnection}>Add Connection</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database size={16} />
              Active Connections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{activeConnections}</div>
            <p className="text-xs text-muted-foreground mt-1">
              of {connections?.length || 0} total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle size={16} />
              Successful Syncs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{totalSynced}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total successful operations
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Warning size={16} />
              Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{totalErrors}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Failed sync operations
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="connections" className="w-full">
        <TabsList>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="sync-logs">Sync Logs</TabsTrigger>
          <TabsTrigger value="financial-data">Financial Data</TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          {!connections || connections.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Database size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No ERP Connections</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first ERP connection to start syncing data
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus size={16} className="mr-2" />
                  Add Connection
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {connections.map((connection) => (
                <Card key={connection.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(connection.status)}
                        <div>
                          <CardTitle className="text-lg">{connection.name}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{connection.system}</Badge>
                            <Badge variant="secondary">{connection.environment}</Badge>
                            <span className={cn("text-xs font-medium", getStatusColor(connection.status))}>
                              {connection.status}
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={connection.enabled}
                          onCheckedChange={() => toggleConnection(connection.id)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteConnection(connection.id)}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Base URL:</span>
                        <p className="font-mono text-xs mt-1">{connection.baseUrl}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">API Key:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="font-mono text-xs">
                            {showApiKey[connection.id] ? connection.apiKey : '••••••••••••••••'}
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setShowApiKey({ ...showApiKey, [connection.id]: !showApiKey[connection.id] })}
                          >
                            {showApiKey[connection.id] ? <EyeSlash size={14} /> : <Eye size={14} />}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Sync Interval:</span>
                        <p className="font-medium mt-1">{connection.syncInterval} minutes</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Sync:</span>
                        <p className="font-medium mt-1">
                          {connection.lastSync ? new Date(connection.lastSync).toLocaleString() : 'Never'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Active Data Sources:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(connection.dataSources).filter(([_, enabled]) => enabled).map(([source]) => (
                          <Badge key={source} variant="secondary" className="capitalize">
                            {source.replace(/([A-Z])/g, ' $1').trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testConnection(connection)}
                        disabled={!connection.enabled}
                      >
                        <LinkIcon size={16} className="mr-2" />
                        Test Connection
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => syncData(connection)}
                        disabled={!connection.enabled}
                      >
                        <ArrowsClockwise size={16} className="mr-2" />
                        Sync Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sync-logs">
          <Card>
            <CardHeader>
              <CardTitle>Synchronization History</CardTitle>
              <CardDescription>Recent sync operations and their status</CardDescription>
            </CardHeader>
            <CardContent>
              {!syncLogs || syncLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No sync logs available
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Connection</TableHead>
                      <TableHead>Data Type</TableHead>
                      <TableHead>Records</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {syncLogs.slice(0, 20).map((log) => {
                      const connection = connections?.find(c => c.id === log.connectionId)
                      return (
                        <TableRow key={log.id}>
                          <TableCell>
                            {log.status === 'success' ? (
                              <CheckCircle size={20} weight="fill" className="text-green-600" />
                            ) : log.status === 'warning' ? (
                              <Warning size={20} weight="fill" className="text-yellow-600" />
                            ) : (
                              <XCircle size={20} weight="fill" className="text-red-600" />
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {connection?.name || 'Unknown'}
                          </TableCell>
                          <TableCell>{log.dataType}</TableCell>
                          <TableCell>{log.recordsSynced.toLocaleString()}</TableCell>
                          <TableCell>{(log.duration / 1000).toFixed(2)}s</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-sm">{log.message}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial-data">
          <Card>
            <CardHeader>
              <CardTitle>Synced Financial Data</CardTitle>
              <CardDescription>Financial data imported from ERP systems</CardDescription>
            </CardHeader>
            <CardContent>
              {!financialData || financialData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No financial data synced yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Expenses</TableHead>
                      <TableHead className="text-right">Profit</TableHead>
                      <TableHead>Synced At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {financialData.map((data) => (
                      <TableRow key={data.id}>
                        <TableCell className="font-medium">{data.source}</TableCell>
                        <TableCell>{data.period}</TableCell>
                        <TableCell className="text-right text-green-600 font-mono">
                          {data.currency} {data.revenue.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-red-600 font-mono">
                          {data.currency} {data.expenses.toLocaleString()}
                        </TableCell>
                        <TableCell className={cn(
                          "text-right font-mono font-semibold",
                          data.profit > 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {data.currency} {data.profit.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(data.syncedAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
