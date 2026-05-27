import type { StatusType, PriorityType } from '@/types'

export const statusColors: Record<StatusType, string> = {
  'not-started': 'bg-muted text-muted-foreground',
  'on-track':    'bg-success/10 text-success border-success/30',
  'at-risk':     'bg-warning/10 text-warning border-warning/30',
  'blocked':     'bg-destructive/10 text-destructive border-destructive/30',
  'completed':   'bg-primary/10 text-primary border-primary/30'
}

export const statusColorsBg: Record<StatusType, string> = {
  'not-started': 'bg-muted',
  'on-track':    'bg-success',
  'at-risk':     'bg-warning',
  'blocked':     'bg-destructive',
  'completed':   'bg-primary'
}

export const priorityColors: Record<PriorityType, string> = {
  'critical': 'bg-destructive/10 text-destructive border-destructive/30',
  'high':     'bg-warning/10 text-warning border-warning/30',
  'medium':   'bg-primary/10 text-primary border-primary/30',
  'low':      'bg-muted text-muted-foreground border-muted'
}

export const priorityBorders: Record<PriorityType, string> = {
  'critical': 'border-destructive',
  'high':     'border-warning',
  'medium':   'border-primary',
  'low':      'border-muted-foreground'
}

export const categoryColors: Record<'breakthrough' | 'annual' | 'improvement', string> = {
  breakthrough: 'bg-accent/10 text-accent border-accent/30',
  annual:       'bg-primary/10 text-primary border-primary/30',
  improvement:  'bg-success/10 text-success border-success/30'
}

export const countermeasureStatusColors: Record<'open' | 'in-progress' | 'completed', string> = {
  'open':        'bg-muted text-muted-foreground',
  'in-progress': 'bg-primary/10 text-primary border-primary/30',
  'completed':   'bg-success/10 text-success border-success/30'
}

export const bowlingStatusColors: Record<'green' | 'yellow' | 'red' | 'not-started', string> = {
  green:         'bg-success',
  yellow:        'bg-warning',
  red:           'bg-destructive',
  'not-started': 'bg-muted'
}

export const bowlingStatusLabels: Record<'green' | 'yellow' | 'red' | 'not-started', string> = {
  green:         'On Track',
  yellow:        'At Risk',
  red:           'Off Track',
  'not-started': 'Not Started'
}

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const

export const EMPTY_METRIC = {
  name: '',
  baseline: 0,
  current: 0,
  target: 0,
  unit: '',
  frequency: 'monthly' as const,
  trend: 'stable' as const
}
