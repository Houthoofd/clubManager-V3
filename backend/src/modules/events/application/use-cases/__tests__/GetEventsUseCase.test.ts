import { GetEventsUseCase } from '../GetEventsUseCase.js';
import { IEventRepository } from '../../../domain/repositories/IEventRepository.js';
import { Event } from '@clubmanager/types';

describe('GetEventsUseCase', () => {
  let useCase: GetEventsUseCase;
  let mockRepository: jest.Mocked<IEventRepository>;

  beforeEach(() => {
    mockRepository = {
      createEvent: jest.fn(),
      getEventById: jest.fn(),
      listEvents: jest.fn(),
      updateEvent: jest.fn(),
      registerToEvent: jest.fn(),
      getRegistration: jest.fn(),
      listRegistrations: jest.fn(),
    };
    useCase = new GetEventsUseCase(mockRepository);
  });

  it('should list events without filters', async () => {
    const expectedEvents = [] as Event[];
    mockRepository.listEvents.mockResolvedValue(expectedEvents);

    const result = await useCase.execute();

    expect(mockRepository.listEvents).toHaveBeenCalledWith(undefined);
    expect(result).toEqual(expectedEvents);
  });

  it('should list events with filters', async () => {
    const expectedEvents = [] as Event[];
    const filters = { visibility: 'PUBLIC' };
    mockRepository.listEvents.mockResolvedValue(expectedEvents);

    const result = await useCase.execute(filters);

    expect(mockRepository.listEvents).toHaveBeenCalledWith(filters);
    expect(result).toEqual(expectedEvents);
  });
});
