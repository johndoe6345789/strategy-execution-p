import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  ClockCounterClockwise, 
  FunnelSimple, 
  Download, 
  MagnifyingGlass,
  Plus,
  Pencil,
  Trash,
  Eye,
  User,
  Strategy,
  Target,
  FolderOpen,
  ChartBar,
  Shield
} from '@phosphor-icons/react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface AuditLog {
  id: string
  timestamp: string
  userId: string
  userName: string
  action: 'created' | 'updated' | 'deleted' | 'viewed' | 'exported' | 'shared'
  entityType: 'strategy' | 'initiative' | 'portfolio' | 'okr' | 'kpi' | 'report' | 'user' | 'api-key' | 'webhook'
  entityId: string
  entityName: string
  details: string
  changes?: {
    field: string
    oldValue: string
    newValue: string
  }[]
  ipAddress?: string
  userAgent?: string
}

const actionColors = {
  created: 'bg-green-500',
  updated: 'bg-blue-500',
  deleted: 'bg-red-500',
  viewed: 'bg-gray-500',
  exported: 'bg-purple-500',
  shared: 'bg-amber-500'
}

const entityIcons = {
  strategy: Strategy,
  initiative: Target,
  portfolio: FolderOpen,
  okr: Target,
  kpi: ChartBar,
  report: ChartBar,
  user: User,
  'api-key': Shield,
  webhook: Shield
}

export default function AuditTrail() {
  const [auditLogs, setAuditLogs] = useKV<AuditLog[]>('audit-logs', [])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [filterAction, setFilterAction] = useState<string>('all')
  const [filterEntity, setFilterEntity] = useState<string>('all')
  const [filterUser, setFilterUser] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState<string>('7')

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await window.spark.user()
        if (user) {
          setCurrentUser(user)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }
    fetchUser()
  }, [])

  useEffect(() => {
    if (auditLogs && auditLogs.length === 0) {
      const sampleLogs: AuditLog[] = [
        {
          id: `log-${Date.now()}-1`,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          userId: 'user-1',
          userName: currentUser?.login || 'Admin User',
          action: 'created',
          entityType: 'strategy',
          entityId: 'strategy-1',
          entityName: 'Digital Transformation Strategy',
          details: 'Created new strategy card using SWOT framework',
          ipAddress: '192.168.1.100'
        },
        {
          id: `log-${Date.now()}-2`,
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          userId: 'user-1',
          userName: currentUser?.login || 'Admin User',
          action: 'updated',
          entityType: 'initiative',
          entityId: 'initiative-1',
          entityName: 'Cloud Migration Project',
          details: 'Updated initiative progress from 45% to 60%',
          changes: [
            { field: 'progress', oldValue: '45', newValue: '60' },
            { field: 'status', oldValue: 'on-track', newValue: 'on-track' }
          ],
          ipAddress: '192.168.1.100'
        },
        {
          id: `log-${Date.now()}-3`,
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          userId: 'user-2',
          userName: 'Manager',
          action: 'created',
          entityType: 'okr',
          entityId: 'okr-1',
          entityName: 'Q4 2024 Objectives',
          details: 'Created new OKR set for Q4',
          ipAddress: '192.168.1.101'
        },
        {
          id: `log-${Date.now()}-4`,
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          userId: 'user-1',
          userName: currentUser?.login || 'Admin User',
          action: 'exported',
          entityType: 'report',
          entityId: 'report-1',
          entityName: 'Executive Dashboard Report',
          details: 'Exported executive dashboard to CSV',
          ipAddress: '192.168.1.100'
        },
        {
          id: `log-${Date.now()}-5`,
          timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          userId: 'user-1',
          userName: currentUser?.login || 'Admin User',
          action: 'created',
          entityType: 'api-key',
          entityId: 'key-1',
          entityName: 'Production API Key',
          details: 'Generated new API key for production environment',
          ipAddress: '192.168.1.100'
        }
      ]
      setAuditLogs(sampleLogs)
    }
  }, [currentUser])

  const logAction = (
    action: AuditLog['action'],
    entityType: AuditLog['entityType'],
    entityId: string,
    entityName: string,
    details: string,
    changes?: AuditLog['changes']
  ) => {
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || 'system',
      userName: currentUser?.login || 'System',
      action,
      entityType,
      entityId,
      entityName,
      details,
      changes,
      ipAddress: '127.0.0.1'
    }
    
    setAuditLogs((current) => [log, ...(current || [])])
  }

  const filteredLogs = (auditLogs || []).filter((log) => {
    const matchesAction = filterAction === 'all' || log.action === filterAction
    const matchesEntity = filterEntity === 'all' || log.entityType === filterEntity
    const matchesUser = filterUser === 'all' || log.userId === filterUser
    const matchesSearch =
      searchQuery === '' ||
      log.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase())
    
    const daysAgo = parseInt(dateRange)
    const logDate = new Date(log.timestamp)
    const cutoffDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
    const matchesDate = dateRange === 'all' || logDate >= cutoffDate

    return matchesAction && matchesEntity && matchesUser && matchesSearch && matchesDate
  })

  const uniqueUsers = Array.from(new Set((auditLogs || []).map((log) => log.userName)))

  const activityStats = {
    total: filteredLogs.length,
    created: filteredLogs.filter((l) => l.action === 'created').length,
    updated: filteredLogs.filter((l) => l.action === 'updated').length,
    deleted: filteredLogs.filter((l) => l.action === 'deleted').length,
    viewed: filteredLogs.filter((l) => l.action === 'viewed').length
  }

  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'User', 'Action', 'Entity Type', 'Entity Name', 'Details', 'IP Address'],
      ...filteredLogs.map((log) => [
        new Date(log.timestamp).toLocaleString(),
        log.userName,
        log.action,
        log.entityType,
        log.entityName,
        log.details,
        log.ipAddress || 'N/A'
      ])
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${new Date().toISOString()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Audit log exported')
    
    logAction('exported', 'report', 'audit-log', 'Audit Trail Log', 'Exported audit trail to CSV')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const formatRelativeTime = (timestamp: string) => {
    const now = Date.now()
    const then = new Date(timestamp).getTime()
    const diff = now - then
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Audit Trail</h2>
          <p className="text-muted-foreground mt-2">
            Complete change history and activity tracking across the platform
          </p>
        </div>
        <Button onClick={exportLogs} className="gap-2">
          <Download size={16} weight="bold" />
          Export Logs
        </Button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityStats.total}</div>
            <p className="text-xs text-muted-foreground">in selected period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-600">Created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activityStats.created}</div>
            <p className="text-xs text-muted-foreground">new entities</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-600">Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{activityStats.updated}</div>
            <p className="text-xs text-muted-foreground">modifications</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-600">Deleted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{activityStats.deleted}</div>
            <p className="text-xs text-muted-foreground">removals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Viewed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{activityStats.viewed}</div>
            <p className="text-xs text-muted-foreground">accesses</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>Filter and search through all system activities</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <FunnelSimple size={20} weight="bold" className="text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <div className="relative flex-1 max-w-xs">
              <MagnifyingGlass
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search activities..."
                className="pl-9"
              />
            </div>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last 24 hours</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="updated">Updated</SelectItem>
                <SelectItem value="deleted">Deleted</SelectItem>
                <SelectItem value="viewed">Viewed</SelectItem>
                <SelectItem value="exported">Exported</SelectItem>
                <SelectItem value="shared">Shared</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterEntity} onValueChange={setFilterEntity}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="strategy">Strategy</SelectItem>
                <SelectItem value="initiative">Initiative</SelectItem>
                <SelectItem value="portfolio">Portfolio</SelectItem>
                <SelectItem value="okr">OKR</SelectItem>
                <SelectItem value="kpi">KPI</SelectItem>
                <SelectItem value="report">Report</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="api-key">API Key</SelectItem>
                <SelectItem value="webhook">Webhook</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="User" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {uniqueUsers.map((user) => (
                  <SelectItem key={user} value={user}>
                    {user}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(filterAction !== 'all' ||
              filterEntity !== 'all' ||
              filterUser !== 'all' ||
              searchQuery !== '' ||
              dateRange !== '7') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterAction('all')
                  setFilterEntity('all')
                  setFilterUser('all')
                  setSearchQuery('')
                  setDateRange('7')
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <ClockCounterClockwise size={48} className="text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No audit logs found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => {
                    const EntityIcon = entityIcons[log.entityType]
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs">
                          <div className="flex flex-col">
                            <span>{formatRelativeTime(log.timestamp)}</span>
                            <span className="text-muted-foreground">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {getInitials(log.userName)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{log.userName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${actionColors[log.action]} text-white`}>
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <EntityIcon size={16} className="text-muted-foreground" />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{log.entityName}</span>
                              <span className="text-xs text-muted-foreground">{log.entityType}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-md">
                            <p className="text-sm">{log.details}</p>
                            {log.changes && log.changes.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {log.changes.map((change, idx) => (
                                  <div key={idx} className="text-xs text-muted-foreground font-mono">
                                    {change.field}: <span className="text-red-500">{change.oldValue}</span> →{' '}
                                    <span className="text-green-500">{change.newValue}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {log.ipAddress || 'N/A'}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
