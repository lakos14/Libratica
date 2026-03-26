import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartAPI } from '../services/api';
import { queryKeys } from '../lib/queryClient';
import { toast } from 'react-toastify';

export const useCart = () => {
  return useQuery({
    queryKey: queryKeys.cart,
    queryFn: async () => {
      const response = await cartAPI.getCart();
      return response.data;
    },
    staleTime: 30 * 1000,
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await cartAPI.addToCart(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      toast.success('Sikeresen hozzáadva a kosárhoz!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Hiba a kosárba helyezéskor');
    },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, data }) => {
      const response = await cartAPI.updateCartItem(itemId, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Hiba a kosár frissítésekor');
    },
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId) => {
      const response = await cartAPI.removeFromCart(itemId);
      return response.data;
    },
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cart });
      
      const previousCart = queryClient.getQueryData(queryKeys.cart);
      
      queryClient.setQueryData(queryKeys.cart, (old) => {
        if (!old || !old.items) return old;
        return {
          ...old,
          items: old.items.filter((item) => item.id !== itemId),
          totalAmount: old.items
            .filter((item) => item.id !== itemId)
            .reduce((sum, item) => sum + item.price * item.quantity, 0),
        };
      });
      
      return { previousCart };
    },
    onError: (error, itemId, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(queryKeys.cart, context.previousCart);
      }
      toast.error(error.response?.data?.message || 'Hiba a tétel törlésekor');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await cartAPI.clearCart();
      return response.data;
    },
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.cart, { items: [], totalAmount: 0 });
      toast.success('Kosár kiürítve!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Hiba a kosár kiürítésekor');
    },
  });
};
