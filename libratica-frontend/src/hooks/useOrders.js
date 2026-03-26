import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersAPI } from '../services/api';
import { queryKeys } from '../lib/queryClient';
import { toast } from 'react-toastify';
import api from '../services/api';

export const usePurchases = () => {
  return useQuery({
    queryKey: queryKeys.purchases,
    queryFn: async () => {
      const response = await ordersAPI.getPurchases();
      return response.data;
    },
  });
};

export const useSales = () => {
  return useQuery({
    queryKey: queryKeys.sales,
    queryFn: async () => {
      const response = await ordersAPI.getSales();
      return response.data;
    },
  });
};

export const useOrder = (id) => {
  return useQuery({
    queryKey: queryKeys.order(id),
    queryFn: async () => {
      const response = await ordersAPI.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCheckout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await ordersAPI.checkout(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      queryClient.invalidateQueries({ queryKey: queryKeys.purchases });
      queryClient.invalidateQueries({ queryKey: queryKeys.listings });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Hiba történt a rendelés leadásakor');
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }) => {
      const response = await api.put(`/orders/${orderId}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchases });
      queryClient.invalidateQueries({ queryKey: queryKeys.sales });
      toast.success('Státusz sikeresen frissítve!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Hiba a státusz frissítésekor');
    },
  });
};

export const useRejectOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId) => {
      const response = await api.post(`/orders/${orderId}/reject`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchases });
      queryClient.invalidateQueries({ queryKey: queryKeys.sales });
      toast.success('Rendelés sikeresen elutasítva!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Hiba a rendelés elutasításakor');
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId) => {
      const response = await ordersAPI.cancelOrder(orderId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchases });
      queryClient.invalidateQueries({ queryKey: queryKeys.sales });
      toast.success('Rendelés lemondva!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Hiba a rendelés lemondásakor');
    },
  });
};
