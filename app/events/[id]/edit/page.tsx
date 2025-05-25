"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EventForm } from '../../../../components/EventForm';
import EventService from "@/services/event-service"; // Gunakan EventService
import type { Event } from "@/lib/eventApi";
import { useAuth } from '@/contexts/auth-context';
import { canManageEvent } from '@/utils/role-utils';

export default function EditEventPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        console.log("Fetching event with ID:", params.id);
        const data = await EventService.getEventById(params.id);
        console.log("Event data received:", data);
        setEvent(data);
      } catch (err: any) {
        console.error("Error fetching event:", err);
        setError(err.message || 'Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [params.id]);

  // Check permissions
  useEffect(() => {
    if (event && user && !canManageEvent(user, event.organizer)) {
      router.push(`/events/${params.id}`);
      alert("You don't have permission to edit this event"); // Ganti dengan toast jika tersedia
    }
  }, [event, user, params.id, router]);

  // Handle form submission
  const handleSubmit = async (formValues: any) => {
    if (!event) return;
    
    setIsSaving(true);
    try {
      console.log("Updating event with data:", formValues);
      
      // Gabungkan data event yang ada dengan perubahan dari form
      const updatedEventData = {
        ...event,
        ...formValues,
        // Pastikan status dan organizer tidak berubah
        status: event.status,
        organizer: event.organizer
      };
      
      // Panggil API untuk update
      const updatedEvent = await EventService.updateEventInfo(params.id, updatedEventData);
      console.log("Update successful:", updatedEvent);
      
      // Redirect ke halaman detail
      router.push(`/events/${params.id}`);
      
    } catch (err: any) {
      console.error("Error updating event:", err);
      setError(err.message || 'Failed to update event');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading event details...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (!event) return <div className="p-8 text-center">Event not found</div>;

  return (
    <div className="container mx-auto py-8 px-4">
      <Link href={`/events/${params.id}`} className="text-blue-600 hover:underline mb-6 inline-block">
        &larr; Back to event details
      </Link>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6">Edit Event</h1>
        <EventForm 
          initialData={{
            title: event.title,
            description: event.description,
            date: event.date,
            location: event.location,
            price: event.price
          }}
          onSubmit={handleSubmit}
          isSubmitting={isSaving}
          error={error || null}
          isEditing={true}
          eventId={params.id}
        />
      </div>
    </div>
  );
}