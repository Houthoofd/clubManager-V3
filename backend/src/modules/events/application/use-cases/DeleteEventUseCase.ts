import type { IEventRepository } from '../../domain/repositories/IEventRepository.js';

export class DeleteEventUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(id: number): Promise<void> {
    const event = await this.eventRepository.getEventById(id);
    if (!event) {
      throw new Error('Not found error: Event not found');
    }
    await this.eventRepository.deleteEvent(id);
  }
}
