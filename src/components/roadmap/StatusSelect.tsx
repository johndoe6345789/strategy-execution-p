import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { StatusType } from '@/types'

interface Props {
  value: StatusType | undefined
  onValueChange: (value: StatusType) => void
}

export function StatusSelect({ value, onValueChange }: Props) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="not-started">Not Started</SelectItem>
        <SelectItem value="on-track">On Track</SelectItem>
        <SelectItem value="at-risk">At Risk</SelectItem>
        <SelectItem value="blocked">Blocked</SelectItem>
        <SelectItem value="completed">Completed</SelectItem>
      </SelectContent>
    </Select>
  )
}
