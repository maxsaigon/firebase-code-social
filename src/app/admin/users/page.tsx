'use client';

import React, { useState } from 'react';
import { Plus, User, Edit, Trash, Eye } from 'lucide-react';
import Link from 'next/link';
import { useUsers, useUpdateUser, useDeleteUser, useCreateUser } from '@/hooks/useUsers';
import { useDebounce } from '@/hooks/useDebounce';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { StatusBadge } from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { UserForm } from '@/components/UserForm';
import { User as UserType, CreateUserData } from '@/types';

export default function UserManagementPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const debouncedSearch = useDebounce(search, 300);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  const { data: users, isLoading, error, refetch } = useUsers({
    search: debouncedSearch,
    status: statusFilter,
  });

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const handleCreateUser = async (data: CreateUserData) => {
    try {
      await createUserMutation.mutateAsync(data);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };  const handleUpdateUser = async (data: CreateUserData) => {
    if (selectedUser) {
      await updateUserMutation.mutateAsync({ id: selectedUser.id, updates: data });
      setIsEditModalOpen(false);
      setSelectedUser(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await deleteUserMutation.mutateAsync(userId);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Error loading users: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* User Table */}
      <DataTable
        data={users || []}
        columns={[
          {
            key: 'full_name',
            header: 'Name',
            render: (value, user) => (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium">{value}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            render: (value) => (
              <StatusBadge status={value} type="user" />
            ),
          },
          {
            key: 'created_at',
            header: 'Joined',
            render: (value) => new Date(value).toLocaleDateString(),
          },
          {
            key: 'actions',
            header: 'Actions',
            render: (_, user) => (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/admin/users/${user.id}`}>
                    <Eye className="w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedUser(user);
                    setIsEditModalOpen(true);
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteUser(user.id)}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            ),
          },
        ]}
      />

      {/* Create User Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>Fill in the details to create a new user account.</DialogDescription>
          </DialogHeader>
          <UserForm onSubmit={handleCreateUser} isSubmitting={false} isCreating={true} />
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update the user's account details.</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <UserForm
              user={selectedUser}
              onSubmit={handleUpdateUser}
              isSubmitting={updateUserMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}