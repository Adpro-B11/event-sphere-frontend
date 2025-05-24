import axiosInstance from "@/lib/eventApi";
import type { Event } from "@/types/event";

const EventService = {
  // Create a new event
  createEvent: async (eventData: Event): Promise<Event> => {
    const response = await axiosInstance.post<Event>("/api/events", eventData);
    return response.data;
  },

  // Get all event
  getAllEvents: async (): Promise<Event> => {
    const response = await axiosInstance.get<Event>(`/api/events`);
    return response.data;
  },

  // Get an event by ID
  getEventById: async (eventId: string): Promise<Event> => {
    const response = await axiosInstance.get<Event>(`/api/events/${eventId}`);
    return response.data;
  },

  // Get all events for an organizer
  getEventsByOrganizer: async (organizer: string): Promise<Event[]> => {
    const response = await axiosInstance.get<Event[]>(`/api/events/organizer/${organizer}`);
    return response.data;
  },

  // Update event status
  updateEventStatus: async (eventId: string, status: string): Promise<Event> => {
    const response = await axiosInstance.patch<Event>(`/api/events/${eventId}/status`, { status });
    return response.data;
  },

  // Update event information
  updateEventInfo: async (id: string, data: Partial<Event>): Promise<Event> => {
    const response = await axiosInstance.put<Event>(`/api/events/${id}`, data);
    
    return response.data;
  },

  // Delete an event
  deleteEvent: async (eventId: string): Promise<void> => {
    await axiosInstance.delete(`/api/events/${eventId}`);
  },
};

export default EventService;