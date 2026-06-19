import { useMutation, useQueryClient } from '@tanstack/react-query';
import { visitService } from '../services/visitService';
import { Alert } from 'react-native';



export const useVisitMutations = () => {
  const queryClient = useQueryClient();

  const startVisitMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        shopId: data.shopId,
        latitude: data.latitude,
        longitude: data.longitude,
        idempotencyKey: data.idempotencyKey,
        startedAt: new Date().toISOString(),
      };
      return await visitService.startVisit(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['visitHistory']);
      queryClient.invalidateQueries(['dashboardAnalytics']);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to start visit';
      Alert.alert('Start Visit Error', message);
    }
  });

  const endVisitMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        visitId: data.visitId,
        latitude: data.latitude,
        longitude: data.longitude,
        idempotencyKey: data.idempotencyKey,
        endedAt: new Date().toISOString(),
      };
      return await visitService.endVisit(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['visitHistory']);
      queryClient.invalidateQueries(['dashboardAnalytics']);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to end visit';
      Alert.alert('End Visit Error', message);
    }
  });

  const noOrderVisitMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        visitId: data.visitId,
        reason: data.reason,
        note: data.note,
        latitude: data.latitude,
        longitude: data.longitude,
        idempotencyKey: data.idempotencyKey,
        endedAt: new Date().toISOString(),
      };
      return await visitService.noOrderVisit(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['visitHistory']);
      queryClient.invalidateQueries(['dashboardAnalytics']);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update visit';
      Alert.alert('No Order Visit Error', message);
    }
  });

  return { startVisitMutation, endVisitMutation, noOrderVisitMutation };
};
