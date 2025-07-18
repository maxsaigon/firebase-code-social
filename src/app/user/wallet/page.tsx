'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { useWallet, useAddFunds, useWithdrawFunds } from '@/hooks/useWallet';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const fundSchema = z.object({
  amount: z.preprocess(
    (val) => Number(val),
    z.number().min(0.01, 'Amount must be greater than 0')
  ),
});

type FundFormInputs = z.infer<typeof fundSchema>;

export default function WalletPage() {
  const { user } = useAuth();
  const { data: wallet, isLoading, error } = useWallet(user?.id || '');
  const addFundsMutation = useAddFunds();
  const withdrawFundsMutation = useWithdrawFunds();

  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
  const [isWithdrawFundsModalOpen, setIsWithdrawFundsModalOpen] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FundFormInputs>({
    resolver: zodResolver(fundSchema),
  });

  const handleAddFunds = async (data: FundFormInputs) => {
    if (!user) return;
    try {
      await addFundsMutation.mutateAsync({ userId: user.id, amount: data.amount });
      setIsAddFundsModalOpen(false);
      reset();
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to add funds.",
        variant: "destructive",
      });
    }
  };

  const handleWithdrawFunds = async (data: FundFormInputs) => {
    if (!user) return;
    try {
      await withdrawFundsMutation.mutateAsync({ userId: user.id, amount: data.amount });
      setIsWithdrawFundsModalOpen(false);
      reset();
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to withdraw funds.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Error loading wallet: {error.message}</div>;
  if (!user) return <div className="text-gray-600">Please log in to view your wallet.</div>;
  if (wallet === null) return <div className="text-gray-600">No wallet found for this user. A wallet should be created automatically upon user registration.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
      <p className="text-gray-600">Manage your account balance.</p>

      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Balance</h2>
        <p className="text-4xl font-bold text-green-600">${wallet?.balance.toFixed(2) || '0.00'}</p>
        <div className="mt-6 flex gap-4">
          <Button onClick={() => setIsAddFundsModalOpen(true)}>
            Add Funds
          </Button>
          <Button variant="outline" onClick={() => setIsWithdrawFundsModalOpen(true)}>
            Withdraw Funds
          </Button>
        </div>
      </div>

      {/* Add Funds Modal */}
      <Dialog open={isAddFundsModalOpen} onOpenChange={setIsAddFundsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Funds</DialogTitle>
            <DialogDescription>Enter the amount you wish to add to your wallet.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleAddFunds)} className="space-y-4">
            <div>
              <Label htmlFor="add-amount">Amount</Label>
              <Input id="add-amount" type="number" step="0.01" {...register('amount')} />
              {errors.amount && <p className="text-red-500 text-sm">{errors.amount.message}</p>}
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Confirm Add Funds'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Withdraw Funds Modal */}
      <Dialog open={isWithdrawFundsModalOpen} onOpenChange={setIsWithdrawFundsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
            <DialogDescription>Enter the amount you wish to withdraw from your wallet.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleWithdrawFunds)} className="space-y-4">
            <div>
              <Label htmlFor="withdraw-amount">Amount</Label>
              <Input id="withdraw-amount" type="number" step="0.01" {...register('amount')} />
              {errors.amount && <p className="text-red-500 text-sm">{errors.amount.message}</p>}
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Withdrawing...' : 'Confirm Withdraw Funds'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}