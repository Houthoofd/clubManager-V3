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

  const updateEventMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<CreateEventDto> }) => eventsService.updateEvent(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["events", variables.id] });
    },
  });

  const registerToEventMutation = useMutation({
    mutationFn: ({ eventId, userId, paymentIntentId }: { eventId: number, userId: number, paymentIntentId?: string }) => 
      eventsService.registerToEvent(eventId, userId, paymentIntentId),
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

  const uploadEventImageMutation = useMutation({
    mutationFn: ({ eventId, file }: { eventId: number, file: File }) =>
      eventsService.uploadEventImage(eventId, file),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["events", variables.eventId] });
    }
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
    updateEvent: updateEventMutation.mutateAsync,
    isUpdating: updateEventMutation.isPending,
    registerToEvent: registerToEventMutation.mutateAsync,
    isRegistering: registerToEventMutation.isPending,
    cancelRegistration: cancelRegistrationMutation.mutateAsync,
    isCanceling: cancelRegistrationMutation.isPending,
    getEvent,
    getRegistrationStatus,
    uploadEventImage: uploadEventImageMutation.mutateAsync,
    isUploadingImage: uploadEventImageMutation.isPending,
  };
};
