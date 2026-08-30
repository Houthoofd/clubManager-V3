import { Event, EventRegistration, CreateEventDto, UpdateEventDto, RegisterToEventDto } from '@clubmanager/types';

export interface IEventRepository {
  createEvent(data: CreateEventDto): Promise<Event>;
  getEventById(id: number): Promise<Event | null>;
  listEvents(filters?: { from_date?: Date; to_date?: Date; visibility?: string }): Promise<Event[]>;
  updateEvent(id: number, data: UpdateEventDto): Promise<Event>;
  registerToEvent(data: RegisterToEventDto): Promise<EventRegistration>;
  getRegistration(eventId: number, userId: number): Promise<EventRegistration | null>;
  listRegistrations(eventId: number): Promise<EventRegistration[]>;
  getUserGradeId(userId: number): Promise<number | null>;
  getUserBasicInfo(userId: number): Promise<{ email: string; first_name: string } | null>;
  updateRegistrationStatus(registrationId: number, status: string, paymentStatus: string): Promise<void>;
}
