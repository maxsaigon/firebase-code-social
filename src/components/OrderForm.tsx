import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const orderSchema = z.object({
  quantity: z.preprocess(
    (val) => Number(val),
    z.number().int().min(1, 'Quantity must be at least 1')
  ),
  notes: z.string().optional(),
});

interface OrderFormProps {
  serviceName: string;
  unitPrice: number;
  onSubmit: (data: { quantity: number; notes?: string }) => void;
  isSubmitting?: boolean;
}

export const OrderForm = ({ serviceName, unitPrice, onSubmit, isSubmitting }: OrderFormProps) => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<{ quantity: number; notes?: string }>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      quantity: 1,
      notes: '',
    },
  });

  const quantity = watch('quantity') || 0;
  const totalAmount = unitPrice * quantity;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Service Name</Label>
        <Input value={serviceName} readOnly disabled />
      </div>
      <div>
        <Label htmlFor="quantity">Quantity</Label>
        <Input id="quantity" type="number" {...register('quantity')} />
        {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity.message}</p>}
      </div>
      <div>
        <Label>Unit Price</Label>
        <Input value={unitPrice.toFixed(2)} readOnly disabled />
      </div>
      <div>
        <Label>Total Amount</Label>
        <Input value={totalAmount.toFixed(2)} readOnly disabled />
      </div>
      <div>
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea id="notes" {...register('notes')} rows={3} />
        {errors.notes && <p className="text-red-500 text-sm">{errors.notes.message}</p>}
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Placing Order...' : 'Place Order'}
        </Button>
      </div>
    </form>
  );
};