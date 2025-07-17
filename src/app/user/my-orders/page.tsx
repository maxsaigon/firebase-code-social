'use client';

import React from 'react';
import { useOrders } from '@/hooks/useOrders';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import DataTable from '@/components/shared/DataTable';
import { Order as OrderType } from '@/types';

export default function MyOrdersPage() {
  const { data: orders, isLoading, error } = useOrders(); // This will fetch all orders, need to filter by user_id later

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Error loading your orders: {error.message}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
      <p className="text-gray-600">View the status and details of your past orders.</p>

      <DataTable
        data={orders || []}
        columns={[
          {
            key: 'id',
            header: 'Order ID',
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
            render: (value) => `${value.toFixed(2)}`,
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
        ]}
      />
    </div>
  );
}