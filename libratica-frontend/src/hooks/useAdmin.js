import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI, reportsAPI } from '../services/api';
import { queryKeys } from '../lib/queryClient';
import { toast } from 'react-toastify';

export const useAdminStats = () => {
  return useQuery({
    queryKey: queryKeys.adminStats,
    queryFn: async () => {
      const response = await adminAPI.getStats();
      return response.data;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });
};

export const useAdminUsers = () => {
  return useQuery({
    queryKey: queryKeys.adminUsers,
    queryFn: async () => {
      const response = await adminAPI.getAllUsers();
      return response.data;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });
};

export const useAdminListings = () => {
  return useQuery({
    queryKey: queryKeys.adminListings,
    queryFn: async () => {
      const response = await adminAPI.getAllListings();
      return response.data;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });
};

export const useAdminEvents = () => {
  return useQuery({
    queryKey: queryKeys.adminEvents,
    queryFn: async () => {
      const response = await adminAPI.getAllEvents();
      return response.data;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });
};

export const useReports = (status) => {
  return useQuery({
    queryKey: [...queryKeys.reports, status],
    queryFn: async () => {
      const response = await reportsAPI.getReports(status);
      return response.data;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });
};

export const useToggleUserActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await adminAPI.toggleUserActive(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers });
      toast.success('Felhasználó státusza megváltoztatva!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Hiba történt');
    },
  });
};

export const useToggleUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await adminAPI.toggleUserRole(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers });
      toast.success('Szerepkör megváltoztatva!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Hiba történt');
    },
  });
};

export const useAdminToggleListingAvailable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await adminAPI.toggleListingAvailable(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminListings });
      toast.success('Hirdetés státusza megváltoztatva!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Hiba történt');
    },
  });
};

export const useAdminDeleteListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await adminAPI.deleteListing(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminListings });
      toast.success('Hirdetés törölve!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Hiba történt');
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await adminAPI.createCategory(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      toast.success('Kategória létrehozva!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Hiba történt');
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await adminAPI.deleteCategory(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      toast.success('Kategória törölve!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Hiba történt');
    },
  });
};

export const useUpdateReportStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await reportsAPI.updateReportStatus(id, { status });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports });
      toast.success(variables.status === 'resolved' ? 'Report elfogadva!' : 'Report elvetve!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Hiba történt');
    },
  });
};

export const useUpdateEventStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await adminAPI.updateEventStatus(id, { status });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminEvents });
      queryClient.invalidateQueries({ queryKey: queryKeys.events });
      toast.success(variables.status === 'approved' ? 'Esemény jóváhagyva!' : 'Esemény elutasítva!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Hiba történt');
    },
  });
};

export const useAdminDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await adminAPI.deleteEvent(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminEvents });
      queryClient.invalidateQueries({ queryKey: queryKeys.events });
      toast.success('Esemény törölve!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Hiba történt');
    },
  });
};
