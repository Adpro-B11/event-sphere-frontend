import React from 'react';
import { Event } from '../../../lib/eventApi';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { canManageEvent } from '@/utils/role-utils';

interface EventCardProps {
  event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { user } = useAuth();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
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
    <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
          <span className={`text-xs px-2 py-1 rounded-full ${
            event.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 
            event.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 
            'bg-gray-100 text-gray-800'
          }`}>
            {event.status || 'DRAFT'}
          </span>
        </div>
        
        <p className="text-gray-500 mb-3">{formatDate(event.date)}</p>
        <p className="text-gray-700 mb-2">📍 {event.location}</p>
        <p className="font-medium text-lg mb-4">{formatPrice(event.price)}</p>
        
        <div className="mt-4 flex justify-between">
          <Link href={`/events/${event.id}`} className="text-blue-600 hover:underline">
            View details
          </Link>
          {event.organizer && (
            <p className="text-sm text-gray-500">By: {event.organizer}</p>
          )}
        </div>
      </div>
    </div>
  );
};