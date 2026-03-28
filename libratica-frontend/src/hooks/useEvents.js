import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsAPI } from '../services/api';
import { queryKeys } from '../lib/queryClient';
import { toast } from 'react-toastify';

export const useEvents = () => {
  return useQuery({
    queryKey: queryKeys.events,
    queryFn: async () => {
      const response = await eventsAPI.getAll();
      return response.data;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });
};

export const useEvent = (id) => {
  return useQuery({
    queryKey: queryKeys.event(id),
    queryFn: async () => {
      const response = await eventsAPI.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useMyEvents = () => {
  return useQuery({
    queryKey: queryKeys.myEvents,
    queryFn: async () => {
      const response = await eventsAPI.getMyEvents();
      return response.data;
    },
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await eventsAPI.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events });
      queryClient.invalidateQueries({ queryKey: queryKeys.myEvents });
      toast.success('Esemény létrehozva, admin jóváhagyásra vár!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Hiba történt');
    },
  });
};

export const useToggleEventAttend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId) => {
      const response = await eventsAPI.toggleAttend(eventId);
      return response.data;
    },
    onSuccess: (data, eventId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events });
      queryClient.invalidateQueries({ queryKey: queryKeys.event(eventId) });
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Hiba történt');
    },
  });
};

export const useAddEventComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, content }) => {
      const response = await eventsAPI.addComment(eventId, { content });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.event(variables.eventId) });
      toast.success('Komment elküldve!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Hiba történt');
    },
  });
};

export const useDeleteEventComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, commentId }) => {
      const response = await eventsAPI.deleteComment(eventId, commentId);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.event(variables.eventId) });
      toast.success('Komment törölve!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Hiba a törléskor');
    },
  });
};