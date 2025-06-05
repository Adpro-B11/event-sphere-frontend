"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Minus, Plus } from "lucide-react"
import type { Ticket } from "@/types/ticket"
import { TICKET_TYPES } from "./ticket-type-selector"

interface TicketPurchaseDialogProps {
  tickets: Ticket[]
  isOpen: boolean
  onClose: () => void
  onPurchase: (quantities: Record<string, number>) => Promise<void>
}

export default function TicketPurchaseDialog({ tickets, isOpen, onClose, onPurchase }: TicketPurchaseDialogProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)

  const availableTickets = tickets.filter((t) => t.remaining > 0 && t.active)

  const updateQuantity = (ticketId: string, change: number) => {
    const ticket = tickets.find((t) => t.id === ticketId)
    if (!ticket) return

    const currentQty = quantities[ticketId] || 0
    let newQty = Math.max(0, Math.min(ticket.remaining, currentQty + change))

    // For GROUP tickets, enforce minimum of 5 or 0
    if (ticket.type === "GROUP" && newQty > 0 && newQty < 5) {
      newQty = change > 0 ? 5 : 0
    }

    setQuantities((prev) => ({
      ...prev,
      [ticketId]: newQty,
    }))
  }

  const getTotalAmount = () => {
    return Object.entries(quantities).reduce((total, [ticketId, quantity]) => {
      const ticket = tickets.find((t) => t.id === ticketId)
      return total + (ticket ? ticket.price * quantity : 0)
    }, 0)
  }

  const getTotalTickets = () => {
    return Object.values(quantities).reduce((sum, qty) => sum + qty, 0)
  }

  const handlePurchase = async () => {
    try {
      setLoading(true)
      await onPurchase(quantities)
      setQuantities({})
      onClose()
    } catch (error) {
      console.error("Purchase failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getTicketTypeInfo = (type: string) => {
    return TICKET_TYPES.find((t) => t.value === type)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Purchase Tickets
          </DialogTitle>
          <DialogDescription>Select the quantity for each ticket type you want to purchase</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
          {availableTickets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tickets available for purchase</p>
            </div>
          ) : (
            availableTickets.map((ticket) => {
              const typeInfo = getTicketTypeInfo(ticket.type)
              const quantity = quantities[ticket.id] || 0

              return (
                <div key={ticket.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge className="text-xs">{typeInfo?.label || ticket.type}</Badge>
                      <span className="text-lg font-bold text-green-600">{formatPrice(ticket.price)}</span>
                      <span className="text-xs text-gray-500">{ticket.remaining} left</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(ticket.id, -1)}
                        disabled={quantity === 0}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <div className="w-16 text-center">
                        <Input
                          type="number"
                          min={ticket.type === "GROUP" ? "5" : "0"}
                          max={ticket.remaining}
                          value={quantity}
                          onChange={(e) => {
                            let newQty = Math.max(0, Math.min(ticket.remaining, Number(e.target.value) || 0))

                            // For GROUP tickets, enforce minimum of 5 or 0
                            if (ticket.type === "GROUP" && newQty > 0 && newQty < 5) {
                              newQty = 0
                            }

                            setQuantities((prev) => ({ ...prev, [ticket.id]: newQty }))
                          }}
                          className="text-center h-8"
                          placeholder={ticket.type === "GROUP" ? "Min 5" : "0"}
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(ticket.id, 1)}
                        disabled={quantity >= ticket.remaining}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    {quantity > 0 && (
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatPrice(ticket.price * quantity)}</p>
                      </div>
                    )}
                  </div>

                  {ticket.type === "GROUP" && quantity > 0 && quantity < 5 && (
                    <p className="text-xs text-red-600 mt-1">Group tickets require minimum 5 people</p>
                  )}
                </div>
              )
            })
          )}
        </div>

        {availableTickets.length > 0 && (
          <>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Total Tickets:</span>
                <span className="font-bold">{getTotalTickets()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Amount:</span>
                <span className="text-xl font-bold text-green-600">{formatPrice(getTotalAmount())}</span>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handlePurchase} disabled={getTotalTickets() === 0 || loading}>
                {loading
                  ? "Processing..."
                  : `Purchase ${getTotalTickets()} Ticket${getTotalTickets() !== 1 ? "s" : ""}`}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
