"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { canManageEvent } from "@/utils/role-utils"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CalendarDays, MapPin, User, DollarSign, MessageSquare, Star } from 'lucide-react'
import type { Event } from "@/types/event"
import EventService from "@/services/event-service"
import TicketManagement from "@/components/tickets/ticket-management"

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [updating, setUpdating] = useState(false)

  const eventId = params.id as string

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await EventService.getEventById(eventId)
        setEvent(data)
      } catch (err: any) {
        setError("Failed to load event details")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    if (eventId) {
      fetchEvent()
    }
  }, [eventId])

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event?")) return

    setDeleting(true)
    try {
      await EventService.deleteEvent(eventId)
      router.push("/events")
    } catch (err) {
      setError("Failed to delete event")
      console.error(err)
      setDeleting(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!user) return;
    setUpdating(true);
    try {
      const updatedEvent = await EventService.updateEventStatus(
        eventId,
        newStatus,
        user.username
      );
      // langsung update state biar badge dan tombol berubah
      setEvent(updatedEvent);
    } catch (err) {
      console.error("Failed to update status:", err);
      setError("Gagal mengubah status event");
    } finally {
      setUpdating(false);
    }
  };
  const isEventFinished = (eventDate: string) => {
    const today = new Date()
    const eventDateObj = new Date(eventDate)
    return eventDateObj < today
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-100 text-green-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      case "DRAFT":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
          <Link href="/events">
            <Button>Back to Events</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
          <Link href="/events">
            <Button>Back to Events</Button>
          </Link>
        </div>
      </div>
    )
  }

  const eventFinished = isEventFinished(event.date)
  const isAdmin = user?.role === "ADMIN"
  const isOrganizer = user?.role === "ORGANIZER"
  const canManageEvent = isAdmin || isOrganizer

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link href="/events">
          <Button variant="ghost" className="mb-4">
            ← Back to Events
          </Button>
        </Link>
      </div>

      {/* Event Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 break-words">{event.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getStatusBadgeColor(event.status || "DRAFT")}>{event.status || "DRAFT"}</Badge>
              {eventFinished && (
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  Event Finished
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 min-w-0">
          <div className="mb-8">
            <div className="w-full h-64 sm:h-80 lg:h-96 rounded-lg overflow-hidden">
              <Image 
                src="https://ticket.eventhk.com/image/cache/catalog/journal3/HOME-eventhk2015-5764x3000.jpg" 
                alt={`${event.title} event image`}
                width={1000}
                height={500}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          </div>

          {/* Event Description */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">About This Event</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm sm:text-base break-words">
                {event.description || "No description provided."}
              </p>
            </CardContent>
          </Card>

          {/* Reviews Section - Only show if event is finished */}
          {eventFinished && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Star className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                  Event Reviews
                </CardTitle>
                <CardDescription className="text-sm">See what attendees thought about this event</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <Link href={`/events/${eventId}/reviews`}>
                    <Button className="w-full sm:w-auto">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      View Reviews
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 min-w-0">
          {/* Event Details Card */}
          <Card className="mb-6 top-4">
            <CardHeader>
              <CardTitle className="text-lg">Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date */}
              <div className="flex items-start gap-3">
                <CalendarDays className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">Date & Time</p>
                  <p className="text-gray-600 text-sm break-words">{formatDate(event.date)}</p>
                </div>
              </div>

              <Separator />

              {/* Location */}
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">Location</p>
                  <p className="text-gray-600 text-sm break-words">{event.location}</p>
                </div>
              </div>

              <Separator />

              {/* Organizer */}
              {event.organizer && (
                <>
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm">Organizer</p>
                      <p className="text-gray-600 text-sm break-words">{event.organizer}</p>
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Price Range */}
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">Starting Price</p>
                  <p className="text-base font-bold text-green-600 break-all">{formatPrice(event.price)}</p>
                  <p className="text-xs text-gray-500">See tickets below for all pricing</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ticket Management - Replaces the simple registration button */}
          <div className="mb-6">
            <TicketManagement eventId={eventId} eventStatus={event.status || "DRAFT"} isEventFinished={eventFinished} />
          </div>

          {/* Admin Actions Card - Only show for admins/organizers */}
          {canManageEvent && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Admin Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link
                  href={`/events/${event.id}/edit`}
                  className="w-full inline-block text-center bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Edit Event
                </Link>

                {event.status !== "PUBLISHED" && (
                  <button
                    onClick={() => handleStatusChange("PUBLISHED")}
                    disabled={updating}
                    className="w-full bg-green-600 text-white py-2.5 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors text-sm font-medium"
                  >
                    {updating ? "Updating..." : "Publish Event"}
                  </button>
                )}

                {event.status !== "CANCELLED" && (
                  <button
                    onClick={() => handleStatusChange("CANCELLED")}
                    disabled={updating}
                    className="w-full bg-orange-600 text-white py-2.5 px-4 rounded-md hover:bg-orange-700 disabled:opacity-50 transition-colors text-sm font-medium"
                  >
                    {updating ? "Updating..." : "Cancel Event"}
                  </button>
                )}

                {event.status !== 'DRAFT' && (
                  <button 
                    onClick={() => handleStatusChange('DRAFT')}
                    disabled={updating}
                    className="w-full bg-gray-500 text-white py-2.5 px-4 rounded-md hover:bg-gray-600 disabled:opacity-50 transition-colors text-sm font-medium"
                  >
                    {updating ? 'Updating...' : 'Draft Event'}
                  </button>
                )}
                
                <button 
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full bg-red-600 text-white py-2.5 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors text-sm font-medium"
                >
                  {deleting ? 'Deleting...' : 'Delete Event'}
                </button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}