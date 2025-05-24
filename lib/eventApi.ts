import axios from "axios";

const API_URL = "http://localhost:8081";
// const API_URL = "http://ec2-35-174-243-167.compute-1.amazonaws.com";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized access. Redirecting to login.");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

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
    const response = await axios.post(`${API_URL}/api/events`, event);
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Get an event by ID
export const getEventById = async (eventId: string): Promise<Event> => {
  try {
    const response = await axios.get(`${API_URL}/api/events/${eventId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching event with ID ${eventId}:`, error);
    throw error;
  }
};

// Get all events for an organizer
export const getEventsByOrganizer = async (organizer: string): Promise<Event[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/events/organizer/${organizer}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching events for organizer ${organizer}:`, error);
    throw error;
  }
};

// Update event status
export const updateEventStatus = async (eventId: string, status: string): Promise<Event> => {
  try {
    const response = await axios.patch(`${API_URL}/api/events/${eventId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating status for event ${eventId}:`, error);
    throw error;
  }
};

// Update event information
export const updateEventInfo = async (id: string, data: Partial<Event>): Promise<Event> => {
  try {
    const response = await axios.put(`${API_URL}/api/events/${id}`, data);
    
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
    await axios.delete(`${API_URL}/api/events/${eventId}`);
  } catch (error) {
    console.error(`Error deleting event ${eventId}:`, error);
    throw error;
  }
};
