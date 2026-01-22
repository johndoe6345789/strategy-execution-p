import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { UserPlus, Shield, Users, CheckCircle, XCircle, Crown, User, Briefcase, Eye } from '@phosphor-icons/react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface UserRole {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'contributor' | 'viewer'
  departments: string[]
  status: 'active' | 'inactive'
  createdAt: string
  lastLogin?: string
}

interface RolePermission {
  module: string
  read: boolean
  write: boolean
  delete: boolean
  admin: boolean
}

interface RoleDefinition {
  role: 'admin' | 'manager' | 'contributor' | 'viewer'
  name: string
  description: string
  icon: React.ElementType
  color: string
  permissions: RolePermission[]
}

const modules = [
  'Strategy Cards',
  'Workbench',
  'Portfolios',
  'Initiatives',
  'OKRs',
  'KPIs',
  'Financial Tracking',
  'Reports',
  'X-Matrix',
  'Bowling Chart',
  'PDCA Cycles',
  'Countermeasures',
  'API & Webhooks',
  'User Management'
]

const roleDefinitions: RoleDefinition[] = [
  {
    role: 'admin',
    name: 'Administrator',
    description: 'Full system access with user management',
    icon: Crown,
    color: 'text-amber-500',
    permissions: modules.map(module => ({
      module,
      read: true,
      write: true,
      delete: true,
      admin: true
    }))
  },
  {
    role: 'manager',
    name: 'Manager',
    description: 'Can create and manage strategies and initiatives',
    icon: Briefcase,
    color: 'text-blue-500',
    permissions: modules.map(module => ({
      module,
      read: true,
      write: module !== 'User Management',
      delete: module !== 'User Management',
      admin: false
    }))
  },
  {
    role: 'contributor',
    name: 'Contributor',
    description: 'Can edit and update assigned items',
    icon: User,
    color: 'text-green-500',
    permissions: modules.map(module => ({
      module,
      read: true,
      write: !['User Management', 'API & Webhooks'].includes(module),
      delete: false,
      admin: false
    }))
  },
  {
    role: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to dashboards and reports',
    icon: Eye,
    color: 'text-gray-500',
    permissions: modules.map(module => ({
      module,
      read: true,
      write: false,
      delete: false,
      admin: false
    }))
  }
]

const departments = [
  'Executive',
  'Strategy',
  'Operations',
  'Finance',
  'IT',
  'HR',
  'Marketing',
  'Sales',
  'Product',
  'Engineering'
]

export default function RoleBasedAccess() {
  const [users, setUsers] = useKV<UserRole[]>('rbac-users', [])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'viewer' as const,
    departments: [] as string[]
  })

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await window.spark.user()
        if (!user) return
        
        setCurrentUser(user)
        
        const existingUser = users?.find(u => u.email === user.email)
        if (!existingUser) {
          const adminUser: UserRole = {
            id: `user-${Date.now()}`,
            name: user.login,
            email: user.email,
            role: 'admin',
            departments: ['Executive'],
            status: 'active',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
          }
          setUsers((current) => [...(current || []), adminUser])
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }
    fetchUser()
  }, [])

  const addUser = () => {
    if (!newUser.name.trim() || !newUser.email.trim()) {
      toast.error('Please fill in name and email')
      return
    }

    const user: UserRole = {
      id: `user-${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      departments: newUser.departments,
      status: 'active',
      createdAt: new Date().toISOString()
    }

    setUsers((current) => [...(current || []), user])
    setIsAddUserOpen(false)
    setNewUser({ name: '', email: '', role: 'viewer', departments: [] })
    toast.success('User added successfully')
  }

  const updateUserRole = (userId: string, newRole: 'admin' | 'manager' | 'contributor' | 'viewer') => {
    setUsers((current) =>
      (current || []).map(u => u.id === userId ? { ...u, role: newRole } : u)
    )
    toast.success('User role updated')
  }

  const toggleUserStatus = (userId: string) => {
    setUsers((current) =>
      (current || []).map(u =>
        u.id === userId
          ? { ...u, status: u.status === 'active' ? 'inactive' as const : 'active' as const }
          : u
      )
    )
    toast.success('User status updated')
  }

  const toggleDepartment = (dept: string) => {
    setNewUser((current) => ({
      ...current,
      departments: current.departments.includes(dept)
        ? current.departments.filter(d => d !== dept)
        : [...current.departments, dept]
    }))
  }

  const getRoleConfig = (role: string) => {
    return roleDefinitions.find(r => r.role === role) || roleDefinitions[3]
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Role-Based Access Control</h2>
        <p className="text-muted-foreground mt-2">
          Manage user permissions and access levels across the platform
        </p>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">Users & Roles</TabsTrigger>
          <TabsTrigger value="permissions">Role Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Users</h3>
              <p className="text-sm text-muted-foreground">
                Manage user accounts and role assignments
              </p>
            </div>
            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <UserPlus size={16} weight="bold" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>
                    Create a new user account and assign role and departments
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="user-name">Full Name</Label>
                    <Input
                      id="user-name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="user-email">Email</Label>
                    <Input
                      id="user-email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="john.doe@company.com"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="user-role">Role</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(value: any) => setNewUser({ ...newUser, role: value })}
                    >
                      <SelectTrigger id="user-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roleDefinitions.map((role) => (
                          <SelectItem key={role.role} value={role.role}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Departments</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto p-2 border rounded-md">
                      {departments.map((dept) => (
                        <div key={dept} className="flex items-center gap-2">
                          <Switch
                            checked={newUser.departments.includes(dept)}
                            onCheckedChange={() => toggleDepartment(dept)}
                          />
                          <span className="text-sm">{dept}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addUser}>Add User</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {(users || []).length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users size={48} className="text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    No users yet. Add your first user to get started.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Departments</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(users || []).map((user) => {
                      const roleConfig = getRoleConfig(user.role)
                      const RoleIcon = roleConfig.icon
                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-xs text-muted-foreground">{user.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <RoleIcon size={16} className={roleConfig.color} />
                              <Select
                                value={user.role}
                                onValueChange={(value: any) => updateUserRole(user.id, value)}
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {roleDefinitions.map((role) => (
                                    <SelectItem key={role.role} value={role.role}>
                                      {role.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {user.departments.map((dept) => (
                                <Badge key={dept} variant="outline" className="text-xs">
                                  {dept}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={user.status === 'active'}
                              onCheckedChange={() => toggleUserStatus(user.id)}
                            />
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {user.lastLogin
                              ? new Date(user.lastLogin).toLocaleDateString()
                              : 'Never'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                              {user.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </Card>
            )}
          </div>

          <div className="grid grid-cols-4 gap-4">
            {roleDefinitions.map((role) => {
              const Icon = role.icon
              const userCount = (users || []).filter(u => u.role === role.role).length
              return (
                <Card key={role.role}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Icon size={20} className={role.color} />
                      <CardTitle className="text-sm">{role.name}</CardTitle>
                    </div>
                    <CardDescription className="text-xs">{role.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userCount}</div>
                    <p className="text-xs text-muted-foreground">active users</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Role Permissions Matrix</CardTitle>
              <CardDescription>
                View and understand permissions for each role across all modules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Module</TableHead>
                      {roleDefinitions.map((role) => {
                        const Icon = role.icon
                        return (
                          <TableHead key={role.role} className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Icon size={16} className={role.color} />
                              <span>{role.name}</span>
                            </div>
                          </TableHead>
                        )
                      })}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modules.map((module) => (
                      <TableRow key={module}>
                        <TableCell className="font-medium">{module}</TableCell>
                        {roleDefinitions.map((role) => {
                          const perm = role.permissions.find(p => p.module === module)
                          return (
                            <TableCell key={role.role} className="text-center">
                              <div className="flex flex-col gap-1 items-center">
                                <div className="flex items-center gap-2">
                                  {perm?.read && (
                                    <Badge variant="outline" className="text-xs">
                                      Read
                                    </Badge>
                                  )}
                                  {perm?.write && (
                                    <Badge variant="outline" className="text-xs">
                                      Write
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {perm?.delete && (
                                    <Badge variant="outline" className="text-xs">
                                      Delete
                                    </Badge>
                                  )}
                                  {perm?.admin && (
                                    <Badge variant="default" className="text-xs">
                                      Admin
                                    </Badge>
                                  )}
                                </div>
                                {!perm?.read && !perm?.write && !perm?.delete && !perm?.admin && (
                                  <XCircle size={16} className="text-muted-foreground" />
                                )}
                              </div>
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {roleDefinitions.map((role) => {
              const Icon = role.icon
              return (
                <Card key={role.role}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon size={24} className={role.color} weight="bold" />
                      </div>
                      <div>
                        <CardTitle>{role.name}</CardTitle>
                        <CardDescription>{role.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-muted/50 rounded-md">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <CheckCircle size={16} className="text-green-500" weight="fill" />
                          <span className="text-sm font-medium">Read</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {role.permissions.filter(p => p.read).length} modules
                        </div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-md">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <CheckCircle size={16} className="text-blue-500" weight="fill" />
                          <span className="text-sm font-medium">Write</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {role.permissions.filter(p => p.write).length} modules
                        </div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-md">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <CheckCircle size={16} className="text-orange-500" weight="fill" />
                          <span className="text-sm font-medium">Delete</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {role.permissions.filter(p => p.delete).length} modules
                        </div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-md">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <Shield size={16} className="text-amber-500" weight="fill" />
                          <span className="text-sm font-medium">Admin</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {role.permissions.filter(p => p.admin).length} modules
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
