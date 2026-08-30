import type { EventRegistration, RegisterToEventDto } from '@clubmanager/types';
import type { IEventRepository } from '../../domain/repositories/IEventRepository.js';
import { EventEmailService } from '../services/EventEmailService.js';

export class RegisterToEventUseCase {
  private emailService: EventEmailService;

  constructor(private readonly eventRepository: IEventRepository) {
    this.emailService = new EventEmailService();
  }

  async execute(dto: RegisterToEventDto): Promise<EventRegistration> {
    if (!dto.event_id || !dto.user_id) {
      throw new Error('Validation error: event_id and user_id are required');
    }
    
    // Check if event exists
    const event = await this.eventRepository.getEventById(dto.event_id);
    if (!event) {
      throw new Error('Event not found');
    }

    // Grade bypass check
    if (event.min_grade_id !== null) {
      const userGradeId = await this.eventRepository.getUserGradeId(dto.user_id);
      if (!userGradeId || userGradeId < event.min_grade_id) {
        throw new Error('403: Vous n\'avez pas le grade requis pour cet évènement');
      }
    }

    // Check if user is already registered
    const existingRegistration = await this.eventRepository.getRegistration(dto.event_id, dto.user_id);
    if (existingRegistration) {
      throw new Error('409: User is already registered to this event');
    }

    // Capacity check
    if (event.capacity !== null) {
      const registrations = await this.eventRepository.listRegistrations(event.id);
      if (registrations.length >= event.capacity) {
        throw new Error('Event is full');
      }
    }

    // Save price snapshot
    const registrationData = {
      ...dto,
      price_paid: event.price
    };

    try {
      const result = await this.eventRepository.registerToEvent(registrationData);
      
      // Fetch user info for email
      const userInfo = await this.eventRepository.getUserBasicInfo(dto.user_id);
      if (userInfo && userInfo.email) {
        const eventDateStr = new Date(event.start_date).toLocaleString('fr-FR');
        // We don't await the email so it doesn't block the request response
        this.emailService.sendRegistrationConfirmation(userInfo.email, userInfo.first_name, event.title, eventDateStr).catch(err => console.error(err));
      }
      
      return result;
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('409: User is already registered to this event');
      }
      throw error;
    }
  }
}
