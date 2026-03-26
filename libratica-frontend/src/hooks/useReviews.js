import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsAPI } from '../services/api';
import { queryKeys } from '../lib/queryClient';
import { toast } from 'react-toastify';

export const useUserReviews = (userId) => {
  return useQuery({
    queryKey: queryKeys.userReviews(userId),
    queryFn: async () => {
      const response = await reviewsAPI.getUserReviews(userId);
      return response.data;
    },
    enabled: !!userId,
  });
};

export const useOrderReviews = (orderId) => {
  return useQuery({
    queryKey: queryKeys.orderReviews(orderId),
    queryFn: async () => {
      const response = await reviewsAPI.getOrderReviews(orderId);
      return response.data;
    },
    enabled: !!orderId,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await reviewsAPI.createReview(data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orderReviews(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.purchases });
      queryClient.invalidateQueries({ queryKey: queryKeys.sales });
      toast.success('Értékelés elküldve!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Hiba az értékelés elküldésekor');
    },
  });
};
