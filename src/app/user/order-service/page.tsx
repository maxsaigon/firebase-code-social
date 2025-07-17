'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useServices } from '@/hooks/useServices';
import { useCreateOrder } from '@/hooks/useOrders';
import { useAuth } from '@/contexts/AuthProvider';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const orderServiceSchema = z.object({
  service_id: z.string().min(1, 'Please select a service'),
  quantity: z.preprocess(
    (val) => Number(val),
    z.number().int().min(1, 'Quantity must be at least 1')
  ),
  notes: z.string().optional(),
});

type OrderServiceFormInputs = z.infer<typeof orderServiceSchema>;

export default function OrderServicePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: services, isLoading: servicesLoading, error: servicesError } = useServices();
  const createOrderMutation = useCreateOrder();

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm<OrderServiceFormInputs>({
    resolver: zodResolver(orderServiceSchema),
  });

  const selectedServiceId = watch('service_id');
  const selectedService = services?.find(s => s.id === selectedServiceId);
  const unitPrice = selectedService?.price || 0;
  const quantity = watch('quantity') || 0;
  const totalAmount = unitPrice * quantity;

  const onSubmit = async (data: OrderServiceFormInputs) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to place an order.",
        variant: "destructive",
      });
      router.push('/auth/login');
      return;
    }

    if (!selectedService) {
      toast({
        title: "Error",
        description: "Please select a valid service.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createOrderMutation.mutateAsync({
        user_id: user.id,
        service_id: data.service_id,
        quantity: data.quantity,
        unit_price: unitPrice,
        total_amount: totalAmount,
        status: 'pending', // Default status
        notes: data.notes,
      });
      toast({
        title: "Success",
        description: "Order placed successfully!",
      });
      router.push('/user/my-orders');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to place order.",
        variant: "destructive",
      });
    }
  };

  if (servicesLoading) return <LoadingSpinner />;
  if (servicesError) return <div className="text-red-500">Error loading services: {servicesError.message}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Order New Service</h1>
      <p className="text-gray-600">Select a service and place your order.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="service_id">Service</Label>
          <Select onValueChange={(value) => setValue('service_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              {services?.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name} - ${service.price.toFixed(2)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.service_id && <p className="text-red-500 text-sm">{errors.service_id.message}</p>}
        </div>

        <div>
          <Label htmlFor="quantity">Quantity</Label>
          <Input id="quantity" type="number" {...register('quantity')} />
          {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity.message}</p>}
        </div>

        <div>
          <Label htmlFor="unit_price">Unit Price</Label>
          <Input id="unit_price" type="number" value={unitPrice.toFixed(2)} readOnly disabled />
        </div>

        <div>
          <Label htmlFor="total_amount">Total Amount</Label>
          <Input id="total_amount" type="number" value={totalAmount.toFixed(2)} readOnly disabled />
        </div>

        <div>
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea id="notes" {...register('notes')} rows={3} />
          {errors.notes && <p className="text-red-500 text-sm">{errors.notes.message}</p>}
        </div>

        <Button type="submit" disabled={isSubmitting || !user}>
          {isSubmitting ? 'Placing Order...' : 'Place Order'}
        </Button>
      </form>
    </div>
  );
}