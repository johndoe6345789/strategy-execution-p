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
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  CheckCircle, 
  Warning, 
  XCircle, 
  ArrowsClockwise,
  Plus,
  Trash,
  Eye,
  EyeSlash,
  Link as LinkIcon,
  TrendUp,
  TrendDown,
  CurrencyDollar,
  Envelope,
  Phone
} from '@phosphor-icons/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type CRMSystem = 'Salesforce' | 'HubSpot' | 'Microsoft Dynamics CRM' | 'Zoho CRM' | 'Pipedrive' | 'Zendesk Sell'

interface CRMConnection {
  id: string
  name: string
  system: CRMSystem
  environment: 'Production' | 'Sandbox'
  baseUrl: string
  apiKey: string
  enabled: boolean
  status: 'connected' | 'disconnected' | 'error'
  lastSync?: string
  syncInterval: number
  autoSync: boolean
  dataSources: {
    contacts: boolean
    accounts: boolean
    opportunities: boolean
    leads: boolean
    activities: boolean
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

interface CustomerData {
  id: string
  source: string
  companyName: string
  contactName: string
  email: string
  phone: string
  accountValue: number
  status: 'prospect' | 'customer' | 'churned'
  lastActivity: string
  syncedAt: string
}

interface OpportunityData {
  id: string
  source: string
  opportunityName: string
  accountName: string
  value: number
  stage: string
  probability: number
  closeDate: string
  syncedAt: string
}

const crmSystems: CRMSystem[] = ['Salesforce', 'HubSpot', 'Microsoft Dynamics CRM', 'Zoho CRM', 'Pipedrive', 'Zendesk Sell']

const generateSampleCustomers = (connectionName: string): CustomerData[] => {
  const companies = [
    'Acme Corp', 'TechFlow Inc', 'Global Dynamics', 'Innovate LLC', 'Summit Partners',
    'NextGen Solutions', 'Prime Industries', 'Apex Systems', 'Fusion Enterprises', 'Vertex Group'
  ]
  
  return companies.map((company, i) => ({
    id: `cust-${i}`,
    source: connectionName,
    companyName: company,
    contactName: `Contact ${i + 1}`,
    email: `contact${i + 1}@${company.toLowerCase().replace(/\s+/g, '')}.com`,
    phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    accountValue: Math.floor(Math.random() * 500000) + 50000,
    status: ['prospect', 'customer', 'customer', 'customer', 'churned'][Math.floor(Math.random() * 5)] as any,
    lastActivity: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    syncedAt: new Date().toISOString()
  }))
}

const generateSampleOpportunities = (connectionName: string): OpportunityData[] => {
  const opportunities = [
    'Q4 Enterprise Deal', 'Annual Renewal', 'Product Expansion', 'New Territory',
    'Strategic Partnership', 'Cross-Sell Initiative', 'Upgrade Package', 'Migration Project'
  ]
  
  const stages = ['Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']
  
  return opportunities.map((opp, i) => ({
    id: `opp-${i}`,
    source: connectionName,
    opportunityName: opp,
    accountName: `Account ${i + 1}`,
    value: Math.floor(Math.random() * 300000) + 50000,
    stage: stages[Math.floor(Math.random() * stages.length)],
    probability: Math.floor(Math.random() * 100),
    closeDate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    syncedAt: new Date().toISOString()
  }))
}

export default function CRMIntegration() {
  const [connections, setConnections] = useKV<CRMConnection[]>('crm-connections', [])
  const [syncLogs, setSyncLogs] = useKV<SyncLog[]>('crm-sync-logs', [])
  const [customerData, setCustomerData] = useKV<CustomerData[]>('crm-customer-data', [])
  const [opportunityData, setOpportunityData] = useKV<OpportunityData[]>('crm-opportunity-data', [])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({})
  
  const [newConnection, setNewConnection] = useState({
    name: '',
    system: 'Salesforce' as CRMSystem,
    environment: 'Sandbox' as const,
    baseUrl: '',
    apiKey: '',
    syncInterval: 30,
    autoSync: true,
    dataSources: {
      contacts: true,
      accounts: true,
      opportunities: true,
      leads: false,
      activities: false
    }
  })

  const addConnection = () => {
    if (!newConnection.name || !newConnection.baseUrl || !newConnection.apiKey) {
      toast.error('Please fill in all required fields')
      return
    }

    const connection: CRMConnection = {
      id: `crm-${Date.now()}`,
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
      system: 'Salesforce',
      environment: 'Sandbox',
      baseUrl: '',
      apiKey: '',
      syncInterval: 30,
      autoSync: true,
      dataSources: {
        contacts: true,
        accounts: true,
        opportunities: true,
        leads: false,
        activities: false
      }
    })
    toast.success('CRM connection added successfully')
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

  const testConnection = (connection: CRMConnection) => {
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

  const syncData = (connection: CRMConnection) => {
    toast.loading('Syncing data...', { id: 'sync-data' })
    
    setTimeout(() => {
      const recordsSynced = Math.floor(Math.random() * 500) + 50
      const duration = Math.floor(Math.random() * 4000) + 1000
      
      const log: SyncLog = {
        id: `log-${Date.now()}`,
        connectionId: connection.id,
        timestamp: new Date().toISOString(),
        status: 'success',
        recordsSynced,
        dataType: 'Customer & Revenue Data',
        message: `Successfully synced ${recordsSynced} records from ${connection.system}`,
        duration
      }

      setSyncLogs((current) => [log, ...(current || [])])
      
      setConnections((current) =>
        (current || []).map(c =>
          c.id === connection.id ? { ...c, lastSync: new Date().toISOString() } : c
        )
      )

      if (connection.dataSources.contacts || connection.dataSources.accounts) {
        const newCustomers = generateSampleCustomers(connection.name)
        setCustomerData((current) => {
          const filtered = (current || []).filter(d => d.source !== connection.name)
          return [...filtered, ...newCustomers]
        })
      }

      if (connection.dataSources.opportunities) {
        const newOpportunities = generateSampleOpportunities(connection.name)
        setOpportunityData((current) => {
          const filtered = (current || []).filter(d => d.source !== connection.name)
          return [...filtered, ...newOpportunities]
        })
      }

      toast.success('Data synchronized successfully', { id: 'sync-data' })
    }, 2000)
  }

  const getStatusColor = (status: CRMConnection['status']) => {
    switch (status) {
      case 'connected': return 'text-green-600'
      case 'disconnected': return 'text-gray-500'
      case 'error': return 'text-red-600'
    }
  }

  const getStatusIcon = (status: CRMConnection['status']) => {
    switch (status) {
      case 'connected': return <CheckCircle size={20} weight="fill" className="text-green-600" />
      case 'disconnected': return <XCircle size={20} className="text-gray-500" />
      case 'error': return <Warning size={20} weight="fill" className="text-red-600" />
    }
  }

  const totalSynced = syncLogs?.filter(log => log.status === 'success').length || 0
  const totalErrors = syncLogs?.filter(log => log.status === 'error').length || 0
  const activeConnections = connections?.filter(c => c.enabled).length || 0
  const totalCustomers = customerData?.length || 0
  const totalOpportunities = opportunityData?.length || 0
  const totalRevenue = customerData?.reduce((sum, c) => sum + c.accountValue, 0) || 0
  const pipelineValue = opportunityData?.reduce((sum, o) => sum + o.value, 0) || 0

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">CRM Integration</h2>
          <p className="text-muted-foreground mt-2">
            Connect and sync customer and revenue data from your CRM systems
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} weight="bold" />
              Add CRM Connection
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add CRM Connection</DialogTitle>
              <DialogDescription>
                Configure a new connection to your CRM system
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="conn-name">Connection Name</Label>
                <Input
                  id="conn-name"
                  value={newConnection.name}
                  onChange={(e) => setNewConnection({ ...newConnection, name: e.target.value })}
                  placeholder="e.g., Salesforce Production"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="conn-system">CRM System</Label>
                  <Select
                    value={newConnection.system}
                    onValueChange={(value: CRMSystem) => setNewConnection({ ...newConnection, system: value })}
                  >
                    <SelectTrigger id="conn-system">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {crmSystems.map(system => (
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
                  placeholder="https://api.yourcrm.com"
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
                        {key}
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

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users size={16} />
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
              <Users size={16} />
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Synced from CRM
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CurrencyDollar size={16} />
              Account Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ${(totalRevenue / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total customer value
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendUp size={16} />
              Pipeline Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              ${(pipelineValue / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalOpportunities} opportunities
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="connections" className="w-full">
        <TabsList>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="sync-logs">Sync Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          {!connections || connections.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No CRM Connections</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first CRM connection to start syncing data
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
                            {source}
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

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Customer Data</CardTitle>
              <CardDescription>Customer accounts and contacts synced from CRM</CardDescription>
            </CardHeader>
            <CardContent>
              {!customerData || customerData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No customer data synced yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead className="text-right">Account Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Activity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerData.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="text-sm text-muted-foreground">{customer.source}</TableCell>
                        <TableCell className="font-medium">{customer.companyName}</TableCell>
                        <TableCell>{customer.contactName}</TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-1">
                            <Envelope size={14} className="text-muted-foreground" />
                            {customer.email}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-1">
                            <Phone size={14} className="text-muted-foreground" />
                            {customer.phone}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-green-600">
                          ${customer.accountValue.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              customer.status === 'customer' ? 'default' :
                              customer.status === 'prospect' ? 'secondary' : 'outline'
                            }
                            className="capitalize"
                          >
                            {customer.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(customer.lastActivity).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities">
          <Card>
            <CardHeader>
              <CardTitle>Sales Opportunities</CardTitle>
              <CardDescription>Active sales pipeline from CRM</CardDescription>
            </CardHeader>
            <CardContent>
              {!opportunityData || opportunityData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No opportunity data synced yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source</TableHead>
                      <TableHead>Opportunity</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Probability</TableHead>
                      <TableHead>Close Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {opportunityData.map((opp) => (
                      <TableRow key={opp.id}>
                        <TableCell className="text-sm text-muted-foreground">{opp.source}</TableCell>
                        <TableCell className="font-medium">{opp.opportunityName}</TableCell>
                        <TableCell>{opp.accountName}</TableCell>
                        <TableCell className="text-right font-mono font-semibold text-green-600">
                          ${opp.value.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              opp.stage === 'Closed Won' ? 'default' :
                              opp.stage === 'Closed Lost' ? 'destructive' : 'secondary'
                            }
                          >
                            {opp.stage}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={opp.probability} className="h-2 w-16" />
                            <span className="text-sm font-medium">{opp.probability}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(opp.closeDate).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
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
      </Tabs>
    </div>
  )
}
