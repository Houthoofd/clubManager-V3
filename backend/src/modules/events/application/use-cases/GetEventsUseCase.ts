import { Event } from '@clubmanager/types';
import { IEventRepository } from '../../domain/repositories/IEventRepository.js';

export class GetEventsUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(filters?: { from_date?: Date; to_date?: Date; visibility?: string }): Promise<Event[]> {
    return this.eventRepository.listEvents(filters);
  }
}
