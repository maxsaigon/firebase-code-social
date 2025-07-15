import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CreateServiceData, Service } from '@/types';

const serviceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  price: z.preprocess(
    (val) => Number(val),
    z.number().min(0, 'Price must be a positive number')
  ),
  is_active: z.boolean().default(true),
  category: z.string().optional(),
});

interface ServiceFormProps {
  service?: Service;
  onSubmit: (data: CreateServiceData) => void;
  isSubmitting?: boolean;
}

export const ServiceForm = ({ service, onSubmit, isSubmitting }: ServiceFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateServiceData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: service || { name: '', description: '', price: 0, is_active: true, category: 'general' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Service Name</Label>
        <Input id="name" {...register('name')} />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register('description')} rows={4} />
        {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
      </div>
      <div>
        <Label htmlFor="price">Price</Label>
        <Input id="price" type="number" step="0.01" {...register('price')} />
        {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Input id="category" {...register('category')} />
        {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="is_active" {...register('is_active')} />
        <Label htmlFor="is_active">Active</Label>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Service'}
        </Button>
      </div>
    </form>
  );
};