import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { RoadmapMetric } from '@/types'

interface Props {
  metric: Partial<RoadmapMetric>
  onChange: (updates: Partial<RoadmapMetric>) => void
  idPrefix?: string
}

export function MetricForm({ metric, onChange, idPrefix = 'metric' }: Props) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}-name`}>Metric Name *</Label>
        <Input
          id={`${idPrefix}-name`}
          value={metric.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="e.g., Monthly Recurring Revenue"
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-baseline`}>Baseline</Label>
          <Input
            id={`${idPrefix}-baseline`}
            type="number"
            value={metric.baseline}
            onChange={(e) => onChange({ baseline: parseFloat(e.target.value) })}
            placeholder="0"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-current`}>Current Value</Label>
          <Input
            id={`${idPrefix}-current`}
            type="number"
            value={metric.current}
            onChange={(e) => onChange({ current: parseFloat(e.target.value) })}
            placeholder="0"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-target`}>Target</Label>
          <Input
            id={`${idPrefix}-target`}
            type="number"
            value={metric.target}
            onChange={(e) => onChange({ target: parseFloat(e.target.value) })}
            placeholder="0"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-unit`}>Unit *</Label>
          <Input
            id={`${idPrefix}-unit`}
            value={metric.unit}
            onChange={(e) => onChange({ unit: e.target.value })}
            placeholder="e.g., $, %, pts"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-frequency`}>Frequency</Label>
          <Select
            value={metric.frequency}
            onValueChange={(v) => onChange({ frequency: v as RoadmapMetric['frequency'] })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="annual">Annual</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-trend`}>Trend</Label>
          <Select
            value={metric.trend}
            onValueChange={(v) => onChange({ trend: v as RoadmapMetric['trend'] })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="improving">Improving</SelectItem>
              <SelectItem value="stable">Stable</SelectItem>
              <SelectItem value="declining">Declining</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
