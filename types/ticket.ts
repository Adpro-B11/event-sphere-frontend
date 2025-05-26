export interface Ticket {
  id: string
  eventId: string
  type: "VIP" | "REGULAR" | "EARLY_BIRD" | "STUDENT" | "GROUP"
  price: number
  quota: number
  remaining: number
  active: boolean
}

export interface PurchaseRequest {
  userId: string
  amount: number
  eventId: string   
  ticketData: Record<string, string>
}

export interface CreateTicketRequest {
  eventId: string
  type: "VIP" | "REGULAR" | "EARLY_BIRD" | "STUDENT" | "GROUP"
  price: number
  quota: number
}

export interface UpdateTicketRequest {
  type?: "VIP" | "REGULAR" | "EARLY_BIRD" | "STUDENT" | "GROUP"
  price?: number
  quota?: number
}

export type TicketType = "VIP" | "REGULAR" | "EARLY_BIRD" | "STUDENT" | "GROUP"