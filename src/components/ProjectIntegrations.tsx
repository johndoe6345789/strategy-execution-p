import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, XCircle, Plus, Trash, ArrowsClockwise, Link as LinkIcon, Warning } from '@phosphor-icons/react'
import { useState } from 'react'
import { toast } from 'sonner'

type IntegrationType = 'jira' | 'asana' | 'monday' | 'trello' | 'clickup' | 'azure-devops'

interface Integration {
  id: string
  type: IntegrationType
  name: string
  apiKey: string
  apiUrl: string
  enabled: boolean
  lastSync?: string
  syncStatus: 'success' | 'error' | 'pending' | 'never'
  projectMapping: ProjectMapping[]
  syncInterval: number
  autoSync: boolean
  createdAt: string
  notes?: string
}

interface ProjectMapping {
  strategyOSInitiativeId: string
  externalProjectId: string
  externalProjectName: string
  syncFields: string[]
}

interface SyncLog {
  id: string
  integrationId: string
  timestamp: string
  status: 'success' | 'error'
  itemsSynced: number
  errors?: string[]
  details: string
}

const integrationConfigs = {
  jira: {
    label: 'Jira',
    icon: '🔷',
    description: 'Atlassian Jira project management',
    fields: ['status', 'assignee', 'progress', 'priority', 'description'],
    defaultUrl: 'https://your-domain.atlassian.net'
  },
  asana: {
    label: 'Asana',
    icon: '🎯',
    description: 'Asana work management platform',
    fields: ['status', 'assignee', 'progress', 'due_date', 'notes'],
    defaultUrl: 'https://app.asana.com/api/1.0'
  },
  monday: {
    label: 'Monday.com',
    icon: '📊',
    description: 'Monday.com work OS',
    fields: ['status', 'owner', 'progress', 'timeline', 'updates'],
    defaultUrl: 'https://api.monday.com/v2'
  },
  trello: {
    label: 'Trello',
    icon: '📋',
    description: 'Trello board management',
    fields: ['status', 'members', 'description', 'due_date', 'labels'],
    defaultUrl: 'https://api.trello.com/1'
  },
  clickup: {
    label: 'ClickUp',
    icon: '⚡',
    description: 'ClickUp productivity platform',
    fields: ['status', 'assignees', 'progress', 'priority', 'description'],
    defaultUrl: 'https://api.clickup.com/api/v2'
  },
  'azure-devops': {
    label: 'Azure DevOps',
    icon: '🔷',
    description: 'Microsoft Azure DevOps',
    fields: ['state', 'assigned_to', 'completed_work', 'priority', 'description'],
    defaultUrl: 'https://dev.azure.com'
  }
}

export default function ProjectIntegrations() {
  const [integrations, setIntegrations] = useKV<Integration[]>('project-integrations', [])
  const [syncLogs, setSyncLogs] = useKV<SyncLog[]>('integration-sync-logs', [])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null)
  const [selectedTab, setSelectedTab] = useState('integrations')
  
  const [newIntegration, setNewIntegration] = useState({
    type: 'jira' as IntegrationType,
    name: '',
    apiKey: '',
    apiUrl: '',
    syncInterval: 60,
    autoSync: true,
    notes: ''
  })

  const addIntegration = () => {
    if (!newIntegration.name.trim() || !newIntegration.apiKey.trim()) {
      toast.error('Please provide integration name and API key')
      return
    }

    const integration: Integration = {
      id: `int-${Date.now()}`,
      type: newIntegration.type,
      name: newIntegration.name,
      apiKey: newIntegration.apiKey,
      apiUrl: newIntegration.apiUrl || integrationConfigs[newIntegration.type].defaultUrl,
      enabled: true,
      syncStatus: 'never',
      projectMapping: [],
      syncInterval: newIntegration.syncInterval,
      autoSync: newIntegration.autoSync,
      createdAt: new Date().toISOString(),
      notes: newIntegration.notes
    }

    setIntegrations((current) => [...(current || []), integration])
    setIsAddDialogOpen(false)
    setNewIntegration({
      type: 'jira',
      name: '',
      apiKey: '',
      apiUrl: '',
      syncInterval: 60,
      autoSync: true,
      notes: ''
    })
    toast.success(`${integrationConfigs[integration.type].label} integration added!`)
  }

  const toggleIntegration = (integrationId: string) => {
    setIntegrations((current) =>
      (current || []).map(int =>
        int.id === integrationId ? { ...int, enabled: !int.enabled } : int
      )
    )
    const integration = integrations?.find(int => int.id === integrationId)
    toast.success(integration?.enabled ? 'Integration disabled' : 'Integration enabled')
  }

  const deleteIntegration = (integrationId: string) => {
    setIntegrations((current) => (current || []).filter(int => int.id !== integrationId))
    toast.success('Integration deleted')
  }

  const syncIntegration = (integrationId: string) => {
    const integration = integrations?.find(int => int.id === integrationId)
    if (!integration) return

    setIntegrations((current) =>
      (current || []).map(int =>
        int.id === integrationId 
          ? { ...int, syncStatus: 'pending' as const, lastSync: new Date().toISOString() } 
          : int
      )
    )

    setTimeout(() => {
      const success = Math.random() > 0.2
      const itemsSynced = Math.floor(Math.random() * 50) + 10

      setIntegrations((current) =>
        (current || []).map(int =>
          int.id === integrationId 
            ? { ...int, syncStatus: success ? 'success' as const : 'error' as const } 
            : int
        )
      )

      const log: SyncLog = {
        id: `log-${Date.now()}`,
        integrationId,
        timestamp: new Date().toISOString(),
        status: success ? 'success' : 'error',
        itemsSynced: success ? itemsSynced : 0,
        errors: success ? undefined : ['Connection timeout', 'Invalid authentication token'],
        details: success 
          ? `Successfully synced ${itemsSynced} items from ${integration.name}`
          : `Failed to sync with ${integration.name}`
      }

      setSyncLogs((current) => [log, ...(current || [])].slice(0, 100))
      
      if (success) {
        toast.success(`Synced ${itemsSynced} items from ${integration.name}`)
      } else {
        toast.error(`Sync failed for ${integration.name}`)
      }
    }, 2000)
  }

  const activeIntegrations = (integrations || []).filter(int => int.enabled).length
  const totalSyncs = syncLogs?.length || 0
  const successfulSyncs = (syncLogs || []).filter(log => log.status === 'success').length
  const syncSuccessRate = totalSyncs > 0 ? Math.round((successfulSyncs / totalSyncs) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Project Management Integrations</h2>
          <p className="text-muted-foreground mt-2">
            Connect with Jira, Asana, Monday.com, and other PM tools to sync initiative data
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} weight="bold" />
              Add Integration
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add Project Management Integration</DialogTitle>
              <DialogDescription>
                Connect a project management tool to sync initiative data
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="integration-type">Integration Type</Label>
                <Select
                  value={newIntegration.type}
                  onValueChange={(value: IntegrationType) => setNewIntegration({ 
                    ...newIntegration, 
                    type: value,
                    apiUrl: integrationConfigs[value].defaultUrl 
                  })}
                >
                  <SelectTrigger id="integration-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(integrationConfigs).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.icon} {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {integrationConfigs[newIntegration.type].description}
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="integration-name">Integration Name</Label>
                <Input
                  id="integration-name"
                  value={newIntegration.name}
                  onChange={(e) => setNewIntegration({ ...newIntegration, name: e.target.value })}
                  placeholder="e.g., Engineering Jira"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="api-url">API URL</Label>
                <Input
                  id="api-url"
                  value={newIntegration.apiUrl}
                  onChange={(e) => setNewIntegration({ ...newIntegration, apiUrl: e.target.value })}
                  placeholder={integrationConfigs[newIntegration.type].defaultUrl}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="api-key">API Key / Token</Label>
                <Input
                  id="api-key"
                  type="password"
                  value={newIntegration.apiKey}
                  onChange={(e) => setNewIntegration({ ...newIntegration, apiKey: e.target.value })}
                  placeholder="Enter your API key or access token"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sync-interval">Sync Interval (minutes)</Label>
                <Input
                  id="sync-interval"
                  type="number"
                  value={newIntegration.syncInterval}
                  onChange={(e) => setNewIntegration({ ...newIntegration, syncInterval: parseInt(e.target.value) })}
                  min="5"
                  max="1440"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-sync">Enable Auto-Sync</Label>
                <Switch
                  id="auto-sync"
                  checked={newIntegration.autoSync}
                  onCheckedChange={(checked) => setNewIntegration({ ...newIntegration, autoSync: checked })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="integration-notes">Notes</Label>
                <Textarea
                  id="integration-notes"
                  value={newIntegration.notes}
                  onChange={(e) => setNewIntegration({ ...newIntegration, notes: e.target.value })}
                  placeholder="Additional configuration notes..."
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addIntegration}>Add Integration</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{integrations?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeIntegrations} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{activeIntegrations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Connected and syncing
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Syncs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalSyncs}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All-time sync operations
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{syncSuccessRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {successfulSyncs} successful syncs
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="sync-logs">Sync Logs</TabsTrigger>
          <TabsTrigger value="field-mapping">Field Mapping</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4 mt-6">
          {(!integrations || integrations.length === 0) && (
            <Card>
              <CardContent className="py-12 text-center">
                <LinkIcon size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Integrations Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Connect your project management tools to sync initiative data
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus size={16} weight="bold" className="mr-2" />
                  Add Your First Integration
                </Button>
              </CardContent>
            </Card>
          )}

          {(integrations || []).map((integration) => {
            const config = integrationConfigs[integration.type]
            return (
              <Card key={integration.id} className={!integration.enabled ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{config.icon}</div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {integration.name}
                          {integration.enabled ? (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <CheckCircle size={12} weight="fill" className="mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-500 border-gray-500">
                              <XCircle size={12} weight="fill" className="mr-1" />
                              Disabled
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{config.label} Integration</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={integration.enabled}
                        onCheckedChange={() => toggleIntegration(integration.id)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => syncIntegration(integration.id)}
                        disabled={!integration.enabled || integration.syncStatus === 'pending'}
                        className="gap-2"
                      >
                        <ArrowsClockwise 
                          size={14} 
                          weight="bold" 
                          className={integration.syncStatus === 'pending' ? 'animate-spin' : ''} 
                        />
                        {integration.syncStatus === 'pending' ? 'Syncing...' : 'Sync Now'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteIntegration(integration.id)}
                      >
                        <Trash size={14} weight="bold" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">API URL</span>
                        <p className="text-sm font-mono mt-1">{integration.apiUrl}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">API Key</span>
                        <p className="text-sm font-mono mt-1">{'•'.repeat(20)}{integration.apiKey.slice(-4)}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Sync Interval</span>
                        <p className="text-sm mt-1">{integration.syncInterval} minutes</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Last Sync</span>
                        <p className="text-sm mt-1">
                          {integration.lastSync 
                            ? new Date(integration.lastSync).toLocaleString()
                            : 'Never'}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Sync Status</span>
                        <div className="mt-1">
                          {integration.syncStatus === 'success' && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <CheckCircle size={12} weight="fill" className="mr-1" />
                              Success
                            </Badge>
                          )}
                          {integration.syncStatus === 'error' && (
                            <Badge variant="outline" className="text-red-600 border-red-600">
                              <XCircle size={12} weight="fill" className="mr-1" />
                              Error
                            </Badge>
                          )}
                          {integration.syncStatus === 'pending' && (
                            <Badge variant="outline" className="text-blue-600 border-blue-600">
                              <ArrowsClockwise size={12} className="mr-1 animate-spin" />
                              Syncing
                            </Badge>
                          )}
                          {integration.syncStatus === 'never' && (
                            <Badge variant="outline">
                              Never Synced
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Auto-Sync</span>
                        <p className="text-sm mt-1">{integration.autoSync ? 'Enabled' : 'Disabled'}</p>
                      </div>
                    </div>
                  </div>
                  {integration.notes && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-md">
                      <p className="text-xs text-muted-foreground">{integration.notes}</p>
                    </div>
                  )}
                  <div className="mt-4 pt-4 border-t">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Synced Fields</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {config.fields.map((field) => (
                        <Badge key={field} variant="secondary" className="text-xs">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        <TabsContent value="sync-logs" className="space-y-4 mt-6">
          {(!syncLogs || syncLogs.length === 0) ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ArrowsClockwise size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Sync Logs Yet</h3>
                <p className="text-muted-foreground">
                  Sync logs will appear here once you perform your first integration sync
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {syncLogs.map((log) => {
                const integration = integrations?.find(int => int.id === log.integrationId)
                if (!integration) return null
                const config = integrationConfigs[integration.type]
                
                return (
                  <Card key={log.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="text-2xl">{config.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{integration.name}</h4>
                              {log.status === 'success' ? (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  <CheckCircle size={12} weight="fill" className="mr-1" />
                                  Success
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-red-600 border-red-600">
                                  <XCircle size={12} weight="fill" className="mr-1" />
                                  Error
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{log.details}</p>
                            {log.status === 'success' && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Synced {log.itemsSynced} items
                              </p>
                            )}
                            {log.errors && log.errors.length > 0 && (
                              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                                <div className="flex items-start gap-2">
                                  <Warning size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                                  <div className="space-y-1">
                                    {log.errors.map((error, idx) => (
                                      <p key={idx} className="text-xs text-red-700">{error}</p>
                                    ))}
                                  </div>
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
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="field-mapping" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Field Mapping Configuration</CardTitle>
              <CardDescription>
                Configure which fields to sync between StrategyOS and external systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="rounded-lg border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-3 text-left text-sm font-semibold">StrategyOS Field</th>
                        <th className="p-3 text-center text-sm font-semibold">→</th>
                        <th className="p-3 text-left text-sm font-semibold">External Field</th>
                        <th className="p-3 text-left text-sm font-semibold">Direction</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { strategyField: 'Initiative Name', externalField: 'Project Name / Title', direction: 'Bidirectional' },
                        { strategyField: 'Status', externalField: 'Status / State', direction: 'Bidirectional' },
                        { strategyField: 'Progress', externalField: '% Complete', direction: 'Import Only' },
                        { strategyField: 'Owner', externalField: 'Assignee / Owner', direction: 'Bidirectional' },
                        { strategyField: 'Due Date', externalField: 'Due Date / Deadline', direction: 'Export Only' },
                        { strategyField: 'Description', externalField: 'Description / Notes', direction: 'Bidirectional' },
                        { strategyField: 'Priority', externalField: 'Priority Level', direction: 'Bidirectional' },
                        { strategyField: 'Budget', externalField: 'Budget / Cost', direction: 'Export Only' },
                      ].map((mapping, idx) => (
                        <tr key={idx} className="border-b last:border-0">
                          <td className="p-3 text-sm font-medium">{mapping.strategyField}</td>
                          <td className="p-3 text-center text-muted-foreground">→</td>
                          <td className="p-3 text-sm">{mapping.externalField}</td>
                          <td className="p-3">
                            <Badge variant="secondary" className="text-xs">
                              {mapping.direction}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <LinkIcon size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-blue-900 text-sm">Field Mapping Notes</h4>
                      <ul className="text-xs text-blue-700 mt-2 space-y-1">
                        <li>• <strong>Bidirectional:</strong> Changes sync both ways between systems</li>
                        <li>• <strong>Import Only:</strong> Data flows from external system to StrategyOS</li>
                        <li>• <strong>Export Only:</strong> Data flows from StrategyOS to external system</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
