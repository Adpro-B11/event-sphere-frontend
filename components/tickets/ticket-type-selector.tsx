"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Users, Star, Clock, GraduationCap, Ticket } from "lucide-react"

interface TicketTypeSelectorProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  showDescriptions?: boolean
  className?: string
}

const TICKET_TYPES = [
  { 
    value: "VIP", 
    label: "VIP", 
    description: "Full access with premium facilities", 
    icon: Star,
    color: "bg-gradient-to-r from-yellow-400 to-orange-500",
    features: ["Premium seating", "Exclusive access", "Complimentary refreshments"]
  },
  { 
    value: "REGULAR", 
    label: "Regular", 
    description: "Standard access to the event", 
    icon: Ticket,
    color: "bg-gradient-to-r from-blue-500 to-blue-600",
    features: ["Standard seating", "Full event access"]
  },
  { 
    value: "EARLY_BIRD", 
    label: "Early Bird", 
    description: "Regular ticket at a discounted price", 
    icon: Clock,
    color: "bg-gradient-to-r from-green-500 to-emerald-600",
    features: ["Discounted price", "Standard access", "Limited time offer"],
    badge: "Save 20%"
  },
  { 
    value: "STUDENT", 
    label: "Student", 
    description: "Special ticket for students with a discount", 
    icon: GraduationCap,
    color: "bg-gradient-to-r from-purple-500 to-indigo-600",
    features: ["Student discount", "ID verification required"],
    badge: "Student Only"
  },
  { 
    value: "GROUP", 
    label: "Group", 
    description: "Ticket for groups with a minimum of 5 people", 
    icon: Users,
    color: "bg-gradient-to-r from-pink-500 to-rose-600",
    features: ["Group discount", "Minimum 5 people", "Bulk pricing"],
    badge: "Min 5 pax"
  },
]

export default function TicketTypeSelector({
  value,
  onValueChange,
  placeholder = "Select ticket type",
  disabled = false,
  showDescriptions = true,
  className = "",
}: TicketTypeSelectorProps) {
  const selectedType = TICKET_TYPES.find(type => type.value === value)

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={`min-h-[3rem] ${className}`}>
        <SelectValue placeholder={placeholder}>
          {selectedType && (
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedType.color}`}>
                <selectedType.icon className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{selectedType.label}</span>
                  {selectedType.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedType.badge}
                    </Badge>
                  )}
                </div>
                {showDescriptions && (
                  <span className="text-xs text-muted-foreground">
                    {selectedType.description}
                  </span>
                )}
              </div>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="w-full">
        {TICKET_TYPES.map((type) => {
          const IconComponent = type.icon
          return (
            <SelectItem 
              key={type.value} 
              value={type.value}
              className="min-h-[4rem] p-3 cursor-pointer hover:bg-accent transition-colors"
            >
              <div className="flex items-start gap-3 w-full">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${type.color} flex-shrink-0`}>
                  <IconComponent className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground">{type.label}</span>
                    {type.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {type.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {type.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {type.features.map((feature, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="text-xs px-2 py-0.5"
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}

export { TICKET_TYPES }