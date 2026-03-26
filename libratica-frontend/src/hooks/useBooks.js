import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { booksAPI } from '../services/api';
import { queryKeys } from '../lib/queryClient';

export const useBooks = (params = {}) => {
  return useQuery({
    queryKey: [...queryKeys.books, params],
    queryFn: async () => {
      const response = await booksAPI.getAll(params);
      return response.data;
    },
  });
};

export const useBooksWithListings = (params = {}) => {
  return useQuery({
    queryKey: [...queryKeys.booksWithListings, params],
    queryFn: async () => {
      const response = await booksAPI.getWithAvailableListings(params);
      return response.data;
    },
  });
};

export const useBook = (id) => {
  return useQuery({
    queryKey: queryKeys.book(id),
    queryFn: async () => {
      const response = await booksAPI.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await booksAPI.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.books });
      queryClient.invalidateQueries({ queryKey: queryKeys.booksWithListings });
    },
  });
};

export const useUpdateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await booksAPI.update(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.book(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.books });
      queryClient.invalidateQueries({ queryKey: queryKeys.booksWithListings });
    },
  });
};

export const useDeleteBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await booksAPI.delete(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.books });
      queryClient.invalidateQueries({ queryKey: queryKeys.booksWithListings });
    },
  });
};
