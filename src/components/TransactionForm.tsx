import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Transaction, CreateTransactionData } from '@/types';

const transactionSchema = z.object({
  user_id: z.string().min(1, 'User ID is required'),
  order_id: z.string().optional(),
  amount: z.preprocess(
    (val) => Number(val),
    z.number().min(0, 'Amount must be a positive number')
  ),
  type: z.enum(['deposit', 'withdrawal', 'payment', 'refund', 'commission']).default('payment'),
  status: z.enum(['pending', 'completed', 'failed', 'cancelled']).default('completed'),
  description: z.string().optional(),
  reference_id: z.string().optional(),
});

interface TransactionFormProps {
  transaction?: Transaction;
  onSubmit: (data: CreateTransactionData) => void;
  isSubmitting?: boolean;
}

export const TransactionForm = ({ transaction, onSubmit, isSubmitting }: TransactionFormProps) => {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<CreateTransactionData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      user_id: transaction?.user_id || '',
      order_id: transaction?.order_id || undefined,
      amount: transaction?.amount || 0,
      type: transaction?.type || 'payment',
      status: transaction?.status || 'completed',
      description: transaction?.description || '',
      reference_id: transaction?.reference_id || '',
    },
  });

  React.useEffect(() => {
    if (transaction) {
      setValue('user_id', transaction.user_id);
      setValue('order_id', transaction.order_id || undefined);
      setValue('amount', transaction.amount);
      setValue('type', transaction.type);
      setValue('status', transaction.status);
      setValue('description', transaction.description || '');
      setValue('reference_id', transaction.reference_id || '');
    }
  }, [transaction, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="user_id">User ID</Label>
        <Input id="user_id" {...register('user_id')} />
        {errors.user_id && <p className="text-red-500 text-sm">{errors.user_id.message}</p>}
      </div>
      <div>
        <Label htmlFor="order_id">Order ID (Optional)</Label>
        <Input id="order_id" {...register('order_id')} />
        {errors.order_id && <p className="text-red-500 text-sm">{errors.order_id.message}</p>}
      </div>
      <div>
        <Label htmlFor="amount">Amount</Label>
        <Input id="amount" type="number" step="0.01" {...register('amount')} />
        {errors.amount && <p className="text-red-500 text-sm">{errors.amount.message}</p>}
      </div>
      <div>
        <Label htmlFor="type">Type</Label>
        <Select onValueChange={(value) => setValue('type', value as 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'commission')} defaultValue={transaction?.type || 'payment'}>
          <SelectTrigger>
            <SelectValue placeholder="Select a type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="deposit">Deposit</SelectItem>
            <SelectItem value="withdrawal">Withdrawal</SelectItem>
            <SelectItem value="payment">Payment</SelectItem>
            <SelectItem value="refund">Refund</SelectItem>
            <SelectItem value="commission">Commission</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Select onValueChange={(value) => setValue('status', value as 'pending' | 'completed' | 'failed' | 'cancelled')} defaultValue={transaction?.status || 'completed'}>
          <SelectTrigger>
            <SelectValue placeholder="Select a status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register('description')} rows={3} />
        {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
      </div>
      <div>
        <Label htmlFor="reference_id">Reference ID (Optional)</Label>
        <Input id="reference_id" {...register('reference_id')} />
        {errors.reference_id && <p className="text-red-500 text-sm">{errors.reference_id.message}</p>}
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Transaction'}
        </Button>
      </div>
    </form>
  );
};