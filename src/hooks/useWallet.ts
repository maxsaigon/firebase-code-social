import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addFundApi } from '@/api/addFundApi';
import { toast } from '@/hooks/use-toast';
import { Wallet, Transaction } from '@/types';

export const useWallet = (userId: string) => {
  return useQuery<Wallet, Error>({
    queryKey: ['wallet', userId],
    queryFn: () => addFundApi.getWallet(userId),
    enabled: !!userId,
  });
};

export const useAddFunds = () => {
  const queryClient = useQueryClient();

  return useMutation<Transaction, Error, { userId: string; amount: number; description?: string }>({
    mutationFn: ({ userId, amount, description }) => addFundApi.addFunds(userId, amount, description),
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

export const useWithdrawFunds = () => {
  const queryClient = useQueryClient();

  return useMutation<Transaction, Error, { userId: string; amount: number; description?: string }>({
    mutationFn: ({ userId, amount, description }) => addFundApi.withdrawFunds(userId, amount, description),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['wallet', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: "Success",
        description: "Funds withdrawn successfully",
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