import { RegisterToEventUseCase } from '../RegisterToEventUseCase.js';
import { IEventRepository } from '../../../domain/repositories/IEventRepository.js';
import { Event, EventRegistration, RegisterToEventDto } from '@clubmanager/types';

describe('RegisterToEventUseCase', () => {
  let useCase: RegisterToEventUseCase;
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
      getUserGradeId: jest.fn().mockResolvedValue(100),
      getUserBasicInfo: jest.fn().mockResolvedValue({ email: 'test@test.com', first_name: 'Test' }),
    };
    useCase = new RegisterToEventUseCase(mockRepository);
  });

  const validDto: RegisterToEventDto = {
    event_id: 1,
    user_id: 2,
  };

  it('should register a user to an event successfully', async () => {
    const mockEvent = { id: 1, capacity: null } as Event;
    const expectedRegistration = { id: 1, event_id: 1, user_id: 2 } as EventRegistration;

    mockRepository.getEventById.mockResolvedValue(mockEvent);
    mockRepository.getRegistration.mockResolvedValue(null);
    mockRepository.registerToEvent.mockResolvedValue(expectedRegistration);

    const result = await useCase.execute(validDto);

    expect(mockRepository.getEventById).toHaveBeenCalledWith(1);
    expect(mockRepository.getRegistration).toHaveBeenCalledWith(1, 2);
    expect(mockRepository.registerToEvent).toHaveBeenCalledWith(validDto);
    expect(result).toEqual(expectedRegistration);
  });

  it('should throw an error if validation fails', async () => {
    const invalidDto = { event_id: 1 } as RegisterToEventDto;

    await expect(useCase.execute(invalidDto)).rejects.toThrow('Validation error: event_id and user_id are required');
    expect(mockRepository.getEventById).not.toHaveBeenCalled();
  });

  it('should throw an error if event does not exist', async () => {
    mockRepository.getEventById.mockResolvedValue(null);

    await expect(useCase.execute(validDto)).rejects.toThrow('Event not found');
    expect(mockRepository.registerToEvent).not.toHaveBeenCalled();
  });

  it('should throw an error if user is already registered', async () => {
    const mockEvent = { id: 1, capacity: null } as Event;
    const existingRegistration = { id: 1 } as EventRegistration;

    mockRepository.getEventById.mockResolvedValue(mockEvent);
    mockRepository.getRegistration.mockResolvedValue(existingRegistration);

    await expect(useCase.execute(validDto)).rejects.toThrow('User is already registered to this event');
    expect(mockRepository.registerToEvent).not.toHaveBeenCalled();
  });

  it('should register successfully if capacity is not reached', async () => {
    const mockEvent = { id: 1, capacity: 5 } as Event;
    const mockRegistrations = [{ id: 1 }] as EventRegistration[];
    const expectedRegistration = { id: 1, event_id: 1, user_id: 2 } as EventRegistration;

    mockRepository.getEventById.mockResolvedValue(mockEvent);
    mockRepository.getRegistration.mockResolvedValue(null);
    mockRepository.listRegistrations.mockResolvedValue(mockRegistrations);
    mockRepository.registerToEvent.mockResolvedValue(expectedRegistration);

    const result = await useCase.execute(validDto);

    expect(mockRepository.listRegistrations).toHaveBeenCalledWith(1);
    expect(result).toEqual(expectedRegistration);
  });

  it('should throw an error if event capacity is reached', async () => {
    const mockEvent = { id: 1, capacity: 1 } as Event;
    const mockRegistrations = [{ id: 1 }] as EventRegistration[]; // 1 registration exists, capacity is 1

    mockRepository.getEventById.mockResolvedValue(mockEvent);
    mockRepository.getRegistration.mockResolvedValue(null);
    mockRepository.listRegistrations.mockResolvedValue(mockRegistrations);

    await expect(useCase.execute(validDto)).rejects.toThrow('Event is full');
    expect(mockRepository.registerToEvent).not.toHaveBeenCalled();
  });
});
