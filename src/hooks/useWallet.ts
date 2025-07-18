import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletApi } from '@/api/walletApi';
import { toast } from '@/hooks/use-toast';
import { Wallet, Transaction } from '@/types';

export const useWallet = (userId: string) => {
  return useQuery<Wallet | null, Error>({
    queryKey: ['wallet', userId],
    queryFn: () => walletApi.getWallet(userId),
    enabled: !!userId,
  });
};

export const useAddFunds = () => {
  const queryClient = useQueryClient();

  return useMutation<Wallet, Error, { userId: string; amount: number; description?: string }>({
    mutationFn: ({ userId, amount, description }) => walletApi.addFunds(userId, amount, description),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['wallet', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: "Success",
        description: "Funds added successfully",
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