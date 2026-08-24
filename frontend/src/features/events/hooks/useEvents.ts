import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eventsService } from "../api/eventsService";
import { CreateEventDto } from "@clubmanager/types";

export const useEvents = () => {
  const queryClient = useQueryClient();

  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ["events"],
    queryFn: eventsService.getEvents
  });

  const createEventMutation = useMutation({
    mutationFn: (data: CreateEventDto) => eventsService.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  const registerToEventMutation = useMutation({
    mutationFn: ({ eventId, userId }: { eventId: number, userId: number }) => 
      eventsService.registerToEvent(eventId, userId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["registration", variables.eventId, variables.userId] });
    },
  });

  const cancelRegistrationMutation = useMutation({
    mutationFn: ({ eventId, userId }: { eventId: number, userId: number }) => 
      eventsService.cancelRegistration(eventId, userId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["registration", variables.eventId, variables.userId] });
    },
  });

  const getEvent = (id?: number) => useQuery({
    queryKey: ["events", id],
    queryFn: () => id ? eventsService.getEventById(id) : null,
    enabled: !!id
  });

  const getRegistrationStatus = (eventId?: number, userId?: number) => useQuery({
    queryKey: ["registration", eventId, userId],
    queryFn: () => (eventId && userId) ? eventsService.getRegistrationStatus(eventId, userId) : null,
    enabled: !!eventId && !!userId
  });

  return {
    events,
    isLoading,
    error,
    createEvent: createEventMutation.mutateAsync,
    isCreating: createEventMutation.isPending,
    registerToEvent: registerToEventMutation.mutateAsync,
    isRegistering: registerToEventMutation.isPending,
    cancelRegistration: cancelRegistrationMutation.mutateAsync,
    isCanceling: cancelRegistrationMutation.isPending,
    getEvent,
    getRegistrationStatus,
  };
};
