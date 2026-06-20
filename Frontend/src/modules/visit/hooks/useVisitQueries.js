import { useQuery } from '@tanstack/react-query';
import { visitService } from '../services/visitService';

export const useVisitHistory = () => {
  return useQuery({
    queryKey: ['visitHistory'],
    queryFn: visitService.getVisits,
  });
};
