import type { CreateEventDto, Event } from '@clubmanager/types';
import type { IEventRepository } from '../../domain/repositories/IEventRepository.js';

export class CreateEventUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(dto: CreateEventDto): Promise<Event> {
    if (!dto.title) {
      throw new Error('Validation error: title is required');
    }

    dto.start_date = new Date(dto.start_date);
    dto.end_date = new Date(dto.end_date);

    if (dto.start_date >= dto.end_date) {
      throw new Error('Validation error: end_date must be after start_date');
    }
    return this.eventRepository.createEvent(dto);
  }
}
