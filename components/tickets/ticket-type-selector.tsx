"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TicketTypeSelectorProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
}

const TICKET_TYPES = [
  { value: "VIP", label: "VIP", description: "Full access with premium facilities" },
  { value: "REGULAR", label: "Regular", description: "Standard access to the event" },
  { value: "EARLY_BIRD", label: "Early Bird", description: "Regular ticket at a discounted price" },
  { value: "STUDENT", label: "Student", description: "Special ticket for students with a discount" },
  { value: "GROUP", label: "Group", description: "Ticket for groups with a minimum of 5 people" },
]

export default function TicketTypeSelector({
  value,
  onValueChange,
  placeholder = "Select ticket type",
}: TicketTypeSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {TICKET_TYPES.map((type) => (
          <SelectItem key={type.value} value={type.value}>
            <div className="flex flex-col">
              <span className="font-medium">{type.label}</span>
              <span className="text-xs text-gray-500">{type.description}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export { TICKET_TYPES }
