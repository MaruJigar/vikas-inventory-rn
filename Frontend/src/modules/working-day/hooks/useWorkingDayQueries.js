import { useQuery } from '@tanstack/react-query';
import { workingDayService } from '../services/workingDayService';

export const useWorkingDayHistory = () => {
  return useQuery({
    queryKey: ['workingDayHistory'],
    queryFn: workingDayService.getHistory,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};
