"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Ticket, Plus, Edit, Trash2, ShoppingCart } from 'lucide-react'
import type { Ticket as TicketType, CreateTicketRequest, UpdateTicketRequest } from "@/types/ticket"
import TicketService from "@/services/ticket-service"
import { useAuth } from "@/contexts/auth-context"
import TicketTypeSelector, { TICKET_TYPES } from "./ticket-type-selector"
import TicketPurchaseDialog from "./ticket-purchase-dialog"
import { useRouter } from "next/navigation";

interface TicketManagementProps {
  eventId: string
  eventStatus: string
  isEventFinished: boolean
}

export default function TicketManagement({ eventId, eventStatus, isEventFinished }: TicketManagementProps) {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<TicketType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null)
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false)
  const [purchaseQuantities, setPurchaseQuantities] = useState<Record<string, number>>({})
  const router = useRouter();

  // Form states
  const [createForm, setCreateForm] = useState<CreateTicketRequest>({
    eventId,
    type: "REGULAR",
    price: 0,
    quota: 1,
  })
  const [editForm, setEditForm] = useState<UpdateTicketRequest>({})

  const isAdmin = user?.role === "ADMIN"
  const isOrganizer = user?.role === "ORGANIZER"
  const canManageTickets = isAdmin || isOrganizer

  useEffect(() => {
    fetchTickets()
  }, [eventId])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await TicketService.getTicketsByEvent(eventId)
      setTickets(data)
    } catch (err: any) {
      setError(err.message || "Failed to load tickets")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTicket = async () => {
    try {
      await TicketService.createTicket(createForm)
      setCreateDialogOpen(false)
      setCreateForm({ eventId, type: "REGULAR", price: 0, quota: 1 })
      fetchTickets()
    } catch (err: any) {
      setError(err.message || "Failed to create ticket")
      console.error(err)
    }
  }

  const handleUpdateTicket = async () => {
    if (!selectedTicket) return
    try {
      await TicketService.updateTicket(selectedTicket.id, editForm)
      setEditDialogOpen(false)
      setSelectedTicket(null)
      setEditForm({})
      fetchTickets()
    } catch (err: any) {
      setError(err.message || "Failed to update ticket")
      console.error(err)
    }
  }

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm("Are you sure you want to delete this ticket?")) return
    try {
      await TicketService.deleteTicket(ticketId)
      fetchTickets()
    } catch (err: any) {
      setError(err.message || "Failed to delete ticket")
      console.error(err)
    }
  }

const handlePurchaseClick = () => {
  if (!user) {
    router.push("/login");
  } else {
    setPurchaseDialogOpen(true);
  }
};

  const handlePurchase = async (purchaseQuantities: Record<string, number>) => {
    try {
      const ticketData: Record<string, string> = {}
      let totalAmount = 0

      Object.entries(purchaseQuantities).forEach(([ticketId, quantity]) => {
        if (quantity > 0) {
          const ticket = tickets.find((t) => t.id === ticketId)
          if (ticket) {
            ticketData[ticket.type] = quantity.toString()
            totalAmount += ticket.price * quantity
          }
        }
      })

      if (Object.keys(ticketData).length === 0) {
        throw new Error("Please select at least one ticket")
      }

      const purchaseRequest = {
        userId: user?.id || "",
        amount: totalAmount,
        eventId: eventId,
        ticketData,
      }

      const result = await TicketService.purchaseTickets(eventId, purchaseRequest)
      if (result.success) {
        fetchTickets()
        alert("Purchase successful! Transaction ID: " + result.transactionId)
      }
    } catch (err: any) {
      setError(err.message || "Failed to process purchase")
      throw err
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getTicketTypeColor = (type: string) => {
    switch (type) {
      case "VIP":
        return "bg-purple-100 text-purple-800"
      case "EARLY_BIRD":
        return "bg-blue-100 text-blue-800"
      case "STUDENT":
        return "bg-green-100 text-green-800"
      case "GROUP":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const canSeebuttonPurchase = eventStatus === "PUBLISHED" && !isEventFinished

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Event Tickets
            </CardTitle>
            <CardDescription>
              {tickets.length === 0 ? "No tickets available" : `${tickets.length} ticket type(s) available`}
            </CardDescription>
          </div>
          {canManageTickets && (
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Ticket
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Ticket</DialogTitle>
                  <DialogDescription>Add a new ticket type for this event</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="type">Ticket Type</Label>
                    <TicketTypeSelector
                      value={createForm.type}
                      onValueChange={(value: any) => setCreateForm({ ...createForm, type: value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="price">Price (IDR)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={createForm.price}
                      onChange={(e) => setCreateForm({ ...createForm, price: Number(e.target.value) })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="quota">Quota</Label>
                    <Input
                      id="quota"
                      type="number"
                      value={createForm.quota}
                      onChange={(e) => setCreateForm({ ...createForm, quota: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateTicket}>Create Ticket</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {tickets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No tickets available for this event</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="border rounded-lg p-4 lg:p-6 bg-white shadow-sm">
                <div className="flex flex-col gap-4">
                  {/* Header section with badges and admin controls */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge className={getTicketTypeColor(ticket.type)}>
                          {TICKET_TYPES.find((t) => t.value === ticket.type)?.label || ticket.type}
                        </Badge>
                        {!ticket.active && (
                          <Badge variant="outline" className="text-red-600 border-red-600">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {TICKET_TYPES.find((t) => t.value === ticket.type)?.description}
                      </p>
                    </div>
                    {canManageTickets && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 w-9 p-0"
                          onClick={() => {
                            setSelectedTicket(ticket)
                            setEditForm({
                              type: ticket.type,
                              price: ticket.price,
                              quota: ticket.quota,
                            })
                            setEditDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" 
                          onClick={() => handleDeleteTicket(ticket.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Ticket details section - two rows to prevent overlap */}
                  <div className="space-y-4">
                    {/* First row: Price and Total Quota */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">Price</p>
                        <p className="text-lg font-bold text-green-600">{formatPrice(ticket.price)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">Total Quota</p>
                        <p className="text-lg font-semibold text-gray-900">{ticket.quota}</p>
                      </div>
                    </div>
                    
                    {/* Second row: Remaining and Sold */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">Remaining</p>
                        <p className={`text-lg font-semibold ${ticket.remaining === 0 ? "text-red-600" : "text-gray-900"}`}>
                          {ticket.remaining}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">Sold</p>
                        <p className="text-lg font-semibold text-blue-600">{ticket.quota - ticket.remaining}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {canSeebuttonPurchase && tickets.some((t) => t.remaining > 0 && t.active) && (
        <CardFooter className="flex flex-col gap-2 items-center">
          <Button className="w-full" size="lg" onClick={handlePurchaseClick}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Purchase Tickets
          </Button>

          {!user && (
            <p className="text-sm text-gray-500">
              You must log in to purchase
            </p>
          )}

          {user && (
            <TicketPurchaseDialog
              tickets={tickets}
              isOpen={purchaseDialogOpen}
              onClose={() => setPurchaseDialogOpen(false)}
              onPurchase={handlePurchase}
            />
          )}
        </CardFooter>
      )}

      {isEventFinished && (
        <CardFooter className="flex flex-col gap-2 items-center">
          <p className="text-sm text-gray-500">
              The Event is Finished
          </p>
        </CardFooter>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Ticket</DialogTitle>
            <DialogDescription>Update ticket information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-type">Ticket Type</Label>
              <TicketTypeSelector
                value={editForm.type || ""}
                onValueChange={(value: any) => setEditForm({ ...editForm, type: value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-price">Price (IDR)</Label>
              <Input
                id="edit-price"
                type="number"
                value={editForm.price || 0}
                onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-quota">Quota</Label>
              <Input
                id="edit-quota"
                type="number"
                value={editForm.quota || 0}
                onChange={(e) => setEditForm({ ...editForm, quota: Number(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateTicket}>Update Ticket</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}