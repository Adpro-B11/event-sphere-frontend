"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EventForm } from '../../../../components/EventForm';
import { Event, getEventById, updateEventInfo } from '../../../../lib/eventApi';

export default function EditEventPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await getEventById(params.id);
        setEvent(data);
      } catch (err) {
        setError('Failed to load event details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [params.id]);

  const handleUpdateSuccess = (event: Event) => {
    router.push(`/events/${event.id}`);
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
          initialData={event} 
          onSubmitSuccess={handleUpdateSuccess} 
          isEditing={true}
          eventId={params.id}
        />
      </div>
    </div>
  );
}