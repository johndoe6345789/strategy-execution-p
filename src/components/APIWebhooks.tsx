import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Code, Copy, Key, Link, Plus, Trash, WebhooksLogo, CheckCircle, Warning } from '@phosphor-icons/react'
import { useState } from 'react'
import { toast } from 'sonner'

interface APIKey {
  id: string
  name: string
  key: string
  createdAt: string
  lastUsed?: string
  status: 'active' | 'revoked'
  permissions: string[]
}

interface Webhook {
  id: string
  name: string
  url: string
  events: string[]
  status: 'active' | 'inactive'
  secret: string
  createdAt: string
  lastTriggered?: string
  deliveryCount: number
}

interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  description: string
  authentication: boolean
  example: string
}

const apiEndpoints: APIEndpoint[] = [
  {
    method: 'GET',
    path: '/api/strategies',
    description: 'List all strategy cards',
    authentication: true,
    example: 'curl -H "Authorization: Bearer YOUR_API_KEY" https://api.strategyos.app/api/strategies'
  },
  {
    method: 'POST',
    path: '/api/strategies',
    description: 'Create a new strategy card',
    authentication: true,
    example: 'curl -X POST -H "Authorization: Bearer YOUR_API_KEY" -H "Content-Type: application/json" -d \'{"title":"New Strategy","framework":"SWOT"}\' https://api.strategyos.app/api/strategies'
  },
  {
    method: 'GET',
    path: '/api/initiatives',
    description: 'List all initiatives',
    authentication: true,
    example: 'curl -H "Authorization: Bearer YOUR_API_KEY" https://api.strategyos.app/api/initiatives'
  },
  {
    method: 'POST',
    path: '/api/initiatives',
    description: 'Create a new initiative',
    authentication: true,
    example: 'curl -X POST -H "Authorization: Bearer YOUR_API_KEY" -H "Content-Type: application/json" -d \'{"title":"New Initiative"}\' https://api.strategyos.app/api/initiatives'
  },
  {
    method: 'PUT',
    path: '/api/initiatives/:id',
    description: 'Update initiative status or progress',
    authentication: true,
    example: 'curl -X PUT -H "Authorization: Bearer YOUR_API_KEY" -H "Content-Type: application/json" -d \'{"status":"on-track","progress":75}\' https://api.strategyos.app/api/initiatives/123'
  },
  {
    method: 'GET',
    path: '/api/portfolios',
    description: 'Get portfolio analytics',
    authentication: true,
    example: 'curl -H "Authorization: Bearer YOUR_API_KEY" https://api.strategyos.app/api/portfolios'
  },
  {
    method: 'GET',
    path: '/api/kpis',
    description: 'Get KPI metrics and dashboards',
    authentication: true,
    example: 'curl -H "Authorization: Bearer YOUR_API_KEY" https://api.strategyos.app/api/kpis'
  },
  {
    method: 'POST',
    path: '/api/webhooks',
    description: 'Register a webhook endpoint',
    authentication: true,
    example: 'curl -X POST -H "Authorization: Bearer YOUR_API_KEY" -H "Content-Type: application/json" -d \'{"url":"https://your-app.com/webhook","events":["initiative.updated"]}\' https://api.strategyos.app/api/webhooks'
  }
]

const webhookEvents = [
  'strategy.created',
  'strategy.updated',
  'strategy.deleted',
  'initiative.created',
  'initiative.updated',
  'initiative.completed',
  'portfolio.updated',
  'kpi.updated',
  'okr.updated',
  'report.generated'
]

export default function APIWebhooks() {
  const [apiKeys, setApiKeys] = useKV<APIKey[]>('api-keys', [])
  const [webhooks, setWebhooks] = useKV<Webhook[]>('webhooks', [])
  const [isKeyDialogOpen, setIsKeyDialogOpen] = useState(false)
  const [isWebhookDialogOpen, setIsWebhookDialogOpen] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    events: [] as string[]
  })

  const generateAPIKey = () => {
    if (!newKeyName.trim()) {
      toast.error('Please provide a name for the API key')
      return
    }

    const key = `sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
    
    const newKey: APIKey = {
      id: `key-${Date.now()}`,
      name: newKeyName,
      key,
      createdAt: new Date().toISOString(),
      status: 'active',
      permissions: ['read', 'write']
    }

    setApiKeys((current) => [...(current || []), newKey])
    setIsKeyDialogOpen(false)
    setNewKeyName('')
    toast.success('API key generated successfully')
  }

  const revokeAPIKey = (keyId: string) => {
    setApiKeys((current) =>
      (current || []).map(k =>
        k.id === keyId ? { ...k, status: 'revoked' as const } : k
      )
    )
    toast.success('API key revoked')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const createWebhook = () => {
    if (!newWebhook.name.trim() || !newWebhook.url.trim() || newWebhook.events.length === 0) {
      toast.error('Please fill in all fields and select at least one event')
      return
    }

    const webhook: Webhook = {
      id: `webhook-${Date.now()}`,
      name: newWebhook.name,
      url: newWebhook.url,
      events: newWebhook.events,
      status: 'active',
      secret: `whsec_${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date().toISOString(),
      deliveryCount: 0
    }

    setWebhooks((current) => [...(current || []), webhook])
    setIsWebhookDialogOpen(false)
    setNewWebhook({ name: '', url: '', events: [] })
    toast.success('Webhook created successfully')
  }

  const toggleWebhookEvent = (event: string) => {
    setNewWebhook((current) => ({
      ...current,
      events: current.events.includes(event)
        ? current.events.filter(e => e !== event)
        : [...current.events, event]
    }))
  }

  const toggleWebhookStatus = (webhookId: string) => {
    setWebhooks((current) =>
      (current || []).map(w =>
        w.id === webhookId
          ? { ...w, status: w.status === 'active' ? 'inactive' as const : 'active' as const }
          : w
      )
    )
    toast.success('Webhook status updated')
  }

  const deleteWebhook = (webhookId: string) => {
    setWebhooks((current) => (current || []).filter(w => w.id !== webhookId))
    toast.success('Webhook deleted')
  }

  const methodColors = {
    GET: 'bg-blue-500',
    POST: 'bg-green-500',
    PUT: 'bg-amber-500',
    DELETE: 'bg-red-500'
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">API & Webhooks</h2>
        <p className="text-muted-foreground mt-2">
          Integrate StrategyOS with external systems and automate workflows
        </p>
      </div>

      <Tabs defaultValue="endpoints" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="endpoints">API Documentation</TabsTrigger>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>REST API Endpoints</CardTitle>
              <CardDescription>
                Programmatically access and manage your strategic data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {apiEndpoints.map((endpoint, idx) => (
                <Card key={idx} className="border-l-4" style={{ borderLeftColor: methodColors[endpoint.method] }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge className={`${methodColors[endpoint.method]} text-white font-mono`}>
                          {endpoint.method}
                        </Badge>
                        <code className="text-sm font-mono">{endpoint.path}</code>
                      </div>
                      {endpoint.authentication && (
                        <Badge variant="outline" className="gap-1">
                          <Key size={12} />
                          Auth Required
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{endpoint.description}</p>
                    <div className="bg-muted/50 rounded-md p-3 flex items-start gap-2">
                      <Code size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                      <code className="text-xs font-mono text-muted-foreground break-all">{endpoint.example}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto flex-shrink-0 h-6 w-6 p-0"
                        onClick={() => copyToClipboard(endpoint.example)}
                      >
                        <Copy size={14} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>All API requests require authentication using Bearer tokens</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-md p-4 space-y-2">
                <p className="text-sm font-medium">Include your API key in the Authorization header:</p>
                <code className="text-xs font-mono block">Authorization: Bearer YOUR_API_KEY</code>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keys" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">API Keys</h3>
              <p className="text-sm text-muted-foreground">Manage authentication keys for API access</p>
            </div>
            <Dialog open={isKeyDialogOpen} onOpenChange={setIsKeyDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus size={16} weight="bold" />
                  Generate API Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate API Key</DialogTitle>
                  <DialogDescription>
                    Create a new API key for programmatic access
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="key-name">Key Name</Label>
                    <Input
                      id="key-name"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="e.g., Production Server, Mobile App"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsKeyDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={generateAPIKey}>Generate Key</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {(apiKeys || []).length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Key size={48} className="text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    No API keys yet. Generate your first key to get started.
                  </p>
                </CardContent>
              </Card>
            ) : (
              (apiKeys || []).map((key) => (
                <Card key={key.id} className={key.status === 'revoked' ? 'opacity-60' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{key.name}</h4>
                          <Badge variant={key.status === 'active' ? 'default' : 'secondary'}>
                            {key.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                            {key.status === 'active' ? key.key : '••••••••••••••••'}
                          </code>
                          {key.status === 'active' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => copyToClipboard(key.key)}
                            >
                              <Copy size={14} />
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Created: {new Date(key.createdAt).toLocaleDateString()}</span>
                          {key.lastUsed && <span>Last used: {new Date(key.lastUsed).toLocaleDateString()}</span>}
                        </div>
                      </div>
                      {key.status === 'active' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => revokeAPIKey(key.id)}
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Webhooks</h3>
              <p className="text-sm text-muted-foreground">Receive real-time notifications for events</p>
            </div>
            <Dialog open={isWebhookDialogOpen} onOpenChange={setIsWebhookDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus size={16} weight="bold" />
                  Create Webhook
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create Webhook</DialogTitle>
                  <DialogDescription>
                    Set up a webhook endpoint to receive real-time event notifications
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="webhook-name">Webhook Name</Label>
                    <Input
                      id="webhook-name"
                      value={newWebhook.name}
                      onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                      placeholder="e.g., Slack Notifications"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="webhook-url">Endpoint URL</Label>
                    <Input
                      id="webhook-url"
                      value={newWebhook.url}
                      onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                      placeholder="https://your-app.com/webhook"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Events to Subscribe</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-2 border rounded-md">
                      {webhookEvents.map((event) => (
                        <div key={event} className="flex items-center gap-2">
                          <Switch
                            checked={newWebhook.events.includes(event)}
                            onCheckedChange={() => toggleWebhookEvent(event)}
                          />
                          <span className="text-sm font-mono">{event}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsWebhookDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createWebhook}>Create Webhook</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {(webhooks || []).length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <WebhooksLogo size={48} className="text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    No webhooks configured. Create your first webhook to receive event notifications.
                  </p>
                </CardContent>
              </Card>
            ) : (
              (webhooks || []).map((webhook) => (
                <Card key={webhook.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <WebhooksLogo size={20} className="text-primary" />
                          <h4 className="font-semibold">{webhook.name}</h4>
                          {webhook.status === 'active' ? (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle size={12} weight="fill" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <Warning size={12} />
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Link size={14} className="text-muted-foreground" />
                          <code className="text-xs font-mono text-muted-foreground">{webhook.url}</code>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {webhook.events.map((event) => (
                            <Badge key={event} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Created: {new Date(webhook.createdAt).toLocaleDateString()}</span>
                          <span>Deliveries: {webhook.deliveryCount}</span>
                          {webhook.lastTriggered && (
                            <span>Last triggered: {new Date(webhook.lastTriggered).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={webhook.status === 'active'}
                          onCheckedChange={() => toggleWebhookStatus(webhook.id)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => deleteWebhook(webhook.id)}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
