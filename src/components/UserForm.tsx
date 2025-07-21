import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, CreateUserData } from '@/types';

const userSchema = z.object({
  full_name: z.string().optional(),
  email: z.string().email('Invalid email address'),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  is_admin: z.boolean().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

interface UserFormProps {
  user?: User;
  onSubmit: (data: CreateUserData) => void;
  isSubmitting?: boolean;
  isCreating?: boolean; // New prop to indicate if it's a create operation
}

export const UserForm = ({ user, onSubmit, isSubmitting, isCreating }: UserFormProps) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CreateUserData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      full_name: user?.full_name || '',
      email: user?.email || '',
      status: user?.status || 'active',
      is_admin: user?.is_admin || false,
    },
  });

  React.useEffect(() => {
    if (user) {
      setValue('full_name', user.full_name || '');
      setValue('email', user.email);
      setValue('status', user.status);
      setValue('is_admin', user.is_admin);
    }
  }, [user, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="full_name">Full Name</Label>
        <Input id="full_name" {...register('full_name')} />
        {errors.full_name && <p className="text-red-500 text-sm">{errors.full_name.message}</p>}
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register('email')} />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Select onValueChange={(value) => setValue('status', value as 'active' | 'inactive' | 'suspended')} defaultValue={user?.status || 'active'}>
          <SelectTrigger>
            <SelectValue placeholder="Select a status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
      </div>
      <div>
        <Label htmlFor="is_admin">Admin Role</Label>
        <Select onValueChange={(value) => setValue('is_admin', value === 'true')} defaultValue={user?.is_admin ? 'true' : 'false'}>
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="false">User</SelectItem>
            <SelectItem value="true">Admin</SelectItem>
          </SelectContent>
        </Select>
        {errors.is_admin && <p className="text-red-500 text-sm">{errors.is_admin.message}</p>}
      </div>
      {isCreating && (
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" {...register('password', { required: isCreating })} />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>
      )}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save User'}
        </Button>
      </div>
    </form>
  );
};