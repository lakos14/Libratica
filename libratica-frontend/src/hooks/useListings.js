import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listingsAPI, searchAPI } from '../services/api';
import { queryKeys } from '../lib/queryClient';

export const useListings = (params = {}) => {
  return useQuery({
    queryKey: [...queryKeys.listings, params],
    queryFn: async () => {
      const response = await searchAPI.searchListings(params);
      return response.data;
    },
  });
};

export const useListing = (id) => {
  return useQuery({
    queryKey: queryKeys.listing(id),
    queryFn: async () => {
      const response = await listingsAPI.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useMyListings = () => {
  return useQuery({
    queryKey: queryKeys.myListings,
    queryFn: async () => {
      const response = await listingsAPI.getMyListings();
      return response.data;
    },
  });
};

export const useCreateListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await listingsAPI.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings });
      queryClient.invalidateQueries({ queryKey: queryKeys.myListings });
    },
  });
};

export const useUpdateListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await listingsAPI.update(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listing(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.listings });
      queryClient.invalidateQueries({ queryKey: queryKeys.myListings });
    },
  });
};

export const useDeleteListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await listingsAPI.delete(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings });
      queryClient.invalidateQueries({ queryKey: queryKeys.myListings });
    },
  });
};
