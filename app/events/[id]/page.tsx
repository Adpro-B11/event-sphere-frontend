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
import { CalendarDays, MapPin, User, DollarSign, Clock } from "lucide-react"

interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  price: number
  status: string
  organizer: string
}

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const eventId = params.id as string

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await EventService.getEventById(eventId)
        // setEvent(response.data)
        
        // Placeholder data for now
        setTimeout(() => {
          setEvent({
            id: eventId,
            title: "Tech Conference 2024",
            description: "Join us for an amazing tech conference featuring the latest innovations, networking opportunities, and expert speakers from around the world. This event will cover topics ranging from AI and machine learning to web development and cybersecurity.",
            date: "2024-12-25",
            location: "Jakarta Convention Center, Indonesia",
            price: 150.00,
            status: "PUBLISHED",
            organizer: "Tech Events Indonesia"
          })
          setIsLoading(false)
        }, 1000)
      } catch (err: any) {
        setError("Failed to load event details")
        setIsLoading(false)
      }
    }

    if (eventId) {
      fetchEvent()
    }
  }, [eventId])

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800'
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
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

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
          <p className="text-gray-600 mb-6">{error || "The event you're looking for doesn't exist."}</p>
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
      {/* Breadcrumb */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link href="/" className="text-gray-700 hover:text-gray-900">
              Home
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link href="/events" className="text-gray-700 hover:text-gray-900">
                Events
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-500 truncate max-w-xs">
                {event.title}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Event Image Placeholder */}
          <div className="relative h-64 md:h-80 bg-gray-200 rounded-lg mb-6 overflow-hidden">
            <Image
              src="/placeholder.svg?height=320&width=800"
              alt={event.title}
              fill
              className="object-cover"
            />
            <div className="absolute top-4 right-4">
              <Badge className={getStatusColor(event.status)}>
                {event.status}
              </Badge>
            </div>
          </div>

          {/* Event Details */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl md:text-3xl mb-2">
                    {event.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    Organized by {event.organizer}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                <div className="flex items-center text-gray-700">
                  <CalendarDays className="h-5 w-5 mr-3 text-gray-500" />
                  <span>{formatDate(event.date)}</span>
                  {eventFinished && (
                    <Badge variant="secondary" className="ml-2">
                      Event Finished
                    </Badge>
                  )}
                </div>
                <div className="flex items-center text-gray-700">
                  <MapPin className="h-5 w-5 mr-3 text-gray-500" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <DollarSign className="h-5 w-5 mr-3 text-gray-500" />
                  <span className="font-semibold">${event.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <User className="h-5 w-5 mr-3 text-gray-500" />
                  <span>{event.organizer}</span>
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <h3 className="text-lg font-semibold mb-3">About This Event</h3>
                <p className="text-gray-700 leading-relaxed">
                  {event.description}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-xl">Event Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Register/Buy Ticket Button */}
              {!eventFinished && event.status === 'PUBLISHED' && (
                <Button className="w-full" size="lg">
                  Register for ${event.price.toFixed(2)}
                </Button>
              )}

              {eventFinished && (
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => router.push(`/events/${eventId}/reviews`)}
                >
                  View Reviews & Rate Event
                </Button>
              )}

              {/* Share Button */}
              <Button variant="outline" className="w-full">
                Share Event
              </Button>

              {/* Report Button */}
              <Button variant="outline" className="w-full text-red-600 hover:bg-red-50">
                Report Event
              </Button>
            </CardContent>
            <CardFooter className="pt-0">
              <div className="w-full text-center text-sm text-gray-500">
                Event ID: {event.id}
              </div>
            </CardFooter>
          </Card>

          {/* Additional Info Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Event Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge className={getStatusColor(event.status)}>
                  {event.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price:</span>
                <span className="font-semibold">${event.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Organizer:</span>
                <span>{event.organizer}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}