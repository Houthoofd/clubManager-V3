import { CreateEventUseCase } from '../CreateEventUseCase.js';
import { IEventRepository } from '../../../domain/repositories/IEventRepository.js';
import { CreateEventDto, Event } from '@clubmanager/types';

describe('CreateEventUseCase', () => {
  let useCase: CreateEventUseCase;
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
    useCase = new CreateEventUseCase(mockRepository);
  });

  it('should create an event successfully with valid inputs', async () => {
    const dto: CreateEventDto = {
      title: 'Test Event',
      start_date: new Date('2026-09-01T10:00:00Z'),
      end_date: new Date('2026-09-01T12:00:00Z'),
    };
    const expectedEvent: Event = { ...dto, id: 1, created_at: new Date(), updated_at: new Date(), description: null, location: null, capacity: null, price: 0, visibility: 'MEMBERS_ONLY', min_grade_id: null };
    mockRepository.createEvent.mockResolvedValue(expectedEvent);

    const result = await useCase.execute(dto);

    expect(mockRepository.createEvent).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Test Event',
    }));
    expect(result).toEqual(expectedEvent);
  });

  it('should throw an error if validation fails (missing title)', async () => {
    const dto = {
      start_date: new Date('2026-09-01T10:00:00Z'),
      end_date: new Date('2026-09-01T12:00:00Z'),
    } as CreateEventDto;

    await expect(useCase.execute(dto)).rejects.toThrow('Validation error: title is required');
    expect(mockRepository.createEvent).not.toHaveBeenCalled();
  });

  it('should throw an error if start_date is after end_date', async () => {
    const dto: CreateEventDto = {
      title: 'Test Event',
      start_date: new Date('2026-09-02T10:00:00Z'),
      end_date: new Date('2026-09-01T12:00:00Z'),
    };

    await expect(useCase.execute(dto)).rejects.toThrow('Validation error: end_date must be after start_date');
    expect(mockRepository.createEvent).not.toHaveBeenCalled();
  });
});
