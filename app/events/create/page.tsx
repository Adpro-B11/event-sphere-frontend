"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EventForm, EventFormValues } from "../../../components/EventForm";
import { Event, createEvent } from "../../../lib/eventApi";
import OrganizerRouteGuard from "@/components/OrganizerRouteGuard";
import { useAuth } from "@/contexts/auth-context";

export default function CreateEventPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateSuccess = (event: Event) => {
    router.push(`/events/${event.id}`);
  };

  const handleSubmit = async (values: EventFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    setError(null);
    try {
      // inject organizer dari context
      const payload: Event = {
        title:       values.title.trim(),
        description: values.description?.trim(),
        date:        values.date,
        location:    values.location.trim(),
        price:       values.price,
        organizer:   user.username,
      };
      const created = await createEvent(payload);
      handleCreateSuccess(created);
    } catch (err: any) {
      console.error("Error creating event:", err);
      setError(
        err.response?.data?.message || "Failed to create event. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OrganizerRouteGuard>
      <div className="container mx-auto py-8 px-4">
        <Link
          href="/events"
          className="text-blue-600 hover:underline mb-6 inline-block"
        >
          &larr; Back to events
        </Link>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold mb-6">Create New Event</h1>
          <EventForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            error={error}
          />
        </div>
      </div>
    </OrganizerRouteGuard>
  );
}
