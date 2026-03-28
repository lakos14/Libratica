import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistAPI } from '../services/api';
import { queryKeys } from '../lib/queryClient';
import { toast } from 'react-toastify';

export const useWishlist = () => {
  return useQuery({
    queryKey: queryKeys.wishlist,
    queryFn: async () => {
      const response = await wishlistAPI.getWishlist();
      return response.data;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });
};

export const useWishlistCheck = (bookId) => {
  return useQuery({
    queryKey: queryKeys.wishlistCheck(bookId),
    queryFn: async () => {
      const response = await wishlistAPI.checkWishlist(bookId);
      return response.data;
    },
    enabled: !!bookId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });
};

export const useAddToWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookId) => {
      const response = await wishlistAPI.addToWishlist(bookId);
      return response.data;
    },
    onSuccess: (_, bookId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist });
      queryClient.setQueryData(queryKeys.wishlistCheck(bookId), { isInWishlist: true });
      toast.success('Hozzáadva a kívánságlistához!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Hiba történt');
    },
  });
};

export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookId) => {
      const response = await wishlistAPI.removeFromWishlist(bookId);
      return response.data;
    },
    onSuccess: async (_, bookId) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.wishlist });
      queryClient.setQueryData(queryKeys.wishlistCheck(bookId), { isInWishlist: false });
      toast.success('Eltávolítva a kívánságlistából!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Hiba az eltávolításkor');
    },
  });
};

export const useToggleWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookId) => {
      const checkResponse = await wishlistAPI.checkWishlist(bookId);
      const isInWishlist = checkResponse.data.isInWishlist;

      if (isInWishlist) {
        await wishlistAPI.removeFromWishlist(bookId);
        return { action: 'removed', bookId };
      } else {
        await wishlistAPI.addToWishlist(bookId);
        return { action: 'added', bookId };
      }
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.wishlist });
      queryClient.setQueryData(queryKeys.wishlistCheck(result.bookId), {
        isInWishlist: result.action === 'added',
      });
      toast.success(
        result.action === 'added'
          ? 'Hozzáadva a kívánságlistához!'
          : 'Eltávolítva a kívánságlistából!'
      );
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Hiba történt');
    },
  });
};