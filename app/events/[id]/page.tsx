"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CalendarDays, MapPin, User, DollarSign, Clock, Star, MessageSquare } from "lucide-react"
import { Event } from "@/types/event"
import EventService from "@/services/event-service"

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
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
    if (!confirm('Are you sure you want to delete this event?')) return
    
    setDeleting(true)
    try {
      await EventService.deleteEvent(eventId)
      router.push('/events')
    } catch (err) {
      setError('Failed to delete event')
      console.error(err)
      setDeleting(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true)
    try {
      await EventService.updateEventStatus(eventId, newStatus)
      // Fetch the updated event data
      const updatedEvent = await EventService.getEventById(eventId)
      setEvent(updatedEvent)
    } catch (err) {
      setError(`Failed to update event status to ${newStatus}`)
      console.error(err)
    } finally {
      setUpdating(false)
    }
  }

  const isEventFinished = (eventDate: string) => {
    const today = new Date()
    const eventDateObj = new Date(eventDate)
    return eventDateObj < today
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{event.title}</h1>
            <div className="flex items-center gap-2">
              <Badge className={getStatusBadgeColor(event.status || 'DRAFT')}>
                {event.status || 'DRAFT'}
              </Badge>
              {eventFinished && (
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  Event Finished
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Event Image Placeholder */}
          <div className="mb-8">
            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Image 
                  src="/placeholder.svg" 
                  alt="Event placeholder" 
                  width={100} 
                  height={100} 
                  className="mx-auto mb-2 opacity-50"
                />
                <p>Event Image</p>
              </div>
            </div>
          </div>

          {/* Event Description */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>About This Event</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {event.description || 'No description provided.'}
              </p>
            </CardContent>
          </Card>

          {/* Reviews Section - Only show if event is finished */}
          {eventFinished && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Event Reviews
                </CardTitle>
                <CardDescription>
                  See what attendees thought about this event
                </CardDescription>
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
        <div className="lg:col-span-1">
          {/* Event Details Card */}
          <Card className="mb-6 sticky top-4">
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date */}
              <div className="flex items-start gap-3">
                <CalendarDays className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">Date & Time</p>
                  <p className="text-gray-600">{formatDate(event.date)}</p>
                </div>
              </div>

              <Separator />

              {/* Location */}
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-gray-600">{event.location}</p>
                </div>
              </div>

              <Separator />

              {/* Organizer */}
              {event.organizer && (
                <>
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Organizer</p>
                      <p className="text-gray-600">{event.organizer}</p>
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Price */}
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">Price</p>
                  <p className="text-2xl font-bold text-green-600">{formatPrice(event.price)}</p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-2">
              {event.status === 'PUBLISHED' && !eventFinished && (
                <Button className="w-full" size="lg">
                  Register for Event
                </Button>
              )}
              {event.status === 'CANCELLED' && (
                <Button className="w-full" variant="destructive" disabled>
                  Event Cancelled
                </Button>
              )}
              {eventFinished && (
                <Button className="w-full" variant="outline" disabled>
                  Event Ended
                </Button>
              )}
              {event.status === 'DRAFT' && (
                <Button className="w-full" variant="secondary" disabled>
                  Event Not Published
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Admin Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link 
                href={`/events/${event.id}/edit`} 
                className="w-full inline-block text-center bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              >
                Edit Event
              </Link>
              
              {event.status !== 'PUBLISHED' && (
                <button 
                  onClick={() => handleStatusChange('PUBLISHED')}
                  disabled={updating}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {updating ? 'Updating...' : 'Publish Event'}
                </button>
              )}
              
              {event.status !== 'CANCELLED' && (
                <button 
                  onClick={() => handleStatusChange('CANCELLED')}
                  disabled={updating}
                  className="w-full bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700 disabled:opacity-50 transition-colors"
                >
                  {updating ? 'Updating...' : 'Cancel Event'}
                </button>
              )}

              {event.status !== 'DRAFT' && (
                <button 
                  onClick={() => handleStatusChange('DRAFT')}
                  disabled={updating}
                  className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 disabled:opacity-50 transition-colors"
                >
                  {updating ? 'Updating...' : 'Draft Event'}
                </button>
              )}
              
              <button 
                onClick={handleDelete}
                disabled={deleting}
                className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleting ? 'Deleting...' : 'Delete Event'}
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}