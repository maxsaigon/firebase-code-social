import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Order, CreateOrderData } from '@/types';

const orderSchema = z.object({
  user_id: z.string().min(1, 'User ID is required'),
  service_id: z.string().min(1, 'Service ID is required'),
  quantity: z.preprocess(
    (val) => Number(val),
    z.number().int().min(1, 'Quantity must be at least 1')
  ),
  unit_price: z.preprocess(
    (val) => Number(val),
    z.number().min(0, 'Unit price must be a positive number')
  ),
  total_amount: z.preprocess(
    (val) => Number(val),
    z.number().min(0, 'Total amount must be a positive number')
  ),
  status: z.enum(['pending', 'processing', 'completed', 'cancelled', 'refunded']).default('pending'),
  notes: z.string().optional(),
});

interface OrderFormProps {
  order?: Order;
  onSubmit: (data: CreateOrderData) => void;
  isSubmitting?: boolean;
}

export const OrderForm = ({ order, onSubmit, isSubmitting }: OrderFormProps) => {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<CreateOrderData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      user_id: order?.user_id || '',
      service_id: order?.service_id || '',
      quantity: order?.quantity || 1,
      unit_price: order?.unit_price || 0,
      total_amount: order?.total_amount || 0,
      status: order?.status || 'pending',
      notes: order?.notes || '',
    },
  });

  React.useEffect(() => {
    if (order) {
      setValue('user_id', order.user_id);
      setValue('service_id', order.service_id);
      setValue('quantity', order.quantity);
      setValue('unit_price', order.unit_price);
      setValue('total_amount', order.total_amount);
      setValue('status', order.status);
      setValue('notes', order.notes || '');
    }
  }, [order, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="user_id">User ID</Label>
        <Input id="user_id" {...register('user_id')} />
        {errors.user_id && <p className="text-red-500 text-sm">{errors.user_id.message}</p>}
      </div>
      <div>
        <Label htmlFor="service_id">Service ID</Label>
        <Input id="service_id" {...register('service_id')} />
        {errors.service_id && <p className="text-red-500 text-sm">{errors.service_id.message}</p>}
      </div>
      <div>
        <Label htmlFor="quantity">Quantity</Label>
        <Input id="quantity" type="number" {...register('quantity')} />
        {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity.message}</p>}
      </div>
      <div>
        <Label htmlFor="unit_price">Unit Price</Label>
        <Input id="unit_price" type="number" step="0.01" {...register('unit_price')} />
        {errors.unit_price && <p className="text-red-500 text-sm">{errors.unit_price.message}</p>}
      </div>
      <div>
        <Label htmlFor="total_amount">Total Amount</Label>
        <Input id="total_amount" type="number" step="0.01" {...register('total_amount')} />
        {errors.total_amount && <p className="text-red-500 text-sm">{errors.total_amount.message}</p>}
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Select onValueChange={(value) => setValue('status', value as 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded')} defaultValue={order?.status || 'pending'}>
          <SelectTrigger>
            <SelectValue placeholder="Select a status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
        {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" {...register('notes')} rows={3} />
        {errors.notes && <p className="text-red-500 text-sm">{errors.notes.message}</p>}
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Order'}
        </Button>
      </div>
    </form>
  );
};