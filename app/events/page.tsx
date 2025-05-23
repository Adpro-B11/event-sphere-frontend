"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, MapPin, DollarSign } from "lucide-react"

// Mock event data - replace with actual API call
const mockEvents = [
  {
    id: "evt_1",
    title: "Tech Conference 2024",
    description: "Join us for an amazing tech conference featuring the latest innovations and networking opportunities.",
    date: "2024-12-25",
    location: "Jakarta Convention Center",
    price: 150.00,
    status: "PUBLISHED"
  },
  {
    id: "evt_2", 
    title: "Digital Marketing Summit",
    description: "Learn the latest digital marketing strategies from industry experts and thought leaders.",
    date: "2024-11-15",
    location: "Bali International Convention Centre",
    price: 75.00,
    status: "PUBLISHED"
  },
  {
    id: "evt_3",
    title: "Startup Pitch Competition",
    description: "Watch innovative startups pitch their ideas to investors and win exciting prizes.",
    date: "2024-10-20",
    location: "Bandung Creative Hub",
    price: 25.00,
    status: "PUBLISHED"
  },
  {
    id: "evt_4",
    title: "AI & Machine Learning Workshop",
    description: "Hands-on workshop covering the fundamentals of AI and machine learning applications.",
    date: "2025-01-10",
    location: "Surabaya Tech Park",
    price: 200.00,
    status: "PUBLISHED"
  },
  {
    id: "evt_5",
    title: "Design Thinking Bootcamp",
    description: "Intensive bootcamp focusing on design thinking methodologies and creative problem solving.",
    date: "2025-02-14",
    location: "Yogyakarta Design Center",
    price: 125.00,
    status: "DRAFT"
  },
  {
    id: "evt_6",
    title: "Blockchain & Cryptocurrency Forum",
    description: "Explore the future of blockchain technology and cryptocurrency in this comprehensive forum.",
    date: "2025-03-18",
    location: "Medan Business District",
    price: 100.00,
    status: "PUBLISHED"
  }
]

export default function EventsPage() {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const isEventFinished = (eventDate: string) => {
    const today = new Date()
    const eventDateObj = new Date(eventDate)
    return eventDateObj < today
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Upcoming Events</h1>
        <p className="text-gray-600">Discover and join exciting events happening around you</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockEvents.map((event) => {
          const eventFinished = isEventFinished(event.date)
          
          return (
            <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
              {/* Event Image Placeholder */}
              <div className="relative h-48 bg-gradient-to-r from-gray-200 to-gray-300">
                <div className="absolute top-4 right-4">
                  <Badge className={getStatusColor(event.status)}>
                    {event.status}
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4">
                  <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg">
                    <div className="flex items-center text-sm font-medium text-gray-800">
                      <CalendarDays className="h-4 w-4 mr-2" />
                      {formatDate(event.date)}
                    </div>
                  </div>
                </div>
                {eventFinished && (
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary">Event Finished</Badge>
                  </div>
                )}
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="text-lg line-clamp-2">
                  {event.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="pb-4">
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {event.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center text-sm font-semibold text-gray-700">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span>${event.price.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-0">
                <Link href={`/events/${event.id}`} className="w-full">
                  <Button className="w-full">
                    View Details
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {mockEvents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <CalendarDays className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-500">Check back later for new events!</p>
        </div>
      )}

      {/* Load More Button (for future pagination) */}
      {mockEvents.length > 0 && (
        <div className="text-center mt-8">
          <Button variant="outline">
            Load More Events
          </Button>
        </div>
      )}
    </div>
  )
}