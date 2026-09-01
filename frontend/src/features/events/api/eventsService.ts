import { apiClient as api } from "../../../shared/api/apiClient";
import { Event, CreateEventDto } from "@clubmanager/types";

export const eventsService = {
  getEvents: async (): Promise<Event[]> => {
    const response = await api.get("/events");
    return response.data;
  },

  createEvent: async (data: CreateEventDto): Promise<Event> => {
    const response = await api.post("/events", data);
    return response.data;
  },

  updateEvent: async (id: number, data: Partial<CreateEventDto>): Promise<Event> => {
    const response = await api.put(/events/, data);
    return response.data;
  },

  deleteEvent: async (id: number): Promise<void> => {
    await api.delete(`/events/${id}`);
  },

  getEventById: async (id: number): Promise<Event> => {
    // If backend has no GET /events/:id endpoint, we can temporarily fetch all and filter, 
    // or we assume it will be implemented. For now, fetch all and filter as fallback.
    const response = await api.get("/events");
    return response.data.find((e: Event) => e.id === id);
  },

  registerToEvent: async (eventId: number, userId: number, payment_intent_id?: string): Promise<any> => {
    const response = await api.post("/events/register", { event_id: eventId, user_id: userId, payment_intent_id });
    return response.data;
  },

  createPaymentIntent: async (eventId: number): Promise<{ clientSecret: string; paymentIntentId: string }> => {
    const response = await api.post(`/events/${eventId}/create-payment-intent`);
    return response.data;
  },

  

  uploadEventImage: async (eventId: number, file: File): Promise<{ image_url: string }> => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await api.post(`/events/${eventId}/image`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
  }
};







