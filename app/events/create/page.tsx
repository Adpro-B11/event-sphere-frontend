"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EventForm } from '../../../components/EventForm';
import { Event, createEvent } from '../../../lib/eventApi';
import OrganizerRouteGuard from '@/components/OrganizerRouteGuard';

export default function CreateEventPage() {
  const router = useRouter();

  const handleCreateSuccess = (event: Event) => {
    router.push(`/events/${event.id}`);
  };

  return (
    <OrganizerRouteGuard>
      <div className="container mx-auto py-8 px-4">
        <Link href="/events" className="text-blue-600 hover:underline mb-6 inline-block">
          &larr; Back to events
        </Link>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold mb-6">Create New Event</h1>
          <EventForm onSubmitSuccess={handleCreateSuccess} />
        </div>
      </div>
    </OrganizerRouteGuard>
  );
}