import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/api/userApi';
import { toast } from '@/hooks/use-toast';
import { User, CreateUserData } from '@/types';

export const useUsers = (filters?: { search?: string; status?: string }) => {
  return useQuery<User[], Error>({
    queryKey: ['users', filters],
    queryFn: () => userApi.getUsers(), // TODO: Implement filtering in userApi
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUser = (id: string) => {
  return useQuery<User, Error>({
    queryKey: ['user', id],
    queryFn: () => userApi.getUserById(id),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation<User, Error, CreateUserData>({
    mutationFn: userApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Success",
        description: "User created successfully",
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

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation<User, Error, { id: string; updates: Partial<User> }>({
    mutationFn: ({ id, updates }) => userApi.updateUser(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
      toast({
        title: "Success",
        description: "User updated successfully",
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

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: userApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Success",
        description: "User deleted successfully",
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