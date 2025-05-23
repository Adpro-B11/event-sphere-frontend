import axios from 'axios';

// Base URL for the API
const API_BASE_URL = "http://localhost:8080";
// const API_BASE_URL = 'http://ec2-35-174-243-167.compute-1.amazonaws.com';

// Event interface matching the Java backend model
export interface Event {
  id?: string;
  title: string;
  description?: string;
  date: string;
  location: string;
  price: number;
  status?: string;
  organizer?: string;
}

// Create a new event
export const createEvent = async (event: Event): Promise<Event> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/events`, event);
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Get an event by ID
export const getEventById = async (eventId: string): Promise<Event> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/events/${eventId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching event with ID ${eventId}:`, error);
    throw error;
  }
};

// Get all events for an organizer
export const getEventsByOrganizer = async (organizer: string): Promise<Event[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/events/organizer/${organizer}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching events for organizer ${organizer}:`, error);
    throw error;
  }
};

// Update event status
export const updateEventStatus = async (eventId: string, status: string): Promise<Event> => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/api/events/${eventId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating status for event ${eventId}:`, error);
    throw error;
  }
};

// Update event information
export const updateEventInfo = async (id: string, data: Partial<Event>): Promise<Event> => {
  try {
    const response = await axios.put(`http://localhost:8080/api/events/${id}`, data);
    
    // Jika server tidak mengembalikan data, ambil event lagi
    if (!response.data || !response.data.id) {
      const updatedEvent = await getEventById(id);
      return updatedEvent;
    }
    
    return response.data;
  } catch (error) {
    console.error("Update event error:", error);
    throw error;
  }
};

// Delete an event
export const deleteEvent = async (eventId: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/api/events/${eventId}`);
  } catch (error) {
    console.error(`Error deleting event ${eventId}:`, error);
    throw error;
  }
};