"use client";

import React, { useEffect, useState } from 'react';
import { Event, getEventById, deleteEvent, updateEventStatus } from '../../../lib/eventApi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);

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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    setDeleting(true);
    try {
      await deleteEvent(params.id);
      router.push('/events');
    } catch (err) {
      setError('Failed to delete event');
      console.error(err);
      setDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
        await updateEventStatus(params.id, newStatus);
        // Fetch the updated event data
        const updatedEvent = await getEventById(params.id);
        setEvent(updatedEvent);
    } catch (err) {
      setError(`Failed to update event status to ${newStatus}`);
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading event details...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (!event) return <div className="p-8 text-center">Event not found</div>;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Link href="/events" className="text-blue-600 hover:underline mb-6 inline-block">
        &larr; Back to events
      </Link>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold">{event.title}</h1>
          <span className={`text-sm px-3 py-1 rounded-full ${
            event.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 
            event.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 
            'bg-gray-100 text-gray-800'
          }`}>
            {event.status || 'DRAFT'}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          <div>
            <p className="text-xl mb-4">{formatDate(event.date)}</p>
            <p className="text-lg mb-2">📍 {event.location}</p>
            <p className="text-2xl font-semibold mb-4">{formatPrice(event.price)}</p>
            {event.organizer && (
              <p className="text-gray-600">Organized by: {event.organizer}</p>
            )}
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-line">{event.description || 'No description provided.'}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t">
          <Link href={`/events/${event.id}/edit`} className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
            Edit Event
          </Link>
          
          {event.status !== 'PUBLISHED' && (
            <button 
              onClick={() => handleStatusChange('PUBLISHED')}
              disabled={updating}
              className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {updating ? 'Updating...' : 'Activate Event'}
            </button>
          )}
          
          {event.status !== 'CANCELLED' && (
            <button 
              onClick={() => handleStatusChange('CANCELLED')}
              disabled={updating}
              className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50"
            >
              {updating ? 'Updating...' : 'Cancel Event'}
            </button>
          )}

          {event.status !== 'DRAFT' && (
            <button 
              onClick={() => handleStatusChange('DRAFT')}
              disabled={updating}
              className="bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              {updating ? 'Updating...' : 'Draft Event'}
            </button>
          )}
          
          <button 
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-100 text-red-800 py-2 px-4 rounded hover:bg-red-200 disabled:opacity-50 ml-auto"
          >
            {deleting ? 'Deleting...' : 'Delete Event'}
          </button>
        </div>
      </div>
    </div>
  );
}