"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import type { Event } from '@/types/event';
import EventService from '@/services/event-service';
import { EventCard } from './components/EventCard';

export default function EventsPage() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortOrder, setSortOrder] = useState('date-asc');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError('');
      try {
        const rawData: Event | Event[] | undefined | null = await EventService.getAllEvents();
        if (Array.isArray(rawData)) {
          setAllEvents(rawData);
        } else if (rawData) {
          setAllEvents([rawData as Event]);
        } else {
          setAllEvents([]);
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Please try again later.';
        setError(`Failed to load events: ${errorMessage}`);
        console.error(err);
        setAllEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filterAndSortEvents = useCallback(() => {
    let result = [...allEvents];

    if (statusFilter !== 'all') {
      result = result.filter(event => event.status === statusFilter);
    }

    result.sort((a, b) => {
      switch (sortOrder) {
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'price-asc':
          return (a.price ?? 0) - (b.price ?? 0);
        case 'price-desc':
          return (b.price ?? 0) - (a.price ?? 0);
        default:
          return 0;
      }
    });
    setFilteredEvents(result);
  }, [allEvents, sortOrder, statusFilter]);

  useEffect(() => {
    filterAndSortEvents();
  }, [filterAndSortEvents]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  if (loading) return <div className="p-8 text-center text-lg font-semibold">Loading events...</div>;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Upcoming Events</h1>
        <Link href="/events/create" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors duration-150">
          Create Event
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 text-center text-red-700 bg-red-100 rounded-lg border border-red-300">
          Error: {error}
        </div>
      )}
      
      <div className="mb-6 flex flex-col sm:flex-row flex-wrap gap-4 items-center bg-gray-50 p-4 rounded-lg shadow">
        <div className="flex flex-col xs:flex-row gap-4 w-full sm:w-auto">
          <div>
            <label htmlFor="sort-order" className="block text-sm font-medium text-gray-700 mb-1">
              Sort by
            </label>
            <select
              id="sort-order"
              value={sortOrder}
              onChange={handleSortChange}
              className="w-full sm:min-w-[180px] p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="date-asc">Date (Oldest first)</option>
              <option value="date-desc">Date (Newest first)</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="w-full sm:min-w-[180px] p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Events</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
        
        <div className="mt-2 sm:mt-0 sm:ml-auto text-sm text-gray-600">
          {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
        </div>
      </div>
      
      {!loading && !error && filteredEvents.length === 0 ? (
        <p className="text-center text-gray-500 my-8 text-lg">No events found matching your criteria.</p>
      ) : !error ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <EventCard key={event.id || `event-${Math.random()}`} event={event} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
