'use client';

import React, { useState } from 'react';
import { Plus, ShoppingCart, Edit, Trash } from 'lucide-react';
import { useOrders, useCreateOrder, useUpdateOrder, useDeleteOrder } from '@/hooks/useOrders';
import { useDebounce } from '@/hooks/useDebounce';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import DataTable from '@/components/shared/DataTable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { OrderForm } from '@/components/OrderForm';
import { Order as OrderType, CreateOrderData } from '@/types';

export default function OrderManagementPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const debouncedSearch = useDebounce(search, 300);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);

  const { data: orders, isLoading, error } = useOrders({
    search: debouncedSearch,
    status: statusFilter,
  });

  const createOrderMutation = useCreateOrder();
  const updateOrderMutation = useUpdateOrder();
  const deleteOrderMutation = useDeleteOrder();

  const handleCreateOrder = async (data: CreateOrderData) => {
    await createOrderMutation.mutateAsync(data);
    setIsCreateModalOpen(false);
  };

  const handleEditOrder = (order: OrderType) => {
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  };

  const handleUpdateOrder = async (data: CreateOrderData) => {
    if (selectedOrder) {
      await updateOrderMutation.mutateAsync({ id: selectedOrder.id, updates: data });
      setIsEditModalOpen(false);
      setSelectedOrder(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      await deleteOrderMutation.mutateAsync(orderId);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Error loading orders: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">Manage customer orders</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Order
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search orders..."
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
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Order Table */}
      <DataTable
        data={orders || []}
        columns={[
          {
            key: 'id',
            header: 'Order ID',
          },
          {
            key: 'user_id',
            header: 'User ID',
          },
          {
            key: 'service_id',
            header: 'Service ID',
          },
          {
            key: 'quantity',
            header: 'Quantity',
          },
          {
            key: 'total_amount',
            header: 'Total Amount',
            render: (value) => `$${value.toFixed(2)}`,
          },
          {
            key: 'status',
            header: 'Status',
            render: (value) => (
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                value === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : value === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : value === 'cancelled'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {value}
              </span>
            ),
          },
          {
            key: 'created_at',
            header: 'Order Date',
            render: (value) => new Date(value).toLocaleDateString(),
          },
          {
            key: 'actions',
            header: 'Actions',
            render: (_, order) => (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedOrder(order);
                    setIsEditModalOpen(true);
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteOrder(order.id)}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            ),
          },
        ]}
      />

      {/* Create Order Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle>
            <DialogDescription>Fill in the details to create a new order.</DialogDescription>
          </DialogHeader>
          <OrderForm onSubmit={handleCreateOrder} isSubmitting={createOrderMutation.isPending} />
        </DialogContent>
      </Dialog>

      {/* Edit Order Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Order</DialogTitle>
            <DialogDescription>Update the order details.</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <OrderForm
              order={selectedOrder}
              onSubmit={handleUpdateOrder}
              isSubmitting={updateOrderMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}