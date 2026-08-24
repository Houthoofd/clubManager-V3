export type EventVisibility = 'PUBLIC' | 'MEMBERS_ONLY' | 'SPECIFIC_GRADES';
export type EventRegistrationStatus = 'CONFIRMED' | 'WAITLIST' | 'CANCELLED';
export type EventPaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED';

export interface Event {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  start_date: Date;
  end_date: Date;
  capacity: number | null;
  price: number;
  visibility: EventVisibility;
  min_grade_id: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface EventRegistration {
  id: number;
  event_id: number;
  user_id: number;
  status: EventRegistrationStatus;
  payment_status: EventPaymentStatus;
  payment_id: number | null;
  price_paid: number | null;
  registered_at: Date;
  updated_at: Date;
}
