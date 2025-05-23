"use client";

import React, { useEffect, useState } from 'react';
import { Event } from '../../lib/eventApi';
import axios from 'axios';
import Link from 'next/link';
import { EventCard } from './components/EventCard';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortOrder, setSortOrder] = useState('date-asc');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/events');
        //const response = await axios.get('http://ec2-35-174-243-167.compute-1.amazonaws.com/api/events');
        console.log('API response:', response.data);
        const eventsData = response.data || [];
        setEvents(eventsData);
        setFilteredEvents(eventsData);
      } catch (err) {
        setError('Failed to load events');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    let result = [...events];
    
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
          return (a.price || 0) - (b.price || 0);
        case 'price-desc':
          return (b.price || 0) - (a.price || 0);
        default:
          return 0;
      }
    });
    
    setFilteredEvents(result);
  }, [events, sortOrder, statusFilter]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  if (loading) return <div className="p-8 text-center">Loading events...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Upcoming Events</h1>
        <Link href="/events/create" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
          Create Event
        </Link>
      </div>
      
      {/* Filter and sorting controls */}
      <div className="mb-6 flex flex-wrap gap-4 items-center bg-gray-50 p-4 rounded-lg">
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <label htmlFor="sort-order" className="block text-sm font-medium text-gray-700 mb-1">
              Sort by
            </label>
            <select
              id="sort-order"
              value={sortOrder}
              onChange={handleSortChange}
              className="p-2 border rounded focus:ring-blue-500 focus:border-blue-500 min-w-[180px]"
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
              className="p-2 border rounded focus:ring-blue-500 focus:border-blue-500 min-w-[180px]"
            >
              <option value="all">All Events</option>
              <option value="PUBLISHED">Published only</option>
              <option value="DRAFT">Draft only</option>
              <option value="CANCELLED">Cancelled only</option>
            </select>
          </div>
        </div>
        
        <div className="ml-auto text-sm text-gray-500">
          {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
        </div>
      </div>
      
      {filteredEvents.length === 0 ? (
        <p className="text-center text-gray-500 my-8">No events found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}