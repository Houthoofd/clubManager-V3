import type { EventVisibility, EventRegistrationStatus, EventPaymentStatus, Event, EventRegistration } from '../../domain/events/Event.types.js';

export interface CreateEventDto {
  title: string;
  description?: string;
  location?: string;
  start_date: Date;
  end_date: Date;
  capacity?: number;
  price?: number;
  visibility?: EventVisibility;
  min_grade_id?: number;
  image_url?: string;
}

export interface UpdateEventDto {
  title?: string;
  description?: string;
  location?: string;
  start_date?: Date;
  end_date?: Date;
  capacity?: number;
  price?: number;
  visibility?: EventVisibility;
  min_grade_id?: number;
  image_url?: string;
}

export interface RegisterToEventDto {
  event_id: number;
  user_id: number;
}
