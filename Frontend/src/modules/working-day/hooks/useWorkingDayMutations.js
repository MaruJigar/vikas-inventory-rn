import { useMutation, useQueryClient } from '@tanstack/react-query';
import { workingDayService } from '../services/workingDayService';
import { Alert } from 'react-native';



export const useWorkingDayMutations = () => {
  const queryClient = useQueryClient();

  const checkInMutation = useMutation({
    mutationFn: async (coords) => {
      const payload = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        idempotency_key: coords.idempotencyKey,
      };
      return await workingDayService.checkIn(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['workingDayHistory']);
      queryClient.invalidateQueries(['dashboardAnalytics']);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to check in';
      Alert.alert('Check In Failed', message);
    }
  });

  const checkOutMutation = useMutation({
    mutationFn: async (coords) => {
      const payload = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        idempotency_key: coords.idempotencyKey,
      };
      return await workingDayService.checkOut(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['workingDayHistory']);
      queryClient.invalidateQueries(['dashboardAnalytics']);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to check out';
      Alert.alert('Check Out Failed', message);
    }
  });

  return { checkInMutation, checkOutMutation };
};
