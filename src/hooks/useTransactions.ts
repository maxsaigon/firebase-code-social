import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionApi } from '@/api/transactionApi';
import { toast } from '@/hooks/use-toast';
import { Transaction, CreateTransactionData } from '@/types';

export const useTransactions = (filters?: { search?: string; type?: string; status?: string }) => {
  return useQuery<Transaction[], Error>({
    queryKey: ['transactions'],
    queryFn: () => transactionApi.getTransactions(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useTransaction = (id: string) => {
  return useQuery<Transaction, Error>({
    queryKey: ['transaction', id],
    queryFn: () => transactionApi.getTransactionById(id),
    enabled: !!id,
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation<Transaction, Error, CreateTransactionData>({
    mutationFn: transactionApi.createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: "Success",
        description: "Transaction created successfully",
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

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation<Transaction, Error, { id: string; updates: Partial<Transaction> }>({
    mutationFn: ({ id, updates }) => transactionApi.updateTransaction(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction', variables.id] });
      toast({
        title: "Success",
        description: "Transaction updated successfully",
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

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: transactionApi.deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: "Success",
        description: "Transaction deleted successfully",
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