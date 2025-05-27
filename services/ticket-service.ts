import eventApiClient from "@/lib/eventApi";
import type {
  Ticket,
  CreateTicketRequest,
  UpdateTicketRequest,
  PurchaseRequest,
} from "@/types/ticket";
import axios from "axios";

const TicketService = {
  getTicketsByEvent: async (eventId: string): Promise<Ticket[]> => {
    const response = await eventApiClient.get<Ticket[]>(`/api/tickets/event/${eventId}`);
    return response.data;
  },

  getTicketById: async (ticketId: string): Promise<Ticket> => {
    const response = await eventApiClient.get<Ticket>(`/api/tickets/${ticketId}`);
    return response.data;
  },

  createTicket: async (ticketData: CreateTicketRequest): Promise<Ticket> => {
    const response = await eventApiClient.post<Ticket>(`/api/tickets`, ticketData);
    return response.data;
  },

  updateTicket: async (ticketId: string, updates: UpdateTicketRequest): Promise<Ticket> => {
    const response = await eventApiClient.put<Ticket>(`/api/tickets/${ticketId}`, updates);
    return response.data;
  },

  deleteTicket: async (ticketId: string): Promise<void> => {
    await eventApiClient.delete(`/api/tickets/${ticketId}`);
  },
  
  purchaseTickets: async (
    eventId: string,
    purchaseData: PurchaseRequest
  ): Promise<{ success: boolean; transactionId?: string; message?: string }> => {
    const jwt = localStorage.getItem('token'); 
    const response = await axios.post(
      `http://http://ec2-3-219-44-29.compute-1.amazonaws.com/api/transactions/purchase/${eventId}`,
      purchaseData,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
        // withCredentials: true, // Tambahkan jika backend juga perlu cookie
      }
    );
    return response.data;
  },

  checkUserTicketsForEvent: async (userId: string, eventId: string): Promise<boolean> => {
    try {
      const response = await eventApiClient.get<Ticket[]>(`/api/users/${userId}/tickets?eventId=${eventId}`);
      return response.data.length > 0;
    } catch (error) {
      console.error("Error in checkUserTicketsForEvent:", error);
      return false;
    }
  },
};

export default TicketService;