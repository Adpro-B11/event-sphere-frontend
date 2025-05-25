"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import ProtectedRoute from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { Role } from "@/types/auth"
import EventService from "@/services/event-service"
import type { Event } from "@/lib/eventApi"
import { CalendarIcon, MapPinIcon, TagIcon } from "lucide-react" 

export default function DashboardPage() {
  const { user } = useAuth()
  const [myEvents, setMyEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user?.username) return

      setIsLoading(true)
      try {
        const allEvents = (await EventService.getAllEvents()) as Event[]
        const filteredEvents = allEvents.filter(
          (event: Event) => event.organizer === user.username
        )

        setMyEvents(filteredEvents)
      } catch (err) {
        console.error("Failed to fetch events:", err)
        setError("Could not load your events. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [user?.username])

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-100 text-green-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      case "DRAFT":
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        {/* User info section - unchanged */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Welcome, {user?.username}!</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium text-gray-700">Role</h3>
              <p className="mt-2">{user?.role}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium text-gray-700">Email</h3>
              <p className="mt-2">{user?.email}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium text-gray-700">Balance</h3>
              <p className="mt-2">${user?.balance}</p>
            </div>
          </div>
        </div>

        {/* User events section - unchanged */}
        {user?.role === Role.USER && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">My Events</h2>
            <p className="text-gray-600">You haven't registered for any events yet.</p>
          </div>
        )}

        {/* UPDATED: Organizer events section */}
        {user?.role === Role.ORGANIZER && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">My Organized Events</h2>
              <Link
                href="/events/create"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Create New Event
              </Link>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-2 text-gray-600">Loading your events...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-700 p-4 rounded-md">{error}</div>
            ) : myEvents.length > 0 ? (
              <div className="space-y-4">
                {myEvents.map((event) => (
                  <div
                    key={event.id}
                    className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{event.title}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(
                            event.status
                          )}`}
                        >
                          {event.status || "DRAFT"}
                        </span>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center text-gray-600 text-sm">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {formatDate(event.date)}
                        </div>
                        <div className="flex items-center text-gray-600 text-sm">
                          <MapPinIcon className="w-4 h-4 mr-2" />
                          {event.location}
                        </div>
                        <div className="flex items-center text-gray-600 text-sm">
                          <TagIcon className="w-4 h-4 mr-2" />
                          {formatCurrency(event.price)}
                        </div>
                      </div>

                      <div className="flex space-x-2 mt-3">
                        <Link
                          href={`/events/${event.id}`}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100 text-sm"
                        >
                          View Details
                        </Link>
                        
                        <Link
                          href={`/events/${event.id}/edit`}
                          className="px-3 py-1 bg-gray-50 text-gray-700 rounded border border-gray-200 hover:bg-gray-100 text-sm"
                        >
                          Edit
                        </Link>
                        
                        {/* Status Action Buttons */}
                        <div className="flex-1 flex justify-end gap-1">
                          {event.status !== 'PUBLISHED' && (
                            <button
                              className="px-3 py-1 bg-green-50 text-green-700 rounded border border-green-200 hover:bg-green-100 text-sm"
                              onClick={async () => {
                                if (confirm("Are you sure you want to publish this event?")) {
                                  try {
                                    await EventService.updateEventStatus(event.id || "", "PUBLISHED", user.username);
                                    
                                    // Refresh events list after update
                                    const allEvents = await EventService.getAllEvents() as Event[];
                                    const filteredEvents = allEvents.filter(
                                      (e: Event) => e.organizer === user.username
                                    );
                                    setMyEvents(filteredEvents);
                                  } catch (err) {
                                    console.error("Failed to update status:", err);
                                    alert("Failed to update event status. Please try again.");
                                  }
                                }
                              }}
                            >
                              Publish
                            </button>
                          )}
                          
                          {event.status !== 'CANCELLED' && (
                            <button
                              className="px-3 py-1 bg-orange-50 text-orange-700 rounded border border-orange-200 hover:bg-orange-100 text-sm"
                              onClick={async () => {
                                if (confirm("Are you sure you want to cancel this event?")) {
                                  try {
                                    await EventService.updateEventStatus(event.id || "", "CANCELLED", user.username);
                                    
                                    // Refresh events list after update
                                    const allEvents = await EventService.getAllEvents() as Event[];
                                    const filteredEvents = allEvents.filter(
                                      (e: Event) => e.organizer === user.username
                                    );
                                    setMyEvents(filteredEvents);
                                  } catch (err) {
                                    console.error("Failed to update status:", err);
                                    alert("Failed to update event status. Please try again.");
                                  }
                                }
                              }}
                            >
                              Cancel
                            </button>
                          )}
                          
                          {event.status !== 'DRAFT' && (
                            <button
                              className="px-3 py-1 bg-gray-50 text-gray-700 rounded border border-gray-200 hover:bg-gray-100 text-sm"
                              onClick={async () => {
                                if (confirm("Are you sure you want to set this event as draft?")) {
                                  try {
                                    await EventService.updateEventStatus(event.id || "", "DRAFT", user.username);
                                    
                                    // Refresh events list after update
                                    const allEvents = await EventService.getAllEvents() as Event[];
                                    const filteredEvents = allEvents.filter(
                                      (e: Event) => e.organizer === user.username
                                    );
                                    setMyEvents(filteredEvents);
                                  } catch (err) {
                                    console.error("Failed to update status:", err);
                                    alert("Failed to update event status. Please try again.");
                                  }
                                }
                              }}
                            >
                              Draft
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Add Delete Button */}
                    <div className="mt-2">
                      <button
                        className="px-3 py-1 bg-red-50 text-red-700 rounded border border-red-200 hover:bg-red-100 text-sm w-full"
                        onClick={async () => {
                          if (confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
                            try {
                              await EventService.deleteEvent(event.id || "");
                              
                              // Refresh events list after deletion
                              const allEvents = await EventService.getAllEvents() as Event[];
                              const filteredEvents = allEvents.filter(
                                (e: Event) => e.organizer === user.username
                              );
                              setMyEvents(filteredEvents);
                            } catch (err) {
                              console.error("Failed to delete event:", err);
                              alert("Failed to delete event. Please try again.");
                            }
                          }
                        }}
                      >
                        Delete Event
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">You haven't created any events yet.</p>
                <Link href="/events/create" className="text-blue-600 hover:underline">
                  Get started by creating your first event
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Admin section - unchanged */}
        {user?.role === Role.ADMIN && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Admin Overview</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-700">Total Users</h3>
                <p className="mt-2 text-2xl font-bold">0</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-700">Total Events</h3>
                <p className="mt-2 text-2xl font-bold">0</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-700">Total Revenue</h3>
                <p className="mt-2 text-2xl font-bold">$0.00</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
