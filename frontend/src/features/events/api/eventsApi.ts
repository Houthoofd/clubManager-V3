import { apiClient as api } from '../../../shared/api/apiClient';
import { UpdateEventDto, Event } from '@clubmanager/types';

export const updateEvent = async (id: number, data: UpdateEventDto): Promise<Event> => {
  const response = await api.put(`/events/${id}`, data);
  return response.data;
};

export const deleteEvent = async (id: number): Promise<void> => {
  await api.delete(`/events/${id}`);
};

