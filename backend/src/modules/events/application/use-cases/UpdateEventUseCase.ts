import type { UpdateEventDto, Event } from '@clubmanager/types';
import type { IEventRepository } from '../../domain/repositories/IEventRepository.js';

export class UpdateEventUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(id: number, dto: UpdateEventDto): Promise<Event> {
    const event = await this.eventRepository.getEventById(id);
    if (!event) {
      throw new Error('Not found error: Event not found');
    }

    if (dto.start_date) dto.start_date = new Date(dto.start_date);
    if (dto.end_date) dto.end_date = new Date(dto.end_date);

    const startDate = dto.start_date || event.start_date;
    const endDate = dto.end_date || event.end_date;

    if (startDate >= endDate) {
      throw new Error('Validation error: end_date must be after start_date');
    }

    return this.eventRepository.updateEvent(id, dto);
  }
}
