import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateOrderData } from '@/types';

type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';

const orderSchema = z.object({
  user_id: z.string().min(1, 'Please select a user'),
  service_id: z.string().min(1, 'Please select a service'),
  quantity: z.preprocess(
    (val) => Number(val),
    z.number().int().min(1, 'Quantity must be at least 1')
  ),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED']).optional(),
  notes: z.string().optional(),
});

interface OrderFormProps {
  serviceName?: string;
  unitPrice?: number;
  serviceId?: string; // Add serviceId prop for user context
  order?: any; // For edit mode
  onSubmit: (data: CreateOrderData & { status?: OrderStatus }) => void;
  isSubmitting?: boolean;
  users?: Array<{ id: string; full_name?: string; email: string }>;
  services?: Array<{ id: string; name: string; price: number; status: string }>;
  isEditMode?: boolean;
  currentUserId?: string; // For user context when no user selection needed
}

export const OrderForm = ({ serviceName, unitPrice, serviceId, order, onSubmit, isSubmitting, users = [], services = [], isEditMode = false, currentUserId }: OrderFormProps) => {
  const [selectedService, setSelectedService] = useState<any>(null);
  
  // Dynamic validation schema based on context
  const getValidationSchema = () => {
    const baseSchema = {
      service_id: z.string().min(1, 'Please select a service'),
      quantity: z.preprocess(
        (val) => Number(val),
        z.number().int().min(1, 'Quantity must be at least 1')
      ),
      status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED']).optional(),
      notes: z.string().optional(),
    };

    // Only require user_id if we have users array (admin context)
    if (users.length > 0) {
      return z.object({
        user_id: z.string().min(1, 'Please select a user'),
        ...baseSchema,
      });
    } else {
      return z.object({
        user_id: z.string().optional(),
        ...baseSchema,
      });
    }
  };
  
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<{ user_id: string; service_id: string; quantity: number; status?: OrderStatus; notes?: string }>({
    resolver: zodResolver(getValidationSchema()),
    defaultValues: {
      user_id: order?.user_id || currentUserId || '',
      service_id: order?.service_id || serviceId || '',
      quantity: order?.quantity || 1,
      status: order?.status || 'PENDING',
      notes: order?.notes || '',
    },
  });

  const quantity = watch('quantity') || 0;
  const watchedServiceId = watch('service_id');
  
  useEffect(() => {
    const service = services.find(s => s.id === watchedServiceId);
    setSelectedService(service);
  }, [watchedServiceId, services]);

  const displayServiceName = serviceName || selectedService?.name || order?.service?.name || 'Select a service';
  const displayUnitPrice = unitPrice || selectedService?.price || order?.service?.price || 0;
  const totalAmount = displayUnitPrice * quantity;

  const handleFormSubmit = (formData: { user_id: string; service_id: string; quantity: number; status?: OrderStatus; notes?: string }) => {
    const orderData: CreateOrderData & { status?: OrderStatus } = {
      user_id: formData.user_id || currentUserId || '',
      service_id: formData.service_id || serviceId || '',
      quantity: formData.quantity,
      unit_price: displayUnitPrice,
      total_amount: totalAmount,
      notes: formData.notes,
      ...(isEditMode && formData.status && { status: formData.status }),
    };
    onSubmit(orderData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* User Selection - Only show for admin create mode */}
      {!order && users.length > 0 && (
        <div>
          <Label htmlFor="user_id">User</Label>
          <Select onValueChange={(value) => setValue('user_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a user" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.full_name || user.email} ({user.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.user_id && <p className="text-red-500 text-sm">{errors.user_id.message}</p>}
        </div>
      )}

      {/* Service Selection - Only show for create mode or if services available */}
      {(!order && services.length > 0) ? (
        <div>
          <Label htmlFor="service_id">Service</Label>
          <Select onValueChange={(value) => setValue('service_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              {services.filter(service => service.status === 'ACTIVE').map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name} - ${service.price.toFixed(2)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.service_id && <p className="text-red-500 text-sm">{errors.service_id.message}</p>}
        </div>
      ) : (
        <div>
          <Label>Service Name</Label>
          <Input value={displayServiceName} readOnly disabled />
        </div>
      )}
      <div>
        <Label htmlFor="quantity">Quantity</Label>
        <Input id="quantity" type="number" {...register('quantity')} />
        {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity.message}</p>}
      </div>
      <div>
        <Label>Unit Price</Label>
        <Input value={displayUnitPrice.toFixed(2)} readOnly disabled />
      </div>
      <div>
        <Label>Total Amount</Label>
        <Input value={totalAmount.toFixed(2)} readOnly disabled />
      </div>
      
      {/* Order Status - Only show in edit mode */}
      {isEditMode && (
        <div>
          <Label htmlFor="status">Order Status</Label>
          <Select onValueChange={(value) => setValue('status', value as OrderStatus)} defaultValue={order?.status || 'PENDING'}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PROCESSING">Processing</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled (Refund)</SelectItem>
              <SelectItem value="REFUNDED">Refunded</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
        </div>
      )}
      
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