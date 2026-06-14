import { useMutation, useQueryClient } from '@tanstack/react-query';
import { manufacturerService } from '@/services/manufacturer.service';
import { manufacturersKeys } from '@/lib/query-keys/manufacturers';
import { CreateManufacturerDto, UpdateManufacturerDto } from '@/types/api/manufacturer.types';

export const useUpdateManufacturerProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateManufacturerDto) => manufacturerService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturersKeys.profile() });
    },
  });
};

export const useCreateManufacturerProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateManufacturerDto) => manufacturerService.createProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturersKeys.profile() });
    },
  });
};
