import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceApi } from '@/api/serviceApi';
import { toast } from '@/hooks/use-toast';
import { Service, CreateServiceData } from '@/types';

export const useServices = () => {
  return useQuery<Service[], Error>({
    queryKey: ['services'],
    queryFn: serviceApi.getServices,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useService = (id: string) => {
  return useQuery<Service, Error>({
    queryKey: ['service', id],
    queryFn: () => serviceApi.getServiceById(id),
    enabled: !!id,
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();

  return useMutation<Service, Error, CreateServiceData>({
    mutationFn: serviceApi.createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast({
        title: "Success",
        description: "Service created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation<Service, Error, { id: string; updates: Partial<Service> }>({
    mutationFn: ({ id, updates }) => serviceApi.updateService(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['service', variables.id] });
      toast({
        title: "Success",
        description: "Service updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: serviceApi.deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast({
        title: "Success",
        description: "Service deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};