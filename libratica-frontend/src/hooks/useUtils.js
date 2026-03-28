import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import { usersAPI, recommendationsAPI, bookCollectionAPI, aiAPI, reportsAPI } from '../services/api';
import { toast } from 'react-toastify';

export const useCategories = () => {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: async () => {
      const response = await fetch('http://localhost:5102/api/categories');
      return response.json();
    },
    staleTime: 30 * 60 * 1000,
  });
};

export const useUserProfile = (username) => {
  return useQuery({
    queryKey: queryKeys.userProfile(username),
    queryFn: async () => {
      const response = await usersAPI.getPublicProfile(username);
      return response.data;
    },
    enabled: !!username,
  });
};

export const useRecommendations = () => {
  return useQuery({
    queryKey: queryKeys.recommendations,
    queryFn: async () => {
      const response = await recommendationsAPI.getRecommendations();
      return response.data;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });
};

export const useBookCollection = () => {
  return useQuery({
    queryKey: queryKeys.bookCollection,
    queryFn: async () => {
      const response = await bookCollectionAPI.getCollection();
      return response.data;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });
};

export const useAddToCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await bookCollectionAPI.addToCollection(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookCollection });
      toast.success('Könyv hozzáadva a gyűjteményhez!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Hiba történt');
    },
  });
};

export const useRemoveFromCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await bookCollectionAPI.removeFromCollection(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookCollection });
      toast.success('Könyv eltávolítva a gyűjteményből!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Hiba az eltávolításkor');
    },
  });
};

export const useAISearch = () => {
  return useMutation({
    mutationFn: async (query) => {
      const response = await aiAPI.search(query);
      return response.data;
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Hiba a keresés során');
    },
  });
};

export const useCreateReport = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await reportsAPI.createReport(data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Jelentés elküldve, köszönjük!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Hiba a jelentés elküldésekor');
    },
  });
};
